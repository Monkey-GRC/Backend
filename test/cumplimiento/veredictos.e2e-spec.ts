import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { asApp, failure, withRollback } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';
import { asignarControl } from '../support/asignaciones';

// MD-155 + D85 + D91 + D102 + D121 (MD-194) · El veredicto de una prueba manual que no es documental se REGISTRA (el ejecutor, el dueño o el admin_empresa) y se REVISA (el dueño, si no lo registró él, y
// el admin_empresa): nace pendiente y no cuenta; el último del test en el servicio decide el estado del test, y solo si está aprobado. Cada cambio de estado de un control queda como evento de
// cumplimiento. Cada prueba sale por HTTP con la sesión real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let adminId: string;
let monkey: Agent;
let auditor: Agent;
let responsable: Agent; // dueño del control manual
let responsableId: string;
let ajeno: Agent; // otro responsable: no atiende el control
let delegado: Agent; // ejecutor del control manual
let delegadoId: string;
let delegadoAjeno: Agent; // otro delegado: no lo ejecuta

let manualControl: string; // un control con un test de nube que se resuelve a mano (`manual`)
let manualTest: string;
let automaticTest: { control: string; test: string }; // un test de nube que la sonda mide (`hybrid`)
let noAssetsTest: { control: string; test: string } | null; // un test manual de una dimensión sin activos en el servicio (base de datos)
let documentary: { control: string; test: string };

const verdicts = (controlId: string, testId: string) => `/v1/controls/${controlId}/tests/${testId}/verdicts`;
const register = (agent: Agent, result: string, extra: Record<string, unknown> = {}) => agent.post(verdicts(manualControl, manualTest)).send({ result, ...extra });
const give = (agent: Agent, result: string, extra: Record<string, unknown> = {}) => register(agent, result, extra);
const review = (agent: Agent, verdictId: string, body: Record<string, unknown>) => agent.put(`/v1/verdicts/${verdictId}/review`).send(body);
const stateEvents = (controlId: string) =>
  owner<{ previous_value: any; new_value: any; user_id: string | null }>(
    `select previous_value, new_value, user_id from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'control_id' = $2 order by created_at`,
    [a.companyId, controlId],
  );
const auditRows = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);
/** El estado del test manual en su control de origen, tal como lo ve quien pide la vista técnica. */
const testState = async (): Promise<string> =>
  (await a.agent.get(`/v1/controls/${manualControl}?view=technical`).expect(200)).body.data.technical.tests.find((t: any) => t.test_id === manualTest).state;
const history = async (agent: Agent = a.agent) => (await agent.get(verdicts(manualControl, manualTest)).expect(200)).body.data;
const reviewsIn = (verdictId: string) => owner<{ reviewer_role: string; decision: string }>('select reviewer_role, decision from tenant.test_verdict_reviews where test_verdict_id = $1 order by reviewer_role', [verdictId]);

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable' | 'delegado'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role, is_internal) values (gen_random_uuid(), $1, $2, 'Camilo', 'Ortiz', $3, $4::platform.user_role, $5) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role, role === 'delegado' ? true : null],
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
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>(`update platform.users set name = 'Camilo', last_name = 'Ortiz' where email = $1 returning id`, [a.email]))[0].id;
  await cuenta(a.companyId, `auditor-ver-${RUN}@cumplimiento.test`, 'auditor');
  responsableId = await cuenta(a.companyId, `responsable-ver-${RUN}@cumplimiento.test`, 'responsable');
  await cuenta(a.companyId, `ajeno-ver-${RUN}@cumplimiento.test`, 'responsable');
  delegadoId = await cuenta(a.companyId, `delegado-ver-${RUN}@cumplimiento.test`, 'delegado');
  await cuenta(a.companyId, `delegado2-ver-${RUN}@cumplimiento.test`, 'delegado');
  auditor = await login(app, `auditor-ver-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-ver-${RUN}@cumplimiento.test`);
  ajeno = await login(app, `ajeno-ver-${RUN}@cumplimiento.test`);
  delegado = await login(app, `delegado-ver-${RUN}@cumplimiento.test`);
  delegadoAjeno = await login(app, `delegado2-ver-${RUN}@cumplimiento.test`);

  const manual = await pick('cloud', 'manual');
  expect(manual.length).toBeGreaterThan(0);
  ({ control: manualControl, test: manualTest } = manual[0]);
  await asignarControl(a.companyId, manualControl, responsableId, delegadoId);
  const automatic = await pick('cloud', 'hybrid');
  expect(automatic.length).toBeGreaterThan(0);
  automaticTest = automatic[0];
  noAssetsTest = (await pick('database', 'manual'))[0] ?? null;
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

