import type { INestApplication } from '@nestjs/common';
import { FileStorage } from '../../src/common/storage/file-storage';
import { RollEvaluationPeriodsUseCase } from '../../src/features/compliance/application/periods/evaluation-period.use-cases';
import { Agent, bootApp, owner, RUN } from '../support/app';
import { asignarControl } from '../support/asignaciones';
import { controlPropioConPruebas } from '../support/controles';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';
import { personaDe, Persona, Roles, unaPersonaPorRol } from '../support/roles';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-504 · D132, D140 · Gestión y aprobación del control (contracts/cumplimiento/aprobacion.md): el estado de gestión, la aprobación del responsable y la final del admin_empresa, la
// devolución con motivo, el resultado de una prueba manual y que solo un control aprobado cuente como cumplido. Por HTTP real con la sesión de cada rol, contra el Postgres desechable.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let roles: Roles;
let ajeno: Persona; // otro responsable: no atiende los controles de abajo
const storage = new StorageEnMemoria();

const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% aprobacion ${marca} ${RUN}\n`);
const approval = (control: string) => `/v1/controls/${control}/approval`;
const decide = (agent: Agent, control: string, body: Record<string, unknown>) => agent.post(approval(control)).send(body);
const detail = async (control: string, agent: Agent = roles.admin_empresa) => (await agent.get(`/v1/controls/${control}`).expect(200)).body.data;
const subir = async (agent: Agent, control: string, test: string, marca: string): Promise<string> =>
  (await agent.post(`/v1/controls/${control}/tests/${test}/evidence`).attach('file', pdf(marca), `${marca}.pdf`).expect(201)).body.data.id;
const rows = (control: string) => owner<{ step: string; decision: string; reason: string | null; invalidated_at: Date | null; window_start: Date | null }>(
  'select step, decision, reason, invalidated_at, window_start from tenant.control_approvals where client_control_id = $1 order by at, id', [control]);
const auditRows = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);
const doneInOverview = async () => (await roles.admin_empresa.get(`/v1/services/${a.serviceId}/compliance-overview`).expect(200)).body.data.frameworks.find((f: any) => f.framework_code === 'soc2').progress.done as number;

let n = 0;
let docTests: string[] = [];
/** Un control propio (documental) con `docs` pruebas documentales: al entregar todas cumple al 100 %. */
async function controlDoc(docs: number, owner_: string | null, executor: string | null = null): Promise<{ control: string; tests: string[] }> {
  if (!docTests.length) docTests = (await owner<{ id: string }>(`select id from catalog.tests where code like 'T-DOC-%' order by code limit 12`)).map((r) => r.id);
  const tests = docTests.slice(n, n + docs);
  const control = await controlPropioConPruebas(a.companyId, a.serviceId, `P${RUN.toUpperCase()}${n++}`, tests);
  if (owner_) await asignarControl(a.companyId, control, owner_, executor);
  return { control, tests };
}

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  roles = await unaPersonaPorRol(app, a, monkey);
  ajeno = await personaDe(app, a, 'responsable', 'ajeno');
  await definirPeriodo(a.serviceId, '2026-01-01', '2027-12-31'); // sin período auditado el resumen no mide (D87)
});
afterAll(async () => {
  await app?.close();
});

describe('POST /v1/controls/{id}/approval · la primera aprobación y la final (D132)', () => {
  let c: { control: string; tests: string[] };

  beforeAll(async () => {
    c = await controlDoc(1, roles.responsable.id, roles.delegado.id);
  });

  it('un control sin evidencia es non_compliant y no se puede aprobar: 409 CONTROL_NOT_COMPLIANT', async () => {
    expect(await detail(c.control)).toMatchObject({ management_state: 'non_compliant', management: { owner_approved_by: null, approved_by: null, returned_reason: null } });
    const res = await decide(roles.responsable.agent, c.control, { decision: 'approve' }).expect(409);
    expect(res.body.error.code).toBe('CONTROL_NOT_COMPLIANT');
    expect((await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(409)).body.error.code).toBe('CONTROL_NOT_COMPLIANT');
  });

  it('la lista de controles también trae management_state y management', async () => {
    const item = (await roles.admin_empresa.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items.find((i: any) => i.id === c.control);
    expect(item).toMatchObject({ management_state: 'non_compliant', approval: 'approved', management: { owner_approved_at: null, approved_at: null, returned_at: null } });
  });

  it('con la evidencia cargada el motor da el 100 %: pending_approval, y todavía no cuenta en el resumen', async () => {
    const antes = await doneInOverview();
    await subir(roles.delegado.agent, c.control, c.tests[0], 'v1');
    expect(await detail(c.control)).toMatchObject({ management_state: 'pending_approval' });
    expect(await doneInOverview()).toBe(antes);
  });

  it('el delegado, el auditor, el colaborador, admin_monkey y un responsable ajeno no aprueban: 403', async () => {
    for (const agent of [roles.delegado.agent, roles.auditor.agent, roles.colaborador.agent, monkey, ajeno.agent]) await decide(agent, c.control, { decision: 'approve' }).expect(403);
    expect(await rows(c.control)).toEqual([]);
  });

  it('con otro responsable, el admin_empresa no se salta la primera aprobación: 409 OWNER_APPROVAL_REQUIRED', async () => {
    const res = await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(409);
    expect(res.body.error.code).toBe('OWNER_APPROVAL_REQUIRED');
  });

  it('el responsable aprueba: owner_approved con quién y cuándo; aún no cuenta; repetir es 409 ALREADY_APPROVED', async () => {
    const antes = await doneInOverview();
    const res = await decide(roles.responsable.agent, c.control, { decision: 'approve' }).expect(200);
    expect(res.body.data).toMatchObject({ id: c.control, management_state: 'owner_approved', management: { owner_approved_by: { id: roles.responsable.id }, owner_approved_at: expect.any(String), approved_by: null } });
    expect(await doneInOverview()).toBe(antes);
    expect((await decide(roles.responsable.agent, c.control, { decision: 'approve' }).expect(409)).body.error.code).toBe('ALREADY_APPROVED');
    expect(await auditRows('control_approval.approve')).toBeGreaterThanOrEqual(1);
  });

  it('el admin_empresa da la final: approved, y ahora sí cuenta como cumplido en el marco; repetir es 409', async () => {
    const antes = await doneInOverview();
    const res = await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(200);
    expect(res.body.data).toMatchObject({ management_state: 'approved', management: { approved_by: { id: expect.any(String) }, approved_at: expect.any(String), owner_approved_by: { id: roles.responsable.id } } });
    expect(await doneInOverview()).toBe(antes + 1);
    expect((await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(409)).body.error.code).toBe('ALREADY_APPROVED');
    expect((await rows(c.control)).map((r) => [r.step, r.decision])).toEqual([['owner', 'approved'], ['final', 'approved']]);
  });

  it('una versión nueva que no cambia el resultado no quita la aprobación', async () => {
    await subir(roles.delegado.agent, c.control, c.tests[0], 'v2');
    expect(await detail(c.control)).toMatchObject({ management_state: 'approved' });
  });

  it('devolver sobre un control ya aprobado es 409 NOTHING_TO_RETURN', async () => {
    const res = await decide(roles.admin_empresa, c.control, { decision: 'return', reason: 'Ya no.' }).expect(409);
    expect(res.body.error.code).toBe('NOTHING_TO_RETURN');
  });

  it('la aprobación vigente deja de valer si el control deja de cumplir: queda invalidada y, al volver a cumplir, hay que aprobar de nuevo', async () => {
    // El motor deja de dar el 100 %: la entrega vigente se marca devuelta (lo que haría una devolución anterior). La pasada diaria lo ve como una caída de nivel.
    const [approvalRow] = await owner<{ id: string }>('select id from tenant.control_approvals where client_control_id = $1 order by at limit 1', [c.control]);
    await owner(`insert into audit.compliance_events (id, tenant_id, changed_field, new_value) values (gen_random_uuid(), $1, 'control.state', $2::jsonb)`, [a.companyId, JSON.stringify({
      control_id: c.control, control_code: 'X', service_id: a.serviceId, cause: 'control_approval', state: 'effective', level: 'solid', level_value: 5, readiness: 'ready', progress: { done: 1, total: 1 }, management_state: 'approved' })]);
    await owner('update tenant.evidence_submissions set returned_approval_id = $2 where evidence_requirement_id in (select id from tenant.evidence_requirements where client_control_id = $1)', [c.control, approvalRow.id]);
    expect(await detail(c.control)).toMatchObject({ management_state: 'in_progress' });
    await app.get(RollEvaluationPeriodsUseCase).execute();
    expect((await rows(c.control)).every((r) => r.invalidated_at !== null)).toBe(true);
    // Vuelve a cumplir con una entrega nueva: ya no está aprobado, está por aprobar.
    await subir(roles.delegado.agent, c.control, c.tests[0], 'v3');
    expect(await detail(c.control)).toMatchObject({ management_state: 'pending_approval', management: { approved_by: null, owner_approved_by: null } });
  });

  it('el aprobado de otra empresa o inexistente: 404', async () => {
    await decide(b.agent, c.control, { decision: 'approve' }).expect(404);
    await decide(roles.admin_empresa, '00000000-0000-4000-8000-000000000000', { decision: 'approve' }).expect(404);
    await decide(roles.admin_empresa, 'no-es-un-uuid', { decision: 'approve' }).expect(404);
  });

  it('un cuerpo inválido es 422', async () => {
    await decide(roles.admin_empresa, c.control, {}).expect(422);
    await decide(roles.admin_empresa, c.control, { decision: 'tal_vez' }).expect(422);
  });
});

describe('G-05 · si el admin_empresa es el responsable, o no hay responsable, su aprobación es la única', () => {
  it('sin responsable: aprueba directo sobre pending_approval y queda approved', async () => {
    const c = await controlDoc(1, null);
    await subir(roles.admin_empresa, c.control, c.tests[0], 'sin-resp');
    expect(await detail(c.control)).toMatchObject({ management_state: 'pending_approval' });
    expect((await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(200)).body.data).toMatchObject({ management_state: 'approved' });
    expect((await rows(c.control)).map((r) => [r.step, r.decision])).toEqual([['final', 'approved']]);
  });

  it('el admin es el responsable: su aprobación es la final', async () => {
    const [{ id: adminId }] = await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]);
    const c = await controlDoc(1, adminId);
    await subir(roles.admin_empresa, c.control, c.tests[0], 'admin-resp');
    expect((await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(200)).body.data).toMatchObject({ management_state: 'approved' });
  });
});

describe('POST /v1/controls/{id}/approval · devolver con motivo', () => {
  let c: { control: string; tests: string[] };
  let ids: string[];

  beforeAll(async () => {
    c = await controlDoc(2, roles.responsable.id, roles.delegado.id);
    ids = [await subir(roles.delegado.agent, c.control, c.tests[0], 'dev-a'), await subir(roles.delegado.agent, c.control, c.tests[1], 'dev-b')];
  });

  it('sin el motivo, 422 reason.required; con uno en blanco también', async () => {
    for (const body of [{ decision: 'return' }, { decision: 'return', reason: '   ' }]) {
      const res = await decide(roles.responsable.agent, c.control, body).expect(422);
      expect(res.body.error.fields).toEqual([expect.objectContaining({ field: 'reason', code: 'reason.required' })]);
    }
  });

  it('una entrega que no es del control: 422 returned_submission_ids.invalid, y no se escribe nada', async () => {
    const otro = await controlDoc(1, roles.responsable.id);
    const ajena = await subir(roles.admin_empresa, otro.control, otro.tests[0], 'ajena');
    const res = await decide(roles.responsable.agent, c.control, { decision: 'return', reason: 'x', returned_submission_ids: [ajena] }).expect(422);
    expect(res.body.error.fields).toEqual([expect.objectContaining({ field: 'returned_submission_ids', code: 'returned_submission_ids.invalid' })]);
    expect(await rows(c.control)).toEqual([]);
  });

  it('el delegado, el auditor y un responsable ajeno no devuelven: 403', async () => {
    for (const agent of [roles.delegado.agent, roles.auditor.agent, ajeno.agent]) await decide(agent, c.control, { decision: 'return', reason: 'x' }).expect(403);
  });

  it('el responsable devuelve: returned con el motivo, la entrega dada deja de contar y se ve su motivo; la otra sigue contando', async () => {
    const res = await decide(roles.responsable.agent, c.control, { decision: 'return', reason: 'El acta del comité no está firmada.', returned_submission_ids: [ids[0]] }).expect(200);
    expect(res.body.data).toMatchObject({ management_state: 'returned', management: { returned_reason: 'El acta del comité no está firmada.', returned_by: { id: roles.responsable.id }, returned_at: expect.any(String) } });
    const evidencia = (await roles.admin_empresa.get(`/v1/controls/${c.control}/evidence`).expect(200)).body.data;
    expect(JSON.stringify(evidencia)).toContain('El acta del comité no está firmada.');
    expect(JSON.stringify(evidencia)).toContain('non_compliant');
    expect(await auditRows('control_approval.return')).toBeGreaterThanOrEqual(1);
    const [row] = await rows(c.control);
    expect(row).toMatchObject({ step: 'owner', decision: 'returned', reason: 'El acta del comité no está firmada.' });
  });

  it('desde returned no se aprueba ni se vuelve a devolver; con una carga nueva sale de returned', async () => {
    expect((await decide(roles.responsable.agent, c.control, { decision: 'approve' }).expect(409)).body.error.code).toBe('CONTROL_NOT_COMPLIANT');
    expect((await decide(roles.responsable.agent, c.control, { decision: 'return', reason: 'otra' }).expect(409)).body.error.code).toBe('NOTHING_TO_RETURN');
    await subir(roles.delegado.agent, c.control, c.tests[0], 'dev-a-corregida');
    expect(await detail(c.control)).toMatchObject({ management_state: 'pending_approval', management: { returned_reason: null } });
  });

  it('devolver quita las aprobaciones vigentes: el admin devuelve sobre owner_approved y la primera aprobación queda invalidada', async () => {
    await decide(roles.responsable.agent, c.control, { decision: 'approve' }).expect(200);
    await decide(roles.admin_empresa, c.control, { decision: 'return', reason: 'Falta la firma.' }).expect(200);
    const filas = await rows(c.control);
    expect(filas.filter((r) => r.decision === 'approved').every((r) => r.invalidated_at !== null)).toBe(true);
    expect(await detail(c.control)).toMatchObject({ management_state: 'returned', management: { owner_approved_by: null, approved_by: null } });
  });
});

describe('POST /v1/controls/{id}/tests/{test}/result · el resultado de una prueba manual (D140)', () => {
  let control: string;
  let control2: string; // sin responsable
  let manualTest: string;
  let manualTest2: string; // la prueba de `control2`
  let documentaryTest: string;
  const registrar = (agent: Agent, body: Record<string, unknown>, ctl = control, test = manualTest) => agent.post(`/v1/controls/${ctl}/tests/${test}/result`).send(body);

  beforeAll(async () => {
    // Dos controles del catálogo que llevan la misma prueba operativa o de población, con un requisito de una sola prueba.
    const found = await owner<{ control: string; test: string; doc: string }>(
      `select cc.id control, crt.test_id test,
              (select x.test_id from tenant.client_control_tests x join catalog.tests d on d.id = x.test_id and d.dimension = 'policy' where x.client_control_id = cc.id order by d.code limit 1) doc
         from tenant.client_controls cc
         join tenant.client_control_requirements ccr on ccr.client_control_id = cc.id
         join catalog.control_requirement_tests crt on crt.control_requirement_id = ccr.control_requirement_id
         join catalog.tests t on t.id = crt.test_id and t.type in ('operational', 'population')
        where cc.service_id = $1 and cc.is_active and cc.control_id is not null
        order by cc.own_code, t.code limit 400`,
      [a.serviceId],
    );
    const withDoc = found.filter((f) => f.doc);
    const first = withDoc[0];
    const second = withDoc.find((f) => f.control !== first.control)!;
    expect(second).toBeDefined();
    ({ control, test: manualTest, doc: documentaryTest } = first);
    control2 = second.control;
    manualTest2 = second.test;
    await asignarControl(a.companyId, control, roles.responsable.id, roles.delegado.id);
  });

  it('el responsable del control lo registra: 201 con quién, cuándo y el estado de gestión del control, y queda en el rastro y en el evento de estado', async () => {
    const res = await registrar(roles.responsable.agent, { result: 'correct' }).expect(201);
    expect(res.body.data).toMatchObject({
      control_id: control, test_id: manualTest, result: 'correct', note: null, registered_by: { id: roles.responsable.id }, registered_at: expect.any(String), management_state: expect.stringMatching(/^(non_compliant|in_progress)$/),
    });
    expect(await auditRows('manual_test_result.register')).toBe(1);
    const status = (await roles.admin_empresa.get(`/v1/controls/${control}?view=technical`).expect(200)).body.data.technical.tests.find((t: any) => t.test_id === manualTest).status;
    expect(status).toBe('correct');
    expect(await detail(control)).toMatchObject({ management_state: 'in_progress' });
  });

  it('observación y excepción exigen la nota: 422 note.required; un resultado fuera del enum, 422 enum.invalid', async () => {
    for (const result of ['observation', 'exception']) {
      const res = await registrar(roles.responsable.agent, { result }).expect(422);
      expect(res.body.error.fields).toEqual([expect.objectContaining({ field: 'note', code: 'note.required' })]);
      await registrar(roles.responsable.agent, { result, note: '   ' }).expect(422);
    }
    expect((await registrar(roles.responsable.agent, { result: 'tal_vez' }).expect(422)).body.error.fields).toEqual([expect.objectContaining({ field: 'result' })]);
  });

  it('cada registro es una fila nueva e inmutable: el último decide, y la base no deja editarlo ni borrarlo', async () => {
    await registrar(roles.responsable.agent, { result: 'exception', note: 'La consola muestra la regla abierta.' }).expect(201);
    const status = () => roles.admin_empresa.get(`/v1/controls/${control}?view=technical`).then((r) => r.body.data.technical.tests.find((t: any) => t.test_id === manualTest).status);
    expect(await status()).toBe('exception');
    await registrar(roles.responsable.agent, { result: 'observation', note: 'Se corrigió pero falta el acta.' }).expect(201);
    expect(await status()).toBe('observation');
    expect(Number((await owner<{ n: number }>('select count(*)::int n from tenant.manual_test_results where client_control_id = $1', [control]))[0].n)).toBe(3);
    await expect(owner('update tenant.manual_test_results set result = $2::tenant.manual_test_result_value where client_control_id = $1', [control, 'correct'])).rejects.toThrow(/inmutable/);
    await expect(owner('delete from tenant.manual_test_results where client_control_id = $1', [control])).rejects.toThrow(/inmutable/);
  });

  it('es del control, no del servicio: el resultado queda atado al control y a la prueba, y otro control no lo recibe', async () => {
    const filas = await owner<{ client_control_id: string; test_id: string }>('select distinct client_control_id, test_id from tenant.manual_test_results where tenant_id = $1', [a.companyId]);
    expect(filas).toEqual([{ client_control_id: control, test_id: manualTest }]);
    const otro = (await roles.admin_empresa.get(`/v1/controls/${control2}?view=technical`).expect(200)).body.data.technical.tests.find((t: any) => t.test_id === manualTest2);
    expect(otro.status).toBe('pending');
  });

  it('el delegado carga la evidencia pero no registra el resultado; tampoco un responsable ajeno, el auditor, el colaborador ni admin_monkey: 403', async () => {
    for (const agent of [roles.delegado.agent, ajeno.agent, roles.auditor.agent, roles.colaborador.agent, monkey]) await registrar(agent, { result: 'correct' }).expect(403);
  });

  it('con otro responsable el admin_empresa no lo registra (403); sin responsable, o si él lo es, sí (201)', async () => {
    await registrar(roles.admin_empresa, { result: 'correct' }).expect(403);
    await registrar(roles.admin_empresa, { result: 'correct' }, control2, manualTest2).expect(201);
    const [{ id: adminId }] = await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]);
    await asignarControl(a.companyId, control2, adminId);
    await registrar(roles.admin_empresa, { result: 'correct' }, control2, manualTest2).expect(201);
  });

  it('una prueba documental se resuelve con su evidencia: 409 TEST_NOT_MANUAL', async () => {
    const res = await registrar(roles.responsable.agent, { result: 'correct' }, control, documentaryTest).expect(409);
    expect(res.body.error.code).toBe('TEST_NOT_MANUAL');
  });

  it('una prueba que el control no lleva, un control de otra empresa o un id inválido: 404', async () => {
    await registrar(roles.responsable.agent, { result: 'correct' }, control, '00000000-0000-4000-8000-000000000000').expect(404);
    await registrar(b.agent, { result: 'correct' }).expect(404);
    await registrar(roles.responsable.agent, { result: 'correct' }, 'no-es-un-uuid').expect(404);
  });
});

/** Un control del catálogo que queda con UN solo requisito de UNA sola prueba operativa o de población: con su resultado cumple al 100 %. */
async function controlDeUnaPrueba(skip: number, periodicidad: string | null = null): Promise<{ control: string; test: string }> {
  const [row] = await owner<{ control: string; test: string; requirement: string }>(
    `select cc.id control, crt.test_id test, ccr.control_requirement_id requirement
       from tenant.client_controls cc
       join tenant.client_control_requirements ccr on ccr.client_control_id = cc.id
       join catalog.control_requirement_tests crt on crt.control_requirement_id = ccr.control_requirement_id
       join catalog.tests t on t.id = crt.test_id and t.type in ('operational', 'population')
      where cc.service_id = $1 and cc.is_active and cc.control_id is not null
        and (select count(*) from catalog.control_requirement_tests x where x.control_requirement_id = ccr.control_requirement_id) = 1
      order by cc.own_code, t.code offset $2 limit 1`,
    [a.serviceId, skip + 10],
  );
  await owner('delete from tenant.client_control_requirements where client_control_id = $1 and control_requirement_id <> $2', [row.control, row.requirement]);
  if (periodicidad) await owner('update tenant.client_control_requirements set periodicity = $2::catalog.periodicity where client_control_id = $1', [row.control, periodicidad]);
  return { control: row.control, test: row.test };
}

describe('MD-504 · invalidación por la vía normal, carrera y rutas retiradas', () => {
  it('una carrera: dos aprobaciones del mismo paso a la vez dan un 200 y un 409 ALREADY_APPROVED, y una sola fila', async () => {
    const c = await controlDoc(1, null);
    await subir(roles.admin_empresa, c.control, c.tests[0], 'carrera');
    const res = await Promise.all([decide(roles.admin_empresa, c.control, { decision: 'approve' }), decide(roles.admin_empresa, c.control, { decision: 'approve' })]);
    expect(res.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(res.find((r) => r.status === 409)!.body.error.code).toBe('ALREADY_APPROVED');
    expect(await rows(c.control)).toHaveLength(1);
  });

  it('un resultado que baja el nivel invalida la aprobación en la misma escritura: queda marcada y, al volver a cumplir, hay que aprobar otra vez', async () => {
    const c = await controlDeUnaPrueba(0);
    const result = (body: Record<string, unknown>) => roles.admin_empresa.post(`/v1/controls/${c.control}/tests/${c.test}/result`).send(body);
    expect((await result({ result: 'correct' }).expect(201)).body.data.management_state).toBe('pending_approval');
    expect((await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(200)).body.data.management_state).toBe('approved');
    expect((await result({ result: 'exception', note: 'La regla volvió a abrirse.' }).expect(201)).body.data.management_state).toBe('in_progress');
    expect((await rows(c.control)).map((r) => r.invalidated_at !== null)).toEqual([true]);
    expect((await result({ result: 'correct' }).expect(201)).body.data.management_state).toBe('pending_approval');
    expect(await detail(c.control)).toMatchObject({ management: { approved_by: null } });
  });

  it('el paso del tiempo en un servicio SIN período auditado también invalida la aprobación (y no escribe eventos D91)', async () => {
    await definirPeriodo(a.serviceId, null, null);
    const c = await controlDeUnaPrueba(1, 'monthly');
    await roles.admin_empresa.post(`/v1/controls/${c.control}/tests/${c.test}/result`).send({ result: 'correct' }).expect(201);
    await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(200);
    expect(await detail(c.control)).toMatchObject({ management_state: 'approved' });
    const hoy = new Date();
    const proximoMes = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 1, 12));
    const eventos = () => owner<{ n: number }>(`select count(*)::int n from audit.compliance_events where tenant_id = $1 and new_value->>'cause' = 'window_closed'`, [a.companyId]).then((r) => r[0].n);
    const antes = await eventos();
    await app.get(RollEvaluationPeriodsUseCase).execute(proximoMes);
    expect((await rows(c.control)).every((r) => r.invalidated_at !== null)).toBe(true);
    expect(await eventos()).toBe(antes);
    await definirPeriodo(a.serviceId, '2026-01-01', '2027-12-31');
  });

  it('un control dado de baja responde 404 en la aprobación y en el resultado', async () => {
    const c = await controlDoc(1, null);
    await subir(roles.admin_empresa, c.control, c.tests[0], 'baja');
    await roles.admin_empresa.delete(`/v1/controls/${c.control}`).expect(204);
    await decide(roles.admin_empresa, c.control, { decision: 'approve' }).expect(404);
    await roles.admin_empresa.post(`/v1/controls/${c.control}/tests/${c.tests[0]}/result`).send({ result: 'correct' }).expect(404);
  });

  it('las tres rutas retiradas ya no existen: 404', async () => {
    const u = '00000000-0000-4000-8000-000000000000';
    await roles.admin_empresa.put(`/v1/evidence-submissions/${u}/review`).send({ review: 'human_validated' }).expect(404);
    await roles.admin_empresa.post(`/v1/controls/${u}/tests/${u}/verdicts`).send({ result: 'compliant' }).expect(404);
    await roles.admin_empresa.put(`/v1/verdicts/${u}/review`).send({ decision: 'approve' }).expect(404);
  });
});
