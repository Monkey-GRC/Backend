import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { FileStorage } from '../../src/common/storage/file-storage';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { asApp, failure, withRollback } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';
import { asignarControl, asignarServicio } from '../support/asignaciones';
import { controlPropioConPruebas, resultadoDeStatus } from '../support/controles';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-127 + D88 + D102 (MD-194) · La persona lee lo que pide una prueba documental y sube su documento PARA ESA PRUEBA en ese control; la revisan el responsable dueño (si no la subió él) y el
// admin_empresa (siempre), una revisión por rol, y el estado de la prueba sale de COMBINAR las dos (RN-04): un rechazo gana. El delegado, el auditor y admin_monkey no revisan. Cada prueba sale por
// HTTP con la sesión real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
type TestRef = { id: string; code: string };
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let responsable: Agent;
let responsableNoDoc: Agent;
let delegado: Agent;
let responsableId: string;
const storage = new StorageEnMemoria();

let controlX: string; // un control con dos pruebas documentales
let controlY: string; // otro control con las mismas pruebas: no debe enterarse de lo que pasa en X
let testsX: TestRef[]; // sus pruebas documentales
let testsY: TestRef[];

const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% evidencia ${marca} ${RUN}\n`);
const ALL_OK = { type_ok: true, period_ok: true, valid_ok: true, approved_ok: true, signed_ok: true, content_ok: true, review: 'human_validated' as const };
const forTest = (agent: Agent, controlId: string, testId: string, marca: string, buffer: Buffer = pdf(marca)) =>
  agent.post(`/v1/controls/${controlId}/tests/${testId}/evidence`).attach('file', buffer, `${marca}.pdf`);
const review = (agent: Agent, submissionId: string, body: Record<string, unknown>) => agent.put(`/v1/evidence-submissions/${submissionId}/review`).send(body);

/** El estado de cada prueba documental de un control, tal como lo ve quien pide la vista técnica. */
async function docStates(controlId: string): Promise<Record<string, string>> {
  const d = (await a.agent.get(`/v1/controls/${controlId}?view=technical`).expect(200)).body.data;
  return Object.fromEntries(d.technical.tests.filter((t: any) => t.dimension === 'policy').map((t: any) => [t.test_code, resultadoDeStatus(t.status)]));
}
const requirementsOf = async (agent: Agent, controlId: string, view?: 'technical') =>
  (await agent.get(`/v1/controls/${controlId}/evidence${view ? `?view=${view}` : ''}`).expect(200)).body.data.items as any[];
const requirementOfTest = async (controlId: string, testId: string) => (await requirementsOf(a.agent, controlId)).find((r) => r.test?.id === testId);
const docTestsOf = (controlId: string) =>
  owner<TestRef>(
    `select t.id, t.code from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension = 'policy' order by t.code`,
    [controlId],
  );

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable' | 'delegado'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role, is_internal) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role, $5) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role, role === 'delegado' ? true : null],
  ))[0].id;
}

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-rev-${RUN}@cumplimiento.test`, 'auditor');
  responsableId = await cuenta(a.companyId, `responsable-rev-${RUN}@cumplimiento.test`, 'responsable');
  await cuenta(a.companyId, `responsable-nodoc-rev-${RUN}@cumplimiento.test`, 'responsable');
  auditor = await login(app, `auditor-rev-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-rev-${RUN}@cumplimiento.test`);
  await asignarServicio(a.companyId, a.serviceId, responsableId);
  responsableNoDoc = await login(app, `responsable-nodoc-rev-${RUN}@cumplimiento.test`);
  const delegadoId = await cuenta(a.companyId, `delegado-rev-${RUN}@cumplimiento.test`, 'delegado');
  delegado = await login(app, `delegado-rev-${RUN}@cumplimiento.test`);

  const controls = await owner<{ id: string }>(
    `select cc.id from tenant.client_controls cc
      where cc.service_id = $1 and cc.is_active
        and (select count(*) from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = cc.id and t.dimension = 'policy') >= 2
      order by cc.own_code limit 2`,
    [a.serviceId],
  );
  expect(controls.length).toBe(2);
  [controlX, controlY] = controls.map((c) => c.id);
  await asignarControl(a.companyId, controlY, responsableId, delegadoId); // el delegado es el ejecutor de Y; el responsable, su dueño
  testsX = await docTestsOf(controlX);
  testsY = await docTestsOf(controlY);
});
afterAll(async () => {
  await app?.close();
});

