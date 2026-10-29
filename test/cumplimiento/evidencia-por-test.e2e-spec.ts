import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { FileStorage } from '../../src/common/storage/file-storage';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';
import { darEspecialidades } from '../support/especialidades';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-177 · Ver la evidencia de un test manual y listarla por test; ver un PDF, PNG o JPG sin descargarlo (contracts/modules/compliance-evidence.md, D85, D88, D96).
// Todo por HTTP con la sesión real de cada rol, contra el Postgres desechable; el almacenamiento es uno en memoria.
type Agent = Awaited<ReturnType<typeof login>>;
type TestRef = { id: string; code: string };
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let auditor: Agent;
let funcionalDoc: Agent; // con la especialidad documental (D98)
let funcionalOtro: Agent; // con una especialidad distinta de la del test compartido
let adminId: string;
let controlX: string;
let controlY: string;
let docTest: TestRef;
let sharedTest: TestRef; // un test manual no documental que llevan al menos dos controles
let sharedControls: string[];
const storage = new StorageEnMemoria();

const pdf = (marca: string) => Buffer.from(`%PDF-1.7\n% evidencia ${marca} ${RUN}\n`);
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from(`png ${RUN}`)]);
const forTest = (agent: Agent, controlId: string, testId: string, marca: string, buffer: Buffer = pdf(marca), name = `${marca}.pdf`) =>
  agent.post(`/v1/controls/${controlId}/tests/${testId}/evidence`).attach('file', buffer, name);
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));
const listOf = (agent: Agent, controlId: string, testId: string, query = '') => agent.get(`/v1/controls/${controlId}/tests/${testId}/evidence${query}`);

async function cuenta(companyId: string, email: string, role: 'auditor' | 'funcional'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}
beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>(`select id from platform.users where email = $1`, [a.email]))[0].id;
  await cuenta(a.companyId, `auditor-evt-${RUN}@cumplimiento.test`, 'auditor');
  const docId = await cuenta(a.companyId, `funcional-evt-${RUN}@cumplimiento.test`, 'funcional');
  const otroId = await cuenta(a.companyId, `funcional2-evt-${RUN}@cumplimiento.test`, 'funcional');
  auditor = await login(app, `auditor-evt-${RUN}@cumplimiento.test`);
  funcionalDoc = await login(app, `funcional-evt-${RUN}@cumplimiento.test`);
  funcionalOtro = await login(app, `funcional2-evt-${RUN}@cumplimiento.test`);

  // Un control con una prueba documental, y otro control que lleva la misma prueba (no debe enterarse: D88).
  const docControls = await owner<{ id: string; test_id: string; code: string }>(
    `select cc.id, t.id test_id, t.code from tenant.client_controls cc
       join tenant.client_control_tests x on x.client_control_id = cc.id join catalog.tests t on t.id = x.test_id and t.dimension = 'policy'
      where cc.service_id = $1 and cc.is_active
        and exists (select 1 from tenant.client_control_tests y where y.test_id = t.id and y.client_control_id <> cc.id and y.client_control_id in (select id from tenant.client_controls where service_id = $1 and is_active))
      order by cc.own_code, t.code limit 1`,
    [a.serviceId],
  );
  expect(docControls.length).toBe(1);
  controlX = docControls[0].id;
  docTest = { id: docControls[0].test_id, code: docControls[0].code };
  controlY = (await owner<{ id: string }>(`select client_control_id id from tenant.client_control_tests where test_id = $1 and client_control_id <> $2 and client_control_id in (select id from tenant.client_controls where service_id = $3 and is_active) limit 1`, [docTest.id, controlX, a.serviceId]))[0].id;
  await darEspecialidades(a.companyId, docId, 'policy');

  // Un test no documental que lleven al menos dos controles vigentes: se marca como manual en esos controles y se les pone un requerimiento que lo sirva.
  const shared = await owner<{ id: string; code: string; dimension: string }>(
    `select t.id, t.code, t.dimension from catalog.tests t join tenant.client_control_tests x on x.test_id = t.id join tenant.client_controls cc on cc.id = x.client_control_id and cc.service_id = $1 and cc.is_active
      where t.dimension <> 'policy' group by t.id, t.code, t.dimension having count(*) >= 2 order by count(*) desc, t.code limit 1`,
    [a.serviceId],
  );
  expect(shared.length).toBe(1);
  sharedTest = { id: shared[0].id, code: shared[0].code };
  // El otro funcional atiende una dimensión distinta de la del test compartido (y no la documental): no ve nada de esto.
  await darEspecialidades(a.companyId, otroId, (['server', 'cloud', 'database', 'app'] as const).find((d) => d !== shared[0].dimension)!);
  sharedControls = (await owner<{ id: string }>(`select cc.id from tenant.client_control_tests x join tenant.client_controls cc on cc.id = x.client_control_id where x.test_id = $1 and cc.service_id = $2 and cc.is_active order by cc.own_code limit 2`, [sharedTest.id, a.serviceId])).map((r) => r.id);
  for (const [i, controlId] of sharedControls.entries()) {
    await owner(`update tenant.client_control_dimensions set type = 'manual' where client_control_id = $1 and dimension = $2::catalog.dimension`, [controlId, shared[0].dimension]);
    await owner(
      `insert into tenant.evidence_requirements (id, tenant_id, client_control_id, code, sequence, description, dimension, test_id, validity_within_period)
       values (gen_random_uuid(), $1, $2, $3, 90, $4, $5::catalog.dimension, $6, 'Dentro del período de evaluación')`,
      [a.companyId, controlId, `EV-MD177-${i}`, `Evidencia manual ${i}`, shared[0].dimension, i === 0 ? sharedTest.id : null],
    );
  }
});
afterAll(async () => {
  await app?.close();
});

