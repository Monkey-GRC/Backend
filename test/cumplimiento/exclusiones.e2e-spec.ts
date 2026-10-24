import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { connect } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-144 · Excluir un activo de un test: la propone la empresa, la decide el consultor, vence con el período del servicio (contracts/modules/compliance-audit.md, D78).
// Hoy un consultor no puede trabajar en la empresa de un cliente (elegir la empresa de trabajo es MD-160), así que la cuenta del consultor de estas pruebas vive en la
// empresa: lo que se prueba es la regla de la decisión, no cómo el consultor llega a esa empresa.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let funcional: Agent;
let consultor: Agent;
let consultorB: Agent;
let consultorId: string;
let testId: string; // una prueba de nube que mide la empresa A
let serverTestId: string; // una prueba de servidores: no le aplica a una cuenta de nube
let policyTestId: string; // una prueba documental: no tiene activos
let controlId: string; // una acción de A que lleva testId
const realInsert = auditInsert.insertAuditLog;
const auditFailsAfterInsert = () =>
  jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
    await realInsert(db, entry);
    throw new Error('audit_down');
  });
const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const list = (t: Tenant, q = '') => `/v1/services/${t.serviceId}/exclusions${q}`;
const propose = (agent: Agent, over: object = {}) =>
  agent.post(list(a)).send({ test_id: testId, asset_id: a.assetId, justification: 'La cuenta se cierra en diciembre.', technical_justification: 'Aislada de producción desde septiembre.', ...over });
const decide = (agent: Agent, id: string, body: object) => agent.patch(`/v1/exclusions/${id}`).send(body);
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));
const auditRows = (tenantId: string, action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [tenantId, action]).then((r) => r[0].n);
const approvalEvents = (tenantId: string) => owner<{ n: number }>(`select count(*)::int n from audit.compliance_events where tenant_id = $1 and changed_field = 'exclusion.approve'`, [tenantId]).then((r) => r[0].n);
// Suspender a un consultor lo hace solo la empresa (D64): la base lo impone leyendo el rol de la sesión, así que se simula ese rol en la transacción.
async function asCompanyAdmin(sql: string, params: unknown[]) {
  const db = await connect();
  try {
    await db.query('BEGIN');
    await db.query(`select set_config('app.user_role', 'admin_empresa', true), set_config('app.tenant_id', $1, true)`, [a.companyId]);
    await db.query(sql, params);
    await db.query('COMMIT');
  } finally {
    await db.end();
  }
}
const reset = () => owner(`delete from tenant.exclusions where tenant_id = $1`, [a.companyId]).catch(() => undefined);

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional' | 'consultor'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}
// El estado que el motor da a la prueba `testId` de una acción de A, tal como lo ve el administrador en la vista técnica.
const stateOfTest = async (): Promise<string> => {
  const detail = (await a.agent.get(`/v1/controls/${controlId}?view=technical`).expect(200)).body.data;
  return detail.technical.tests.find((t: any) => t.test_code === testCode).state;
};
let testCode: string;
const controlState = async () => {
  const d = (await a.agent.get(`/v1/controls/${controlId}?view=technical`).expect(200)).body.data;
  return { state: d.technical.control_state as string, readiness: d.readiness as string };
};
const definePeriod = (end: string | null) =>
  owner(`update tenant.service_frameworks set period_start = $2, period_end = $3, cutoff_date = $2 where service_id = $1`, [a.serviceId, end ? day(-30) : null, end]);

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-exc-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `funcional-exc-${RUN}@cumplimiento.test`, 'funcional');
  consultorId = await cuenta(a.companyId, `consultor-exc-${RUN}@cumplimiento.test`, 'consultor');
  auditor = await login(app, `auditor-exc-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-exc-${RUN}@cumplimiento.test`);
  consultor = await login(app, `consultor-exc-${RUN}@cumplimiento.test`);
  await cuenta(b.companyId, `consultor-exb-${RUN}@cumplimiento.test`, 'consultor');
  consultorB = await login(app, `consultor-exb-${RUN}@cumplimiento.test`);

  // La cuenta de nube de A mide la dimensión «cloud» una vez activa. Se elige una prueba de nube que lleve una acción del servicio.
  await owner(`update tenant.assets set status = 'active' where id = $1`, [a.assetId]);
  const tests = await owner<{ id: string; code: string; dimension: string; client_control_id: string }>(
    `select distinct on (t.dimension) t.id, t.code, t.dimension, cct.client_control_id
       from tenant.client_control_tests cct
       join catalog.tests t on t.id = cct.test_id
       join tenant.client_controls cc on cc.id = cct.client_control_id
      where cc.service_id = $1 and cc.is_active order by t.dimension, t.code`,
    [a.serviceId],
  );
  const byDimension = (d: string) => tests.find((t) => t.dimension === d)!;
  testId = byDimension('cloud').id;
  testCode = byDimension('cloud').code;
  controlId = byDimension('cloud').client_control_id;
  serverTestId = byDimension('server').id;
  policyTestId = byDimension('policy').id;
});
afterAll(async () => {
  await app?.close();
});
afterEach(async () => {
  jest.restoreAllMocks();
});

