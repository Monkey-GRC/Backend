import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-123 · Evaluar un riesgo en la matriz 5×5 y registrar su tratamiento con un cargo como responsable (contracts/modules/compliance-risks.md).
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let funcional: Agent;
let adminId: string;
let riskId: string; // un riesgo del catálogo de la empresa A
let ciso: { id: string; type: string; person_name: string };
const risks = (t: Tenant, q = '') => `/v1/services/${t.serviceId}/risks${q}`;
const evaluate = (agent: Agent, id: string, body: object) => agent.post(`/v1/risks/${id}/evaluation`).send(body);
const treat = (agent: Agent, id: string, body: object) => agent.post(`/v1/risks/${id}/treatments`).send(body);
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string; message: string }>).map(({ field, code }) => ({ field, code }));
const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
const realInsert = auditInsert.insertAuditLog;
const auditFailsAfterInsert = () =>
  jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
    await realInsert(db, entry);
    throw new Error('audit_down');
  });
const auditRows = (tenantId: string, action: string) =>
  owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [tenantId, action]).then((r) => r[0].n);

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}
const riskOf = async (agent: Agent, t: Tenant, id: string) => (await agent.get(`/v1/risks/${id}`).expect(200)).body.data;

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-eva-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `funcional-eva-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-eva-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-eva-${RUN}@cumplimiento.test`);
  adminId = (await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]))[0].id;
  riskId = (await a.agent.get(risks(a, '?page_size=100')).expect(200)).body.data.items.find((r: any) => r.origin === 'catalog').id;
  ciso = (await a.agent.post('/v1/responsibles').send({ type: 'ciso', person_name: 'Marta Ruiz' }).expect(201)).body.data;
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Evaluar un riesgo: el servidor calcula el valor y el nivel', () => {
  it.each([
    [1, 1, 1, 'low'],
    [2, 2, 4, 'low'],
    [3, 3, 9, 'moderate'],
    [2, 5, 10, 'high'],
    [4, 4, 16, 'high'],
    [5, 4, 20, 'critical'],
    [5, 5, 25, 'critical'],
  ])('probabilidad %i e impacto %i → valor %i, nivel %s', async (likelihood, impact, value, level) => {
    const res = await evaluate(a.agent, riskId, { likelihood, impact }).expect(201);
    expect(res.body.message).toBeTruthy();
    expect(res.body.data).toMatchObject({ risk_id: riskId, likelihood, impact, inherent_risk_value: value, inherent_risk_level: level });
    expect(res.body.data.evaluated_by).toMatchObject({ id: adminId });
    expect(new Date(res.body.data.evaluated_at).getTime()).not.toBeNaN();
  });

  it('un riesgo ya evaluado guarda el valor previo, y la primera evaluación no trae ninguno', async () => {
    const fresh = (await a.agent.post(risks(a)).send({ name: 'Pérdida de un portátil', description: 'Un equipo se extravía.', trust_criterion: 'confidentiality', potential_impact: ['reputational'] }).expect(201)).body.data.id;
    const first = await evaluate(a.agent, fresh, { likelihood: 2, impact: 4 }).expect(201);
    expect(first.body.data.previous).toBeNull();
    const second = await evaluate(a.agent, fresh, { likelihood: 3, impact: 4 }).expect(201);
    expect(second.body.data.previous).toEqual({ likelihood: 2, impact: 4, inherent_risk_value: 8, inherent_risk_level: 'moderate' });
    expect(second.body.data).toMatchObject({ inherent_risk_value: 12, inherent_risk_level: 'high' });
  });

  it('el valor y el nivel que mande el cliente se ignoran', async () => {
    const res = await evaluate(a.agent, riskId, { likelihood: 1, impact: 2, inherent_risk_value: 25, inherent_risk_level: 'critical' }).expect(201);
    expect(res.body.data).toMatchObject({ inherent_risk_value: 2, inherent_risk_level: 'low' });
  });

  it('la lista y el detalle muestran la evaluación vigente, y se puede filtrar por nivel y por evaluado', async () => {
    await evaluate(a.agent, riskId, { likelihood: 5, impact: 4 }).expect(201);
    const detail = await riskOf(a.agent, a, riskId);
    expect(detail).toMatchObject({ likelihood: 5, impact: 4, inherent_risk_value: 20, inherent_risk_level: 'critical' });
    const critical = (await a.agent.get(risks(a, '?inherent_risk_level=critical&page_size=100')).expect(200)).body.data.items;
    expect(critical.map((r: any) => r.id)).toContain(riskId);
    const notEvaluated = (await a.agent.get(risks(a, '?evaluated=false&page_size=100')).expect(200)).body.data.items;
    expect(notEvaluated.map((r: any) => r.id)).not.toContain(riskId);
  });

  it('valida por campo, con todos los errores a la vez', async () => {
    expect(fields(await evaluate(a.agent, riskId, { likelihood: 0, impact: 6 }).expect(422))).toEqual([
      { field: 'likelihood', code: 'number.range' },
      { field: 'impact', code: 'number.range' },
    ]);
    expect(fields(await evaluate(a.agent, riskId, { likelihood: 2.5 }).expect(422))).toEqual(
      expect.arrayContaining([{ field: 'likelihood', code: 'number.invalid' }, { field: 'impact', code: 'required' }]),
    );
  });

  it('la base no acepta una evaluación incoherente', async () => {
    await expect(owner(`update tenant.client_risks set likelihood = 3, impact = 3, inherent_risk_value = 8, inherent_risk_level = 'moderate' where id = $1`, [riskId])).rejects.toThrow(/client_risks_evaluation_shape/);
    await expect(owner(`update tenant.client_risks set likelihood = 6, impact = 1, inherent_risk_value = 6, inherent_risk_level = 'moderate' where id = $1`, [riskId])).rejects.toThrow(/client_risks_evaluation_shape/);
  });
});