describe('D88 · la persona sube su documento para UNA prueba, y solo esa prueba se mueve', () => {
  let submission1: string;
  let t1: TestRef;
  let t2: TestRef;

  beforeAll(() => {
    [t1, t2] = testsX;
  });

  it('sin evidencias entregadas, sus pruebas documentales están pendientes: la ausencia de evidencia nunca es cumplimiento', async () => {
    const states = await docStates(controlX);
    expect(Object.keys(states).length).toBeGreaterThanOrEqual(2);
    for (const s of Object.values(states)) expect(s).toBe('pending');
  });

  it('la primera entrega crea el lugar de esa prueba y queda pendiente: subir NO cumple nada (D84)', async () => {
    const res = await forTest(a.agent, controlX, t1.id, 'x-t1-v1').expect(201);
    submission1 = res.body.data.id;
    expect(res.body.data).toMatchObject({ version: 1, evidence_state: 'pending' });
    const slot = await requirementOfTest(controlX, t1.id);
    // v2: el lugar de cada documento ya lo creó el clonado (origen del catálogo): la entrega no crea uno nuevo.
    expect(slot).toMatchObject({ origin: 'catalog', dimension: 'policy', test: { id: t1.id, code: t1.code } });
    expect(res.body.data.requirement_id).toBe(slot.id);
    for (const s of Object.values(await docStates(controlX))) expect(s).toBe('pending');
  });

  it('el admin_empresa valida: cumple SOLO esa prueba; la otra prueba del control y las del otro control siguen pendientes', async () => {
    const res = await review(a.agent, submission1, { ...ALL_OK, note: 'Aprobada por la dirección.' }).expect(200);
    expect(res.body.data).toMatchObject({ id: submission1, evidence_state: 'compliant', technical: { review: 'human_validated', note: 'Aprobada por la dirección.' } });
    expect(res.body.data.technical.attributes).toEqual({ type_ok: true, period_ok: true, valid_ok: true, approved_ok: true, signed_ok: true, content_ok: true });
    expect(res.body.data.technical.reviewed_by.id).toBeTruthy();

    const x = await docStates(controlX);
    expect(x[t1.code]).toBe('compliant');
    expect(x[t2.code]).toBe('pending');
    for (const s of Object.values(await docStates(controlY))) expect(s).toBe('pending');
  });

  it('cuando cada prueba tiene su evidencia validada, el control de documentos queda cumplido', async () => {
    const second = (await forTest(a.agent, controlX, t2.id, 'x-t2-v1').expect(201)).body.data.id;
    await review(a.agent, second, ALL_OK).expect(200);
    for (const s of Object.values(await docStates(controlX))) expect(s).toBe('compliant');
  });

  it('una entrega nueva de la misma prueba es la versión 2 del mismo lugar, nace sin revisar y devuelve la prueba a pendiente; la v1 queda de histórico', async () => {
    const v2 = (await forTest(a.agent, controlX, t1.id, 'x-t1-v2').expect(201)).body.data;
    expect(v2).toMatchObject({ version: 2, evidence_state: 'pending' });
    expect((await requirementsOf(a.agent, controlX)).filter((r) => r.test?.id === t1.id)).toHaveLength(1); // no se creó otro lugar
    const x = await docStates(controlX);
    expect(x[t1.code]).toBe('pending');
    expect(x[t2.code]).toBe('compliant');
    const subs = (await a.agent.get(`/v1/evidence-requirements/${(await requirementOfTest(controlX, t1.id)).id}/submissions`).expect(200)).body.data.items;
    expect(subs.find((s: any) => s.version === 1).evidence_state).toBe('compliant');
  });

  it('revisar de nuevo REEMPLAZA la revisión (una fila por entrega); un atributo en «no» deja la prueba sin cumplir y pide motivo', async () => {
    const v2 = (await a.agent.get(`/v1/evidence-requirements/${(await requirementOfTest(controlX, t1.id)).id}/submissions`).expect(200)).body.data.items.find((s: any) => s.version === 2).id;
    await review(a.agent, v2, ALL_OK).expect(200);
    expect((await docStates(controlX))[t1.code]).toBe('compliant');
    const res = await review(a.agent, v2, { ...ALL_OK, signed_ok: false, note: 'Falta la firma de la dirección.' }).expect(200);
    expect(res.body.data.evidence_state).toBe('non_compliant');
    expect((await docStates(controlX))[t1.code]).toBe('non_compliant');
    expect((await owner<{ n: number }>(`select count(*)::int n from tenant.evidence_reviews where evidence_submission_id = $1 and reviewer_role = 'admin_empresa'`, [v2]))[0].n).toBe(1);
  });

  it('vigencia en «no» la deja vencida; un atributo sin valorar, pendiente; sin validación humana no cumple', async () => {
    const v2 = (await a.agent.get(`/v1/evidence-requirements/${(await requirementOfTest(controlX, t1.id)).id}/submissions`).expect(200)).body.data.items.find((s: any) => s.version === 2).id;
    expect((await review(a.agent, v2, { ...ALL_OK, valid_ok: false, note: 'El documento venció.' }).expect(200)).body.data.evidence_state).toBe('expired');
    expect((await review(a.agent, v2, { ...ALL_OK, content_ok: null }).expect(200)).body.data.evidence_state).toBe('pending');
    expect((await review(a.agent, v2, { ...ALL_OK, review: 'pending_review' }).expect(200)).body.data.evidence_state).toBe('pending');
    await review(a.agent, v2, ALL_OK).expect(200); // lo deja cumpliendo para lo que sigue
  });

  it('un documento que el catálogo sugiere para el control (sin prueba) no cuenta para ninguna prueba, aunque tenga entregas', async () => {
    const [shared] = await owner<{ id: string }>(`select id from tenant.evidence_requirements where client_control_id = $1 and test_id is null order by sequence limit 1`, [controlY]);
    if (!shared) return; // este control no trae documento sugerido
    await a.agent.post(`/v1/evidence-requirements/${shared.id}/submissions`).attach('file', pdf('y-sugerido'), 'sugerido.pdf').expect(201);
    for (const s of Object.values(await docStates(controlY))) expect(s).toBe('pending');
  });
});

