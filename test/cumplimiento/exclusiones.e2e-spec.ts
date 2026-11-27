import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { controlStateOf, resultadoDeStatus } from '../support/controles';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { ExpireExclusionsUseCase } from '../../src/features/compliance/application/exclusions/exclusion.use-cases';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';

// MD-144, MD-501, D96, D135 · La excepción del FAIL de una prueba en un activo: el admin_empresa la propone y la decide en un solo acto (nace aprobada), dura hasta `valid_until`
// (como mucho PR-04) y la tarea diaria registra su vencimiento (contracts/cumplimiento/exclusiones.md).
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let responsable: Agent;
let adminId: string;
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
const create = (agent: Agent, over: object = {}) =>
  agent.post(list(a)).send({ test_id: testId, asset_id: a.assetId, justification: 'La cuenta se cierra en diciembre.', technical_justification: 'Aislada de producción desde septiembre.', valid_until: day(60), ...over });
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));
const auditRows = (tenantId: string, action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [tenantId, action]).then((r) => r[0].n);
const approvalEvents = (tenantId: string) => owner<{ n: number }>(`select count(*)::int n from audit.compliance_events where tenant_id = $1 and changed_field = 'exclusion.approve'`, [tenantId]).then((r) => r[0].n);
const expireEvents = (tenantId: string, id: string) => owner<{ n: number }>(`select count(*)::int n from audit.compliance_events where tenant_id = $1 and changed_field = 'exclusion.expire' and new_value->>'exclusion_id' = $2`, [tenantId, id]).then((r) => r[0].n);
// `tenant.evaluations` es inmutable: el último resultado manda, así que se escribe uno más reciente.
const writeResult = (result: 'compliant' | 'non_compliant' | 'not_applicable') =>
  owner(
    `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, dimension, result, origin)
     values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'cloud', $7::tenant.evaluation_result, 'automated')`,
    [a.companyId, a.serviceId, failRow!.client_control_id, testId, a.assetId, failRow!.catalog_version_id, result],
  );
let failRow: { client_control_id: string; catalog_version_id: string } | null = null;
const reset = () => owner(`delete from tenant.exclusions where tenant_id = $1`, [a.companyId]).catch(() => undefined);

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}
// El estado que el motor da a la prueba `testId` de una acción de A, tal como lo ve el administrador en la vista técnica.
const stateOfTest = async (): Promise<string> => {
  const detail = (await a.agent.get(`/v1/controls/${controlId}?view=technical`).expect(200)).body.data;
  const status = detail.technical.tests.find((t: any) => t.test_code === testCode).status;
  return resultadoDeStatus(status);
};
let testCode: string;
const controlState = async () => {
  const d = (await a.agent.get(`/v1/controls/${controlId}?view=technical`).expect(200)).body.data;
  return { state: controlStateOf(d.technical), readiness: d.readiness as string };
};
const definePeriod = (end: string | null) =>
  definirPeriodo(a.serviceId, end ? day(-30) : null, end, end ? day(-30) : null);


beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-exc-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `responsable-exc-${RUN}@cumplimiento.test`, 'responsable');
  adminId = (await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]))[0].id;
  auditor = await login(app, `auditor-exc-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-exc-${RUN}@cumplimiento.test`);

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
  // v2 (MD-498, D135): una excepción deja pasar un FAIL, así que la prueba de nube debe decidirla un check Directo y tener un resultado que falle.
  const cloud = (await owner<{ id: string; code: string; client_control_id: string; catalog_version_id: string }>(
    `select t.id, t.code, cc.id client_control_id, sf.catalog_version_id
       from tenant.client_controls cc
       join tenant.client_control_requirements ccr on ccr.client_control_id = cc.id
       join catalog.control_requirement_tests crt on crt.control_requirement_id = ccr.control_requirement_id
       join catalog.tests t on t.id = crt.test_id and t.dimension = 'cloud' and t.type = 'technical'
       join tenant.service_frameworks sf on sf.service_id = cc.service_id
      where cc.service_id = $1 and cc.is_active
        and exists (select 1 from catalog.test_checks tc where tc.test_id = t.id and tc.role = 'direct' and tc.check_id is not null)
      order by t.code, cc.own_code limit 1`,
    [a.serviceId],
  ))[0];
  failRow = cloud;
  testId = cloud.id;
  testCode = cloud.code;
  controlId = cloud.client_control_id;
  await owner(
    `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, dimension, result, origin)
     values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'cloud', 'non_compliant'::tenant.evaluation_result, 'automated')`,
    [a.companyId, a.serviceId, controlId, testId, a.assetId, cloud.catalog_version_id],
  );
  serverTestId = byDimension('server').id;
  policyTestId = byDimension('policy').id;
});
afterAll(async () => {
  await app?.close();
});
afterEach(async () => {
  jest.restoreAllMocks();
});