describe('Quién puede evaluar, y el aislamiento entre empresas', () => {
  it('solo el administrador de la empresa evalúa: el auditor, el funcional y admin_monkey reciben 403', async () => {
    await evaluate(auditor, riskId, { likelihood: 1, impact: 1 }).expect(403);
    await evaluate(funcional, riskId, { likelihood: 1, impact: 1 }).expect(403);
    await evaluate(monkey, riskId, { likelihood: 1, impact: 1 }).expect(403);
  });

  it('un riesgo de otra empresa no existe: 404, y un id que no es UUID tampoco', async () => {
    await evaluate(b.agent, riskId, { likelihood: 1, impact: 1 }).expect(404);
    await evaluate(a.agent, '00000000-0000-0000-0000-000000000000', { likelihood: 1, impact: 1 }).expect(404);
    await evaluate(a.agent, 'no-es-uuid', { likelihood: 1, impact: 1 }).expect(404);
    await b.agent.get(`/v1/risks/${riskId}/evaluation-history`).expect(404);
    await treat(b.agent, riskId, { decision: 'accept', responsible_id: ciso.id, due_date: inDays(10) }).expect(404);
  });

  it('un riesgo dado de baja no se evalúa ni se trata: 409', async () => {
    const id = (await a.agent.post(risks(a)).send({ name: 'Riesgo de baja', description: 'Se retirará.', trust_criterion: 'security', potential_impact: [] }).expect(201)).body.data.id;
    await a.agent.delete(`/v1/risks/${id}`).expect(204);
    expect((await evaluate(a.agent, id, { likelihood: 2, impact: 2 }).expect(409)).body.error.code).toBe('RISK_INACTIVE');
    expect((await treat(a.agent, id, { decision: 'accept', responsible_id: ciso.id, due_date: inDays(10) }).expect(409)).body.error.code).toBe('RISK_INACTIVE');
  });
});

describe('Historial de evaluaciones', () => {
  let id: string;
  beforeAll(async () => {
    id = (await a.agent.post(risks(a)).send({ name: 'Riesgo con historial', description: 'Para probar el historial.', trust_criterion: 'availability', potential_impact: [] }).expect(201)).body.data.id;
    await evaluate(a.agent, id, { likelihood: 2, impact: 2 }).expect(201);
    await evaluate(a.agent, id, { likelihood: 4, impact: 4 }).expect(201);
    await evaluate(a.agent, id, { likelihood: 5, impact: 5 }).expect(201);
  });

  it('va de la más reciente a la más antigua, con lo previo de cada una', async () => {
    const res = await a.agent.get(`/v1/risks/${id}/evaluation-history`).expect(200);
    expect(res.body.data).toMatchObject({ page: 1, page_size: 25, total: 3, total_pages: 1 });
    const items = res.body.data.items;
    expect(items.map((i: any) => i.inherent_risk_value)).toEqual([25, 16, 4]);
    expect(items[0].previous).toMatchObject({ inherent_risk_value: 16 });
    expect(items[1].previous).toMatchObject({ inherent_risk_value: 4 });
    expect(items[2].previous).toBeNull();
    expect(items[0].evaluated_by).toMatchObject({ id: adminId });
  });

  it('pagina', async () => {
    const res = await a.agent.get(`/v1/risks/${id}/evaluation-history?page=2&page_size=2`).expect(200);
    expect(res.body.data).toMatchObject({ page: 2, page_size: 2, total: 3, total_pages: 2 });
    expect(res.body.data.items).toHaveLength(1);
  });

  it('lo leen el administrador y el auditor; el funcional y admin_monkey, no', async () => {
    await auditor.get(`/v1/risks/${id}/evaluation-history`).expect(200);
    await funcional.get(`/v1/risks/${id}/evaluation-history`).expect(403);
    await monkey.get(`/v1/risks/${id}/evaluation-history`).expect(403);
  });
});

