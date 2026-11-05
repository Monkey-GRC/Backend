import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-168 · D87 · El período auditado y la fecha de corte de un marco del servicio (contracts/modules/compliance-overview.md). Cada prueba sale por HTTP con la sesión real de
// cada rol, contra el Postgres desechable. Las fechas salen del reloj para que la prueba no caduque.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let responsable: Agent;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const now = new Date();
const TODAY = iso(now);
const TOMORROW = iso(new Date(now.getTime() + 24 * 3600 * 1000));
const YESTERDAY = iso(new Date(now.getTime() - 24 * 3600 * 1000));
const START = `${now.getUTCFullYear() - 1}-01-01`;
const END = `${now.getUTCFullYear() + 1}-12-31`;

const path = (t: Tenant = a, code = 'soc2') => `/v1/services/${t.serviceId}/frameworks/${code}/evaluation-period`;
const overviewPath = (t: Tenant = a) => `/v1/services/${t.serviceId}/compliance-overview`;
const evaluationOf = async (t: Tenant) => (await t.agent.get(overviewPath(t)).expect(200)).body.data.frameworks.find((f: any) => f.framework_code === 'soc2').evaluation;
const auditRows = (tenantId: string) =>
  owner<{ before_state: any; after_state: any }>(`select before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'evaluation_period.set' order by created_at`, [tenantId]);

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable'): Promise<void> {
  await owner(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
     values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role)`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  );
}

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  for (const role of ['auditor', 'responsable'] as const) await cuenta(a.companyId, `${role}-per-${RUN}@cumplimiento.test`, role);
  auditor = await login(app, `auditor-per-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-per-${RUN}@cumplimiento.test`);
});
afterAll(async () => {
  await app?.close();
});

describe('Período auditado — antes de declararlo', () => {
  it('un servicio recién clonado no tiene evaluación: todo en nulo, también la fecha de corte efectiva', async () => {
    expect(await evaluationOf(a)).toEqual({ catalog_version: null, period_start: null, period_end: null, cutoff_date: null, cutoff_frozen: null });
  });
});

describe('Período auditado — declararlo', () => {
  it('con inicio y fin, y sin fecha de corte: 200, y la fecha de corte es hoy y no está congelada', async () => {
    const res = await a.agent.put(path()).send({ period_start: START, period_end: END }).expect(200);
    expect(res.body.message).toBeTruthy();
    expect(res.body.data).toEqual({ framework_code: 'soc2', catalog_version: expect.any(String), period_start: START, period_end: END, cutoff_date: TODAY, cutoff_frozen: false });
  });

  it('el resumen ya responde con la evaluación definida, con la fecha de corte de hoy', async () => {
    expect(await evaluationOf(a)).toEqual({ catalog_version: expect.any(String), period_start: START, period_end: END, cutoff_date: TODAY, cutoff_frozen: false });
  });

  it('con una fecha de corte, la congela: queda esa fecha, aunque pase el tiempo', async () => {
    const res = await a.agent.put(path()).send({ period_start: START, period_end: END, cutoff_date: YESTERDAY }).expect(200);
    expect(res.body.data).toMatchObject({ cutoff_date: YESTERDAY, cutoff_frozen: true });
    expect(await evaluationOf(a)).toMatchObject({ cutoff_date: YESTERDAY, cutoff_frozen: true });
  });

  it('sin la fecha de corte, o con null, la descongela y vuelve a ser hoy (PUT reemplaza)', async () => {
    expect((await a.agent.put(path()).send({ period_start: START, period_end: END, cutoff_date: null }).expect(200)).body.data).toMatchObject({ cutoff_date: TODAY, cutoff_frozen: false });
    await a.agent.put(path()).send({ period_start: START, period_end: END, cutoff_date: YESTERDAY }).expect(200);
    expect((await a.agent.put(path()).send({ period_start: START, period_end: END }).expect(200)).body.data).toMatchObject({ cutoff_date: TODAY, cutoff_frozen: false });
  });

  it('hoy sí vale como fecha de corte congelada', async () => {
    expect((await a.agent.put(path()).send({ period_start: START, period_end: END, cutoff_date: TODAY }).expect(200)).body.data).toMatchObject({ cutoff_date: TODAY, cutoff_frozen: true });
  });

  it('un período de un solo día (SOC 2 Tipo I) se acepta', async () => {
    const res = await a.agent.put(path()).send({ period_start: YESTERDAY, period_end: YESTERDAY }).expect(200);
    // El período ya terminó: la fecha de corte efectiva no pasa del fin.
    expect(res.body.data).toMatchObject({ period_start: YESTERDAY, period_end: YESTERDAY, cutoff_date: YESTERDAY, cutoff_frozen: false });
  });

  it('se puede repetir sin efecto extra (idempotente)', async () => {
    const first = (await a.agent.put(path()).send({ period_start: START, period_end: END }).expect(200)).body.data;
    const second = (await a.agent.put(path()).send({ period_start: START, period_end: END }).expect(200)).body.data;
    expect(second).toEqual(first);
  });
});

describe('Período auditado — validación (422, todos los errores a la vez)', () => {
  const fields = (res: request.Response) => res.body.error.fields.map((f: any) => [f.field, f.code]);

  it('un fin anterior al inicio', async () => {
    const res = await a.agent.put(path()).send({ period_start: '2026-12-31', period_end: '2026-01-01' }).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(fields(res)).toEqual([['period_end', 'period.invalid_range']]);
    expect(res.body.error.fields[0].message).toBeTruthy();
  });

  it('una fecha de corte fuera del período', async () => {
    const res = await a.agent.put(path()).send({ period_start: START, period_end: `${now.getUTCFullYear() - 1}-06-30`, cutoff_date: TODAY }).expect(422);
    expect(fields(res)).toEqual([['cutoff_date', 'cutoff.out_of_period']]);
  });

  it('una fecha de corte en el futuro', async () => {
    const res = await a.agent.put(path()).send({ period_start: START, period_end: END, cutoff_date: TOMORROW }).expect(422);
    expect(fields(res)).toEqual([['cutoff_date', 'cutoff.in_future']]);
  });

  it('una fecha que no existe o mal escrita, y los campos que faltan', async () => {
    expect(fields(await a.agent.put(path()).send({ period_start: '2026-02-31', period_end: '15/12/2026' }).expect(422))).toEqual([['period_start', 'date.invalid'], ['period_end', 'date.invalid']]);
    const res = await a.agent.put(path()).send({}).expect(422);
    expect(fields(res)).toEqual(expect.arrayContaining([['period_start', 'required'], ['period_end', 'required']]));
  });

  it('una validación fallida no cambia nada', async () => {
    const before = await evaluationOf(a);
    await a.agent.put(path()).send({ period_start: '2026-12-31', period_end: '2026-01-01' }).expect(422);
    expect(await evaluationOf(a)).toEqual(before);
  });
});

describe('Período auditado — quién y sobre qué', () => {
  const body = { period_start: START, period_end: END };

  it('401 sin sesión', async () => {
    await request(app.getHttpServer()).put(path()).send(body).expect(401);
  });

  it('solo admin_empresa: el responsable, el auditor y el administrador de Monkey reciben 403', async () => {
    for (const agent of [responsable, auditor, monkey]) await agent.put(path()).send(body).expect(403);
  });

  it('un marco que el servicio no contrató, o un servicio que no existe, es 404', async () => {
    await a.agent.put(path(a, 'iso27001')).send(body).expect(404);
    await a.agent.put(path(a, 'no-existe')).send(body).expect(404);
    await a.agent.put(`/v1/services/00000000-0000-4000-8000-000000000000/frameworks/soc2/evaluation-period`).send(body).expect(404);
    await a.agent.put(`/v1/services/no-es-un-uuid/frameworks/soc2/evaluation-period`).send(body).expect(404);
  });

  it('aislamiento: otra empresa no puede cambiar el período de este servicio (404) y el suyo sigue intacto', async () => {
    await b.agent.put(path(a)).send(body).expect(404);
    expect(await evaluationOf(b)).toMatchObject({ period_start: null, cutoff_date: null });
  });

  it('cambiar el período de una empresa no toca el de la otra', async () => {
    await b.agent.put(path(b)).send({ period_start: '2025-01-01', period_end: '2025-12-31' }).expect(200);
    expect(await evaluationOf(a)).toMatchObject({ period_start: expect.any(String) });
    expect(await evaluationOf(b)).toMatchObject({ period_start: '2025-01-01', period_end: '2025-12-31' });
  });
});

describe('Período auditado — rastro de auditoría (SEG-36)', () => {
  it('cada cambio deja su rastro con el valor anterior y el nuevo', async () => {
    const rows = await auditRows(a.companyId);
    expect(rows.length).toBeGreaterThan(1);
    // La primera declaración: antes nada, después el período.
    expect(rows[0].before_state).toMatchObject({ service_id: a.serviceId, framework_code: 'soc2', period_start: null, period_end: null, cutoff_date: null });
    expect(rows[0].after_state).toMatchObject({ period_start: START, period_end: END, cutoff_date: null });
    // Los que siguen parten del anterior.
    expect(rows[1].before_state).toMatchObject({ period_start: START, period_end: END });
  });

  it('un cambio rechazado por validación no deja rastro', async () => {
    const n = (await auditRows(a.companyId)).length;
    await a.agent.put(path()).send({ period_start: '2026-12-31', period_end: '2026-01-01' }).expect(422);
    expect((await auditRows(a.companyId)).length).toBe(n);
  });
});