describe('Aprobar una excepción (el admin_empresa la propone y la decide en un solo acto)', () => {
  beforeEach(async () => {
    await reset();
    await definePeriod(day(120));
  });

  it('nace aprobada, con la fecha de fin que pidió, y el FAIL del activo pasa a contar como PASS marcado (D135)', async () => {
    expect(await stateOfTest()).toBe('non_compliant');
    const res = await create(a.agent).expect(201);
    expect(res.body.data).toEqual({
      id: expect.any(String),
      service_id: a.serviceId,
      test: { id: testId, display_name: expect.any(String) },
      asset: { id: a.assetId, name: a.assetName },
      justification: 'La cuenta se cierra en diciembre.',
      technical_justification: 'Aislada de producción desde septiembre.',
      status: 'approved',
      valid_from: day(0),
      valid_until: day(60),
      effective_until: day(60),
      is_expired: false,
      expired_at: null,
      proposed_by: { id: adminId, name: null, last_name: null },
      requested_at: expect.any(String),
      decided_by: { id: adminId, name: null, last_name: null },
      decision_note: null,
      decided_at: expect.any(String),
    });
    // La única cuenta de nube de la empresa falla ese check con una excepción vigente: cuenta como PASS y se muestra marcada; el activo sigue en el alcance y en la cobertura.
    expect(await stateOfTest()).toBe('compliant');
    const technical = (await a.agent.get(`/v1/controls/${controlId}?view=technical`).expect(200)).body.data.technical;
    const test = technical.requirements.flatMap((r: any) => r.tests).find((t: any) => t.test_code === testCode);
    expect(test).toMatchObject({ status: 'correct', checks: { direct_pass: 0, direct_fail: 0, direct_exception: 1 }, asset_coverage: { with_result: 1, in_scope: 1 } });
  });

  it('deja su rastro, su evento de cumplimiento y, si mueve el control, el evento de su estado (D91)', async () => {
    const eventsBefore = await approvalEvents(a.companyId);
    const controlBefore = await controlState();
    const stateEventsOf = () =>
      owner<{ previous_value: any; new_value: any; user_id: string }>(
        `select previous_value, new_value, user_id from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'cause' = 'exclusion_approved' and new_value->>'control_id' = $2 order by created_at`,
        [a.companyId, controlId],
      );
    const already = (await stateEventsOf()).length;
    const id = (await create(a.agent).expect(201)).body.data.id;
    const controlAfter = await controlState();
    const stateEvents = (await stateEventsOf()).slice(already);
    // Crearla mueve el estado del control, o no; y el historial lo dice exactamente: un evento si cambió, ninguno si no.
    if (controlBefore.state === controlAfter.state && controlBefore.readiness === controlAfter.readiness) expect(stateEvents).toHaveLength(0);
    else {
      expect(stateEvents).toHaveLength(1);
      expect(stateEvents[0].user_id).toBe(adminId);
      expect(stateEvents[0].previous_value).toMatchObject(controlBefore);
      expect(stateEvents[0].new_value).toMatchObject(controlAfter);
    }
    const audit = await owner<{ before_state: any; after_state: any }>(`select before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'exclusion.create' order by created_at desc limit 1`, [a.companyId]);
    expect(audit[0].before_state).toBeNull();
    expect(audit[0].after_state).toMatchObject({ id, status: 'approved' });
    expect(await approvalEvents(a.companyId)).toBe(eventsBefore + 1);
    const event = (await owner<{ new_value: any; user_id: string }>(`select new_value, user_id from audit.compliance_events where tenant_id = $1 and changed_field = 'exclusion.approve' and new_value->>'exclusion_id' = $2`, [a.companyId, id]))[0];
    expect(event.new_value).toMatchObject({ exclusion_id: id, test_id: testId, asset_id: a.assetId, valid_until: day(60) });
    expect(event.user_id).toBe(adminId);
  });

  it('el nombre de la prueba es el neutro, nunca el texto del comité ni el proveedor de la sonda', async () => {
    const body = JSON.stringify((await create(a.agent).expect(201)).body);
    expect(body).not.toMatch(/wazuh|prowler/i);
  });

  it('la fecha de fin es posterior a hoy y como mucho hoy + PR-04 (90 días por defecto)', async () => {
    for (const bad of [day(0), day(-3)]) expect(fields(await create(a.agent, { valid_until: bad }).expect(422))).toEqual([{ field: 'valid_until', code: 'date.min' }]);
    const tooLong = await create(a.agent, { valid_until: day(91) }).expect(422);
    expect(fields(tooLong)).toEqual([{ field: 'valid_until', code: 'exception.max_days' }]);
    expect(tooLong.body.error.fields[0].message).toContain('90');
    expect(fields(await create(a.agent, { valid_until: '2027-02-31' }).expect(422))).toEqual([{ field: 'valid_until', code: 'date.invalid' }]);
    expect(fields(await create(a.agent, { valid_until: undefined }).expect(422))).toEqual([{ field: 'valid_until', code: 'date.invalid' }]);
    // El tope es el PR-04 vigente de la empresa, no una constante.
    const res = await create(a.agent, { valid_until: day(90) }).expect(201);
    expect(res.body.data).toMatchObject({ valid_until: day(90), effective_until: day(90) });
  });

  it('con PR-04 distinto de 90 el tope sigue al parámetro: 30 días sí, 31 no', async () => {
    await owner(`update catalog.evaluation_parameters set value = '30'::jsonb where key = 'check_exception_max_days'`);
    try {
      const tooLong = await create(a.agent, { valid_until: day(31) }).expect(422);
      expect(fields(tooLong)).toEqual([{ field: 'valid_until', code: 'exception.max_days' }]);
      expect(tooLong.body.error.fields[0].message).toContain('30');
      expect((await create(a.agent, { valid_until: day(30) }).expect(201)).body.data).toMatchObject({ valid_until: day(30), effective_until: day(30) });
    } finally {
      await owner(`update catalog.evaluation_parameters set value = default_value, updated_at = null, updated_by = null where key = 'check_exception_max_days'`);
    }
  });

  it('sin dato en el período (no_data) tampoco hay FAIL que exceptuar: 409 CHECK_NOT_FAILING', async () => {
    await definirPeriodo(a.serviceId, day(1), day(120), day(1)); // el resultado de hoy queda fuera del período auditado
    try {
      expect((await create(a.agent).expect(409)).body.error.code).toBe('CHECK_NOT_FAILING');
    } finally {
      await definePeriod(day(120));
    }
  });

  it('un activo de la empresa que no es de este servicio: 404', async () => {
    const other = (await owner<{ id: string }>(
      `insert into tenant.assets select (jsonb_populate_record(null::tenant.assets, to_jsonb(src) || jsonb_build_object('id', gen_random_uuid(), 'name', 'suelto-' || gen_random_uuid(), 'code', 'SUELTO-' || gen_random_uuid()))).* from tenant.assets src where id = $1 returning id`,
      [a.assetId],
    ))[0].id;
    await create(a.agent, { asset_id: other }).expect(404);
  });

  it('sin un FAIL hoy en ese activo (pasa o no aplica) no hay qué exceptuar: 409 CHECK_NOT_FAILING', async () => {
    try {
      for (const result of ['compliant', 'not_applicable'] as const) {
        await writeResult(result);
        expect((await create(a.agent).expect(409)).body.error.code).toBe('CHECK_NOT_FAILING');
      }
      expect((await a.agent.get(list(a)).expect(200)).body.data.total).toBe(0);
    } finally {
      await writeResult('non_compliant');
    }
  });

  it('la justificación es obligatoria, y la sustentación técnica también en un test automático', async () => {
    expect(fields(await create(a.agent, { justification: '   ' }).expect(422))).toEqual([{ field: 'justification', code: 'required' }]);
    expect(fields(await create(a.agent, { technical_justification: '   ' }).expect(422))).toEqual([{ field: 'technical_justification', code: 'required' }]);
    expect(fields(await create(a.agent, { test_id: 'x', asset_id: 'y' }).expect(422))).toEqual(
      expect.arrayContaining([{ field: 'test_id', code: 'uuid.invalid' }, { field: 'asset_id', code: 'uuid.invalid' }]),
    );
  });

  it('el activo debe ser del servicio y el test debe aplicarle: si no, 404', async () => {
    await create(a.agent, { test_id: serverTestId }).expect(404); // una prueba de servidores no mide una cuenta de nube
    await create(a.agent, { test_id: policyTestId }).expect(404); // una prueba documental no tiene activos
    await create(a.agent, { asset_id: b.assetId }).expect(404); // un activo de otra empresa
    await create(a.agent, { asset_id: '00000000-0000-0000-0000-000000000000' }).expect(404);
    await create(a.agent, { test_id: '00000000-0000-0000-0000-000000000000' }).expect(404);
    await b.agent.post(list(a)).send({ test_id: testId, asset_id: a.assetId, justification: 'x', technical_justification: 'y', valid_until: day(30) }).expect(404); // el servicio de otra empresa
  });

  it('repetir lo mismo mientras está vigente es un conflicto', async () => {
    await create(a.agent).expect(201);
    expect((await create(a.agent).expect(409)).body.error.code).toBe('EXCLUSION_ALREADY_EXISTS');
  });

  it('dos a la vez de lo mismo crean una sola', async () => {
    const results = await Promise.all([create(a.agent), create(a.agent)]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    expect((await a.agent.get(list(a)).expect(200)).body.data.total).toBe(1);
  });

  it('solo el administrador de la empresa la crea; no existe un paso aparte para decidirla', async () => {
    await create(auditor).expect(403);
    await create(responsable).expect(403);
    await create(monkey).expect(403);
    const id = (await create(a.agent).expect(201)).body.data.id;
    await a.agent.patch(`/v1/exclusions/${id}`).send({ status: 'rejected', decision_note: 'x' }).expect(404);
  });
});

describe('Vencer y renovar', () => {
  beforeEach(async () => {
    await reset();
    await definePeriod(day(120));
  });
  const expire = () => app.get(ExpireExclusionsUseCase).execute(new Date(), [a.companyId]);
  const stateEventsOf = (cause: string) =>
    owner<{ user_id: string | null; previous_value: any; new_value: any }>(
      `select user_id, previous_value, new_value from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'cause' = $2 and new_value->>'control_id' = $3`,
      [a.companyId, cause, controlId],
    );

  it('una aprobada cuya vigencia pasó deja de excluir: el activo vuelve a contar, y se puede renovar con una nueva', async () => {
    const id = (await create(a.agent).expect(201)).body.data.id;
    expect(await stateOfTest()).toBe('compliant');
    await owner(`update tenant.exclusions set valid_from = $2, valid_until = $3 where id = $1`, [id, day(-30), day(-1)]);
    expect(await stateOfTest()).toBe('non_compliant');
    const listed = (await a.agent.get(list(a)).expect(200)).body.data.items.find((e: any) => e.id === id);
    expect(listed).toMatchObject({ status: 'approved', is_expired: true, effective_until: day(-1), expired_at: null });
    await create(a.agent).expect(201); // se revalida, no se hereda
  });

  it('si PR-04 baja, las ya aprobadas se acortan: effective_until es la menor entre su fin y su inicio + PR-04', async () => {
    const id = (await create(a.agent).expect(201)).body.data.id;
    await owner(`update tenant.exclusions set valid_from = $2, valid_until = $3 where id = $1`, [id, day(-100), day(30)]);
    const listed = (await a.agent.get(list(a)).expect(200)).body.data.items.find((e: any) => e.id === id);
    expect(listed).toMatchObject({ valid_until: day(30), effective_until: day(-10), is_expired: true });
    expect(await stateOfTest()).toBe('non_compliant');
  });

  it('la tarea diaria registra el vencimiento una sola vez: expired_at, evento exclusion.expire y el evento de estado con exclusion_expired', async () => {
    const id = (await create(a.agent).expect(201)).body.data.id;
    const movedBefore = (await stateEventsOf('exclusion_expired')).length;
    await owner(`update tenant.exclusions set valid_from = $2, valid_until = $3 where id = $1`, [id, day(-30), day(-1)]);
    const first = await expire();
    expect(first.failed).toBe(0);
    expect(first.expired).toBeGreaterThanOrEqual(1);
    const row = (await owner<{ expired_at: Date | null }>(`select expired_at from tenant.exclusions where id = $1`, [id]))[0];
    expect(row.expired_at).not.toBeNull();
    expect(await expireEvents(a.companyId, id)).toBe(1);
    const events = (await stateEventsOf('exclusion_expired')).slice(movedBefore);
    expect(events).toHaveLength(1);
    expect(events[0].user_id).toBeNull();
    expect(events[0].previous_value.state).not.toBe(events[0].new_value.state);
    expect((await a.agent.get(list(a)).expect(200)).body.data.items.find((e: any) => e.id === id)).toMatchObject({ is_expired: true, expired_at: row.expired_at!.toISOString() });
    // Una segunda pasada no repite nada.
    expect((await expire()).expired).toBe(0);
    expect((await owner<{ expired_at: Date }>(`select expired_at from tenant.exclusions where id = $1`, [id]))[0].expired_at).toEqual(row.expired_at);
    expect(await expireEvents(a.companyId, id)).toBe(1);
    expect((await stateEventsOf('exclusion_expired')).slice(movedBefore)).toHaveLength(1);
  });

  it('si el vencimiento no mueve el estado de ningún control, queda expired_at y exclusion.expire pero ningún evento de estado', async () => {
    const id = (await create(a.agent).expect(201)).body.data.id;
    await writeResult('compliant'); // el check ya pasa: la excepción no sostenía nada
    try {
      const movedBefore = (await stateEventsOf('exclusion_expired')).length;
      await owner(`update tenant.exclusions set valid_from = $2, valid_until = $3 where id = $1`, [id, day(-30), day(-1)]);
      expect((await expire()).expired).toBe(1);
      expect(await expireEvents(a.companyId, id)).toBe(1);
      expect((await stateEventsOf('exclusion_expired')).length).toBe(movedBefore);
    } finally {
      await writeResult('non_compliant');
    }
  });

  it('dos pasadas a la vez dejan un solo vencimiento, y una vigente no se toca', async () => {
    const id = (await create(a.agent).expect(201)).body.data.id;
    await owner(`update tenant.exclusions set valid_from = $2, valid_until = $3 where id = $1`, [id, day(-30), day(-1)]);
    const current = (await create(a.agent).expect(201)).body.data.id;
    const passes = await Promise.all([expire(), expire()]);
    expect(passes.reduce((n, r) => n + r.expired, 0)).toBe(1);
    expect(await expireEvents(a.companyId, id)).toBe(1);
    expect((await owner<{ expired_at: Date | null }>(`select expired_at from tenant.exclusions where id = $1`, [current]))[0].expired_at).toBeNull();
  });
});

describe('Listar', () => {
  let current: string;
  let expired: string;
  beforeAll(async () => {
    await reset();
    await definePeriod(day(120));
    expired = (await create(a.agent).expect(201)).body.data.id;
    await owner(`update tenant.exclusions set valid_from = $2, valid_until = $3 where id = $1`, [expired, day(-30), day(-1)]);
    current = (await create(a.agent).expect(201)).body.data.id;
  });

  it('pagina, de la más reciente a la más antigua, y filtra por prueba, activo y vencida', async () => {
    const all = (await a.agent.get(list(a)).expect(200)).body.data;
    expect(all).toMatchObject({ page: 1, page_size: 25, total: 2, total_pages: 1 });
    expect(all.items.map((e: any) => e.id)).toEqual([current, expired]);
    const ids = async (q: string) => (await a.agent.get(list(a, q)).expect(200)).body.data.items.map((e: any) => e.id);
    expect(await ids('?expired=true')).toEqual([expired]);
    expect(await ids('?expired=false')).toEqual([current]);
    expect(await ids(`?test_id=${testId}&asset_id=${a.assetId}`)).toHaveLength(2);
    expect(await ids(`?asset_id=${b.assetId}`)).toEqual([]);
    expect((await a.agent.get(list(a, '?page=2&page_size=1')).expect(200)).body.data.items.map((e: any) => e.id)).toEqual([expired]);
    expect(fields(await a.agent.get(list(a, '?status=approved')).expect(422))).toEqual([{ field: 'status', code: 'field.not_allowed' }]);
  });

  it('las leen el administrador y el auditor; el responsable y admin_monkey, no; otra empresa no ve nada', async () => {
    await auditor.get(list(a)).expect(200);
    await responsable.get(list(a)).expect(403);
    await monkey.get(list(a)).expect(403);
    await b.agent.get(list(a)).expect(404);
  });
});

describe('La base y el rastro', () => {
  beforeEach(async () => {
    await reset();
    await definePeriod(day(120));
  });

  it('la base no acepta una exclusión decidida sin quién ni cuándo, un rechazo sin motivo, ni una vigencia invertida', async () => {
    const id = (await create(a.agent).expect(201)).body.data.id;
    await expect(owner(`update tenant.exclusions set decided_at = null where id = $1`, [id])).rejects.toThrow(/exclusions_decision_shape/);
    await expect(owner(`update tenant.exclusions set status = 'rejected' where id = $1`, [id])).rejects.toThrow(/exclusions_decision_shape/);
    await expect(owner(`update tenant.exclusions set valid_until = valid_from - 1 where id = $1`, [id])).rejects.toThrow(/exclusions_validity_order/);
    await expect(owner(`update tenant.exclusions set justification = '  ' where id = $1`, [id])).rejects.toThrow(/exclusions_justification_present/);
  });

  it('cada exclusión deja su auditoría', async () => {
    const before = await auditRows(a.companyId, 'exclusion.create');
    await create(a.agent).expect(201);
    expect(await auditRows(a.companyId, 'exclusion.create')).toBe(before + 1);
  });

  it('si el rastro falla, la exclusión se revierte: ni fila, ni auditoría, ni evento de cumplimiento', async () => {
    const before = await auditRows(a.companyId, 'exclusion.create');
    const eventsBefore = await approvalEvents(a.companyId);
    auditFailsAfterInsert();
    await create(a.agent).expect(500);
    expect((await a.agent.get(list(a)).expect(200)).body.data.total).toBe(0);
    expect(await auditRows(a.companyId, 'exclusion.create')).toBe(before);
    expect(await approvalEvents(a.companyId)).toBe(eventsBefore);
  });
});
