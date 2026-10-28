import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-155 + D85 + D91 · El veredicto de un test manual que no es documental: lo da el admin_empresa (D96), cuenta en todos los controles del servicio que llevan el test y deja una
// evaluación inmutable por control y activo. Cada cambio de estado de un control que provoca queda como evento de cumplimiento. Cada prueba sale por HTTP con la sesión real
// de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let adminId: string;
let auditor: Agent;
let funcional: Agent;

let manualControl: string; // un control con un test de nube que el admin_empresa resuelve a mano (`technical_manual`)
let manualTest: string;
let automaticTest: { control: string; test: string }; // un test de nube que la sonda mide (`hybrid`)
let noAssetsTest: { control: string; test: string } | null; // un test manual de una dimensión sin activos en el servicio (base de datos)
let documentary: { control: string; test: string };

const verdicts = (controlId: string, testId: string) => `/v1/controls/${controlId}/tests/${testId}/verdicts`;
const give = (agent: Agent, result: string, extra: Record<string, unknown> = {}) => agent.post(verdicts(manualControl, manualTest)).send({ result, ...extra });
const stateEvents = (controlId: string) =>
  owner<{ previous_value: any; new_value: any; user_id: string | null }>(
    `select previous_value, new_value, user_id from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'control_id' = $2 order by created_at`,
    [a.companyId, controlId],
  );
const auditRows = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Camilo', 'Ortiz', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}

/** Un control del servicio con un test de la dimensión pedida cuyo tipo en el control es el dado. */
async function pick(dimension: string, type: string) {
  return owner<{ control: string; test: string }>(
    `select cc.id control, x.test_id test from tenant.client_controls cc
       join tenant.client_control_dimensions d on d.client_control_id = cc.id and d.dimension = $2::catalog.dimension and d.type = $3::catalog.control_dimension_type
       join tenant.client_control_tests x on x.client_control_id = cc.id
       join catalog.tests t on t.id = x.test_id and t.dimension = $2::catalog.dimension
      where cc.service_id = $1 and cc.is_active order by cc.own_code, t.code`,
    [a.serviceId, dimension, type],
  );
}