describe('Proponer una exclusión', () => {
  beforeEach(async () => {
    await reset();
    await definePeriod(day(120));
  });

  it('queda pendiente, con la vigencia de hoy al fin del período, y el activo se sigue midiendo', async () => {
    const before = await stateOfTest();
    const res = await propose(a.agent).expect(201);
    expect(res.body.data).toEqual({
      id: expect.any(String),
      service_id: a.serviceId,
      test: { id: testId, display_name: expect.any(String) },
      asset: { id: a.assetId, name: a.assetName },
      justification: 'La cuenta se cierra en diciembre.',
      technical_justification: 'Aislada de producción desde septiembre.',
      status: 'pending',
      is_expired: false,
      awaiting_consultant: true,
      valid_from: day(0),
      valid_until: day(120),
      proposed_by: { id: expect.any(String), name: null, last_name: null },
      requested_at: expect.any(String),
      decided_by: null,
      decision_note: null,
      decided_at: null,
    });
    expect(await stateOfTest()).toBe(before); // una exclusión sin aprobar no cambia nada
  });

  it('el nombre de la prueba es el neutro, nunca el texto del comité ni el proveedor de la sonda', async () => {
    const body = JSON.stringify((await propose(a.agent).expect(201)).body);
    expect(body).not.toMatch(/wazuh|prowler/i);
  });

  it('sin período definido en el servicio no hay hasta cuándo excluir: 409 EVALUATION_NOT_DEFINED', async () => {
    await definePeriod(null);
    expect((await propose(a.agent).expect(409)).body.error.code).toBe('EVALUATION_NOT_DEFINED');
    await definePeriod(day(-1)); // un período que ya terminó tampoco sirve
    expect((await propose(a.agent).expect(409)).body.error.code).toBe('EVALUATION_NOT_DEFINED');
  });

  it('la justificación es obligatoria, y la sustentación técnica también en un test automático', async () => {
    expect(fields(await propose(a.agent, { justification: '   ' }).expect(422))).toEqual([{ field: 'justification', code: 'required' }]);
    expect(fields(await propose(a.agent, { technical_justification: undefined }).expect(422))).toEqual([{ field: 'technical_justification', code: 'required' }]);
    expect(fields(await propose(a.agent, { test_id: 'x', asset_id: 'y' }).expect(422))).toEqual(
      expect.arrayContaining([{ field: 'test_id', code: 'uuid.invalid' }, { field: 'asset_id', code: 'uuid.invalid' }]),
    );
  });

  it('el activo debe ser del servicio y el test debe aplicarle: si no, 404', async () => {
    await propose(a.agent, { test_id: serverTestId }).expect(404); // una prueba de servidores no mide una cuenta de nube
    await propose(a.agent, { test_id: policyTestId }).expect(404); // una prueba documental no tiene activos
    await propose(a.agent, { asset_id: b.assetId }).expect(404); // un activo de otra empresa
    await propose(a.agent, { asset_id: '00000000-0000-0000-0000-000000000000' }).expect(404);
    await propose(a.agent, { test_id: '00000000-0000-0000-0000-000000000000' }).expect(404);
    await b.agent.post(list(a)).send({ test_id: testId, asset_id: a.assetId, justification: 'x', technical_justification: 'y' }).expect(404); // el servicio de otra empresa
  });

  it('repetir una pendiente de lo mismo es un conflicto', async () => {
    await propose(a.agent).expect(201);
    expect((await propose(a.agent).expect(409)).body.error.code).toBe('EXCLUSION_ALREADY_EXISTS');
  });

  it('solo el administrador de la empresa propone', async () => {
    await propose(consultor).expect(403);
    await propose(auditor).expect(403);
    await propose(funcional).expect(403);
    await propose(monkey).expect(403);
  });
});

