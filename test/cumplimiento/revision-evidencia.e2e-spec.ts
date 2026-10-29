import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { FileStorage } from '../../src/common/storage/file-storage';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { asApp, failure, withRollback } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-127 + D88 · La persona lee lo que pide una prueba documental y sube su documento PARA ESA PRUEBA en ese control; el admin_empresa la valida o la rechaza con motivo (D96),
// en una sola revisión de la que sale el estado de la prueba (RN-04). El funcional y el auditor no revisan. Cada prueba sale por HTTP con la sesión real de cada rol, contra el Postgres desechable.
type Agent = Awaited<ReturnType<typeof login>>;
type TestRef = { id: string; code: string };
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let funcional: Agent;
let funcionalId: string;
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
  return Object.fromEntries(d.technical.tests.filter((t: any) => t.dimension === 'policy').map((t: any) => [t.test_code, t.state]));
}
const requirementsOf = async (agent: Agent, controlId: string, view?: 'technical') =>
  (await agent.get(`/v1/controls/${controlId}/evidence${view ? `?view=${view}` : ''}`).expect(200)).body.data.items as any[];
const requirementOfTest = async (controlId: string, testId: string) => (await requirementsOf(a.agent, controlId)).find((r) => r.test?.id === testId);
const docTestsOf = (controlId: string) =>
  owner<TestRef>(
    `select t.id, t.code from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension = 'policy' order by t.code`,
    [controlId],
  );

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-rev-${RUN}@cumplimiento.test`, 'auditor');
  funcionalId = await cuenta(a.companyId, `funcional-rev-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-rev-${RUN}@cumplimiento.test`);
  funcional = await login(app, `funcional-rev-${RUN}@cumplimiento.test`);

  const controls = await owner<{ id: string }>(
    `select cc.id from tenant.client_controls cc
      where cc.service_id = $1 and cc.is_active
        and (select count(*) from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = cc.id and t.dimension = 'policy') >= 2
      order by cc.own_code limit 2`,
    [a.serviceId],
  );
  expect(controls.length).toBe(2);
  [controlX, controlY] = controls.map((c) => c.id);
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
    expect(slot).toMatchObject({ origin: 'own', dimension: 'policy', test: { id: t1.id, code: t1.code } });
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
  it('suben el administrador y el funcional dueño del control; otro funcional, auditor y admin_monkey, no', async () => {
    const [, t2] = testsY;
    await owner(`insert into platform.user_control_assignments (id, company_id, user_id, client_control_id, assigned_by) values (gen_random_uuid(), $1, $2, $3, $4)`,
      [a.companyId, funcionalId, controlY, (await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]))[0].id]);
    await forTest(funcional, controlY, t2.id, 'func').expect(201);
    await forTest(funcional, controlX, testsX[0].id, 'func-ajeno').expect(403); // no tiene asignado el control X
    await forTest(auditor, controlY, t2.id, 'au').expect(403);
    await forTest(monkey, controlY, t2.id, 'm').expect(403);
  });

  it('otra empresa y un id inválido, 404; una prueba que el control no lleva, 404; una prueba que no es documental, 422', async () => {
    const [t1] = testsX;
    await forTest(b.agent, controlX, t1.id, 'b').expect(404);
    await forTest(a.agent, controlX, 'no-es-uuid', 'x').expect(404);
    const sinVinculo = (await owner<{ id: string }>(`select id from catalog.tests where dimension = 'policy' and id not in (select test_id from tenant.client_control_tests where client_control_id = $1) limit 1`, [controlX]))[0];
    await forTest(a.agent, controlX, sinVinculo.id, 'x').expect(404);
    const automated = (await owner<{ id: string }>(
      `select t.id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension <> 'policy' limit 1`, [controlX]))[0];
    if (automated) {
      const res = await forTest(a.agent, controlX, automated.id, 'x').expect(422);
      expect(res.body.error.fields[0]).toMatchObject({ field: 'test_id', code: 'test.not_documentary' });
    }
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

  it('deja el rastro de la creación del lugar y de la entrega', async () => {
    const [row] = await owner<{ after_state: Record<string, unknown> }>(
      `select after_state from audit.audit_logs where tenant_id = $1 and action = 'evidence_requirement.create' order by created_at desc limit 1`, [a.companyId]);
    expect(row.after_state).toMatchObject({ dimension: 'policy' });
    expect(row.after_state.test_id).toBeTruthy();
  });
});

describe('D96 · solo el admin_empresa revisa; el funcional y el auditor leen', () => {
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

  it('el funcional dueño del control lee el motivo del rechazo, sin el detalle técnico', async () => {
    const t2 = testsY[1];
    const requirement = await requirementOfTest(controlY, t2.id);
    const submission = requirement.submissions[0].id;
    await review(a.agent, submission, { ...ALL_OK, content_ok: false, note: 'Falta el anexo de proveedores.' }).expect(200);
    const visto = (await requirementsOf(funcional, controlY)).find((r) => r.test?.id === t2.id).submissions.find((s: any) => s.id === submission);
    expect(visto).toMatchObject({ evidence_state: 'non_compliant', review_note: 'Falta el anexo de proveedores.' });
    expect(visto.technical).toBeUndefined();
    await funcional.get(`/v1/controls/${controlY}/evidence?view=technical`).expect(403);
  });

  it('el auditor ve la misma revisión que el administrador, y no puede revisar (403)', async () => {
    const find = (items: any[]) => items.find((i) => i.test?.id === t.id).submissions.find((s: any) => s.version === 2);
    const porAuditor = find(await requirementsOf(auditor, controlX, 'technical'));
    const porAdmin = find(await requirementsOf(a.agent, controlX, 'technical'));
    expect(porAuditor).toEqual(porAdmin);
    expect(porAuditor).toMatchObject({ evidence_state: 'compliant', technical: { review: 'human_validated' } });
    await review(auditor, v, ALL_OK).expect(403);
  });

  it('funcional y admin_monkey no revisan (403); otra empresa y un id inválido, 404', async () => {
    await review(funcional, v, ALL_OK).expect(403);
    await review(monkey, v, ALL_OK).expect(403);
    // El administrador de OTRA empresa no encuentra la entrega: para él no existe (404), no es que no pueda (403).
    await review(b.agent, v, ALL_OK).expect(404);
    await review(a.agent, 'no-es-un-uuid', ALL_OK).expect(404);
  });

  it('`ai_prevalidated` y un cuerpo sin `review` se rechazan (422): lo deriva el sistema, nunca una persona', async () => {
    expect((await review(a.agent, v, { ...ALL_OK, review: 'ai_prevalidated' }).expect(422)).body.error.fields[0]).toMatchObject({ field: 'review', code: 'enum.invalid' });
    await review(a.agent, v, { type_ok: true }).expect(422);
    await review(a.agent, v, { ...ALL_OK, type_ok: 'si' }).expect(422);
  });

  it('deja el rastro de quién revisó qué, sin los atributos en el detalle', async () => {
    const [row] = await owner<{ after_state: Record<string, unknown> }>(
      `select after_state from audit.audit_logs where tenant_id = $1 and action = 'evidence_review.update' order by created_at desc limit 1`, [a.companyId]);
    expect(row.after_state).toMatchObject({ reviewer_role: 'admin_empresa', review: 'human_validated' });
    for (const k of ['type_ok', 'period_ok', 'signed_ok', 'content_ok', 'note']) expect(JSON.stringify(row.after_state)).not.toContain(k);
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
    await funcional.post(`/v1/controls/${controlX}/evidence-requirements`).send({ description: 'x', dimension: 'policy' }).expect(403);
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

  it('solo existe una revisión por entrega', async () => {
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