describe('MD-177 · la evidencia de una prueba documental, en su control (D88)', () => {
  let submissionId: string;

  beforeAll(async () => {
    submissionId = (await forTest(a.agent, controlX, docTest.id, 'politica-x').expect(201)).body.data.id;
  });

  it('aparece en el test visto desde su control, con el control de origen, y sin controles compartidos', async () => {
    const res = await listOf(a.agent, controlX, docTest.id).expect(200);
    expect(res.body.message).toBeTruthy();
    expect(res.body.data.test_id).toBe(docTest.id);
    expect(res.body.data.shared_with).toEqual([]);
    expect(res.body.data.items).toHaveLength(1);
    const [item] = res.body.data.items;
    expect(item).toMatchObject({ dimension: 'policy', test: { id: docTest.id, code: docTest.code }, control: { id: controlX, code: expect.stringMatching(/^[A-Z]+-\d+$/) } });
    expect(item.submissions).toHaveLength(1);
    expect(item.submissions[0]).toMatchObject({ id: submissionId, version: 1, file_type: 'application/pdf', evidence_state: 'pending' });
    expect(item.submissions[0]).not.toHaveProperty('technical');
    expect(JSON.stringify(res.body)).not.toMatch(/file_key|file_path|X-Signature/);
  });

  it('otro control que lleva la misma prueba no ve esa evidencia: cada control tiene la suya', async () => {
    const res = await listOf(a.agent, controlY, docTest.id).expect(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.shared_with).toEqual([]);
  });

  it('una versión nueva se suma a las entregas, la más reciente primero', async () => {
    await forTest(a.agent, controlX, docTest.id, 'politica-x-v2').expect(201);
    const [item] = (await listOf(a.agent, controlX, docTest.id).expect(200)).body.data.items;
    expect(item.submissions.map((s: any) => s.version)).toEqual([2, 1]);
  });

  it('?view=technical lo piden el administrador y el auditor; el funcional recibe 403', async () => {
    const [item] = (await listOf(auditor, controlX, docTest.id, '?view=technical').expect(200)).body.data.items;
    expect(item.submissions[0].technical).toMatchObject({ review: expect.any(String), attributes: expect.any(Object) });
    await listOf(a.agent, controlX, docTest.id, '?view=technical').expect(200);
    await listOf(funcionalDoc, controlX, docTest.id, '?view=technical').expect(403);
  });

  it('el funcional con la especialidad la ve; otro funcional recibe la lista vacía, no un error; el auditor ve todo', async () => {
    expect((await listOf(funcionalDoc, controlX, docTest.id).expect(200)).body.data.items).toHaveLength(1);
    expect((await listOf(funcionalOtro, controlX, docTest.id).expect(200)).body.data.items).toEqual([]);
    expect((await listOf(auditor, controlX, docTest.id).expect(200)).body.data.items).toHaveLength(1);
  });

  it('una empresa ajena, admin_monkey, un identificador inválido, un test que el control no lleva o uno automático: 404 (o 403 para admin_monkey)', async () => {
    await listOf(b.agent, controlX, docTest.id).expect(404);
    await listOf(monkey, controlX, docTest.id).expect(403);
    await listOf(a.agent, 'no-es-un-uuid', docTest.id).expect(404);
    await listOf(a.agent, controlX, 'no-es-un-uuid').expect(404);
    await listOf(a.agent, controlX, '00000000-0000-4000-8000-000000000000').expect(404);
    const automatic = await owner<{ id: string }>(
      `select t.id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id join tenant.client_control_dimensions d on d.client_control_id = x.client_control_id and d.dimension = t.dimension
        where x.client_control_id = $1 and t.dimension <> 'policy' and d.type not in ('manual', 'technical_manual') limit 1`,
      [controlX],
    );
    if (automatic.length) await listOf(a.agent, controlX, automatic[0].id).expect(404);
  });
});