describe('Registrar el veredicto de un test manual (D121)', () => {
  it('antes del veredicto el test está pendiente: la ausencia de un veredicto nunca es cumplimiento', async () => {
    expect(await testState()).toBe('pending');
    expect((await history()).items).toEqual([]);
  });

  it('el ejecutor (delegado) lo registra: 201, nace pendiente, con quién lo registró, y NO cuenta todavía', async () => {
    const before = await auditRows('test_verdict.issue');
    const res = await give(delegado, 'compliant', { note: 'La revisión manual del período está firmada.' }).expect(201);
    const v = res.body.data;
    expect(res.body.message).toBeDefined();
    expect(v).toMatchObject({
      control_id: manualControl, test_id: manualTest, dimension: 'cloud', origin: 'manual', result: 'compliant', note: 'La revisión manual del período está firmada.',
      closure_observation_reason: null, state: 'pending', reviews: [], test_state: 'pending', registered_by: { id: delegadoId, name: 'Camilo', last_name: 'Ortiz', role: 'delegado' },
    });
    expect(v.applies_to_controls.map((c: any) => c.id)).toContain(manualControl);
    expect(await auditRows('test_verdict.issue')).toBe(before + 1);
    expect(await testState()).toBe('pending');
  });

  it('el dueño (responsable) lo aprueba con su rol: 200, aprobado, cuenta en el estado del test', async () => {
    const id = (await history()).items[0].id;
    const res = await review(responsable, id, { decision: 'approve', note: 'Revisado.' }).expect(200);
    expect(res.body.data).toMatchObject({ id, state: 'approved', result: 'compliant', test_state: 'compliant', reviews: [{ reviewer_role: 'responsable', decision: 'approve', note: 'Revisado.', reviewed_by: { id: responsableId } }] });
    expect(await testState()).toBe('compliant');
  });

  it('cuenta en TODOS los controles del servicio que llevan el test (D85)', async () => {
    const res = (await history()).items[0];
    expect(res.applies_to_controls.length).toBeGreaterThan(0);
    for (const c of res.applies_to_controls) {
      const d = (await a.agent.get(`/v1/controls/${c.id}?view=technical`).expect(200)).body.data;
      expect(d.technical.tests.find((t: any) => t.test_id === manualTest).state).toBe('compliant');
    }
  });

  it('el motor lee `test_verdicts`: ya no se escriben evaluaciones manuales', async () => {
    const rows = await owner<{ n: number }>(`select count(*)::int n from tenant.evaluations where service_id = $1 and test_id = $2 and origin = 'manual'`, [a.serviceId, manualTest]);
    expect(rows[0].n).toBe(0);
  });

  it('el admin_empresa que lo registra lo aprueba al nacer: cuenta al instante y queda quién registró y quién aprobó (P34)', async () => {
    const res = await give(a.agent, 'non_compliant', { note: 'Falta la firma de la dirección.' }).expect(201);
    expect(res.body.data).toMatchObject({
      result: 'non_compliant', state: 'approved', test_state: 'non_compliant', registered_by: { id: adminId, role: 'admin_empresa' },
      reviews: [{ reviewer_role: 'admin_empresa', decision: 'approve', reviewed_by: { id: adminId } }],
    });
    expect(await testState()).toBe('non_compliant');
  });

  it('el último registrado manda y el anterior se conserva: el historial trae los dos, el más reciente primero', async () => {
    const list = await history();
    expect(list.total).toBe(2);
    expect(list.items.map((i: any) => i.result)).toEqual(['non_compliant', 'compliant']);
    expect(list.items.map((i: any) => i.state)).toEqual(['approved', 'approved']);
    expect(list.items.every((i: any) => i.origin === 'manual')).toBe(true);
  });

  it('un veredicto nuevo SIN aprobar deja el test pendiente aunque el anterior estuviera aprobado; al aprobarlo, cuenta', async () => {
    const res = await give(delegado, 'compliant', { note: 'Ya se corrigió la firma.' }).expect(201);
    expect(res.body.data).toMatchObject({ state: 'pending', test_state: 'pending' });
    expect(await testState()).toBe('pending');
    await review(a.agent, res.body.data.id, { decision: 'approve' }).expect(200);
    expect(await testState()).toBe('compliant');
  });
});