describe('Decidir una exclusión', () => {
  beforeEach(async () => {
    await reset();
    await definePeriod(day(120));
  });

  it('aprobarla saca al activo del universo del test hasta que venza, y deja su rastro y su evento de cumplimiento', async () => {
    expect(await stateOfTest()).not.toBe('no_assets');
    const eventsBefore = await approvalEvents(a.companyId);
    const controlBefore = await controlState();
    const id = (await propose(a.agent).expect(201)).body.data.id;
    const res = await decide(consultor, id, { status: 'approved' }).expect(200);
    // D91 · Aprobarla mueve el estado del control, o no; y el historial lo dice exactamente: un evento si cambió, ninguno si no.
    const controlAfter = await controlState();
    const stateEvents = await owner<{ previous_value: any; new_value: any; user_id: string }>(
      `select previous_value, new_value, user_id from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'cause' = 'exclusion_approved' and new_value->>'control_id' = $2`,
      [a.companyId, controlId],
    );
    if (controlBefore.state === controlAfter.state && controlBefore.readiness === controlAfter.readiness) expect(stateEvents).toHaveLength(0);
    else {
      expect(stateEvents).toHaveLength(1);
      expect(stateEvents[0].user_id).toBe(consultorId);
      expect(stateEvents[0].previous_value).toMatchObject(controlBefore);
      expect(stateEvents[0].new_value).toMatchObject(controlAfter);
    }
    expect(res.body.data).toMatchObject({ id, status: 'approved', decided_by: { id: consultorId }, awaiting_consultant: false, is_expired: false });
    expect(res.body.data.decided_at).toEqual(expect.any(String));
    // La única cuenta de nube de la empresa quedó excluida de ese test: el test no tiene sobre qué correr.
    expect(await stateOfTest()).toBe('no_assets');

    const audit = await owner<{ before_state: any; after_state: any }>(`select before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'exclusion.decide' order by created_at desc limit 1`, [a.companyId]);
    expect(audit[0].before_state).toMatchObject({ id, status: 'pending' });
    expect(audit[0].after_state).toMatchObject({ id, status: 'approved' });
    expect(await approvalEvents(a.companyId)).toBe(eventsBefore + 1);
    const event = (await owner<{ new_value: any; user_id: string }>(`select new_value, user_id from audit.compliance_events where tenant_id = $1 and changed_field = 'exclusion.approve' and new_value->>'exclusion_id' = $2`, [a.companyId, id]))[0];
    expect(event.new_value).toMatchObject({ exclusion_id: id, test_id: testId, asset_id: a.assetId, valid_until: day(120) });
    expect(event.user_id).toBe(consultorId);
  });

  it('rechazarla exige el motivo; el activo sigue contando y queda el motivo', async () => {
    const id = (await propose(a.agent).expect(201)).body.data.id;
    expect(fields(await decide(consultor, id, { status: 'rejected' }).expect(422))).toEqual([{ field: 'decision_note', code: 'note.required' }]);
    expect(fields(await decide(consultor, id, { status: 'rejected', decision_note: '   ' }).expect(422))).toEqual([{ field: 'decision_note', code: 'note.required' }]);
    const before = await stateOfTest();
    const eventsBefore = await approvalEvents(a.companyId);
    const res = await decide(consultor, id, { status: 'rejected', decision_note: 'El servidor sigue en producción.' }).expect(200);
    expect(res.body.data).toMatchObject({ status: 'rejected', decision_note: 'El servidor sigue en producción.', decided_by: { id: consultorId } });
    expect(await stateOfTest()).toBe(before);
    expect(await approvalEvents(a.companyId)).toBe(eventsBefore); // rechazar no cambia lo que se mide
    await propose(a.agent).expect(201); // tras un rechazo se puede proponer de nuevo
  });

  it('una exclusión ya decidida no se decide otra vez: 409', async () => {
    const id = (await propose(a.agent).expect(201)).body.data.id;
    await decide(consultor, id, { status: 'approved' }).expect(200);
    expect((await decide(consultor, id, { status: 'rejected', decision_note: 'tarde' }).expect(409)).body.error.code).toBe('ALREADY_DECIDED');
    expect((await decide(consultor, id, { status: 'approved' }).expect(409)).body.error.code).toBe('ALREADY_DECIDED');
  });

  it('solo el consultor decide: el administrador de la empresa, el auditor y el funcional reciben 403', async () => {
    const id = (await propose(a.agent).expect(201)).body.data.id;
    await decide(a.agent, id, { status: 'approved' }).expect(403);
    await decide(auditor, id, { status: 'approved' }).expect(403);
    await decide(funcional, id, { status: 'approved' }).expect(403);
    await decide(monkey, id, { status: 'approved' }).expect(403);
    expect((await a.agent.get(list(a, '?status=pending')).expect(200)).body.data.items.map((e: any) => e.id)).toContain(id);
  });

  it('una exclusión de otra empresa no existe: 404, y un valor fuera de las opciones es un error de validación', async () => {
    const id = (await propose(a.agent).expect(201)).body.data.id;
    await decide(b.agent, id, { status: 'approved' }).expect(403); // la empresa de otro no es consultor
    await decide(consultorB, id, { status: 'approved' }).expect(404); // y un consultor de otra empresa no la ve
    await decide(consultor, '00000000-0000-0000-0000-000000000000', { status: 'approved' }).expect(404);
    await decide(consultor, 'no-es-uuid', { status: 'approved' }).expect(404);
    expect(fields(await decide(consultor, id, { status: 'maybe' }).expect(422))).toEqual([{ field: 'status', code: 'enum.invalid' }]);
  });
});

