import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { asApp, failure, withRollback } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-155 + D77 + SEG-56 · La evaluación del consultor (lista o no lista para la auditoría) y la del auditor (certifica o no) sobre un servicio y un marco. Cada rol emite solo la
// suya, una emitida no se edita ni se borra y no cambia el estado calculado. Cada prueba sale por HTTP con la sesión real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let consultor: Agent;
let consultorB: Agent;
let auditor: Agent;
let funcional: Agent;
let consultorId: string;
let auditorId: string;
let framework: string;
let serviceFrameworkId: string;

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const path = (t: Tenant = a, code: string = framework) => `/v1/services/${t.serviceId}/frameworks/${code}/assessments`;
const issue = (agent: Agent, verdict: string, over: Record<string, unknown> = {}) => agent.post(path()).send({ verdict, rationale: 'Las evidencias del período están completas.', ...over });
const period = (over: Record<string, unknown> = {}) =>
  a.agent.put(`/v1/services/${a.serviceId}/frameworks/${framework}/evaluation-period`).send({ period_start: day(-60), period_end: day(120), ...over });
const auditRows = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);
const overview = async () => (await consultor.get(`/v1/services/${a.serviceId}/compliance-overview?view=technical`).expect(200)).body.data;
const stripAssessments = (o: any) => JSON.parse(JSON.stringify(o, (k, v) => (k === 'assessments' ? undefined : v)));

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional' | 'consultor'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Camilo', 'Ortiz', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  consultorId = await cuenta(a.companyId, `consultor-asm-${RUN}@cumplimiento.test`, 'consultor');
  auditorId = await cuenta(a.companyId, `auditor-asm-${RUN}@cumplimiento.test`, 'auditor');
  await cuenta(a.companyId, `funcional-asm-${RUN}@cumplimiento.test`, 'funcional');
  await cuenta(b.companyId, `consultor-asmb-${RUN}@cumplimiento.test`, 'consultor');
  consultor = await login(app, `consultor-asm-${RUN}@cumplimiento.test`);
  auditor = await login(app, `auditor-asm-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-asm-${RUN}@cumplimiento.test`);
  consultorB = await login(app, `consultor-asmb-${RUN}@cumplimiento.test`);
  const [sf] = await owner<{ id: string; code: string }>(
    `select sf.id, f.code from tenant.service_frameworks sf join catalog.frameworks f on f.id = sf.framework_id where sf.service_id = $1 and sf.status = 'active' limit 1`,
    [a.serviceId],
  );
  serviceFrameworkId = sf.id;
  framework = sf.code;
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Sin período no hay evaluación (REQ-004, D87)', () => {
  it('emitirla sin el período definido responde 409 EVALUATION_NOT_DEFINED y no deja nada', async () => {
    const before = await auditRows('framework_assessment.issue');
    const res = await issue(consultor, 'ready').expect(409);
    expect(res.body.error.code).toBe('EVALUATION_NOT_DEFINED');
    expect(await auditRows('framework_assessment.issue')).toBe(before);
    expect((await consultor.get(path()).expect(200)).body.data.items).toEqual([]);
  });
});