describe('MD-177 · un test manual que llevan varios controles (D85)', () => {
  it('reúne los requerimientos de todos los controles del servicio que lo llevan, cada uno con su control, y avisa dónde más aplica', async () => {
    const [origin, other] = sharedControls;
    const res = await listOf(a.agent, origin, sharedTest.id).expect(200);
    expect(res.body.data.test_id).toBe(sharedTest.id);
    const controls = res.body.data.items.map((i: any) => i.control.id);
    expect(controls).toContain(origin);
    expect(controls).toContain(other);
    expect(res.body.data.shared_with.map((c: any) => c.id)).toContain(other);
    expect(res.body.data.shared_with.map((c: any) => c.id)).not.toContain(origin);
    expect(res.body.data.shared_with.every((c: any) => /^[A-Z]+-\d+$/.test(c.code))).toBe(true);
    // Visto desde el otro control, el aviso apunta al primero.
    const back = await listOf(a.agent, other, sharedTest.id).expect(200);
    expect(back.body.data.shared_with.map((c: any) => c.id)).toContain(origin);
  });

  it('el funcional sin esa especialidad no ve ni los requerimientos ni los controles compartidos', async () => {
    const res = await listOf(funcionalOtro, sharedControls[0], sharedTest.id).expect(200);
    expect(res.body.data.items).toEqual([]);
    expect(res.body.data.shared_with).toEqual([]);
  });

  it('el funcional con la especialidad de esa dimensión lo ve en todos los controles que lo llevan, sin que nadie se lo asigne (D98)', async () => {
    const dimension = (await owner<{ dimension: 'server' | 'cloud' | 'database' | 'app' }>(`select dimension::text dimension from catalog.tests where id = $1`, [sharedTest.id]))[0].dimension;
    const funcionalId = (await owner<{ id: string }>(`select id from platform.users where email = $1`, [`funcional-evt-${RUN}@cumplimiento.test`]))[0].id;
    await darEspecialidades(a.companyId, funcionalId, dimension);
    const res = await listOf(funcionalDoc, sharedControls[0], sharedTest.id).expect(200);
    expect(res.body.data.items.map((i: any) => i.control.id)).toContain(sharedControls[0]);
    expect(res.body.data.shared_with.length).toBeGreaterThan(0);
  });});