describe('Quién revisa un veredicto y cómo se combinan las revisiones (D102, D121)', () => {
  let id: string;

  it('el dueño NO revisa un veredicto que registró él mismo (403); el admin_empresa sí', async () => {
    id = (await give(responsable, 'compliant', { note: 'Lo registra el dueño.' }).expect(201)).body.data.id;
    await review(responsable, id, { decision: 'approve' }).expect(403);
    expect(await reviewsIn(id)).toEqual([]);
    const res = await review(a.agent, id, { decision: 'approve' }).expect(200);
    expect(res.body.data).toMatchObject({ state: 'approved', registered_by: { id: responsableId, role: 'responsable' }, reviews: [{ reviewer_role: 'admin_empresa' }] });
  });

  it('el admin_empresa revisa también lo que registró él (P34): un segundo PUT del mismo rol reemplaza su revisión', async () => {
    const mine = (await give(a.agent, 'compliant').expect(201)).body.data.id;
    await review(a.agent, mine, { decision: 'reject', note: 'Me equivoqué de período.' }).expect(200);
    expect((await reviewsIn(mine)).length).toBe(1);
    expect(((await history()).items[0] as any).state).toBe('rejected');
    await review(a.agent, mine, { decision: 'approve' }).expect(200);
    expect(await reviewsIn(mine)).toEqual([{ reviewer_role: 'admin_empresa', decision: 'approve' }]);
    expect(((await history()).items[0] as any).state).toBe('approved');
  });

  it('delegado (ejecutor), auditor, admin_monkey y un responsable que no es el dueño reciben 403 al revisar; nada se escribe', async () => {
    const pendiente = (await give(delegado, 'compliant').expect(201)).body.data.id;
    for (const agent of [delegado, auditor, monkey, ajeno]) await review(agent, pendiente, { decision: 'approve' }).expect(403);
    expect(await reviewsIn(pendiente)).toEqual([]);
    id = pendiente;
  });

  it('el rechazo de un rol gana sobre la aprobación del otro, pide nota y anula la aprobación previa', async () => {
    const sinNota = await review(responsable, id, { decision: 'reject' }).expect(422);
    expect(sinNota.body.error.fields[0]).toMatchObject({ field: 'note', code: 'note.required' });
    await review(responsable, id, { decision: 'reject', note: '   ' }).expect(422);
    await review(a.agent, id, { decision: 'approve' }).expect(200);
    expect(await testState()).toBe('compliant');
    const rechazado = await review(responsable, id, { decision: 'reject', note: 'La evidencia es de otro período.' }).expect(200);
    expect(rechazado.body.data).toMatchObject({ state: 'rejected', test_state: 'pending' });
    expect(rechazado.body.data.reviews.map((r: any) => r.reviewer_role)).toEqual(['admin_empresa', 'responsable']);
    expect(await testState()).toBe('pending'); // un rechazado no cuenta ni deja valer a uno anterior
    // El responsable cambia de opinión: su revisión se reemplaza y vuelve a contar.
    await review(responsable, id, { decision: 'approve' }).expect(200);
    expect((await reviewsIn(id)).length).toBe(2);
    expect(await testState()).toBe('compliant');
  });

  it('un veredicto que ya no es el último del test en el servicio no se revisa: 409 VERDICT_SUPERSEDED', async () => {
    const viejo = id;
    await give(a.agent, 'non_compliant', { note: 'Más reciente.' }).expect(201);
    const res = await review(a.agent, viejo, { decision: 'approve' }).expect(409);
    expect(res.body.error.code).toBe('VERDICT_SUPERSEDED');
    await review(responsable, viejo, { decision: 'reject', note: 'x' }).expect(409);
  });

  it('el rechazo y la revisión dejan rastro, con el rol y quién registró, y el evento de estado a nombre de quien revisó', async () => {
    const [row] = await owner<{ user_id: string; after_state: Record<string, unknown> }>(
      `select user_id, after_state from audit.audit_logs where tenant_id = $1 and action = 'test_verdict.review' and after_state->>'reviewer_role' = 'responsable' order by created_at desc limit 1`, [a.companyId]);
    expect(row.user_id).toBe(responsableId);
    expect(row.after_state).toMatchObject({ reviewer_role: 'responsable', decision: expect.any(String), registered_by: expect.any(String), verdict_state: expect.any(String) });
    expect(JSON.stringify(row.after_state)).not.toContain('otro período'); // la nota no viaja en el detalle
    // v2 (MD-498, D91): el evento de estado registra el cambio de nivel o de estado del control; el veredicto de UNA prueba ya no lo mueve mientras otros requisitos sigan pendientes,
    // así que no hay un evento por cada revisión. Los que haya, llevan a quien revisó.
    const events = (await stateEvents(manualControl)).filter((e) => e.new_value.cause === 'test_verdict_review');
    expect(events.every((e) => e.user_id === responsableId || e.user_id === adminId)).toBe(true);
  });

  it('un id inválido, uno inexistente y otra empresa: 404', async () => {
    await review(a.agent, 'no-es-un-uuid', { decision: 'approve' }).expect(404);
    await review(a.agent, '00000000-0000-4000-8000-000000000000', { decision: 'approve' }).expect(404);
    await review(b.agent, id, { decision: 'approve' }).expect(404);
  });

  it('validación: decisión inexistente, sin decisión, rol en el cuerpo y nota demasiado larga se rechazan (422)', async () => {
    const reciente = (await history()).items[0].id;
    expect((await review(a.agent, reciente, { decision: 'quizas' }).expect(422)).body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'decision' })]));
    await review(a.agent, reciente, {}).expect(422);
    await review(a.agent, reciente, { decision: 'approve', reviewer_role: 'responsable' }).expect(422);
    await review(a.agent, reciente, { decision: 'approve', note: 'x'.repeat(2001) }).expect(422);
  });
});