describe('Tratamiento de un riesgo', () => {
  it('agrega una decisión con un cargo y una fecha, y la vigente es la última', async () => {
    const res = await treat(a.agent, riskId, { decision: 'mitigate', responsible_id: ciso.id, due_date: inDays(30) }).expect(201);
    expect(res.body.data).toEqual({
      id: expect.any(String),
      risk_id: riskId,
      decision: 'mitigate',
      responsible: { id: ciso.id, type: 'ciso', person_name: 'Marta Ruiz' },
      due_date: inDays(30),
      created_at: expect.any(String),
    });
    const second = await treat(a.agent, riskId, { decision: 'transfer', responsible_id: ciso.id, due_date: inDays(60) }).expect(201);
    const detail = await riskOf(a.agent, a, riskId);
    expect(detail.treatment).toEqual({ decision: 'transfer', due_date: inDays(60), responsible: { id: ciso.id, type: 'ciso', person_name: 'Marta Ruiz' } });
    const listed = (await a.agent.get(risks(a, '?page_size=100')).expect(200)).body.data.items.find((r: any) => r.id === riskId);
    expect(listed.treatment).toMatchObject({ decision: 'transfer' });
    const history = (await a.agent.get(`/v1/risks/${riskId}/treatments`).expect(200)).body.data;
    expect(history.items.map((t: any) => t.id)[0]).toBe(second.body.data.id);
    expect(history.total).toBeGreaterThanOrEqual(2);
  });

  it('un riesgo sin tratamiento lo trae en null', async () => {
    const fresh = (await a.agent.post(risks(a)).send({ name: 'Sin tratar', description: 'Todavía sin decisión.', trust_criterion: 'privacy', potential_impact: [] }).expect(201)).body.data.id;
    expect((await riskOf(a.agent, a, fresh)).treatment).toBeNull();
    expect((await a.agent.get(`/v1/risks/${fresh}/treatments`).expect(200)).body.data.items).toEqual([]);
  });

  it('valida por campo: decisión desconocida, cargo sin formato, fecha pasada o mal escrita', async () => {
    expect(fields(await treat(a.agent, riskId, { decision: 'ignorar', responsible_id: 'x', due_date: inDays(5) }).expect(422))).toEqual(
      expect.arrayContaining([{ field: 'decision', code: 'enum.invalid' }, { field: 'responsible_id', code: 'uuid.invalid' }]),
    );
    expect(fields(await treat(a.agent, riskId, { decision: 'accept', responsible_id: ciso.id, due_date: inDays(-1) }).expect(422))).toEqual([{ field: 'due_date', code: 'date.past' }]);
    expect(fields(await treat(a.agent, riskId, { decision: 'accept', responsible_id: ciso.id, due_date: '2026-02-31' }).expect(422))).toEqual([{ field: 'due_date', code: 'date.invalid' }]);
    expect(fields(await treat(a.agent, riskId, { decision: 'accept', responsible_id: ciso.id, due_date: 'mañana' }).expect(422))).toEqual([{ field: 'due_date', code: 'date.invalid' }]);
    await treat(a.agent, riskId, { decision: 'accept', responsible_id: ciso.id, due_date: inDays(0) }).expect(201); // hoy sí vale
  });

  it('el responsable es un cargo de esta empresa: uno ajeno o inexistente es 404', async () => {
    const other = (await b.agent.post('/v1/responsibles').send({ type: 'it', person_name: 'Otra Persona' }).expect(201)).body.data;
    await treat(a.agent, riskId, { decision: 'accept', responsible_id: other.id, due_date: inDays(10) }).expect(404);
    await treat(a.agent, riskId, { decision: 'accept', responsible_id: '00000000-0000-0000-0000-000000000000', due_date: inDays(10) }).expect(404);
  });

  it('el cargo que responde de un tratamiento ya no se puede quitar', async () => {
    const cargo = (await a.agent.post('/v1/responsibles').send({ type: 'compliance', person_name: 'Laura Gómez' }).expect(201)).body.data;
    await a.agent.delete(`/v1/responsibles/${cargo.id}`).expect(204); // sin uso, se puede
    const cargo2 = (await a.agent.post('/v1/responsibles').send({ type: 'compliance', person_name: 'Pedro Pérez' }).expect(201)).body.data;
    await treat(a.agent, riskId, { decision: 'avoid', responsible_id: cargo2.id, due_date: inDays(15) }).expect(201);
    expect((await a.agent.delete(`/v1/responsibles/${cargo2.id}`).expect(409)).body.error.code).toBe('RESPONSIBLE_IN_USE');
  });

  it('cambiar la persona del cargo no toca el tratamiento que apunta a él', async () => {
    const id = (await a.agent.post(risks(a)).send({ name: 'Riesgo con cargo', description: 'Para ver que el cargo se conserva.', trust_criterion: 'security', potential_impact: [] }).expect(201)).body.data.id;
    await treat(a.agent, id, { decision: 'mitigate', responsible_id: ciso.id, due_date: inDays(20) }).expect(201);
    await a.agent.patch(`/v1/responsibles/${ciso.id}`).send({ person_name: 'Marta Ruiz Peña' }).expect(200);
    const detail = await riskOf(a.agent, a, id);
    expect(detail.treatment.responsible).toEqual({ id: ciso.id, type: 'ciso', person_name: 'Marta Ruiz Peña' });
  });

  it('solo el administrador trata; lo leen el auditor y el funcional de un riesgo suyo, y admin_monkey no', async () => {
    const body = { decision: 'accept', responsible_id: ciso.id, due_date: inDays(10) };
    await treat(auditor, riskId, body).expect(403);
    await treat(funcional, riskId, body).expect(403);
    await treat(monkey, riskId, body).expect(403);
    await auditor.get(`/v1/risks/${riskId}/treatments`).expect(200);
    await monkey.get(`/v1/risks/${riskId}/treatments`).expect(403);
    // el funcional sin acciones asignadas no ve riesgos: el historial de uno tampoco
    await funcional.get(`/v1/risks/${riskId}/treatments`).expect(403);
  });
});