describe('MD-177 · ver un archivo sin descargarlo (disposition=inline)', () => {
  let pdfSubmission: string;
  let pngSubmission: string;
  let docxSubmission: string;

  beforeAll(async () => {
    pdfSubmission = (await forTest(a.agent, controlY, docTest.id, 'inline-pdf').expect(201)).body.data.id;
    pngSubmission = (await forTest(a.agent, controlY, docTest.id, 'inline-png', png, 'captura.png').expect(201)).body.data.id;
    // Un DOCX mínimo con la estructura que se valida al subir: se inserta la entrega directamente para no depender de armar un .docx válido.
    const requirement = (await owner<{ id: string }>(`select id from tenant.evidence_requirements where client_control_id = $1 and test_id = $2`, [controlY, docTest.id]))[0].id;
    docxSubmission = (await owner<{ id: string }>(
      `insert into tenant.evidence_submissions (id, tenant_id, evidence_requirement_id, submitted_by, file_path, file_type, file_size, storage_location, integrity_hash, version)
       values (gen_random_uuid(), $1, $2, $3, $4, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 10, 's3', 'abc', '99') returning id`,
      [a.companyId, requirement, adminId, `${a.companyId}/evidence/x/informe.docx`],
    ))[0].id;
  });

  it('sin parámetro sigue siendo una descarga, con la disposición dicha en la respuesta', async () => {
    const res = await a.agent.get(`/v1/evidence-submissions/${pdfSubmission}/download`).expect(200);
    expect(res.body.data).toMatchObject({ file_type: 'application/pdf', disposition: 'attachment', expires_in: 300 });
    expect(storage.links.at(-1)).toMatchObject({ disposition: 'attachment', contentType: 'application/pdf', expiresInSeconds: 300 });
  });

  it('un PDF y un PNG se piden inline: el enlace queda firmado para mostrarse, con su tipo fijado y vence a los 5 minutos', async () => {
    const pdfRes = await a.agent.get(`/v1/evidence-submissions/${pdfSubmission}/download?disposition=inline`).expect(200);
    expect(pdfRes.body.data).toMatchObject({ file_type: 'application/pdf', disposition: 'inline', expires_in: 300 });
    expect(storage.links.at(-1)).toMatchObject({ disposition: 'inline', contentType: 'application/pdf', expiresInSeconds: 300 });
    const pngRes = await a.agent.get(`/v1/evidence-submissions/${pngSubmission}/download?disposition=inline`).expect(200);
    expect(pngRes.body.data).toMatchObject({ file_type: 'image/png', disposition: 'inline' });
    expect(storage.links.at(-1)).toMatchObject({ disposition: 'inline', contentType: 'image/png' });
  });

  it('un DOCX o XLSX no se muestra: 422 disposition.not_supported, y no se genera ningún enlace ni se registra', async () => {
    const before = storage.links.length;
    const audits = (await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'evidence.download'`, [a.companyId]))[0].n;
    const res = await a.agent.get(`/v1/evidence-submissions/${docxSubmission}/download?disposition=inline`).expect(422);
    expect(fields(res)).toEqual([{ field: 'disposition', code: 'disposition.not_supported' }]);
    expect(storage.links.length).toBe(before);
    expect((await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'evidence.download'`, [a.companyId]))[0].n).toBe(audits);
    // Como descarga sí se puede.
    await a.agent.get(`/v1/evidence-submissions/${docxSubmission}/download`).expect(200);
  });

  it('un valor que no es attachment ni inline es 422, y cada enlace inline queda en el rastro con su disposición y sin la URL firmada', async () => {
    await a.agent.get(`/v1/evidence-submissions/${pdfSubmission}/download?disposition=otra`).expect(422);
    const [row] = await owner<{ after_state: Record<string, unknown> }>(
      `select after_state from audit.audit_logs where tenant_id = $1 and action = 'evidence.download' and after_state->>'disposition' = 'inline' order by created_at desc limit 1`,
      [a.companyId],
    );
    expect(row.after_state).toMatchObject({ id: pngSubmission, disposition: 'inline', file_name: 'captura.png' });
    expect(JSON.stringify(row.after_state)).not.toContain('X-Signature');
  });

  it('los permisos son los de siempre: otra empresa 404, admin_monkey 403', async () => {
    await b.agent.get(`/v1/evidence-submissions/${pdfSubmission}/download?disposition=inline`).expect(404);
    await monkey.get(`/v1/evidence-submissions/${pdfSubmission}/download?disposition=inline`).expect(403);
    await auditor.get(`/v1/evidence-submissions/${pdfSubmission}/download?disposition=inline`).expect(200);
  });
});