describe('Cada cambio de estado de un control deja un evento (D91)', () => {
  it('el veredicto que mueve el control deja un evento con el estado anterior y el nuevo, a nombre de quien lo registró', async () => {
    const events = await stateEvents(manualControl);
    const mine = events.filter((e) => e.new_value.cause === 'test_verdict');
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.some((e) => e.user_id === adminId)).toBe(true); // el del admin_empresa, que nace aprobado
    for (const e of mine) {
      expect([adminId, delegadoId, responsableId]).toContain(e.user_id);
      expect(e.previous_value).toEqual(expect.objectContaining({ state: expect.any(String), readiness: expect.any(String) }));
      expect(e.new_value).toEqual(expect.objectContaining({ control_id: manualControl, service_id: a.serviceId, state: expect.any(String), readiness: expect.any(String) }));
      expect(JSON.stringify(e.previous_value)).not.toEqual(JSON.stringify({ state: e.new_value.state, readiness: e.new_value.readiness, progress: e.new_value.progress }));
    }
  });

  it('un veredicto pendiente que releva a uno aprobado mueve el estado (deja evento); otro pendiente encima ya no lo mueve', async () => {
    const antes = await stateEvents(manualControl);
    await give(delegado, 'compliant', { note: 'Pendiente de revisión.' }).expect(201);
    expect(await testState()).toBe('pending');
    const despues = await stateEvents(manualControl);
    expect(despues.length).toBe(antes.length + 1);
    expect(despues[despues.length - 1]).toMatchObject({ user_id: delegadoId, new_value: { cause: 'test_verdict' } });
    await give(delegado, 'non_compliant', { note: 'Otro pendiente.' }).expect(201);
    expect((await stateEvents(manualControl)).length).toBe(despues.length);
  });

  it('los eventos son inmutables y no se pueden editar ni borrar', async () => {
    await expect(owner(`update audit.compliance_events set changed_field = 'x' where tenant_id = $1 and changed_field = 'control.state'`, [a.companyId])).rejects.toThrow(/append-only|inmutable/);
  });
});