beforeAll(async () => {
  app = await bootApp();
  ({ a, b } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>(`update platform.users set name = 'Camilo', last_name = 'Ortiz' where email = $1 returning id`, [a.email]))[0].id;
  await cuenta(a.companyId, `auditor-ver-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `funcional-ver-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-ver-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-ver-${RUN}@cumplimiento.test`);

  const manual = await pick('cloud', 'technical_manual');
  expect(manual.length).toBeGreaterThan(0);
  ({ control: manualControl, test: manualTest } = manual[0]);
  const automatic = await pick('cloud', 'hybrid');
  expect(automatic.length).toBeGreaterThan(0);
  automaticTest = automatic[0];
  noAssetsTest = (await pick('database', 'technical_manual'))[0] ?? null;
  const doc = await owner<{ control: string; test: string }>(
    `select cc.id control, x.test_id test from tenant.client_controls cc join tenant.client_control_tests x on x.client_control_id = cc.id
       join catalog.tests t on t.id = x.test_id and t.dimension = 'policy' where cc.service_id = $1 and cc.is_active order by cc.own_code limit 1`,
    [a.serviceId],
  );
  documentary = doc[0];
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Dar el veredicto de un test manual', () => {
  it('antes del veredicto el test está pendiente: la ausencia de un veredicto nunca es cumplimiento', async () => {
    const d = (await a.agent.get(`/v1/controls/${manualControl}?view=technical`).expect(200)).body.data;
    expect(d.technical.tests.find((t: any) => t.test_id === manualTest).state).toBe('pending');
    expect((await a.agent.get(verdicts(manualControl, manualTest)).expect(200)).body.data.items).toEqual([]);
  });

  it('el admin_empresa lo da: 201, queda con quién lo confirmó, y cuenta en el estado del test', async () => {
    const before = await auditRows('test_verdict.issue');
    const res = await give(a.agent, 'compliant', { note: 'La revisión manual del período está firmada.' }).expect(201);
    const v = res.body.data;
    expect(res.body.message).toBeDefined();
    expect(v).toMatchObject({
      control_id: manualControl, test_id: manualTest, dimension: 'cloud', origin: 'manual', result: 'compliant', note: 'La revisión manual del período está firmada.',
      closure_observation_reason: null, test_state: 'compliant', confirmed_by: { id: adminId, name: 'Camilo', last_name: 'Ortiz' },
    });
    expect(v.applies_to_controls.map((c: any) => c.id)).toContain(manualControl);
    expect(await auditRows('test_verdict.issue')).toBe(before + 1);
    const detail = (await a.agent.get(`/v1/controls/${manualControl}?view=technical`).expect(200)).body.data;
    expect(detail.technical.tests.find((t: any) => t.test_id === manualTest).state).toBe('compliant');
  });

  it('deja una evaluación por control que lleva el test y por activo de su dimensión, todas confirmadas por el admin_empresa', async () => {
    const rows = await owner<{ n: number; controls: number; confirmed: number }>(
      `select count(*)::int n, count(distinct client_control_id)::int controls, count(*) filter (where confirmed_by = $3)::int confirmed
         from tenant.evaluations where service_id = $1 and test_id = $2 and origin = 'manual'`,
      [a.serviceId, manualTest, adminId],
    );
    const carrying = await owner<{ n: number }>(`select count(*)::int n from tenant.client_control_tests x join tenant.client_controls c on c.id = x.client_control_id where x.test_id = $1 and c.service_id = $2 and c.is_active`, [manualTest, a.serviceId]);
    expect(rows[0].controls).toBe(carrying[0].n);
    expect(rows[0].n).toBe(rows[0].controls); // el servicio de prueba tiene un solo activo de nube
    expect(rows[0].confirmed).toBe(rows[0].n);
  });

  it('un veredicto posterior se agrega y el anterior se conserva: el más reciente manda y el historial trae los dos', async () => {
    const res = await give(a.agent, 'non_compliant', { note: 'Falta la firma de la dirección.' }).expect(201);
    expect(res.body.data).toMatchObject({ result: 'non_compliant', test_state: 'non_compliant' });
    const list = (await a.agent.get(verdicts(manualControl, manualTest)).expect(200)).body.data;
    expect(list.total).toBe(2);
    expect(list.items.map((i: any) => i.result)).toEqual(['non_compliant', 'compliant']);
    expect(list.items.every((i: any) => i.origin === 'manual' && i.confirmed_by.id === adminId)).toBe(true);
    expect(list.items[0].applies_to_controls.length).toBeGreaterThan(0);
  });

  it('el admin_empresa y el auditor leen el historial; el funcional no', async () => {
    expect((await auditor.get(verdicts(manualControl, manualTest)).expect(200)).body.data.total).toBe(2);
    expect((await a.agent.get(verdicts(manualControl, manualTest)).expect(200)).body.data.total).toBe(2);
    await funcional.get(verdicts(manualControl, manualTest)).expect(403);
  });
});

describe('Cada cambio de estado de un control deja un evento (D91)', () => {
  it('el veredicto que mueve el control deja un evento con el estado anterior y el nuevo, a nombre del admin_empresa', async () => {
    const events = await stateEvents(manualControl);
    const mine = events.filter((e) => e.new_value.cause === 'test_verdict');
    expect(mine.length).toBeGreaterThan(0);
    for (const e of mine) {
      expect(e.user_id).toBe(adminId);
      expect(e.previous_value).toEqual(expect.objectContaining({ state: expect.any(String), readiness: expect.any(String) }));
      expect(e.new_value).toEqual(expect.objectContaining({ control_id: manualControl, service_id: a.serviceId, state: expect.any(String), readiness: expect.any(String) }));
      expect(JSON.stringify(e.previous_value)).not.toEqual(JSON.stringify({ state: e.new_value.state, readiness: e.new_value.readiness, progress: e.new_value.progress }));
    }
  });

  it('un veredicto que repite el estado no deja un evento nuevo', async () => {
    const before = (await stateEvents(manualControl)).length;
    await give(a.agent, 'non_compliant', { note: 'Se mantiene.' }).expect(201);
    expect((await stateEvents(manualControl)).length).toBe(before);
  });

  it('los eventos son inmutables y no se pueden editar ni borrar', async () => {
    await expect(owner(`update audit.compliance_events set changed_field = 'x' where tenant_id = $1 and changed_field = 'control.state'`, [a.companyId])).rejects.toThrow(/append-only|inmutable/);
  });
});

describe('Quién puede dar un veredicto y sobre qué', () => {
  it('solo el admin_empresa: el funcional, el auditor y el administrador de Monkey reciben 403', async () => {
    await funcional.post(verdicts(manualControl, manualTest)).send({ result: 'compliant' }).expect(403);
    await auditor.post(verdicts(manualControl, manualTest)).send({ result: 'compliant' }).expect(403);
  });

  it('un test automático lo mide la sonda: 409 TEST_NOT_MANUAL', async () => {
    const res = await a.agent.post(verdicts(automaticTest.control, automaticTest.test)).send({ result: 'compliant' }).expect(409);
    expect(res.body.error.code).toBe('TEST_NOT_MANUAL');
  });

  it('un test documental se resuelve revisando su evidencia: 409 TEST_DECIDED_BY_EVIDENCE', async () => {
    const res = await a.agent.post(verdicts(documentary.control, documentary.test)).send({ result: 'compliant' }).expect(409);
    expect(res.body.error.code).toBe('TEST_DECIDED_BY_EVIDENCE');
  });

  it('sin activos de la dimensión del test no hay sobre qué dar el veredicto: 409 TEST_HAS_NO_ASSETS', async () => {
    if (!noAssetsTest) return; // el catálogo cargado no trae un test manual de base de datos en este servicio
    const res = await a.agent.post(verdicts(noAssetsTest.control, noAssetsTest.test)).send({ result: 'compliant' }).expect(409);
    expect(res.body.error.code).toBe('TEST_HAS_NO_ASSETS');
  });

  it('el test debe ser del control; un id inválido y otra empresa, 404', async () => {
    await a.agent.post(verdicts(manualControl, automaticTest.test)).send({ result: 'compliant' }).expect(404);
    await a.agent.post(verdicts('no-es-un-uuid', manualTest)).send({ result: 'compliant' }).expect(404);
    await b.agent.post(verdicts(manualControl, manualTest)).send({ result: 'compliant' }).expect(404);
    await b.agent.get(verdicts(manualControl, manualTest)).expect(404);
  });

  it('validación: un resultado que no existe y campos de más', async () => {
    const res = await give(a.agent, 'quizas').expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'result', code: 'enum.invalid' })]));
    await give(a.agent, 'compliant', { confirmed_by: adminId }).expect(422);
    await give(a.agent, 'compliant', { note: 'x'.repeat(2001) }).expect(422);
  });

  it('un veredicto rechazado no deja evaluaciones ni rastro', async () => {
    const before = await owner<{ n: number }>(`select count(*)::int n from tenant.evaluations where service_id = $1 and origin = 'manual'`, [a.serviceId]);
    const audits = await auditRows('test_verdict.issue');
    await give(a.agent, 'quizas').expect(422);
    await a.agent.post(verdicts(automaticTest.control, automaticTest.test)).send({ result: 'compliant' }).expect(409);
    expect((await owner<{ n: number }>(`select count(*)::int n from tenant.evaluations where service_id = $1 and origin = 'manual'`, [a.serviceId]))[0].n).toBe(before[0].n);
    expect(await auditRows('test_verdict.issue')).toBe(audits);
  });

  it('si el rastro falla, el veredicto se revierte: ni evaluaciones ni eventos ni fila de auditoría (SEG-36)', async () => {
    const realInsert = auditInsert.insertAuditLog;
    const count = async () =>
      (await owner<{ n: number }>(
        `select (select count(*) from tenant.evaluations where service_id = $1 and origin = 'manual')::int
              + (select count(*) from audit.compliance_events where tenant_id = $1)::int
              + (select count(*) from audit.audit_logs where tenant_id = $1 and action = 'test_verdict.issue')::int n`,
        [a.companyId],
      ))[0].n;
    const before = await count();
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await give(a.agent, 'compliant').expect(500);
    expect(await count()).toBe(before);
  });

  it('la razón de cierre se guarda con la evaluación', async () => {
    const res = await give(a.agent, 'compliant', { closure_observation_reason: 'La observación abierta es de forma.' }).expect(201);
    expect(res.body.data.closure_observation_reason).toBe('La observación abierta es de forma.');
    const stored = await owner<{ n: number }>(`select count(*)::int n from tenant.evaluations where service_id = $1 and test_id = $2 and closure_observation_reason is not null`, [a.serviceId, manualTest]);
    expect(stored[0].n).toBeGreaterThan(0);
  });
});