describe('MD-177 · las pruebas de un control, con lo que comparten (D85, D88)', () => {
  const testsOf = (agent: Agent, controlId: string, query = '') => agent.get(`/v1/controls/${controlId}/tests${query}`);

  it('el administrador recibe todas las pruebas del control, con su estado, ordenadas por código y sin textos del comité', async () => {
    const res = await testsOf(a.agent, controlX, '?page_size=100').expect(200);
    expect(res.body.message).toBeTruthy();
    const items = res.body.data.items as Array<Record<string, any>>;
    const detail = (await a.agent.get(`/v1/controls/${controlX}?view=technical`).expect(200)).body.data;
    expect(res.body.data.total).toBe(detail.technical.tests.length);
    expect(items.map((i) => i.test_code)).toEqual([...items.map((i) => i.test_code)].sort((x, y) => x.localeCompare(y)));
    expect(items[0]).toEqual({
      test_id: expect.any(String), test_code: expect.any(String), display_name: expect.any(String), dimension: expect.any(String), type: expect.any(String),
      is_mandatory: expect.any(Boolean), is_active: expect.any(Boolean), shared_with: expect.any(Array), state: expect.any(String), last_verdict: null, ai_suggestion: null,
    });
    expect(items.find((i) => i.test_id === docTest.id)).toMatchObject({ dimension: 'policy', shared_with: [] }); // D88: una prueba documental es de su control
    expect(JSON.stringify(res.body)).not.toMatch(/wazuh|prowler/i);
  });

  it('una prueba manual que llevan varios controles avisa cuáles, y desde el otro control el aviso apunta de vuelta', async () => {
    const [origin, other] = sharedControls;
    const item = ((await testsOf(a.agent, origin, '?page_size=100').expect(200)).body.data.items as any[]).find((i) => i.test_id === sharedTest.id);
    expect(item.shared_with.map((c: any) => c.id)).toContain(other);
    expect(item.shared_with.map((c: any) => c.id)).not.toContain(origin);
    expect(item.shared_with.every((c: any) => /^[A-Z]+-\d+$/.test(c.code))).toBe(true);
    const back = ((await testsOf(a.agent, other, '?page_size=100').expect(200)).body.data.items as any[]).find((i) => i.test_id === sharedTest.id);
    expect(back.shared_with.map((c: any) => c.id)).toContain(origin);
  });

  it('pagina: page_size recorta y el total sigue siendo el de todas', async () => {
    const all = (await testsOf(a.agent, controlX, '?page_size=100').expect(200)).body.data;
    const first = (await testsOf(a.agent, controlX, '?page_size=1').expect(200)).body.data;
    expect(first.items).toHaveLength(1);
    expect([first.page, first.page_size, first.total]).toEqual([1, 1, all.total]);
    expect(first.items[0].test_code).toBe(all.items[0].test_code);
  });

  it('last_verdict trae el último veredicto del admin_empresa sobre una prueba manual', async () => {
    const [manual] = await owner<{ control: string; test: string }>(
      `select cc.id control, x.test_id test from tenant.client_controls cc
         join tenant.client_control_dimensions d on d.client_control_id = cc.id and d.dimension = 'cloud'::catalog.dimension and d.type = 'technical_manual'::catalog.control_dimension_type
         join tenant.client_control_tests x on x.client_control_id = cc.id join catalog.tests t on t.id = x.test_id and t.dimension = 'cloud'::catalog.dimension
        where cc.service_id = $1 and cc.is_active order by cc.own_code, t.code limit 1`,
      [a.serviceId],
    );
    expect(manual).toBeDefined();
    await a.agent.post(`/v1/controls/${manual.control}/tests/${manual.test}/verdicts`).send({ result: 'compliant', note: 'Revisado por la empresa.' }).expect(201);
    const item = ((await testsOf(auditor, manual.control, '?page_size=100').expect(200)).body.data.items as any[]).find((i) => i.test_id === manual.test);
    expect(item).toMatchObject({ state: 'compliant', last_verdict: { result: 'compliant', evaluated_at: expect.any(String), confirmed_by: { id: adminId } } });
  });

  it('es la vista técnica: el auditor la ve; el funcional y admin_monkey, 403; otra empresa, un id inválido o inexistente, 404', async () => {
    await testsOf(auditor, controlX).expect(200);
    await testsOf(funcionalDoc, controlX).expect(403);
    await testsOf(funcionalOtro, controlX).expect(403);
    await testsOf(monkey, controlX).expect(403);
    await testsOf(b.agent, controlX).expect(404);
    await testsOf(a.agent, 'no-es-un-uuid').expect(404);
    await testsOf(a.agent, '00000000-0000-4000-8000-000000000000').expect(404);
  });
});