describe('Quién puede registrar un veredicto y sobre qué', () => {
  it('registran el admin_empresa, el dueño y el ejecutor; el auditor, admin_monkey, otro responsable y otro delegado reciben 403', async () => {
    await give(responsable, 'compliant').expect(201);
    await give(delegado, 'compliant').expect(201);
    for (const agent of [auditor, monkey, ajeno, delegadoAjeno]) await agent.post(verdicts(manualControl, manualTest)).send({ result: 'compliant' }).expect(403);
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
    await give(a.agent, 'compliant', { registered_by: adminId }).expect(422);
    await give(a.agent, 'compliant', { note: 'x'.repeat(2001) }).expect(422);
  });

  it('un veredicto rechazado en el borde no deja filas ni rastro', async () => {
    const count = () => owner<{ n: number }>(`select count(*)::int n from tenant.test_verdicts where service_id = $1`, [a.serviceId]).then((r) => r[0].n);
    const before = await count();
    const audits = await auditRows('test_verdict.issue');
    await give(a.agent, 'quizas').expect(422);
    await a.agent.post(verdicts(automaticTest.control, automaticTest.test)).send({ result: 'compliant' }).expect(409);
    await auditor.post(verdicts(manualControl, manualTest)).send({ result: 'compliant' }).expect(403);
    expect(await count()).toBe(before);
    expect(await auditRows('test_verdict.issue')).toBe(audits);
  });

  it('si el rastro falla, el veredicto se revierte: ni veredicto ni revisión ni eventos ni fila de auditoría (SEG-36)', async () => {
    const realInsert = auditInsert.insertAuditLog;
    const count = async () =>
      (await owner<{ n: number }>(
        `select (select count(*) from tenant.test_verdicts where service_id = $1)::int
              + (select count(*) from tenant.test_verdict_reviews where tenant_id = $2)::int
              + (select count(*) from audit.compliance_events where tenant_id = $2)::int
              + (select count(*) from audit.audit_logs where tenant_id = $2 and action = 'test_verdict.issue')::int n`,
        [a.serviceId, a.companyId],
      ))[0].n;
    const before = await count();
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await give(a.agent, 'compliant').expect(500);
    expect(await count()).toBe(before);
  });

  it('si el rastro de una revisión falla, la revisión se revierte (SEG-36)', async () => {
    const pendiente = (await give(delegado, 'compliant').expect(201)).body.data.id;
    const realInsert = auditInsert.insertAuditLog;
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await review(a.agent, pendiente, { decision: 'approve' }).expect(500);
    expect(await reviewsIn(pendiente)).toEqual([]);
  });

  it('la razón de cierre se guarda con el veredicto', async () => {
    const res = await give(a.agent, 'compliant', { closure_observation_reason: 'La observación abierta es de forma.' }).expect(201);
    expect(res.body.data.closure_observation_reason).toBe('La observación abierta es de forma.');
    const stored = await owner<{ n: number }>(`select count(*)::int n from tenant.test_verdicts where service_id = $1 and test_id = $2 and closure_observation_reason is not null`, [a.serviceId, manualTest]);
    expect(stored[0].n).toBeGreaterThan(0);
  });
});

describe('Quién lee el historial de veredictos', () => {
  it('el admin_empresa, el auditor, el dueño y el ejecutor lo leen, con estado, quién lo registró y las revisiones', async () => {
    const total = (await history()).total;
    for (const agent of [auditor, responsable, delegado]) {
      const list = await history(agent);
      expect(list.total).toBe(total);
      expect(list.items[0]).toEqual(expect.objectContaining({ state: expect.any(String), registered_by: expect.objectContaining({ role: expect.any(String) }), reviews: expect.any(Array) }));
    }
  });

  it('otro responsable, otro delegado y admin_monkey reciben 403', async () => {
    for (const agent of [ajeno, delegadoAjeno, monkey]) await agent.get(verdicts(manualControl, manualTest)).expect(403);
  });

  it('pagina el historial', async () => {
    const page = (await a.agent.get(`${verdicts(manualControl, manualTest)}?page=1&page_size=2`).expect(200)).body.data;
    expect(page.items.length).toBe(2);
    expect(page.total).toBeGreaterThan(2);
  });
});