describe('Vencer y renovar', () => {
  beforeEach(async () => {
    await reset();
    await definePeriod(day(120));
  });

  it('una aprobada cuya vigencia pasó deja de excluir: el activo vuelve a contar, y se puede renovar con una propuesta nueva', async () => {
    const id = (await propose(a.agent).expect(201)).body.data.id;
    await decide(consultor, id, { status: 'approved' }).expect(200);
    expect(await stateOfTest()).toBe('no_assets');
    await owner(`update tenant.exclusions set valid_from = $2, valid_until = $3 where id = $1`, [id, day(-30), day(-1)]);
    expect(await stateOfTest()).not.toBe('no_assets');
    const listed = (await a.agent.get(list(a)).expect(200)).body.data.items.find((e: any) => e.id === id);
    expect(listed).toMatchObject({ status: 'approved', is_expired: true });
    await propose(a.agent).expect(201); // se revalida, no se hereda
  });

  it('una aprobada vigente impide proponer de nuevo lo mismo', async () => {
    const id = (await propose(a.agent).expect(201)).body.data.id;
    await decide(consultor, id, { status: 'approved' }).expect(200);
    expect((await propose(a.agent).expect(409)).body.error.code).toBe('EXCLUSION_ALREADY_EXISTS');
  });
});

describe('Listar', () => {
  let pending: string;
  let approved: string;
  beforeAll(async () => {
    await reset();
    await definePeriod(day(120));
    approved = (await propose(a.agent).expect(201)).body.data.id;
    await decide(consultor, approved, { status: 'approved' }).expect(200);
    await owner(`update tenant.exclusions set valid_from = $2, valid_until = $3 where id = $1`, [approved, day(-30), day(-1)]);
    pending = (await propose(a.agent).expect(201)).body.data.id;
  });

  it('pagina, de la más reciente a la más antigua, y filtra por estado, prueba, activo y vencida', async () => {
    const all = (await a.agent.get(list(a)).expect(200)).body.data;
    expect(all).toMatchObject({ page: 1, page_size: 25, total: 2, total_pages: 1 });
    expect(all.items.map((e: any) => e.id)).toEqual([pending, approved]);
    const ids = async (q: string) => (await a.agent.get(list(a, q)).expect(200)).body.data.items.map((e: any) => e.id);
    expect(await ids('?status=pending')).toEqual([pending]);
    expect(await ids('?status=approved')).toEqual([approved]);
    expect(await ids('?expired=true')).toEqual([approved]);
    expect(await ids('?expired=false')).toEqual([pending]);
    expect(await ids(`?test_id=${testId}&asset_id=${a.assetId}`)).toHaveLength(2);
    expect(await ids(`?asset_id=${b.assetId}`)).toEqual([]);
    expect((await a.agent.get(list(a, '?page=2&page_size=1')).expect(200)).body.data.items.map((e: any) => e.id)).toEqual([approved]);
    expect(fields(await a.agent.get(list(a, '?status=otra')).expect(422))).toEqual([{ field: 'status', code: 'enum.invalid' }]);
  });

  it('las leen el administrador, el consultor y el auditor; el funcional y admin_monkey, no; otra empresa no ve nada', async () => {
    await consultor.get(list(a)).expect(200);
    await auditor.get(list(a)).expect(200);
    await funcional.get(list(a)).expect(403);
    await monkey.get(list(a)).expect(403);
    await b.agent.get(list(a)).expect(404);
  });

  it('una pendiente avisa que falta un consultor mientras la empresa no tenga uno activo (P24)', async () => {
    const awaiting = async () => (await a.agent.get(list(a, '?status=pending')).expect(200)).body.data.items[0].awaiting_consultant;
    expect(await awaiting()).toBe(true);
    const monkeyId = (await owner<{ id: string }>(`select id from platform.users where email like 'admin-monkey%' or role = 'admin_monkey' order by created_at limit 1`))[0].id;
    try {
      await owner(`insert into platform.consultant_assignments (id, consultant_user_id, company_id, assigned_by) values (gen_random_uuid(), $1, $2, $3)`, [consultorId, a.companyId, monkeyId]);
      expect(await awaiting()).toBe(false);
      await asCompanyAdmin(`update platform.consultant_assignments set status = 'suspended' where company_id = $1`, [a.companyId]);
      expect(await awaiting()).toBe(true); // un consultor suspendido no aprueba nada
    } finally {
      // No deja la asignación en la base compartida de las pruebas: otras suites cuentan las asignaciones.
      await owner(`delete from platform.consultant_assignments where company_id = $1`, [a.companyId]);
    }
    // una decidida nunca espera
    expect((await a.agent.get(list(a, '?status=approved')).expect(200)).body.data.items[0].awaiting_consultant).toBe(false);
  });
});

