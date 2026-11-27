import type { INestApplication } from '@nestjs/common';
import { RollEvaluationPeriodsUseCase } from '../../src/features/compliance/application/periods/evaluation-period.use-cases';
import { FileStorage } from '../../src/common/storage/file-storage';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { asignarControl } from '../support/asignaciones';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';
import { personaDe, Persona, Roles, unaPersonaPorRol } from '../support/roles';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-529 (contracts/cumplimiento/aprobacion.md, «Lo nuevo de MD-529») · R5 (corregir el nivel), el plan de remediación por excepción, «No aplica» de un requisito, las ocurrencias y la declaración
// de «sin ocurrencias» (DT-115), «Mi trabajo» y el historial de gestión. Por HTTP real con la sesión de cada rol, contra el Postgres desechable.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let roles: Roles;
let ajeno: Persona;
const storage = new StorageEnMemoria();

type Req = { id: string; code: string; periodicity: string; tests: Array<{ id: string; type: string }> };
type Fixture = { id: string; reqs: Req[] };

const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% md529 ${marca} ${RUN}\n`);
const detail = async (id: string, agent: Agent = roles.admin_empresa, view = '') => (await agent.get(`/v1/controls/${id}${view}`).expect(200)).body.data;
const technical = async (id: string) => (await detail(id, roles.admin_empresa, '?view=technical')).technical;
const auditCount = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);

const usados = new Set<string>();
/**
 * El código de un control del catálogo del servicio cuyas pruebas son todas documentales, operativas o de población (se pueden dejar Correctas a mano), con `min` a `max` requisitos, cada uno con su
 * propia prueba (`aparte`) y, si `onDemand`, con algún requisito «cuando sea requerido» sin prueba documental. Sin repetir uno ya usado.
 */
async function elegir(o: { min: number; max: number; aparte?: boolean; onDemand?: boolean }): Promise<string> {
  const rows = await owner<{ code: string }>(
    `select k.code from tenant.client_controls c join catalog.controls k on k.id = c.control_id
      where c.service_id = $1 and c.is_active and k.code <> all($2::text[])
        and (select count(*) from tenant.client_control_requirements r where r.client_control_id = c.id) between $3 and $4
        and not exists (select 1 from tenant.client_control_requirements r join catalog.control_requirement_tests crt on crt.control_requirement_id = r.control_requirement_id
                          join catalog.tests t on t.id = crt.test_id where r.client_control_id = c.id and t.type not in ('documentary','operational','population'))
        and not exists (select 1 from tenant.client_control_requirements r where r.client_control_id = c.id and not exists (select 1 from catalog.control_requirement_tests x where x.control_requirement_id = r.control_requirement_id))
        and (not $5::boolean or (select count(distinct crt.test_id) from tenant.client_control_requirements r join catalog.control_requirement_tests crt on crt.control_requirement_id = r.control_requirement_id where r.client_control_id = c.id)
                              = (select count(*) from tenant.client_control_requirements r where r.client_control_id = c.id))
        and ($6::boolean or not exists (select 1 from tenant.client_control_requirements r join catalog.control_requirements cr on cr.id = r.control_requirement_id where r.client_control_id = c.id and coalesce(r.periodicity, cr.periodicity) = 'on_demand'))
        and (not $6::boolean or exists (select 1 from tenant.client_control_requirements r join catalog.control_requirements cr on cr.id = r.control_requirement_id
                          where r.client_control_id = c.id and coalesce(r.periodicity, cr.periodicity) = 'on_demand'
                            and not exists (select 1 from catalog.control_requirement_tests crt join catalog.tests t on t.id = crt.test_id where crt.control_requirement_id = cr.id and t.type = 'documentary')))
      order by case when $5::boolean then k.code else null end, k.code desc limit 1`,
    [a.serviceId, [...usados], o.min, o.max, o.aparte ?? false, o.onDemand ?? false],
  );
  if (!rows[0]) throw new Error(`no hay un control del servicio con ${JSON.stringify(o)}`);
  usados.add(rows[0].code);
  return rows[0].code;
}

/** Un control del catálogo del servicio, con sus requisitos y las pruebas de cada uno, asignado al responsable (dueño) y al delegado (ejecutor). */
async function fixture(code: string, asignar = true): Promise<Fixture> {
  const [c] = await owner<{ id: string }>(
    `select c.id from tenant.client_controls c join catalog.controls k on k.id = c.control_id where c.service_id = $1 and c.is_active and k.code = $2`, [a.serviceId, code]);
  const reqs = await owner<Req>(
    `select r.id, cr.code, coalesce(r.periodicity, cr.periodicity)::text as periodicity,
            coalesce(json_agg(json_build_object('id', t.id, 'type', t.type) order by t.code) filter (where t.id is not null), '[]'::json) as tests
       from tenant.client_control_requirements r
       join catalog.control_requirements cr on cr.id = r.control_requirement_id
       left join catalog.control_requirement_tests crt on crt.control_requirement_id = cr.id
       left join catalog.tests t on t.id = crt.test_id
      where r.client_control_id = $1 group by r.id, cr.code, r.periodicity, cr.periodicity order by cr.code`, [c.id]);
  if (asignar) await asignarControl(a.companyId, c.id, roles.responsable.id, roles.delegado.id);
  return { id: c.id, reqs };
}

const testsOf = (f: Fixture) => [...new Map(f.reqs.flatMap((r) => r.tests).map((t) => [t.id, t] as const)).values()];

/** Deja cada prueba en Correcto (la documental con una entrega del delegado; las demás con el resultado del responsable); las de `except` en Excepción. */
async function cumplir(f: Fixture, except: string[] = []): Promise<void> {
  for (const t of testsOf(f)) {
    if (t.type === 'documentary') {
      if (!except.includes(t.id)) await roles.delegado.agent.post(`/v1/controls/${f.id}/tests/${t.id}/evidence`).attach('file', pdf(t.id), `${t.id}.pdf`).expect(201);
      continue;
    }
    await roles.responsable.agent.post(`/v1/controls/${f.id}/tests/${t.id}/result`).send(except.includes(t.id) ? { result: 'exception', note: 'Falta el acta.' } : { result: 'correct' }).expect(201);
  }
}

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  roles = await unaPersonaPorRol(app, a, monkey);
  ajeno = await personaDe(app, a, 'responsable', 'ajeno');
  await definirPeriodo(a.serviceId, '2026-01-01', '2027-12-31');
});
afterAll(async () => {
  await app?.close();
});

describe('R5 y plan de remediación (D140 puntos 3 y 4)', () => {
  let f: Fixture;
  let exception: string; // la prueba en excepción
  const plansUrl = () => `/v1/controls/${f.id}/remediation-plans`;
  const overridesUrl = () => `/v1/controls/${f.id}/level-overrides`;
  const plan = (agent: Agent, body: Record<string, unknown> = {}) => agent.post(plansUrl()).send({ test_id: exception, what: 'Firmar el acta del comité.', owner_id: roles.delegado.id, due_date: '2030-01-31', ...body });

  beforeAll(async () => {
    f = await fixture(await elegir({ min: 6, max: 7, aparte: true }));
    exception = f.reqs.flatMap((r) => r.tests).find((t) => t.type === 'operational')!.id;
    await cumplir(f, [exception]);
  });

  it('con una excepción sin plan, el 83 % no es Parcial: el nivel sugerido queda Débil', async () => {
    const t = await technical(f.id);
    expect(t).toMatchObject({ level: 'weak', suggested_level: 'weak', complies: false });
    expect(t.c_percent).toBeGreaterThan(75);
    expect(t.c_percent).toBeLessThan(100);
  });

  it('el detalle trae las excepciones con su plan y las acciones permitidas de cada rol', async () => {
    const owner_ = await detail(f.id, roles.responsable.agent);
    expect(owner_.management.exceptions).toHaveLength(1);
    expect(owner_.management.exceptions[0]).toMatchObject({ test: { id: exception }, plan: null, allowed_actions: ['register_plan'] });
    expect(owner_.management.allowed_actions).toEqual(expect.arrayContaining(['register_plan', 'propose_level', 'register_result']));
    expect(owner_.management.level).toMatchObject({ suggested: 'weak', final: 'weak', is_corrected: false });
    expect(owner_.management.requirements).toHaveLength(6);
    const admin = await detail(f.id);
    expect(admin.management.allowed_actions).not.toContain('register_plan'); // hay otro responsable: el admin no lleva el control
    // Un responsable que no es dueño ni ejecutor no lee el control (403): ni `management.level` ni los requisitos salen para él; el colaborador tampoco.
    await ajeno.agent.get(`/v1/controls/${f.id}`).expect(403);
    await roles.colaborador.agent.get(`/v1/controls/${f.id}`).expect(403);
    const delegado = await detail(f.id, roles.delegado.agent);
    expect(delegado.management.allowed_actions).toEqual([]);
    expect(delegado.management.level).toBeNull();
    expect(delegado.management.requirements.length).toBe(6);
    const auditor = await detail(f.id, roles.auditor.agent);
    expect(auditor.management.level).toMatchObject({ final: 'weak' });
    expect(auditor.management.allowed_actions).toEqual([]);
  });

  it('registrar el plan: solo quien lleva el control; el delegado, el auditor, el colaborador, admin_monkey, un responsable ajeno y el admin con otro responsable reciben 403', async () => {
    for (const agent of [roles.delegado.agent, roles.auditor.agent, roles.colaborador.agent, monkey, ajeno.agent, roles.admin_empresa]) await plan(agent).expect(403);
  });

  it('valida: qué se hará, persona activa de la empresa, fecha futura y que la prueba esté en excepción', async () => {
    const r1 = await plan(roles.responsable.agent, { what: '   ' }).expect(422);
    expect(r1.body.error.fields.map((x: any) => x.code)).toContain('what.required');
    expect((await plan(roles.responsable.agent, { owner_id: b.companyId }).expect(422)).body.error.fields[0].code).toBe('owner_id.invalid');
    expect((await plan(roles.responsable.agent, { due_date: '2020-01-01' }).expect(422)).body.error.fields[0].code).toBe('due_date.past');
    const correcta = f.reqs.flatMap((r) => r.tests).find((t) => t.type === 'operational' && t.id !== exception)?.id ?? f.reqs.flatMap((r) => r.tests).find((t) => t.id !== exception)!.id;
    expect((await plan(roles.responsable.agent, { test_id: correcta }).expect(409)).body.error.code).toBe('TEST_NOT_IN_EXCEPTION');
    await plan(roles.responsable.agent, { test_id: '00000000-0000-4000-8000-000000000000' }).expect(404);
  });

  let planId: string;
  it('el responsable lo registra: queda por aprobar y todavía no cambia el nivel; uno repetido es 409', async () => {
    const res = await plan(roles.responsable.agent).expect(201);
    planId = res.body.data.id;
    expect(res.body.data).toMatchObject({ status: 'pending', is_valid: true, is_overdue: false, owner: { id: roles.delegado.id }, test: { id: exception }, management_state: expect.any(String) });
    expect((await plan(roles.responsable.agent).expect(409)).body.error.code).toBe('PLAN_ALREADY_EXISTS');
    expect(await technical(f.id)).toMatchObject({ level: 'weak' });
    expect(await auditCount('remediation_plan.register')).toBeGreaterThanOrEqual(1);
    const adminView = await detail(f.id);
    expect(adminView.management.exceptions[0].allowed_actions).toEqual(['decide_plan']);
  });

  it('decidir: solo el admin_empresa; rechazar exige motivo; aprobar sube el nivel a Parcial', async () => {
    for (const agent of [roles.responsable.agent, roles.delegado.agent, roles.auditor.agent, roles.colaborador.agent, monkey]) await agent.post(`/v1/remediation-plans/${planId}/decision`).send({ decision: 'approve' }).expect(403);
    expect((await roles.admin_empresa.post(`/v1/remediation-plans/${planId}/decision`).send({ decision: 'reject' }).expect(422)).body.error.fields[0].code).toBe('reason.required');
    await b.agent.post(`/v1/remediation-plans/${planId}/decision`).send({ decision: 'approve' }).expect(404);
    const ok = await roles.admin_empresa.post(`/v1/remediation-plans/${planId}/decision`).send({ decision: 'approve' }).expect(200);
    expect(ok.body.data).toMatchObject({ status: 'approved', decided_by: { id: expect.any(String) } });
    expect(await technical(f.id)).toMatchObject({ level: 'partial', suggested_level: 'partial', complies: false });
    expect((await roles.admin_empresa.post(`/v1/remediation-plans/${planId}/decision`).send({ decision: 'approve' }).expect(409)).body.error.code).toBe('ALREADY_DECIDED');
    expect(await auditCount('remediation_plan.approve')).toBeGreaterThanOrEqual(1);
  });

  it('un plan vencido sigue contando: solo se marca `is_overdue` y Parcial se mantiene', async () => {
    await owner(`update tenant.remediation_plans set due_date = '2020-01-01' where id = $1`, [planId]);
    const exceptionRow = (await detail(f.id)).management.exceptions[0];
    expect(exceptionRow.plan).toMatchObject({ id: planId, status: 'approved', is_overdue: true, is_valid: true });
    expect(await technical(f.id)).toMatchObject({ level: 'partial' });
  });

  let overrideId: string;
  it('R5: un nivel de «cumple» no se puede proponer sobre un sugerido que no cumple; el responsable propone bajar y el admin lo decide', async () => {
    const propose = (agent: Agent, body: Record<string, unknown>) => agent.post(overridesUrl()).send(body);
    expect((await propose(roles.responsable.agent, { proposed_level: 'adequate', justification: 'Está bien.' }).expect(409)).body.error.code).toBe('LEVEL_CHANGE_NOT_ALLOWED');
    expect((await propose(roles.responsable.agent, { proposed_level: 'solid', justification: 'Está bien.' }).expect(409)).body.error.code).toBe('LEVEL_CHANGE_NOT_ALLOWED');
    expect((await propose(roles.responsable.agent, { proposed_level: 'partial', justification: 'Igual.' }).expect(422)).body.error.fields[0].code).toBe('proposed_level.invalid');
    expect((await propose(roles.responsable.agent, { proposed_level: 'weak', justification: '  ' }).expect(422)).body.error.fields[0].code).toBe('justification.required');
    for (const agent of [roles.delegado.agent, roles.auditor.agent, roles.colaborador.agent, monkey, ajeno.agent, roles.admin_empresa]) await propose(agent, { proposed_level: 'weak', justification: 'x' }).expect(403);
    const res = await propose(roles.responsable.agent, { proposed_level: 'ineffective', justification: 'Dos accesos siguen sin dueño y el motor no lo ve.' }).expect(201);
    overrideId = res.body.data.id;
    expect(res.body.data).toMatchObject({ status: 'pending', suggested_level: 'partial', proposed_level: 'ineffective', is_valid: true });
    expect((await propose(roles.responsable.agent, { proposed_level: 'weak', justification: 'Otra.' }).expect(409)).body.error.code).toBe('LEVEL_OVERRIDE_ALREADY_PENDING');
    expect((await detail(f.id, roles.admin_empresa)).management.level_override).toMatchObject({ id: overrideId, status: 'pending' });
    expect(await technical(f.id)).toMatchObject({ level: 'partial' });
  });

  it('aprobar la corrección: el nivel final reemplaza al sugerido y el detalle expone los dos', async () => {
    for (const agent of [roles.responsable.agent, roles.delegado.agent, roles.auditor.agent, monkey]) await agent.post(`/v1/level-overrides/${overrideId}/decision`).send({ decision: 'approve' }).expect(403);
    await roles.admin_empresa.post(`/v1/level-overrides/${overrideId}/decision`).send({ decision: 'approve' }).expect(200);
    expect(await technical(f.id)).toMatchObject({ level: 'ineffective', suggested_level: 'partial', level_value: 1, complies: false });
    const d = await detail(f.id, roles.responsable.agent);
    expect(d.management.level).toMatchObject({ suggested: 'partial', final: 'ineffective', is_corrected: true });
    expect(d.management.level_override).toMatchObject({ status: 'approved', proposed_level: 'ineffective' });
    expect(await auditCount('control_level_override.approve')).toBeGreaterThanOrEqual(1);
  });

  it('en la vista del período la corrección aprobada solo baja el nivel (opción C): la que baja aplica', async () => {
    const t = await technical(f.id);
    expect(t.period).toMatchObject({ level: 'ineffective', complies: false });
  });

  it('la corrección deja de valer si cambia el nivel sugerido (el plan deja de valer y el sugerido baja a Débil)', async () => {
    await owner('update tenant.remediation_plans set invalidated_at = now() where id = $1', [planId]);
    expect(await technical(f.id)).toMatchObject({ level: 'weak', suggested_level: 'weak' });
    expect((await detail(f.id)).management.level_override).toBeNull();
    expect((await detail(f.id)).management.level).toMatchObject({ is_corrected: false });
  });

  const invalidatedAt = async (table: string, id: string) => (await owner<{ at: Date | null }>(`select invalidated_at at from tenant.${table} where id = $1`, [id]))[0].at;
  const auditBy = (action: string, userId: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2 and user_id = $3', [a.companyId, action, userId]).then((r) => r[0].n);


  it('un plan pendiente y una corrección aprobada dejan de valer cuando un acto cambia lo que los sostenía: se invalidan con su rastro y no resucitan', async () => {
    const newPlan = () => roles.responsable.agent.post(`/v1/controls/${f.id}/remediation-plans`).send({ test_id: exception, what: 'Firmar el acta.', owner_id: roles.delegado.id, due_date: '2030-01-31' }).expect(201);
    const result = (body: Record<string, unknown>) => roles.responsable.agent.post(`/v1/controls/${f.id}/tests/${exception}/result`).send(body).expect(201);

    // Un plan pendiente cuya prueba deja de estar en Excepción se invalida y nadie puede decidirlo.
    const pending = (await newPlan()).body.data.id;
    expect(await invalidatedAt('remediation_plans', pending)).toBeNull();
    const planAudit = await auditBy('remediation_plan.invalidate', roles.responsable.id);
    await result({ result: 'correct' });
    expect(await invalidatedAt('remediation_plans', pending)).not.toBeNull();
    expect(await auditBy('remediation_plan.invalidate', roles.responsable.id)).toBe(planAudit + 1);
    await roles.admin_empresa.post(`/v1/remediation-plans/${pending}/decision`).send({ decision: 'approve' }).expect(404); // ya invalidado: no existe para quien decide

    // Una corrección aprobada deja de valer cuando un acto cambia el sugerido, y no resucita si el sugerido vuelve.
    await result({ result: 'exception', note: 'Otra vez.' });
    const live = (await newPlan()).body.data.id;
    await roles.admin_empresa.post(`/v1/remediation-plans/${live}/decision`).send({ decision: 'approve' }).expect(200);
    const override = (await roles.responsable.agent.post(`/v1/controls/${f.id}/level-overrides`).send({ proposed_level: 'ineffective', justification: 'Dos accesos sin dueño.' }).expect(201)).body.data.id;
    await roles.admin_empresa.post(`/v1/level-overrides/${override}/decision`).send({ decision: 'approve' }).expect(200);
    expect(await technical(f.id)).toMatchObject({ level: 'ineffective', suggested_level: 'partial' });
    expect(await invalidatedAt('control_level_overrides', override)).toBeNull();
    const levelAudit = await auditBy('control_level_override.invalidate', roles.responsable.id);

    await result({ result: 'correct' }); // el sugerido sube: la corrección ya no vale
    expect(await invalidatedAt('control_level_overrides', override)).not.toBeNull();
    expect(await auditBy('control_level_override.invalidate', roles.responsable.id)).toBe(levelAudit + 1);

    await result({ result: 'exception', note: 'Una vez más.' }); // el sugerido vuelve a Parcial
    expect(await technical(f.id)).toMatchObject({ level: 'partial', suggested_level: 'partial' });
    expect((await detail(f.id)).management.level_override).toBeNull();
    expect(await auditBy('control_level_override.invalidate', roles.responsable.id)).toBe(levelAudit + 1);
  });
});

describe('R5 baja un control cumplido y le quita las aprobaciones', () => {
  let f: Fixture;
  beforeAll(async () => {
    f = await fixture(await elegir({ min: 3, max: 7 }));
    await cumplir(f);
  });

  it('con el 100 % el control está por aprobar; aprobado por los dos pasos, proponer y aprobar un nivel de «no cumple» invalida las aprobaciones', async () => {
    expect(await detail(f.id)).toMatchObject({ management_state: 'pending_approval' });
    const done = async () => (await roles.admin_empresa.get(`/v1/services/${a.serviceId}/compliance-overview`).expect(200)).body.data.frameworks.find((x: any) => x.framework_code === 'soc2').progress.done as number;
    const done0 = await done();
    await roles.responsable.agent.post(`/v1/controls/${f.id}/approval`).send({ decision: 'approve' }).expect(200);
    await roles.admin_empresa.post(`/v1/controls/${f.id}/approval`).send({ decision: 'approve' }).expect(200);
    expect(await detail(f.id)).toMatchObject({ management_state: 'approved' });
    const done1 = await done();
    expect(done1).toBeGreaterThanOrEqual(done0);
    // El mismo lado (4↔5) es libre y no mueve las aprobaciones.
    const current = (await technical(f.id)).level as string;
    const other = current === 'solid' ? 'adequate' : 'solid';
    const up = await roles.responsable.agent.post(`/v1/controls/${f.id}/level-overrides`).send({ proposed_level: other, justification: 'Hay evidencia continua.' }).expect(201);
    await roles.admin_empresa.post(`/v1/level-overrides/${up.body.data.id}/decision`).send({ decision: 'approve' }).expect(200);
    expect(await detail(f.id)).toMatchObject({ management_state: 'approved' });
    const down = await roles.responsable.agent.post(`/v1/controls/${f.id}/level-overrides`).send({ proposed_level: 'partial', justification: 'Falló una revisión.' }).expect(201);
    // Con una propuesta pendiente no se aprueba el control.
    expect((await roles.admin_empresa.post(`/v1/controls/${f.id}/approval`).send({ decision: 'approve' }).expect(409)).body.error.code).toBe('ALREADY_APPROVED'); // ya aprobado: el paso repetido gana
    await roles.admin_empresa.post(`/v1/level-overrides/${down.body.data.id}/decision`).send({ decision: 'approve' }).expect(200);
    const d = await detail(f.id);
    expect(d.management_state).not.toBe('approved');
    expect(d.management).toMatchObject({ approved_by: null, owner_approved_by: null });
    const rows = await owner<{ invalidated_at: Date | null }>('select invalidated_at from tenant.control_approvals where client_control_id = $1', [f.id]);
    expect(rows.every((r) => r.invalidated_at !== null)).toBe(true);
    const doneBefore = (await roles.admin_empresa.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items.find((i: any) => i.id === f.id);
    expect(doneBefore.management_state).not.toBe('approved');
    // R5 llega al resumen: el rollup del marco vuelve a donde estaba antes de aprobar (el control ya no cuenta como cumplido).
    expect(await done()).toBe(done0);
    // La caída de las aprobaciones deja su rastro (G-09).
    expect(await auditCount('control_approval.invalidate')).toBeGreaterThanOrEqual(1);
  });

  it('rechazar una propuesta exige motivo y no cambia el nivel', async () => {
    const before = (await technical(f.id)).level as string;
    const proposed = before === 'weak' ? 'ineffective' : 'weak'; // un nivel distinto del que rige y del mismo lado
    const res = await roles.responsable.agent.post(`/v1/controls/${f.id}/level-overrides`).send({ proposed_level: proposed, justification: 'Otra vez.' }).expect(201);
    expect((await roles.admin_empresa.post(`/v1/level-overrides/${res.body.data.id}/decision`).send({ decision: 'reject' }).expect(422)).body.error.fields[0].code).toBe('reason.required');
    await roles.admin_empresa.post(`/v1/level-overrides/${res.body.data.id}/decision`).send({ decision: 'reject', reason: 'No procede.' }).expect(200);
    expect(await auditCount('control_level_override.reject')).toBeGreaterThanOrEqual(1);
    expect((await technical(f.id)).level).toBe(before);
  });
});

describe('«No aplica» de un requisito (D135)', () => {
  let f: Fixture;
  let failing: Req;
  const url = (r: Req, tail = 'not-applicable-requests') => `/v1/controls/${f.id}/requirements/${r.id}/${tail}`;

  beforeAll(async () => {
    f = await fixture(await elegir({ min: 5, max: 7, aparte: true }));
    // Una prueba que sirve a un solo requisito: así «No aplica» saca solo a ese del cálculo.
    const t = f.reqs.flatMap((r) => r.tests).find((x) => x.type !== 'documentary' && f.reqs.filter((r) => r.tests.some((y) => y.id === x.id)).length === 1)!;
    failing = f.reqs.find((r) => r.tests.some((x) => x.id === t.id))!;
    await cumplir(f, [t.id]);
  });

  it('solo quien lleva el control lo pide, con justificación; el requisito sigue en el C% hasta que se aprueba', async () => {
    const antes = await technical(f.id);
    for (const agent of [roles.delegado.agent, roles.auditor.agent, roles.colaborador.agent, monkey, ajeno.agent, roles.admin_empresa]) await agent.post(url(failing)).send({ reason: 'No operamos eso.' }).expect(403);
    expect((await roles.responsable.agent.post(url(failing)).send({ reason: ' ' }).expect(422)).body.error.fields[0].code).toBe('reason.required');
    const res = await roles.responsable.agent.post(url(failing)).send({ reason: 'No operamos ese proceso.' }).expect(201);
    expect(res.body.data).toMatchObject({ status: 'pending', requirement: { id: failing.id, code: failing.code }, reason: 'No operamos ese proceso.' });
    expect((await roles.responsable.agent.post(url(failing)).send({ reason: 'Otra.' }).expect(409)).body.error.code).toBe('REQUEST_ALREADY_PENDING');
    expect((await technical(f.id)).c_percent).toBe(antes.c_percent);
    const req = (await detail(f.id, roles.responsable.agent)).management.requirements.find((r: any) => r.id === failing.id);
    expect(req).toMatchObject({ applicability: 'not_applicable_pending', not_applicable: { status: 'pending' } });
    const id = res.body.data.id;
    for (const agent of [roles.responsable.agent, roles.delegado.agent, roles.auditor.agent, monkey]) await agent.post(`/v1/not-applicable-requests/${id}/decision`).send({ decision: 'approve' }).expect(403);
    await b.agent.post(`/v1/not-applicable-requests/${id}/decision`).send({ decision: 'approve' }).expect(404);
    expect((await roles.admin_empresa.post(`/v1/not-applicable-requests/${id}/decision`).send({ decision: 'reject' }).expect(422)).body.error.fields[0].code).toBe('reason.required');
    await roles.admin_empresa.post(`/v1/not-applicable-requests/${id}/decision`).send({ decision: 'approve' }).expect(200);
    const after = await technical(f.id);
    expect(after.requirements.find((r: any) => r.id === failing.id)).toMatchObject({ status: 'not_applicable', applicability: 'not_applicable' });
    expect(after.c_percent).toBe(100);
    expect(after.complies).toBe(true);
    expect(await detail(f.id)).toMatchObject({ management_state: 'pending_approval' });
    expect((await roles.responsable.agent.post(url(failing)).send({ reason: 'Otra.' }).expect(409)).body.error.code).toBe('ALREADY_NOT_APPLICABLE');
    expect(await auditCount('requirement_not_applicable.approve')).toBeGreaterThanOrEqual(1);
  });

  it('se revierte directo, con motivo, por quien lleva el control: el requisito vuelve al C% y el control deja de cumplir', async () => {
    await roles.responsable.agent.post(`/v1/controls/${f.id}/approval`).send({ decision: 'approve' }).expect(200);
    for (const agent of [roles.delegado.agent, roles.auditor.agent, monkey, ajeno.agent]) await agent.post(url(failing, 'not-applicable/revert')).send({ reason: 'x' }).expect(403);
    expect((await roles.responsable.agent.post(url(failing, 'not-applicable/revert')).send({}).expect(422)).body.error.fields[0].code).toBe('reason.required');
    const res = await roles.responsable.agent.post(url(failing, 'not-applicable/revert')).send({ reason: 'Sí lo operamos.' }).expect(200);
    expect(res.body.data).toMatchObject({ reverted_by: { id: roles.responsable.id }, reverted_at: expect.any(String) });
    const after = await technical(f.id);
    expect(after.complies).toBe(false);
    expect(after.requirements.find((r: any) => r.id === failing.id).status).toBe('non_compliant');
    expect((await detail(f.id)).management).toMatchObject({ owner_approved_by: null });
    expect((await roles.responsable.agent.post(url(failing, 'not-applicable/revert')).send({ reason: 'x' }).expect(409)).body.error.code).toBe('NOT_NOT_APPLICABLE');
  });

  it('el último requisito aplicable no se puede dejar sin ninguno', async () => {
    const g = await fixture(await elegir({ min: 2, max: 4 }));
    // Se piden todos (quedan por aprobar) y el admin los aprueba de a uno: el último ya no se puede (siempre queda uno que aplica).
    for (const r of g.reqs) await roles.responsable.agent.post(`/v1/controls/${g.id}/requirements/${r.id}/not-applicable-requests`).send({ reason: 'No aplica.' }).expect(201);
    const pending = await owner<{ id: string }>('select p.id from tenant.requirement_applicability_requests p join tenant.client_control_requirements r on r.id = p.client_control_requirement_id where r.client_control_id = $1 order by p.requested_at', [g.id]);
    for (const p of pending.slice(0, -1)) await roles.admin_empresa.post(`/v1/not-applicable-requests/${p.id}/decision`).send({ decision: 'approve' }).expect(200);
    expect((await roles.admin_empresa.post(`/v1/not-applicable-requests/${pending[pending.length - 1].id}/decision`).send({ decision: 'approve' }).expect(409)).body.error.code).toBe('LAST_APPLICABLE_REQUIREMENT');
    // Sin nada evaluado todavía no hay un nivel que corregir.
    expect((await technical(g.id)).level).toBe('not_evaluated');
    expect((await roles.responsable.agent.post(`/v1/controls/${g.id}/level-overrides`).send({ proposed_level: 'weak', justification: 'x' }).expect(409)).body.error.code).toBe('LEVEL_NOT_EVALUATED');
  });
});

describe('Requisitos «cuando sea requerido»: ocurrencias y declaración trimestral (DT-115)', () => {
  let f: Fixture;
  let req: Req;
  const occ = (agent: Agent, body: Record<string, unknown>, r: Req = req) => agent.post(`/v1/controls/${f.id}/requirements/${r.id}/occurrences`).send(body);
  const decl = (agent: Agent, r: Req = req) => agent.post(`/v1/controls/${f.id}/requirements/${r.id}/no-occurrence-declarations`).send({});
  const today = new Date().toISOString().slice(0, 10);

  const quarterStart = (() => {
    const n = new Date();
    return new Date(Date.UTC(n.getUTCFullYear(), Math.floor(n.getUTCMonth() / 3) * 3, 1)).toISOString().slice(0, 10);
  })();

  beforeAll(async () => {
    // El período empieza en el trimestre actual: los anteriores no cuentan (si no, todo trimestre cerrado sin declaración es Vencido).
    await definirPeriodo(a.serviceId, quarterStart, '2027-12-31');
    f = await fixture(await elegir({ min: 3, max: 7, onDemand: true }));
    req = f.reqs.find((r) => r.periodicity === 'on_demand' && r.tests.every((t) => t.type !== 'documentary'))!;
  });

  it('sin ocurrencias ni declaración el trimestre abierto queda Pendiente; la declaración lo deja Correcto sin resultado que registrar', async () => {
    const before = (await technical(f.id)).requirements.find((r: any) => r.id === req.id);
    expect(before.tests[0].status).toBe('pending');
    expect(before.tests[0].alert_at).not.toBeNull();
    for (const agent of [roles.delegado.agent, roles.auditor.agent, roles.colaborador.agent, monkey, ajeno.agent, roles.admin_empresa]) await decl(agent).expect(403);
    const res = await decl(roles.responsable.agent).expect(201);
    expect(res.body.data).toMatchObject({ requirement: { id: req.id }, window_start: expect.stringMatching(/-(01|04|07|10)-01$/), declared_by: { id: roles.responsable.id } });
    expect((await decl(roles.responsable.agent).expect(409)).body.error.code).toBe('ALREADY_DECLARED');
    const after = (await technical(f.id)).requirements.find((r: any) => r.id === req.id);
    expect(after.tests[0].status).toBe('correct');
    const view = (await detail(f.id, roles.delegado.agent)).management.requirements.find((r: any) => r.id === req.id);
    expect(view.on_demand).toMatchObject({ has_declaration: true, occurrences_count: 0 });
    expect(await auditCount('no_occurrence_declaration.declare')).toBe(1);
  });

  it('registrar una ocurrencia (ejecutor, dueño o admin) deja sin efecto la declaración y exige su evidencia', async () => {
    for (const agent of [roles.auditor.agent, roles.colaborador.agent, monkey, ajeno.agent]) await occ(agent, { occurred_on: today, description: 'Alta de proveedor.' }).expect(403);
    expect((await occ(roles.delegado.agent, { occurred_on: '2999-01-01', description: 'x' }).expect(422)).body.error.fields[0].code).toBe('occurred_on.future');
    expect((await occ(roles.delegado.agent, { occurred_on: today, description: ' ' }).expect(422)).body.error.fields[0].code).toBe('description.required');
    const res = await occ(roles.delegado.agent, { occurred_on: today, description: 'Alta de proveedor.' }).expect(201);
    expect(res.body.data).toMatchObject({ has_evidence: false, evidence_count: 0, requirement: { id: req.id } });
    const status = (await technical(f.id)).requirements.find((r: any) => r.id === req.id).tests[0].status;
    expect(status).toBe('pending'); // el trimestre sigue abierto: la ocurrencia sin evidencia es Pendiente
    expect((await decl(roles.responsable.agent).expect(409)).body.error.code).toBe('OCCURRENCES_EXIST');
    expect(await auditCount('no_occurrence_declaration.invalidate')).toBe(1);
    const list = await roles.responsable.agent.get(`/v1/controls/${f.id}/requirements/${req.id}/occurrences`).expect(200);
    expect(list.body.data.items).toHaveLength(1);
    await b.agent.get(`/v1/controls/${f.id}/requirements/${req.id}/occurrences`).expect(404);
  });

  it('subir la evidencia de la ocurrencia: exige occurrence_id; con ella y el resultado del responsable la prueba cumple', async () => {
    const test = req.tests[0].id;
    const [o] = await owner<{ id: string }>('select id from tenant.requirement_occurrences where client_control_requirement_id = $1', [req.id]);
    const up = (extra: Record<string, string> = {}) => {
      let r = roles.delegado.agent.post(`/v1/controls/${f.id}/tests/${test}/evidence`).attach('file', pdf(`occ${Object.keys(extra).length}`), 'o.pdf');
      for (const [k, v] of Object.entries(extra)) r = r.field(k, v);
      return r;
    };
    expect((await up().expect(422)).body.error.fields[0].code).toBe('occurrence_id.required');
    expect((await up({ occurrence_id: '00000000-0000-4000-8000-000000000000' }).expect(422)).body.error.fields[0].code).toBe('occurrence_id.invalid');
    await up({ occurrence_id: o.id }).expect(201);
    const list = await roles.responsable.agent.get(`/v1/controls/${f.id}/requirements/${req.id}/occurrences`).expect(200);
    expect(list.body.data.items[0]).toMatchObject({ has_evidence: true, evidence_count: 1 });
    await roles.responsable.agent.post(`/v1/controls/${f.id}/tests/${test}/result`).send({ result: 'correct' }).expect(201);
    expect((await technical(f.id)).requirements.find((r: any) => r.id === req.id).tests[0].status).toBe('correct');
  });

  it('la evidencia devuelta con el control no cuenta: la ocurrencia vuelve a quedar sin evidencia (mismo criterio en el motor y en la lista)', async () => {
    const [o] = await owner<{ id: string }>('select id from tenant.requirement_occurrences where client_control_requirement_id = $1 limit 1', [req.id]);
    const [approval] = await owner<{ id: string }>(
      `insert into tenant.control_approvals (id, tenant_id, client_control_id, step, decision, reason, actor_id) values (gen_random_uuid(), $1, $2, 'owner', 'returned', 'Falta el acta.', $3) returning id`, [a.companyId, f.id, roles.responsable.id]);
    await owner('update tenant.evidence_submissions set returned_approval_id = $1 where requirement_occurrence_id = $2', [approval.id, o.id]);
    const list = await roles.responsable.agent.get(`/v1/controls/${f.id}/requirements/${req.id}/occurrences`).expect(200);
    expect(list.body.data.items[0]).toMatchObject({ has_evidence: false, evidence_count: 0 });
    const view = (await detail(f.id, roles.delegado.agent)).management.requirements.find((r: any) => r.id === req.id);
    expect(view.on_demand.occurrences_without_evidence).toBe(1);
  });

  it('un trimestre cerrado con una ocurrencia sin evidencia es Excepción, y sin nada, Vencido (la vista del período lo cuenta)', async () => {
    await definirPeriodo(a.serviceId, '2026-01-01', '2027-12-31'); // ahora los trimestres ya cerrados de 2026 cuentan
    const other = f.reqs.find((r) => r.id !== req.id && r.periodicity === 'on_demand' && r.tests.every((t) => t.type !== 'documentary')) ?? req;
    await owner(`insert into tenant.requirement_occurrences (id, tenant_id, client_control_requirement_id, occurred_on, description, registered_by) values (gen_random_uuid(), $1, $2, $3::date, 'Antiguo', $4)`, [a.companyId, other.id, '2026-05-10', roles.delegado.id]);
    const t = await technical(f.id);
    expect(t.requirements.find((r: any) => r.id === other.id).tests[0].status).toBe('exception');
    expect(t.period.missing.some((m: any) => m.requirement_code === other.code)).toBe(true);
  });
});

describe('«Mi trabajo»: la bandeja de quien decide, y el historial de gestión', () => {
  let f: Fixture;
  beforeAll(async () => {
    f = await fixture(await elegir({ min: 3, max: 7 }));
  });

  it('el admin_empresa recibe su bandeja con `to_review` y solo con ella; el responsable, el control por aprobar', async () => {
    const r = await roles.admin_empresa.get('/v1/me/work').expect(200);
    expect(r.body.data.progress).toBeNull();
    expect((await roles.admin_empresa.get('/v1/me/work?bucket=to_upload').expect(422)).body.error.fields[0].code).toBe('bucket.invalid');
    for (const agent of [roles.auditor.agent, roles.colaborador.agent, monkey]) await agent.get('/v1/me/work').expect(403);
    await roles.admin_empresa.get('/v1/me/work?bucket=to_review').expect(200);
  });

  it('el historial lista cada acto con quién y cuándo, paginado; el delegado no ve los niveles; otra empresa, 404', async () => {
    const g = f;
    await cumplir(g);
    await roles.responsable.agent.post(`/v1/controls/${g.id}/approval`).send({ decision: 'approve' }).expect(200);
    const res = await roles.admin_empresa.get(`/v1/controls/${g.id}/management-history?page_size=100`).expect(200);
    const types = res.body.data.items.map((i: any) => i.type);
    expect(types).toEqual(expect.arrayContaining(['approval', 'manual_result']));
    expect(res.body.data.items[0]).toMatchObject({ at: expect.any(String), actor: { id: expect.any(String) } });
    expect(res.body.data).toMatchObject({ page: 1, total: expect.any(Number) });
    const filtered = await roles.admin_empresa.get(`/v1/controls/${g.id}/management-history?type=approval`).expect(200);
    expect(filtered.body.data.items.every((i: any) => i.type === 'approval')).toBe(true);
    await roles.delegado.agent.get(`/v1/controls/${g.id}/management-history`).expect(200);
    await ajeno.agent.get(`/v1/controls/${g.id}/management-history`).expect(403);
    await roles.colaborador.agent.get(`/v1/controls/${g.id}/management-history`).expect(403);
    await b.agent.get(`/v1/controls/${g.id}/management-history`).expect(404);
    expect(f.id).toBeTruthy();
  });
});

describe('«Mi trabajo» to_review, el directorio de personas y los avisos (MD-529)', () => {
  let f: Fixture;
  const notices = (type: string, userId: string) => owner<{ n: number }>('select count(*)::int n from platform.notifications where company_id = $1 and type = $2::platform.notification_type and user_id = $3', [a.companyId, type, userId]).then((r) => r[0].n);

  beforeAll(async () => {
    f = await fixture(await elegir({ min: 3, max: 6 }));
  });

  it('el directorio: solo quien registra un plan; personas activas con id, nombre, apellido y rol, sin correo', async () => {
    for (const agent of [roles.delegado.agent, roles.auditor.agent, roles.colaborador.agent, monkey]) await agent.get('/v1/users/directory').expect(403);
    for (const agent of [roles.admin_empresa, roles.responsable.agent]) {
      const res = await agent.get('/v1/users/directory').expect(200);
      const items = res.body.data.items as Array<Record<string, unknown>>;
      expect(items.length).toBeGreaterThanOrEqual(3);
      expect(items.every((i) => Object.keys(i).sort().join() === 'id,last_name,name,role')).toBe(true);
      expect(items.map((i) => i.id)).toEqual(expect.arrayContaining([roles.responsable.id, roles.delegado.id]));
      expect(items.some((i) => i.role === 'auditor' || i.role === 'colaborador')).toBe(false);
    }
    const otra = await b.agent.get('/v1/users/directory').expect(200);
    expect(otra.body.data.items.some((i: any) => i.id === roles.responsable.id)).toBe(false);
    await owner(`update platform.users set status = 'inactive' where id = $1`, [ajeno.id]);
    expect((await roles.admin_empresa.get('/v1/users/directory').expect(200)).body.data.items.some((i: any) => i.id === ajeno.id)).toBe(false);
    await owner(`update platform.users set status = 'active' where id = $1`, [ajeno.id]);
  });

  it('la evidencia del delegado sin resultado es del responsable: to_review con manual_result; el delegado no la cuenta como suya', async () => {
    const t = testsOf(f).find((x) => x.type === 'documentary')!;
    await roles.delegado.agent.post(`/v1/controls/${f.id}/tests/${t.id}/evidence`).attach('file', pdf(`work${t.id}`), 'w.pdf').expect(201);
    const mine = (await roles.responsable.agent.get('/v1/me/work?bucket=to_review&page_size=100').expect(200)).body.data.items.find((i: any) => i.client_control_id === f.id);
    // Una prueba solo documental no lleva resultado: el responsable no tiene nada que registrar por ella.
    expect(mine?.pending_decisions ?? []).not.toContain('manual_result');
    const manual = testsOf(f).find((x) => x.type !== 'documentary')!;
    await roles.delegado.agent.post(`/v1/controls/${f.id}/tests/${manual.id}/evidence`).attach('file', pdf(`work2${manual.id}`), 'w2.pdf').expect(201);
    const after = (await roles.responsable.agent.get('/v1/me/work?bucket=to_review&page_size=100').expect(200)).body.data.items.find((i: any) => i.client_control_id === f.id);
    expect(after).toMatchObject({ bucket: 'to_review', role_in_control: 'owner', pending_decisions: ['manual_result'] });
    const del = (await roles.delegado.agent.get('/v1/me/work?page_size=100').expect(200)).body.data.items.find((i: any) => i.client_control_id === f.id);
    expect(del.pending_decisions).toEqual([]);
    expect(del.bucket).not.toBe('to_review');
  });

  it('con el 100 % el control está en to_review del responsable (control_approval) y pasa a in_review cuando él aprueba; el admin lo ve al quedar owner_approved', async () => {
    await cumplir(f);
    // «Mi trabajo» también pide la evidencia de las pruebas manuales que la aceptan: se sube la que falta.
    for (const t of testsOf(f).filter((x) => x.type !== 'documentary')) await roles.delegado.agent.post(`/v1/controls/${f.id}/tests/${t.id}/evidence`).attach('file', pdf(`ev${t.id}`), 'e.pdf').expect(201);
    const ctl = (agent: Agent, q = '') => agent.get(`/v1/me/work?page_size=100${q}`).expect(200).then((r) => r.body.data.items.find((i: any) => i.client_control_id === f.id));
    expect(await ctl(roles.responsable.agent)).toMatchObject({ bucket: 'to_review', pending_decisions: ['control_approval'] });
    expect(await ctl(roles.admin_empresa)).toBeUndefined();
    // Con una corrección de nivel pendiente, el control en `pending_approval` no se aprueba: se decide primero la propuesta.
    const level = (await technical(f.id)).level as string;
    const pendingLevel = await roles.responsable.agent.post(`/v1/controls/${f.id}/level-overrides`).send({ proposed_level: level === 'adequate' ? 'solid' : 'adequate', justification: 'Lo veo distinto.' }).expect(201);
    expect((await roles.responsable.agent.post(`/v1/controls/${f.id}/approval`).send({ decision: 'approve' }).expect(409)).body.error.code).toBe('LEVEL_OVERRIDE_PENDING');
    await roles.admin_empresa.post(`/v1/level-overrides/${pendingLevel.body.data.id}/decision`).send({ decision: 'reject', reason: 'Así está bien.' }).expect(200);
    await roles.responsable.agent.post(`/v1/controls/${f.id}/approval`).send({ decision: 'approve' }).expect(200);
    expect(await ctl(roles.responsable.agent)).toMatchObject({ bucket: 'in_review', pending_decisions: [] });
    expect(await ctl(roles.admin_empresa)).toMatchObject({ bucket: 'to_review', role_in_control: 'approver', pending_decisions: ['control_approval'], pending_items: 1 });
    expect(await notices('control_owner_approved', (await owner<{ id: string }>(`select id from platform.users where company_id = $1 and role = 'admin_empresa' limit 1`, [a.companyId]))[0].id)).toBeGreaterThanOrEqual(1);
  });

  it('el admin ve también lo que espera su decisión: nivel, plan y «No aplica», y los avisos llegan a quien corresponde', async () => {
    const g = await fixture(await elegir({ min: 4, max: 7, aparte: true }));
    const exception = testsOf(g).find((x) => x.type !== 'documentary')!;
    await cumplir(g, [exception.id]);
    await roles.responsable.agent.post(`/v1/controls/${g.id}/remediation-plans`).send({ test_id: exception.id, what: 'Firmar el acta.', owner_id: roles.delegado.id, due_date: '2030-01-31' }).expect(201);
    await roles.responsable.agent.post(`/v1/controls/${g.id}/level-overrides`).send({ proposed_level: 'ineffective', justification: 'No refleja la realidad.' }).expect(201);
    const other = g.reqs.find((r) => r.tests.every((t) => t.id !== exception.id))!;
    await roles.responsable.agent.post(`/v1/controls/${g.id}/requirements/${other.id}/not-applicable-requests`).send({ reason: 'No operamos eso.' }).expect(201);
    const row = (await roles.admin_empresa.get('/v1/me/work?bucket=to_review&page_size=100').expect(200)).body.data.items.find((i: any) => i.client_control_id === g.id);
    expect(row).toMatchObject({ bucket: 'to_review', role_in_control: 'approver' });
    expect(row.pending_decisions).toEqual(expect.arrayContaining(['level_override', 'remediation_plan', 'not_applicable']));
    const adminId = (await owner<{ id: string }>(`select id from platform.users where company_id = $1 and role = 'admin_empresa' limit 1`, [a.companyId]))[0].id;
    for (const type of ['level_override_proposed', 'remediation_plan_proposed', 'not_applicable_requested']) expect(await notices(type, adminId)).toBeGreaterThanOrEqual(1);
    // Lo propuesto espera al admin: para el responsable es in_review, no to_review.
    const mine = (await roles.responsable.agent.get('/v1/me/work?page_size=100').expect(200)).body.data.items.find((i: any) => i.client_control_id === g.id);
    expect(mine.bucket).not.toBe('to_review');
    // Rechazadas: el detalle muestra quién, cuándo y por qué. (La del nivel primero: aprobar el plan cambia el sugerido y la propuesta dejaría de valer.)
    const [lvl] = await owner<{ id: string }>('select id from tenant.control_level_overrides where client_control_id = $1', [g.id]);
    await roles.admin_empresa.post(`/v1/level-overrides/${lvl.id}/decision`).send({ decision: 'reject', reason: 'El motor tiene razón.' }).expect(200);
    // La decisión avisa al responsable (y, en el plan aprobado, a la persona del plan).
    const [plan] = await owner<{ id: string }>('select id from tenant.remediation_plans where client_control_id = $1', [g.id]);
    await roles.admin_empresa.post(`/v1/remediation-plans/${plan.id}/decision`).send({ decision: 'approve' }).expect(200);
    expect(await notices('remediation_plan_decided', roles.responsable.id)).toBeGreaterThanOrEqual(1);
    expect(await notices('remediation_plan_decided', roles.delegado.id)).toBeGreaterThanOrEqual(1);
    const [na] = await owner<{ id: string }>('select p.id from tenant.requirement_applicability_requests p join tenant.client_control_requirements r on r.id = p.client_control_requirement_id where r.client_control_id = $1', [g.id]);
    await roles.admin_empresa.post(`/v1/not-applicable-requests/${na.id}/decision`).send({ decision: 'reject', reason: 'Sí aplica.' }).expect(200);
    expect(await notices('level_override_decided', roles.responsable.id)).toBeGreaterThanOrEqual(1);
    expect(await notices('not_applicable_decided', roles.responsable.id)).toBeGreaterThanOrEqual(1);
    const d = (await detail(g.id, roles.responsable.agent)).management;
    expect(d.level_override).toMatchObject({ status: 'rejected', decided_by: { id: expect.any(String) }, decided_at: expect.any(String), decision_reason: 'El motor tiene razón.' });
    expect(d.requirements.find((r: any) => r.id === other.id).not_applicable).toMatchObject({ status: 'rejected', decided_by: { id: expect.any(String) }, decided_at: expect.any(String), decision_reason: 'Sí aplica.' });
    expect(d.exceptions[0]).toMatchObject({ test: { id: exception.id, code: expect.any(String), display_name: expect.any(String) }, plan: { status: 'approved', owner: { id: roles.delegado.id } } });
    expect(d.manual_tests.every((m: any) => typeof m.test.code === 'string' && m.requirement_id !== undefined)).toBe(true);
    expect(d.manual_tests.find((m: any) => m.test.id === exception.id)).toMatchObject({ requirement_id: expect.any(String), latest_result: { result: 'exception', registered_by: { id: roles.responsable.id } } });
    const evidenceTests = (await detail(g.id, roles.delegado.agent)).evidence_tests;
    expect(evidenceTests.every((e: any) => e.control_requirement_id !== undefined)).toBe(true);
    expect(evidenceTests.find((e: any) => e.test_id === exception.id).control_requirement_id).toEqual(expect.any(String));

    // Ya decidida no se decide otra vez; y una propuesta cuyo nivel sugerido cambió dejó de valer.
    expect((await roles.admin_empresa.post(`/v1/remediation-plans/${plan.id}/decision`).send({ decision: 'reject', reason: 'x' }).expect(409)).body.error.code).toBe('ALREADY_DECIDED');
    const again = await roles.responsable.agent.post(`/v1/controls/${g.id}/level-overrides`).send({ proposed_level: 'weak', justification: 'Otra vez.' }).expect(201);
    await owner('update tenant.remediation_plans set invalidated_at = now() where id = $1', [plan.id]); // el plan deja de valer: el sugerido baja a Débil
    const stale = await roles.admin_empresa.post(`/v1/level-overrides/${again.body.data.id}/decision`).send({ decision: 'approve' }).expect(409);
    expect(stale.body.error.code).toBe('REQUEST_NO_LONGER_VALID');
    expect((await detail(g.id)).management.level_override?.status).not.toBe('pending');
  });
});


describe('El admin_empresa que lleva el control: lo que propone vale directo (G-05)', () => {
  let f: Fixture;
  let exception: string;

  beforeAll(async () => {
    f = await fixture(await elegir({ min: 4, max: 7, aparte: true }), false); // sin responsable
    exception = testsOf(f).find((t) => t.type !== 'documentary')!.id;
    for (const t of testsOf(f)) {
      if (t.type === 'documentary') await roles.admin_empresa.post(`/v1/controls/${f.id}/tests/${t.id}/evidence`).attach('file', pdf(`d${t.id}`), 'd.pdf').expect(201);
      else await roles.admin_empresa.post(`/v1/controls/${f.id}/tests/${t.id}/result`).send(t.id === exception ? { result: 'exception', note: 'Falta.' } : { result: 'correct' }).expect(201);
    }
  });

  it('el plan, el nivel y el «No aplica» nacen aprobados con quien los pidió como quien decide, y el responsable ajeno no puede pedirlos', async () => {
    for (const agent of [ajeno.agent, roles.responsable.agent]) await agent.post(`/v1/controls/${f.id}/remediation-plans`).send({ test_id: exception, what: 'x', owner_id: roles.delegado.id, due_date: '2030-01-01' }).expect(403);
    const plan = await roles.admin_empresa.post(`/v1/controls/${f.id}/remediation-plans`).send({ test_id: exception, what: 'Firmar el acta.', owner_id: roles.delegado.id, due_date: '2030-01-01' }).expect(201);
    expect(plan.body.data).toMatchObject({ status: 'approved', decided_by: { id: plan.body.data.proposed_by.id } });
    expect(await technical(f.id)).toMatchObject({ level: 'partial' });
    const d = await detail(f.id);
    expect(d.management.allowed_actions).toEqual(expect.arrayContaining(['propose_level', 'register_result']));
    const lvl = await roles.admin_empresa.post(`/v1/controls/${f.id}/level-overrides`).send({ proposed_level: 'weak', justification: 'Lo veo así.' }).expect(201);
    expect(lvl.body.data).toMatchObject({ status: 'approved', suggested_level: 'partial', proposed_level: 'weak' });
    expect(await technical(f.id)).toMatchObject({ level: 'weak', suggested_level: 'partial' });
    const na = f.reqs.find((r) => r.tests.every((t) => t.id !== exception))!;
    const req = await roles.admin_empresa.post(`/v1/controls/${f.id}/requirements/${na.id}/not-applicable-requests`).send({ reason: 'No operamos eso.' }).expect(201);
    expect(req.body.data.status).toBe('approved');
    expect((await technical(f.id)).requirements.find((r: any) => r.id === na.id).status).toBe('not_applicable');
    // Con el admin como quien lleva el control, no hay nada pendiente que decidir ni en su bandeja.
    expect((await roles.admin_empresa.get('/v1/me/work?bucket=to_review&page_size=100').expect(200)).body.data.items.some((i: any) => i.client_control_id === f.id && i.pending_decisions.includes('level_override'))).toBe(false);
  });
});

describe('La pasada diaria invalida lo que dejó de valer (MD-529)', () => {
  it('una corrección de otro nivel sugerido y un plan de otra ventana reciben `invalidated_at` y su rastro, una sola vez', async () => {
    const [c] = await owner<{ id: string; test_id: string }>(
      `select c.id, (select crt.test_id from tenant.client_control_requirements r join catalog.control_requirement_tests crt on crt.control_requirement_id = r.control_requirement_id where r.client_control_id = c.id limit 1) test_id
         from tenant.client_controls c where c.service_id = $1 and c.control_id is not null and c.is_active order by c.own_code desc limit 1`, [a.serviceId]);
    const [lvl] = await owner<{ id: string }>(
      `insert into tenant.control_level_overrides (id, tenant_id, client_control_id, suggested_level, proposed_level, justification, status, proposed_by) values (gen_random_uuid(), $1, $2, 5, 1, 'Vieja', 'pending', $3) returning id`, [a.companyId, c.id, roles.responsable.id]);
    const [plan] = await owner<{ id: string }>(
      `insert into tenant.remediation_plans (id, tenant_id, client_control_id, test_id, what, assignee_id, due_date, status, proposed_by, window_start) values (gen_random_uuid(), $1, $2, $3, 'Vieja', $4, '2030-01-01', 'pending', $4, '2020-01-01') returning id`,
      [a.companyId, c.id, c.test_id, roles.responsable.id]);
    const stale = () => owner<{ a: Date | null; b: Date | null }>('select (select invalidated_at from tenant.control_level_overrides where id = $1) a, (select invalidated_at from tenant.remediation_plans where id = $2) b', [lvl.id, plan.id]);
    expect(await stale()).toEqual([{ a: null, b: null }]);
    const before = [await auditCount('control_level_override.invalidate'), await auditCount('remediation_plan.invalidate')];
    await app.get(RollEvaluationPeriodsUseCase).execute(new Date(), [a.companyId, b.companyId]);
    const after = (await stale())[0];
    expect(after.a).not.toBeNull();
    expect(after.b).not.toBeNull();
    const written = [await auditCount('control_level_override.invalidate'), await auditCount('remediation_plan.invalidate')];
    expect(written).toEqual([before[0] + 1, before[1] + 1]);
    await app.get(RollEvaluationPeriodsUseCase).execute(new Date(), [a.companyId, b.companyId]); // una segunda pasada no vuelve a escribir
    expect([await auditCount('control_level_override.invalidate'), await auditCount('remediation_plan.invalidate')]).toEqual(written);
  });
});