describe('Emitir la evaluación', () => {
  beforeAll(async () => {
    await period().expect(200);
  });

  it('el consultor emite la suya: 201, ligada a la evaluación del servicio, con la fecha de corte congelada', async () => {
    const before = await auditRows('framework_assessment.issue');
    const res = await issue(consultor, 'ready').expect(201);
    expect(res.body.data).toMatchObject({
      service_id: a.serviceId, framework_code: framework, assessor_role: 'consultor', verdict: 'ready', rationale: 'Las evidencias del período están completas.', is_current: true,
      issued_by: { id: consultorId, name: 'Camilo', last_name: 'Ortiz' }, evaluation: { period_start: day(-60), period_end: day(120), cutoff_date: day(0) },
    });
    expect(res.body.data.evaluation.catalog_version).toEqual(expect.any(String));
    expect(await auditRows('framework_assessment.issue')).toBe(before + 1);
    const [sf] = await owner<{ cutoff: string }>(`select to_char(cutoff_date, 'YYYY-MM-DD') cutoff from tenant.service_frameworks where id = $1`, [serviceFrameworkId]);
    expect(sf.cutoff).toBe(day(0));
  });

  it('el auditor emite la suya, y no cambia el estado calculado del servicio (D77)', async () => {
    const before = stripAssessments(await overview());
    const res = await issue(auditor, 'certified', { rationale: 'Certifico el período auditado.' }).expect(201);
    expect(res.body.data).toMatchObject({ assessor_role: 'auditor', verdict: 'certified', is_current: true, issued_by: { id: auditorId } });
    expect(stripAssessments(await overview())).toEqual(before);
  });

  it('cada rol emite solo la suya: emitir el valor del otro rol es 403 y no deja nada (SEG-56)', async () => {
    const before = await owner<{ n: number }>(`select count(*)::int n from tenant.framework_assessments where service_framework_id = $1`, [serviceFrameworkId]);
    for (const [agent, verdict] of [[consultor, 'certified'], [consultor, 'not_certified'], [auditor, 'ready'], [auditor, 'not_ready']] as const) {
      const res = await issue(agent, verdict).expect(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    }
    const after = await owner<{ n: number }>(`select count(*)::int n from tenant.framework_assessments where service_framework_id = $1`, [serviceFrameworkId]);
    expect(after[0].n).toBe(before[0].n);
    expect((await issue(consultor, 'quizas').expect(422)).body.error.fields[0]).toMatchObject({ field: 'verdict', code: 'enum.invalid' });
  });

  it('la justificación es obligatoria, y el rol no viaja en el cuerpo', async () => {
    const empty = await issue(consultor, 'not_ready', { rationale: '   ' }).expect(422);
    expect(empty.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'rationale' })]));
    const missing = await consultor.post(path()).send({ verdict: 'not_ready' }).expect(422);
    expect(missing.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'rationale', code: 'required' })]));
    await issue(consultor, 'ready', { assessor_role: 'auditor' }).expect(422);
  });

  it('solo el consultor y el auditor: la empresa y el administrador de Monkey reciben 403', async () => {
    await issue(a.agent, 'ready').expect(403);
    await issue(funcional, 'ready').expect(403);
    await issue(monkey, 'ready').expect(403);
    await a.agent.get(path()).expect(403);
    await funcional.get(path()).expect(403);
  });

  it('si el rastro falla, la evaluación no queda ni congela la fecha de corte (SEG-36)', async () => {
    const realInsert = auditInsert.insertAuditLog;
    const rows = () => owner<{ n: number }>(`select count(*)::int n from tenant.framework_assessments where service_framework_id = $1`, [serviceFrameworkId]).then((r) => r[0].n);
    const before = await rows();
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await issue(auditor, 'not_certified').expect(500);
    expect(await rows()).toBe(before);
  });

  it('un servicio de otra empresa o un marco no contratado, 404', async () => {
    await consultorB.post(path(a)).send({ verdict: 'ready', rationale: 'x' }).expect(404);
    await consultorB.get(path(a)).expect(404);
    await issue(consultor, 'ready').expect(201).then(() => undefined);
    await consultor.post(path(a, 'no-existe')).send({ verdict: 'ready', rationale: 'x' }).expect(404);
    await consultor.post(`/v1/services/no-es-un-uuid/frameworks/${framework}/assessments`).send({ verdict: 'ready', rationale: 'x' }).expect(404);
  });
});