describe('D88 · reglas de la subida por prueba', () => {
  it('suben el administrador y el responsable dueño; otro responsable sin asignación, auditor y admin_monkey, no (D102)', async () => {
    const [, t2] = testsY;
    await forTest(responsable, controlY, t2.id, 'func').expect(201);
    await forTest(responsableNoDoc, controlY, t2.id, 'sin-asignacion').expect(403);
    await forTest(auditor, controlY, t2.id, 'au').expect(403);
    await forTest(monkey, controlY, t2.id, 'm').expect(403);
  });

  it('otra empresa y un id inválido, 404; una prueba que el control no lleva, 404; una prueba que no es documental, 422', async () => {
    const [t1] = testsX;
    await forTest(b.agent, controlX, t1.id, 'b').expect(404);
    await forTest(a.agent, controlX, 'no-es-uuid', 'x').expect(404);
    const sinVinculo = (await owner<{ id: string }>(`select id from catalog.tests where dimension = 'policy' and id not in (select test_id from tenant.client_control_tests where client_control_id = $1) limit 1`, [controlX]))[0];
    await forTest(a.agent, controlX, sinVinculo.id, 'x').expect(404);
    // MD-499 · Una prueba cuya evidencia toma una fuente automática no acepta subida (test.not_manual); una de proceso, sí.
    const link = async (testId: string) => owner(`insert into tenant.client_control_tests (id, tenant_id, client_control_id, test_id) values (gen_random_uuid(), $1, $2, $3) on conflict do nothing`, [a.companyId, controlX, testId]);
    const automated = (await owner<{ id: string }>(`select id from catalog.tests where primary_source in ('probe','cloud_engine','probe_and_cloud_engine') limit 1`))[0];
    await link(automated.id);
    const res = await forTest(a.agent, controlX, automated.id, 'x').expect(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'test_id', code: 'test.not_manual' });
    expect(res.body.error.fields[0].message).not.toMatch(/^validation\./);
    const proceso = (await owner<{ id: string }>(`select t.id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension = 'process' and t.primary_source in ('manual','document') limit 1`, [controlX]))[0];
    expect(proceso).toBeDefined(); // el catálogo lleva pruebas de proceso en este control
    const ok = await forTest(a.agent, controlX, proceso.id, 'proc').expect(201);
    expect(ok.body.data).toBeDefined();
    const req = await requirementOfTest(controlX, proceso.id);
    expect(req).toMatchObject({ dimension: 'process' });
    // El motor la cuenta: pendiente al subir, cumplida cuando el admin_empresa la valida.
    const stateOf = async () => (await a.agent.get(`/v1/controls/${controlX}?view=technical`).expect(200)).body.data.technical.tests.find((t: any) => t.test_id === proceso.id).status;
    expect(await stateOf()).toBe('pending');
    await review(a.agent, ok.body.data.id, ALL_OK).expect(200);
    expect(await stateOf()).toBe('correct');
    // MD-499 · si la dimensión de la prueba se marca «no aplica» en el control, deja de aceptar subida y de salir en evidence_tests.
    await owner(`update tenant.client_control_dimensions set reason_not_applicable = 'No operamos esa parte.' where client_control_id = $1 and dimension = 'process'`, [controlX]);
    try {
      const sinAplicar = await forTest(a.agent, controlX, proceso.id, 'proc-no-aplica').expect(422);
      expect(sinAplicar.body.error.fields[0]).toMatchObject({ field: 'test_id', code: 'dimension.not_in_control' });
      const d = (await a.agent.get(`/v1/controls/${controlX}?view=technical`).expect(200)).body.data;
      expect(d.evidence_tests.some((t: any) => t.test_id === proceso.id)).toBe(false);
      expect(d.technical.tests.find((t: any) => t.test_id === proceso.id)).toMatchObject({ accepts_evidence: false, evidence_fallback: false });
    } finally {
      await owner(`update tenant.client_control_dimensions set reason_not_applicable = null where client_control_id = $1 and dimension = 'process'`, [controlX]);
    }
    const detail = (await a.agent.get(`/v1/controls/${controlX}?view=technical`).expect(200)).body.data;
    expect(detail.technical.tests.find((t: any) => t.test_id === proceso.id)).toMatchObject({ accepts_evidence: true, evidence_fallback: false });
    expect(detail.technical.requirements.flatMap((r: any) => r.tests).every((t: any) => typeof t.accepts_evidence === 'boolean')).toBe(true);
  });

  it('el ejecutor y el dueño suben en una prueba de proceso, y evidence_tests la ofrece a todos los roles, sin technical (MD-499)', async () => {
    const proceso = (await owner<{ id: string }>(`select t.id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension = 'process' and t.primary_source in ('manual','document') limit 1`, [controlY]))[0];
    expect(proceso).toBeDefined(); // el control Y lleva pruebas de proceso manuales
    const leer = async (agent: Agent) => (await agent.get(`/v1/controls/${controlY}`).expect(200)).body.data;
    for (const agent of [a.agent, responsable, delegado]) {
      const d = await leer(agent);
      expect(d.technical).toBeUndefined();
      const et = d.evidence_tests.find((t: any) => t.test_id === proceso.id);
      expect(et).toEqual({ test_id: proceso.id, test_code: expect.any(String), display_name: expect.any(String), dimension: 'process', status: expect.any(String), evidence_fallback: false, requirement_id: null });
    }
    await forTest(delegado, controlY, proceso.id, 'proc-ejecutor').expect(201);
    await forTest(responsable, controlY, proceso.id, 'proc-dueno').expect(201);
    const req = await requirementOfTest(controlY, proceso.id);
    const despues = (await leer(delegado)).evidence_tests.find((t: any) => t.test_id === proceso.id);
    expect(despues.requirement_id).toBe(req.id);
  });

  it('un archivo rechazado no deja un lugar vacío; sin archivo, 422; sin almacenamiento, 503; un control dado de baja, 409', async () => {
    const t = testsY[0];
    const antes = (await requirementsOf(a.agent, controlY)).length;
    expect((await forTest(a.agent, controlY, t.id, 'falso', Buffer.from('MZ programa')).expect(415)).body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
    expect((await a.agent.post(`/v1/controls/${controlY}/tests/${t.id}/evidence`).expect(422)).body.error.code).toBe('FILE_REQUIRED');
    expect((await requirementsOf(a.agent, controlY)).length).toBe(antes); // lo rechazado no deja un lugar vacío
    storage.available = false;
    await forTest(a.agent, controlY, t.id, 'sin-bucket').expect(503);
    storage.available = true;
    await owner(`update tenant.client_controls set is_active = false where id = $1`, [controlY]);
    try {
      expect((await forTest(a.agent, controlY, t.id, 'baja').expect(409)).body.error.code).toBe('CONTROL_RETIRED');
    } finally {
      await owner(`update tenant.client_controls set is_active = true where id = $1`, [controlY]);
    }
  });

  it('dos primeras entregas a la vez para la misma prueba crean un solo lugar y dos versiones', async () => {
    const t3 = testsY[0];
    const before = (await requirementsOf(a.agent, controlY)).filter((r) => r.test?.id === t3.id).length;
    const results = await Promise.all([1, 2].map((n) => forTest(a.agent, controlY, t3.id, `carrera-${n}`)));
    for (const r of results) expect(r.status).toBe(201);
    const slots = (await requirementsOf(a.agent, controlY)).filter((r) => r.test?.id === t3.id);
    expect(slots.length).toBe(Math.max(before, 1)); // si no existía, se crea uno solo; si ya existía, se reutiliza
    expect(new Set(results.map((r) => r.body.data.version)).size).toBe(2);
  });

  it('deja el rastro de la entrega (el lugar ya existía: lo creó el clonado, así que no hay un `evidence_requirement.create` por subirla)', async () => {
    const [row] = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'evidence.submit'`, [a.companyId]);
    expect(row.n).toBeGreaterThan(0);
  });
});

describe('D96 · el motivo del rechazo, la vista técnica y la validación del cuerpo', () => {
  let v: string;
  let t: TestRef;
  beforeAll(async () => {
    t = testsX[0];
    v = (await a.agent.get(`/v1/evidence-requirements/${(await requirementOfTest(controlX, t.id)).id}/submissions`).expect(200)).body.data.items.find((s: any) => s.version === 2).id;
  });

  it('rechazar sin motivo es 422 (note.required); con motivo, la prueba deja de cumplir y la nota queda', async () => {
    const sinMotivo = await review(a.agent, v, { ...ALL_OK, approved_ok: false }).expect(422);
    expect(sinMotivo.body.error.fields[0]).toMatchObject({ field: 'note', code: 'note.required' });
    const res = await review(a.agent, v, { ...ALL_OK, approved_ok: false, note: 'Sin la firma del comité.' }).expect(200);
    expect(res.body.data).toMatchObject({ evidence_state: 'non_compliant', review_note: 'Sin la firma del comité.', technical: { review: 'human_validated', note: 'Sin la firma del comité.' } });
    expect((await docStates(controlX))[t.code]).toBe('non_compliant');
    // Validar no pide motivo.
    await review(a.agent, v, ALL_OK).expect(200);
    expect((await docStates(controlX))[t.code]).toBe('compliant');
  });

  it('el responsable dueño del control lee el motivo del rechazo, sin el detalle técnico', async () => {
    const t2 = testsY[1];
    const requirement = await requirementOfTest(controlY, t2.id);
    const submission = requirement.submissions[0].id;
    await review(a.agent, submission, { ...ALL_OK, content_ok: false, note: 'Falta el anexo de proveedores.' }).expect(200);
    const visto = (await requirementsOf(responsable, controlY)).find((r) => r.test?.id === t2.id).submissions.find((s: any) => s.id === submission);
    expect(visto).toMatchObject({ evidence_state: 'non_compliant', review_note: 'Falta el anexo de proveedores.' });
    expect(visto.technical).toBeUndefined();
    await responsable.get(`/v1/controls/${controlY}/evidence?view=technical`).expect(403);
    await delegado.get(`/v1/controls/${controlY}/evidence?view=technical`).expect(403);
  });

  it('el auditor ve las mismas revisiones que el administrador, y no puede revisar (403)', async () => {
    const find = (items: any[]) => items.find((i) => i.test?.id === t.id).submissions.find((s: any) => s.version === 2);
    const porAuditor = find(await requirementsOf(auditor, controlX, 'technical'));
    const porAdmin = find(await requirementsOf(a.agent, controlX, 'technical'));
    expect(porAuditor).toEqual(porAdmin);
    expect(porAuditor).toMatchObject({ evidence_state: 'compliant', technical: { review: 'human_validated', reviews: [{ reviewer_role: 'admin_empresa', review: 'human_validated' }] } });
    await review(auditor, v, ALL_OK).expect(403);
  });

  it('otra empresa y un id inválido, 404', async () => {
    await review(b.agent, v, ALL_OK).expect(404);
    await review(a.agent, 'no-es-un-uuid', ALL_OK).expect(404);
    await review(responsable, '00000000-0000-4000-8000-000000000000', ALL_OK).expect(404);
  });

  it('`ai_prevalidated` y un cuerpo sin `review` se rechazan (422): lo deriva el sistema, nunca una persona', async () => {
    expect((await review(a.agent, v, { ...ALL_OK, review: 'ai_prevalidated' }).expect(422)).body.error.fields[0]).toMatchObject({ field: 'review', code: 'enum.invalid' });
    await review(a.agent, v, { type_ok: true }).expect(422);
    await review(a.agent, v, { ...ALL_OK, type_ok: 'si' }).expect(422);
  });

  it('el cuerpo no puede fijar el rol de quien revisa: `reviewer_role` se rechaza (422)', async () => {
    await review(a.agent, v, { ...ALL_OK, reviewer_role: 'responsable' }).expect(422);
  });
});

// D102 · MD-194 · Dos niveles: el responsable dueño y el admin_empresa, una revisión por rol, y el estado combina las dos. Control Y: dueño = responsable, ejecutor = delegado.
describe('D102 · revisión en dos niveles de una evidencia', () => {
  let t: TestRef;
  const rolesOf = (submissionId: string) =>
    owner<{ reviewer_role: string; review: string; reviewed_by: string }>(`select reviewer_role, review, reviewed_by from tenant.evidence_reviews where evidence_submission_id = $1 order by reviewer_role`, [submissionId]);
  const estado = async (agent: Agent = a.agent) => (await requirementsOf(agent, controlY)).find((r) => r.test?.id === t.id).submissions[0];
  /** Sube una versión nueva de la prueba con la sesión dada y devuelve su id (la más reciente). */
  const sube = async (agent: Agent, marca: string) => (await forTest(agent, controlY, t.id, marca).expect(201)).body.data.id as string;

  beforeAll(() => {
    t = testsY[1];
  });

  it('sube el delegado (ejecutor): sin revisión queda pendiente y el responsable dueño la valida con su propio rol', async () => {
    const id = await sube(delegado, 'dos-niveles-delegado-1');
    expect((await estado()).evidence_state).toBe('pending');
    const res = await review(responsable, id, ALL_OK).expect(200);
    expect(res.body.data).toMatchObject({ id, evidence_state: 'compliant' });
    expect(res.body.data.technical).toBeUndefined(); // el responsable ve el estado y la nota, no los atributos
    const filas = await rolesOf(id);
    expect(filas.map((f) => f.reviewer_role)).toEqual(['responsable']);
    expect((await docStates(controlY))[t.code]).toBe('compliant');
  });

  it('el admin_empresa revisa la misma entrega: dos revisiones, una por rol, y si validan los dos cumple', async () => {
    const id = (await estado()).id;
    await review(a.agent, id, ALL_OK).expect(200);
    expect((await rolesOf(id)).map((f) => f.reviewer_role)).toEqual(['admin_empresa', 'responsable']);
    expect((await estado()).evidence_state).toBe('compliant');
    const tecnica = (await requirementsOf(a.agent, controlY, 'technical')).find((r) => r.test?.id === t.id).submissions[0];
    expect(tecnica.technical.reviews.map((r: any) => r.reviewer_role)).toEqual(['admin_empresa', 'responsable']);
  });

  it('el rechazo de un rol gana sobre la validación del otro; quien subió lee el motivo', async () => {
    const id = (await estado()).id;
    const sinNota = await review(a.agent, id, { ...ALL_OK, signed_ok: false }).expect(422);
    expect(sinNota.body.error.fields[0]).toMatchObject({ field: 'note', code: 'note.required' });
    await review(a.agent, id, { ...ALL_OK, signed_ok: false, note: 'Falta la firma de la dirección.' }).expect(200);
    for (const agent of [a.agent, responsable, delegado]) expect((await estado(agent)).evidence_state).toBe('non_compliant');
    expect((await docStates(controlY))[t.code]).toBe('non_compliant');
    const vistoPorQuienSubio = await estado(delegado);
    expect(vistoPorQuienSubio).toMatchObject({ review_note: 'Falta la firma de la dirección.' });
    expect(vistoPorQuienSubio.technical).toBeUndefined();
    const tecnica = (await requirementsOf(a.agent, controlY, 'technical')).find((r) => r.test?.id === t.id).submissions[0];
    expect(tecnica.technical).toMatchObject({ review: 'human_validated', note: 'Falta la firma de la dirección.' }); // el resumen explica el rechazo
  });

  it('un segundo PUT del mismo rol REEMPLAZA su revisión (una fila por rol) y cambia el estado', async () => {
    const id = (await estado()).id;
    await review(a.agent, id, ALL_OK).expect(200); // el admin retira su rechazo; el responsable sigue validando
    expect((await rolesOf(id)).length).toBe(2);
    expect((await estado()).evidence_state).toBe('compliant');
    // El responsable ahora rechaza: gana su rechazo aunque el admin valide.
    await review(responsable, id, { ...ALL_OK, content_ok: false, note: 'El anexo es de otro período.' }).expect(200);
    expect((await rolesOf(id)).length).toBe(2);
    expect((await estado(delegado)).evidence_state).toBe('non_compliant');
    expect((await estado(delegado)).review_note).toBe('El anexo es de otro período.');
    // …y un rechazo posterior anula una validación previa: el responsable vuelve a validar.
    await review(responsable, id, ALL_OK).expect(200);
    expect((await estado()).evidence_state).toBe('compliant');
  });

  it('el responsable dueño NO revisa lo que subió él mismo (403); el admin_empresa sí la revisa', async () => {
    const id = await sube(responsable, 'dos-niveles-responsable-2');
    await review(responsable, id, ALL_OK).expect(403);
    expect(await rolesOf(id)).toEqual([]);
    await review(a.agent, id, ALL_OK).expect(200);
    expect((await rolesOf(id)).map((f) => f.reviewer_role)).toEqual(['admin_empresa']);
    expect((await estado()).evidence_state).toBe('compliant'); // una sola validación, sin rechazos, cumple
  });

  it('el admin_empresa revisa también lo que subió él mismo (P34)', async () => {
    const id = await sube(a.agent, 'dos-niveles-admin-3');
    await review(a.agent, id, ALL_OK).expect(200);
    expect((await estado()).evidence_state).toBe('compliant');
    // Y el responsable dueño sí puede revisar lo que subió el admin.
    await review(responsable, id, { ...ALL_OK, period_ok: false, note: 'El período no es el vigente.' }).expect(200);
    expect((await estado()).evidence_state).toBe('non_compliant');
  });

  it('delegado, auditor, admin_monkey y un responsable que no es el dueño reciben 403; nada se escribe', async () => {
    const id = await sube(delegado, 'dos-niveles-delegado-4');
    await review(delegado, id, ALL_OK).expect(403);
    await review(auditor, id, ALL_OK).expect(403);
    await review(monkey, id, ALL_OK).expect(403);
    await review(responsableNoDoc, id, ALL_OK).expect(403);
    expect(await rolesOf(id)).toEqual([]);
    expect((await estado()).evidence_state).toBe('pending');
  });

  it('otra empresa no encuentra la entrega: 404, no 403', async () => {
    const id = (await estado()).id;
    await review(b.agent, id, ALL_OK).expect(404);
  });

  it('deja el rastro con el rol de quien revisó y quién subió, sin los atributos en el detalle (SEG-36)', async () => {
    const [row] = await owner<{ user_id: string; before_state: any; after_state: Record<string, unknown> }>(
      `select user_id, before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'evidence_review.update' and after_state->>'reviewer_role' = 'responsable' order by created_at desc limit 1`, [a.companyId]);
    expect(row.after_state).toMatchObject({ reviewer_role: 'responsable', submitted_by: expect.any(String), evidence_state: expect.any(String) });
    expect(row.user_id).toBe(responsableId);
    for (const k of ['type_ok', 'period_ok', 'signed_ok', 'content_ok', 'note']) expect(JSON.stringify(row.after_state)).not.toContain(k);
    const [admin] = await owner<{ after_state: Record<string, unknown> }>(
      `select after_state from audit.audit_logs where tenant_id = $1 and action = 'evidence_review.update' and after_state->>'reviewer_role' = 'admin_empresa' order by created_at desc limit 1`, [a.companyId]);
    expect(admin.after_state).toMatchObject({ reviewer_role: 'admin_empresa', review: 'human_validated' });
  });

  it('el cambio de estado que provoca una revisión deja su evento control.state', async () => {
    const [n] = await owner<{ n: number }>(
      `select count(*)::int n from audit.compliance_events where tenant_id = $1 and changed_field = 'control.state' and new_value->>'control_id' = $2 and new_value->>'cause' = 'evidence_review'`, [a.companyId, controlY]);
    expect(n.n).toBeGreaterThan(0);
  });
});

describe('D88 · agregar una evidencia propia con descripción (para quien quiere nombrarla)', () => {
  it('el administrador la agrega a una prueba del control, con las validaciones de siempre', async () => {
    const [t1] = testsX;
    const ok = await a.agent.post(`/v1/controls/${controlX}/evidence-requirements`).send({ description: 'Acta de la revisión anual', dimension: 'policy', test_id: t1.id }).expect(201);
    expect(ok.body.data).toMatchObject({ origin: 'own', test: { id: t1.id } });
    const ajena = (await owner<{ id: string }>(`select id from catalog.tests where dimension = 'policy' and id not in (select test_id from tenant.client_control_tests where client_control_id = $1) limit 1`, [controlX]))[0];
    expect((await a.agent.post(`/v1/controls/${controlX}/evidence-requirements`).send({ description: 'x', dimension: 'policy', test_id: ajena.id }).expect(422)).body.error.fields[0]).toMatchObject({ code: 'test.not_in_control' });
    expect((await a.agent.post(`/v1/controls/${controlX}/evidence-requirements`).send({ description: 'x', dimension: 'app' }).expect(422)).body.error.fields[0]).toMatchObject({ code: 'dimension.not_in_control' });
    // MD-499 · con test_id, la dimensión del requerimiento debe ser la de la prueba.
    const delProceso = (await owner<{ id: string }>(`select t.id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension = 'process' and t.primary_source in ('manual','document') limit 1`, [controlX]))[0];
    const distinta = await a.agent.post(`/v1/controls/${controlX}/evidence-requirements`).send({ description: 'x', dimension: 'policy', test_id: delProceso.id }).expect(422);
    expect(distinta.body.error.fields).toEqual(expect.arrayContaining([{ field: 'dimension', code: 'dimension.not_of_test', message: expect.any(String) }]));
    await responsable.post(`/v1/controls/${controlX}/evidence-requirements`).send({ description: 'x', dimension: 'policy' }).expect(403);
  });

  it('MD-499 · la dimensión `process` con su prueba: la acepta si el control la exige (aunque sea híbrida); otra dimensión del control o una que no tiene, 422', async () => {
    const [t] = await owner<{ id: string }>(`select id from catalog.tests where dimension = 'process' and primary_source = 'manual' order by code limit 1`);
    const control = await controlPropioConPruebas(a.companyId, a.serviceId, `P${RUN.toUpperCase()}`, [t.id], 'process', 'hybrid');
    await owner(`insert into tenant.client_control_dimensions (id, tenant_id, client_control_id, dimension, type) values (gen_random_uuid(), $1, $2, 'policy'::catalog.dimension, 'manual')`, [a.companyId, control]);
    const post = (body: object) => a.agent.post(`/v1/controls/${control}/evidence-requirements`).send({ description: 'Acta firmada', ...body });
    const ok = await post({ dimension: 'process', test_id: t.id }).expect(201);
    expect(ok.body.data).toMatchObject({ dimension: 'process', origin: 'own', test: { id: t.id } });
    // Del control, pero no la de la prueba: un solo error, `dimension.not_of_test`.
    expect((await post({ dimension: 'policy', test_id: t.id }).expect(422)).body.error.fields).toEqual([{ field: 'dimension', code: 'dimension.not_of_test', message: expect.any(String) }]);
    // Una dimensión que el control no exige: el 422 de siempre.
    expect((await post({ dimension: 'network', test_id: t.id }).expect(422)).body.error.fields).toEqual([{ field: 'dimension', code: 'dimension.not_in_control', message: expect.any(String) }]);
    // La dimensión de la prueba marcada «no aplica»: la prueba no se evalúa ahí y no recibe evidencia.
    await owner(`update tenant.client_control_dimensions set reason_not_applicable = 'No aplica' where client_control_id = $1 and dimension = 'process'::catalog.dimension`, [control]);
    expect((await post({ dimension: 'policy', test_id: t.id }).expect(422)).body.error.fields).toEqual(
      expect.arrayContaining([{ field: 'test_id', code: 'dimension.not_in_control', message: expect.any(String) }]),
    );
  });
});

describe('D96 · la base aísla y protege las revisiones', () => {
  it('B no ve las revisiones de A, y la app no puede borrar una revisión', async () => {
    const [row] = await owner<{ id: string }>(`select id from tenant.evidence_reviews where tenant_id = $1 limit 1`, [a.companyId]);
    await withRollback(async (db) => {
      await asApp(db, { tenantId: b.companyId, role: 'admin_empresa' }, async () => {
        expect((await db.query(`select count(*)::int n from tenant.evidence_reviews where id = $1`, [row.id])).rows[0].n).toBe(0);
      });
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => {
        expect((await db.query(`select count(*)::int n from tenant.evidence_reviews where id = $1`, [row.id])).rows[0].n).toBe(1);
        expect(await failure(db, `delete from tenant.evidence_reviews where id = $1`, [row.id])).toMatch(/permission denied/);
      });
    });
  });

  it('solo existe una revisión por entrega y por rol', async () => {
    const [row] = await owner<{ evidence_submission_id: string; reviewed_by: string; tenant_id: string }>(
      `select evidence_submission_id, reviewed_by, tenant_id from tenant.evidence_reviews where tenant_id = $1 and reviewer_role = 'admin_empresa' limit 1`, [a.companyId]);
    await withRollback(async (db) => {
      expect(
        await failure(
          db,
          `insert into tenant.evidence_reviews (id, tenant_id, evidence_submission_id, reviewer_role, reviewed_by) values (gen_random_uuid(), $1, $2, 'admin_empresa', $3)`,
          [row.tenant_id, row.evidence_submission_id, row.reviewed_by],
        ),
      ).toMatch(/duplicate key|unique/);
    });
  });
});