describe('La base aísla y protege los veredictos (D121)', () => {
  it('B no ve los veredictos ni las revisiones de A, y la app no puede editarlos ni borrarlos', async () => {
    const [v] = await owner<{ id: string }>(`select id from tenant.test_verdicts where tenant_id = $1 limit 1`, [a.companyId]);
    const [r] = await owner<{ id: string }>(`select id from tenant.test_verdict_reviews where tenant_id = $1 limit 1`, [a.companyId]);
    await withRollback(async (db) => {
      await asApp(db, { tenantId: b.companyId, role: 'admin_empresa' }, async () => {
        expect((await db.query(`select count(*)::int n from tenant.test_verdicts where id = $1`, [v.id])).rows[0].n).toBe(0);
        expect((await db.query(`select count(*)::int n from tenant.test_verdict_reviews where id = $1`, [r.id])).rows[0].n).toBe(0);
      });
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => {
        expect((await db.query(`select count(*)::int n from tenant.test_verdicts where id = $1`, [v.id])).rows[0].n).toBe(1);
        expect(await failure(db, `update tenant.test_verdicts set result = 'compliant' where id = $1`, [v.id])).toMatch(/permission denied/);
        expect(await failure(db, `delete from tenant.test_verdicts where id = $1`, [v.id])).toMatch(/permission denied/);
        expect(await failure(db, `delete from tenant.test_verdict_reviews where id = $1`, [r.id])).toMatch(/permission denied/);
      });
    });
  });

  it('un veredicto es inmutable también para el dueño de la base (trigger), salvo la purga de la empresa', async () => {
    await expect(owner(`update tenant.test_verdicts set result = 'compliant' where tenant_id = $1`, [a.companyId])).rejects.toThrow(/inmutable|immutable|row-level/);
  });

  it('solo existe una revisión por rol y veredicto, y rechazar exige nota también en la base', async () => {
    const [row] = await owner<{ test_verdict_id: string; reviewed_by: string; tenant_id: string }>(
      `select test_verdict_id, reviewed_by, tenant_id from tenant.test_verdict_reviews where tenant_id = $1 and reviewer_role = 'admin_empresa' limit 1`, [a.companyId]);
    await withRollback(async (db) => {
      await db.query(`select set_config('app.tenant_id', $1, true)`, [row.tenant_id]);
      expect(
        await failure(db, `insert into tenant.test_verdict_reviews (id, tenant_id, test_verdict_id, reviewer_role, decision, reviewed_by) values (gen_random_uuid(), $1, $2, 'admin_empresa', 'approve', $3)`, [row.tenant_id, row.test_verdict_id, row.reviewed_by]),
      ).toMatch(/duplicate key|unique/);
      expect(
        await failure(db, `insert into tenant.test_verdict_reviews (id, tenant_id, test_verdict_id, reviewer_role, decision, reviewed_by) values (gen_random_uuid(), $1, $2, 'responsable', 'reject', $3)`, [row.tenant_id, row.test_verdict_id, row.reviewed_by]),
      ).toMatch(/check constraint|reject_note/);
    });
  });
});

// D121 · Las evaluaciones manuales que ya existían se migran como veredictos aprobados por quien las dio. Se corre el mismo SQL de la migración sobre filas sembradas, dentro de una transacción
// que se revierte. Las evaluaciones antiguas son una fila por control y activo: salen UN veredicto por servicio, test e instante.
describe('Migración de las evaluaciones manuales a veredictos aprobados (D121)', () => {
  it('cada veredicto antiguo (varias filas con el mismo instante) pasa a UN veredicto aprobado por quien lo confirmó', async () => {
    const sql = readFileSync(join(__dirname, '../../prisma/migrations/20261117000100_test_verdicts/migration.sql'), 'utf8');
    const data = sql.slice(sql.indexOf('-- MigrateData'));
    expect(data.length).toBeGreaterThan(50);
    const [seed] = await owner<{ control: string; version: string; asset: string }>(
      `select cc.id control, (select id from catalog.catalog_versions limit 1) version, $2::uuid asset from tenant.client_controls cc where cc.id = $1`, [manualControl, a.assetId]);
    const controls = (await owner<{ id: string }>(`select client_control_id id from tenant.client_control_tests where test_id = $1 and client_control_id in (select id from tenant.client_controls where service_id = $2) limit 2`, [manualTest, a.serviceId])).map((r) => r.id);
    await withRollback(async (db) => {
      await db.query(`select set_config('app.tenant_id', $1, true)`, [a.companyId]);
      const before = (await db.query(`select count(*)::int n from tenant.test_verdicts where service_id = $1`, [a.serviceId])).rows[0].n;
      const evaluatedAt = '2025-01-02T03:04:05.000Z';
      for (const c of controls) {
        await db.query(
          `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, confirmed_by, evaluated_at, dimension, result, origin, verdict_note)
           values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, 'cloud', 'non_compliant', 'manual', 'Migrada')`,
          [a.companyId, a.serviceId, c, manualTest, seed.asset, seed.version, adminId, evaluatedAt],
        );
      }
      await db.query(data);
      const migrated = (await db.query(`select id, result, note, registered_by, client_control_id from tenant.test_verdicts where service_id = $1 and note = 'Migrada'`, [a.serviceId])).rows;
      expect(migrated.length).toBe(1);
      expect(migrated[0]).toMatchObject({ result: 'non_compliant', registered_by: adminId });
      const reviews = (await db.query(`select reviewer_role, decision, reviewed_by from tenant.test_verdict_reviews where test_verdict_id = $1`, [migrated[0].id])).rows;
      expect(reviews).toEqual([{ reviewer_role: 'admin_empresa', decision: 'approve', reviewed_by: adminId }]);
      expect((await db.query(`select count(*)::int n from tenant.test_verdicts where service_id = $1`, [a.serviceId])).rows[0].n).toBe(before + 1);
    });
  });
});