describe('Una emitida no se edita ni se borra: se emite otra y vale la última', () => {
  it('la nueva se agrega, la anterior se conserva y solo la última de cada rol es vigente', async () => {
    await issue(consultor, 'not_ready', { rationale: 'Faltan las evidencias del trimestre.' }).expect(201);
    const all = (await consultor.get(path()).expect(200)).body.data;
    const consultants = all.items.filter((i: any) => i.assessor_role === 'consultor');
    expect(consultants.length).toBeGreaterThanOrEqual(3);
    expect(consultants[0]).toMatchObject({ verdict: 'not_ready', is_current: true });
    expect(consultants.slice(1).every((i: any) => i.is_current === false)).toBe(true);
    const issuedAt = all.items.map((i: any) => i.issued_at);
    expect([...issuedAt].sort().reverse()).toEqual(issuedAt); // la más reciente primero
    const current = (await auditor.get(`${path()}?current=true`).expect(200)).body.data.items;
    expect(current.map((i: any) => `${i.assessor_role}:${i.verdict}`).sort()).toEqual(['auditor:certified', 'consultor:not_ready']);
    expect((await auditor.get(`${path()}?assessor_role=auditor`).expect(200)).body.data.items.every((i: any) => i.assessor_role === 'auditor')).toBe(true);
    expect((await auditor.get(`${path()}?assessor_role=otro`).expect(422)).body.error.fields[0].field).toBe('assessor_role');
  });

  it('la base no deja editarla ni borrarla: ni a la app ni al dueño de la tabla', async () => {
    const [row] = await owner<{ id: string }>(`select id from tenant.framework_assessments where service_framework_id = $1 limit 1`, [serviceFrameworkId]);
    const inmutable = /es inmutable|permission denied/;
    await withRollback(async (db) => {
      expect(await failure(db, `update tenant.framework_assessments set rationale = 'otra' where id = $1`, [row.id])).toMatch(inmutable);
      expect(await failure(db, `delete from tenant.framework_assessments where id = $1`, [row.id])).toMatch(inmutable);
      expect(await failure(db, `truncate tenant.framework_assessments cascade`)).toMatch(inmutable);
      await asApp(db, { tenantId: a.companyId, role: 'consultor' }, async () => {
        expect(await failure(db, `update tenant.framework_assessments set rationale = 'otra' where id = $1`, [row.id])).toMatch(inmutable);
        expect(await failure(db, `delete from tenant.framework_assessments where id = $1`, [row.id])).toMatch(inmutable);
      });
    });
  });

  it('la base impone que cada rol emita solo lo suyo y que la justificación no esté vacía', async () => {
    await withRollback(async (db) => {
      const insert = (role: string, verdict: string, rationale: string) =>
        failure(
          db,
          `insert into tenant.framework_assessments (id, tenant_id, service_framework_id, assessor_role, verdict, rationale, issued_by)
           values (gen_random_uuid(), $1, $2, $3::tenant.assessor_role, $4::tenant.assessment_verdict, $5, $6)`,
          [a.companyId, serviceFrameworkId, role, verdict, rationale, consultorId],
        );
      expect(await insert('consultor', 'certified', 'x')).toMatch(/framework_assessments_role_verdict_check/);
      expect(await insert('auditor', 'ready', 'x')).toMatch(/framework_assessments_role_verdict_check/);
      expect(await insert('consultor', 'ready', '   ')).toMatch(/framework_assessments_rationale_check/);
      expect(await insert('consultor', 'ready', 'bien')).toBeNull();
    });
  });

  it('otra empresa no ve estas evaluaciones aunque conozca el servicio', async () => {
    const asB = await withRollback((db) =>
      asApp(db, { tenantId: b.companyId, role: 'consultor' }, async () => (await db.query('select count(*)::int n from tenant.framework_assessments where service_framework_id = $1', [serviceFrameworkId])).rows[0].n),
    );
    expect(asB).toBe(0);
  });
});

describe('Con una evaluación emitida, el período ya no se cambia', () => {
  it('cambiar el período o la fecha de corte responde 409 EVALUATION_ALREADY_ISSUED y no toca nada', async () => {
    const before = await owner<{ ps: string; pe: string; cd: string }>(
      `select to_char(period_start, 'YYYY-MM-DD') ps, to_char(period_end, 'YYYY-MM-DD') pe, to_char(cutoff_date, 'YYYY-MM-DD') cd from tenant.service_frameworks where id = $1`,
      [serviceFrameworkId],
    );
    const audits = await auditRows('evaluation_period.set');
    expect((await period({ period_end: day(200) }).expect(409)).body.error.code).toBe('EVALUATION_ALREADY_ISSUED');
    expect((await period({ cutoff_date: day(-1) }).expect(409)).body.error.code).toBe('EVALUATION_ALREADY_ISSUED');
    expect((await period({ cutoff_date: null }).expect(409)).body.error.code).toBe('EVALUATION_ALREADY_ISSUED');
    const after = await owner(`select to_char(period_start, 'YYYY-MM-DD') ps, to_char(period_end, 'YYYY-MM-DD') pe, to_char(cutoff_date, 'YYYY-MM-DD') cd from tenant.service_frameworks where id = $1`, [serviceFrameworkId]);
    expect(after).toEqual(before);
    expect(await auditRows('evaluation_period.set')).toBe(audits);
  });

  it('repetir exactamente lo mismo (con la fecha de corte congelada) no cambia nada y se acepta', async () => {
    await period({ cutoff_date: day(0) }).expect(200);
  });
});