describe('Rastro y atomicidad', () => {
  it('cada evaluación y cada tratamiento dejan su auditoría, con lo anterior y lo nuevo', async () => {
    const id = (await a.agent.post(risks(a)).send({ name: 'Riesgo auditado', description: 'Para ver el rastro.', trust_criterion: 'integrity', potential_impact: [] }).expect(201)).body.data.id;
    await evaluate(a.agent, id, { likelihood: 2, impact: 3 }).expect(201);
    await evaluate(a.agent, id, { likelihood: 3, impact: 3 }).expect(201);
    const rows = await owner<{ before_state: any; after_state: any; user_id: string }>(
      `select before_state, after_state, user_id from audit.audit_logs where tenant_id = $1 and action = 'client_risk.evaluate' and after_state->>'risk_id' = $2 order by created_at`,
      [a.companyId, id],
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].before_state).toMatchObject({ likelihood: null, impact: null, inherent_risk_value: null });
    expect(rows[1].before_state).toMatchObject({ likelihood: 2, impact: 3, inherent_risk_value: 6, inherent_risk_level: 'moderate' });
    expect(rows[1].after_state).toMatchObject({ likelihood: 3, impact: 3, inherent_risk_value: 9, inherent_risk_level: 'moderate' });
    expect(rows[1].user_id).toBe(adminId);
    expect(await auditRows(a.companyId, 'risk_treatment.create')).toBeGreaterThan(0);
  });

  it('si el rastro falla, la evaluación se revierte y tampoco queda su fila de auditoría', async () => {
    const id = (await a.agent.post(risks(a)).send({ name: 'Riesgo de reversa', description: 'Para probar la reversa.', trust_criterion: 'security', potential_impact: [] }).expect(201)).body.data.id;
    const before = await auditRows(a.companyId, 'client_risk.evaluate');
    auditFailsAfterInsert();
    await evaluate(a.agent, id, { likelihood: 4, impact: 4 }).expect(500);
    expect(await riskOf(a.agent, a, id)).toMatchObject({ likelihood: null, inherent_risk_level: null });
    expect(await auditRows(a.companyId, 'client_risk.evaluate')).toBe(before);
  });

  it('si el rastro falla, el tratamiento se revierte y tampoco queda su fila de auditoría', async () => {
    const id = (await a.agent.post(risks(a)).send({ name: 'Riesgo de reversa 2', description: 'Para probar la reversa.', trust_criterion: 'security', potential_impact: [] }).expect(201)).body.data.id;
    const before = await auditRows(a.companyId, 'risk_treatment.create');
    auditFailsAfterInsert();
    await treat(a.agent, id, { decision: 'accept', responsible_id: ciso.id, due_date: inDays(10) }).expect(500);
    expect((await a.agent.get(`/v1/risks/${id}/treatments`).expect(200)).body.data.items).toEqual([]);
    expect(await auditRows(a.companyId, 'risk_treatment.create')).toBe(before);
  });
});