// MD-154, D85 · Con observaciones del auditor abiertas en el control de origen, el veredicto exige explicar por qué se da igual (`closure_reason.required`). Cuentan solo las `open` del
// control de origen: una que la empresa ya respondió, una cerrada o una de otro control no piden nada.
describe('Un veredicto con observaciones abiertas del auditor en el control de origen', () => {
  const observe = async (control: string | null) => (await auditor.post(`/v1/services/${a.serviceId}/observations`).send({ type: 'observation', body: 'Revisar la firma de las actas.', ...(control ? { client_control_id: control } : {}) }).expect(201)).body.data;
  const closeOut = async (id: string) => {
    await a.agent.post(`/v1/observations/${id}/answer`).send({ answer_note: 'Se firmaron las actas.' }).expect(200);
    await auditor.patch(`/v1/observations/${id}`).send({ status: 'closed' }).expect(200);
  };

  it('sin la razón: 422 closure_reason.required, y no se escribe ningún veredicto', async () => {
    const o = await observe(manualControl);
    const before = (await owner<{ n: number }>('select count(*)::int n from tenant.test_verdicts where tenant_id = $1', [a.companyId]))[0].n;
    const res = await give(a.agent, 'compliant', { note: 'Sin explicar.' });
    expect(res.status).toBe(422);
    expect(res.body.error.fields).toEqual([expect.objectContaining({ field: 'closure_observation_reason', code: 'closure_reason.required' })]);
    expect((await owner<{ n: number }>('select count(*)::int n from tenant.test_verdicts where tenant_id = $1', [a.companyId]))[0].n).toBe(before);
    await closeOut(o.id);
  });

  it('con la razón: 201, y queda guardada en el veredicto', async () => {
    const o = await observe(manualControl);
    const res = await give(a.agent, 'compliant', { note: 'Con razón.', closure_observation_reason: 'La observación es de forma y no afecta al control.' }).expect(201);
    expect(res.body.data.closure_observation_reason).toBe('La observación es de forma y no afecta al control.');
    await closeOut(o.id);
  });

  it('una razón en blanco no vale', async () => {
    const o = await observe(manualControl);
    expect((await give(a.agent, 'compliant', { closure_observation_reason: '   ' })).status).toBe(422);
    await closeOut(o.id);
  });

  it('respondida o cerrada deja de pedir la razón; también una de otro control o de un servicio completo', async () => {
    const respondida = await observe(manualControl);
    await a.agent.post(`/v1/observations/${respondida.id}/answer`).send({ answer_note: 'Atendida.' }).expect(200);
    const ajena = await observe(automaticTest.control);
    const servicio = await observe(null);
    await give(a.agent, 'compliant', { note: 'Ya atendidas o ajenas.' }).expect(201);
    await auditor.patch(`/v1/observations/${respondida.id}`).send({ status: 'closed' }).expect(200);
    await closeOut(ajena.id);
    await closeOut(servicio.id);
  });

  it('si el auditor devuelve la respondida a abierta, vuelve a pedir la razón', async () => {
    const o = await observe(manualControl);
    await a.agent.post(`/v1/observations/${o.id}/answer`).send({ answer_note: 'Atendida.' }).expect(200);
    await auditor.patch(`/v1/observations/${o.id}`).send({ status: 'open' }).expect(200);
    expect((await give(a.agent, 'compliant')).status).toBe(422);
    await closeOut(o.id);
  });
});