describe('La base y el rastro', () => {
  beforeEach(async () => {
    await reset();
    await definePeriod(day(120));
  });

  it('la base no acepta una exclusión decidida sin quién ni cuándo, un rechazo sin motivo, ni una vigencia invertida', async () => {
    const id = (await propose(a.agent).expect(201)).body.data.id;
    await expect(owner(`update tenant.exclusions set status = 'approved' where id = $1`, [id])).rejects.toThrow(/exclusions_decision_shape/);
    await expect(owner(`update tenant.exclusions set status = 'rejected', decided_by = $2, decided_at = now() where id = $1`, [id, consultorId])).rejects.toThrow(/exclusions_decision_shape/);
    await expect(owner(`update tenant.exclusions set valid_until = valid_from - 1 where id = $1`, [id])).rejects.toThrow(/exclusions_validity_order/);
    await expect(owner(`update tenant.exclusions set justification = '  ' where id = $1`, [id])).rejects.toThrow(/exclusions_justification_present/);
  });

  it('cada propuesta y cada decisión dejan su auditoría', async () => {
    const before = { request: await auditRows(a.companyId, 'exclusion.request'), decide: await auditRows(a.companyId, 'exclusion.decide') };
    const id = (await propose(a.agent).expect(201)).body.data.id;
    await decide(consultor, id, { status: 'approved' }).expect(200);
    expect(await auditRows(a.companyId, 'exclusion.request')).toBe(before.request + 1);
    expect(await auditRows(a.companyId, 'exclusion.decide')).toBe(before.decide + 1);
  });

  it('si el rastro falla, la propuesta se revierte y tampoco queda su fila de auditoría', async () => {
    const before = await auditRows(a.companyId, 'exclusion.request');
    auditFailsAfterInsert();
    await propose(a.agent).expect(500);
    expect((await a.agent.get(list(a)).expect(200)).body.data.total).toBe(0);
    expect(await auditRows(a.companyId, 'exclusion.request')).toBe(before);
  });

  it('si el rastro falla, la decisión se revierte: sigue pendiente, sin evento de cumplimiento', async () => {
    const id = (await propose(a.agent).expect(201)).body.data.id;
    const before = await auditRows(a.companyId, 'exclusion.decide');
    const eventsBefore = await approvalEvents(a.companyId);
    auditFailsAfterInsert();
    await decide(consultor, id, { status: 'approved' }).expect(500);
    expect((await a.agent.get(list(a, '?status=pending')).expect(200)).body.data.items.map((e: any) => e.id)).toContain(id);
    expect(await approvalEvents(a.companyId)).toBe(eventsBefore);
    expect(await auditRows(a.companyId, 'exclusion.decide')).toBe(before);
  });
});
