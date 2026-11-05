import { createHash } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { FileStorage } from '../../src/common/storage/file-storage';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { asApp, failure, withRollback } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';
import { asignarServicio } from '../support/asignaciones';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-126 · Subir una evidencia con su huella y versión, y descargarla con un enlace firmado (contracts/modules/compliance-evidence.md, D84, SEG-60). La empresa solo aporta:
// sube `admin_empresa` y el `responsable` dueño del control; el auditor lee y descarga. Cada prueba sale por HTTP con la sesión real de cada rol, contra el Postgres
// desechable; el almacenamiento es uno en memoria (lo real contra un S3 está en test/almacenamiento).
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let auditor: Agent;
let responsable: Agent;
let responsableAjeno: Agent;
let monkey: Agent;
let controlId: string; // el control que el responsable tiene asignado
let requirementId: string; // un requerimiento de ese control
let otherRequirementId: string; // de un control que el responsable NO tiene asignado
let otherControlId: string;
const storage = new StorageEnMemoria();

const realInsert = auditInsert.insertAuditLog;
const auditFailsAfterInsert = () =>
  jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
    await realInsert(db, entry);
    throw new Error('audit_down');
  });

// Archivos de prueba con contenido real (la firma importa: SEG-60).
const pdf = (marca = 'a') => Buffer.from(`%PDF-1.7\n% evidencia ${marca} ${RUN}\n`);
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from(`png ${RUN}`)]);
const upload = (agent: Agent, id: string, buffer: Buffer | null, name = 'politica-accesos.pdf') =>
  buffer === null ? agent.post(`/v1/evidence-requirements/${id}/submissions`) : agent.post(`/v1/evidence-requirements/${id}/submissions`).attach('file', buffer, name);
const sha256 = (b: Buffer) => createHash('sha256').update(b).digest('hex');
const auditRows = (tenantId: string, action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [tenantId, action]).then((r) => r[0].n);
const submissionsInDb = (id: string) => owner<{ version: string }>('select version from tenant.evidence_submissions where evidence_requirement_id = $1 order by version::int', [id]).then((r) => r.map((x) => x.version));

async function cuenta(companyId: string, email: string, role: 'auditor' | 'responsable'): Promise<string> {
  return (await owner<{ id: string }>(
    `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, $2, 'Prueba', 'Roles', $3, $4::platform.user_role) returning id`,
    [companyId, email, await bcrypt.hash(PASSWORD, 4), role],
  ))[0].id;
}

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a, b, monkey } = await dosEmpresas(app));
  await cuenta(a.companyId, `auditor-evi-${RUN}@cumplimiento.test`, 'auditor');
  const responsableId = await cuenta(a.companyId, `responsable-evi-${RUN}@cumplimiento.test`, 'responsable');
  await cuenta(a.companyId, `responsable2-evi-${RUN}@cumplimiento.test`, 'responsable');
  auditor = await login(app, `auditor-evi-${RUN}@cumplimiento.test`);
  responsable = await login(app, `responsable-evi-${RUN}@cumplimiento.test`);
  responsableAjeno = await login(app, `responsable2-evi-${RUN}@cumplimiento.test`);

  // Dos controles del servicio de A con evidencia requerida: el primero se le asigna al responsable.
  const reqs = await owner<{ id: string; client_control_id: string }>(
    `select distinct on (er.client_control_id) er.id, er.client_control_id
       from tenant.evidence_requirements er join tenant.client_controls cc on cc.id = er.client_control_id
      where cc.service_id = $1 and cc.is_active order by er.client_control_id, er.sequence limit 2`,
    [a.serviceId],
  );
  expect(reqs.length).toBe(2);
  [{ id: requirementId, client_control_id: controlId }, { id: otherRequirementId, client_control_id: otherControlId }] = reqs;
  // D102 · El responsable es dueño de todos los controles del servicio; el otro no tiene ninguno.
  await asignarServicio(a.companyId, a.serviceId, responsableId);
});
afterAll(async () => {
  await app?.close();
});
beforeEach(() => {
  storage.available = true;
});

describe('MD-126 · listar la evidencia de un control', () => {
  it('el administrador ve los requerimientos del control, sin entregas todavía', async () => {
    const res = await a.agent.get(`/v1/controls/${controlId}/evidence`).expect(200);
    const item = res.body.data.items.find((i: any) => i.id === requirementId);
    expect(item).toMatchObject({ id: requirementId, origin: 'catalog', responsible: null, submissions: [] });
    for (const k of ['code', 'sequence', 'description', 'dimension', 'validity_within_period']) expect(item).toHaveProperty(k);
  });

  it('el responsable dueño del control ve la evidencia; otro sin asignación no ve la documental; uno de otra empresa, 404', async () => {
    await responsable.get(`/v1/controls/${controlId}/evidence`).expect(200);
    const ajeno = await responsableAjeno.get(`/v1/controls/${controlId}/evidence`);
    expect([200, 403]).toContain(ajeno.status);
    if (ajeno.status === 200) expect(ajeno.body.data.items.map((i: any) => i.id)).not.toContain(requirementId);
    await b.agent.get(`/v1/controls/${controlId}/evidence`).expect(404);
  });

  it('el auditor ve todo; admin_monkey no entra', async () => {
    await auditor.get(`/v1/controls/${otherControlId}/evidence`).expect(200);
    await monkey.get(`/v1/controls/${controlId}/evidence`).expect(403);
  });

  it('?view=technical lo piden el administrador y el auditor; el responsable recibe 403', async () => {
    await responsable.get(`/v1/controls/${controlId}/evidence?view=technical`).expect(403);
    await a.agent.get(`/v1/controls/${controlId}/evidence?view=technical`).expect(200);
    await auditor.get(`/v1/controls/${controlId}/evidence?view=technical`).expect(200);
  });
});

describe('MD-126 · subir una evidencia', () => {
  it('guarda el archivo con su huella SHA-256, nace sin revisión, y no filtra la llave del objeto', async () => {
    const file = pdf('v1');
    const res = await upload(a.agent, requirementId, file, 'Política de accesos.pdf').expect(201);
    const s = res.body.data;
    expect(s).toMatchObject({
      requirement_id: requirementId, version: 1, file_name: 'Politica_de_accesos.pdf', file_type: 'application/pdf', file_size: file.length,
      integrity_hash: sha256(file), evidence_state: 'pending', ai: null,
    });
    expect(s.submitted_by.id).toBeTruthy();
    expect(new Date(s.submitted_at).getTime()).not.toBeNaN();
    // La aprobación de la empresa ya no existe (D84).
    for (const k of ['validation_status', 'approved_by', 'approved_at', 'decision_note', 'file_path', 'key']) expect(s).not.toHaveProperty(k);
    expect(JSON.stringify(res.body)).not.toContain(a.companyId); // la llave del objeto (empresa/servicio/…) no sale

    // Quedó en el bucket bajo <empresa>/services/<servicio>/evidence/<requerimiento>/<uuid>/<nombre>, con el tipo canónico.
    const key = [...storage.objects.keys()].find((k) => k.startsWith(`${a.companyId}/services/${a.serviceId}/evidence/${requirementId}/`) && k.endsWith('/Politica_de_accesos.pdf'))!;
    expect(key).toBeDefined();
    expect(storage.objects.get(key)).toMatchObject({ contentType: 'application/pdf' });
    expect(storage.objects.get(key)!.body.equals(file)).toBe(true);
  });

  it('una versión nueva NO pisa la anterior: la 1 sigue en la base y en el bucket, y la lista trae la más reciente primero', async () => {
    const before = storage.objects.size;
    const res = await upload(a.agent, requirementId, pdf('v2'), 'politica-accesos.pdf').expect(201);
    expect(res.body.data.version).toBe(2);
    expect(storage.objects.size).toBe(before + 1);
    expect(await submissionsInDb(requirementId)).toEqual(['1', '2']);

    const list = (await a.agent.get(`/v1/controls/${controlId}/evidence`).expect(200)).body.data.items.find((i: any) => i.id === requirementId);
    expect(list.submissions.map((s: any) => s.version)).toEqual([2, 1]);
    const page = (await a.agent.get(`/v1/evidence-requirements/${requirementId}/submissions?page_size=1`).expect(200)).body.data;
    expect(page).toMatchObject({ page: 1, page_size: 1, total: 2, total_pages: 2 });
    expect(page.items[0]).toMatchObject({ version: 2, requirement_id: requirementId });
  });

  it('tres subidas a la vez reciben tres versiones distintas, sin repetir', async () => {
    const results = await Promise.all([1, 2, 3].map((n) => upload(a.agent, requirementId, pdf(`c${n}`), `c${n}.pdf`)));
    for (const r of results) expect(r.status).toBe(201);
    expect(results.map((r) => r.body.data.version).sort()).toEqual([3, 4, 5]);
    expect(await submissionsInDb(requirementId)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('acepta PNG, y rechaza lo que no es: contenido que no coincide (415), vacío (422), sin archivo (422)', async () => {
    const ok = await upload(a.agent, otherRequirementId, png, 'captura.png').expect(201);
    expect(ok.body.data).toMatchObject({ file_type: 'image/png', version: 1 });
    const antes = storage.objects.size;
    const falso = await upload(a.agent, otherRequirementId, Buffer.from('MZ programa'), 'factura.pdf').expect(415);
    expect(falso.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
    await upload(a.agent, otherRequirementId, pdf(), 'macro.exe').expect(415);
    expect((await upload(a.agent, otherRequirementId, Buffer.alloc(0), 'vacio.pdf').expect(422)).body.error.code).toBe('FILE_REQUIRED');
    expect((await upload(a.agent, otherRequirementId, null).expect(422)).body.error.code).toBe('FILE_REQUIRED');
    expect(storage.objects.size).toBe(antes); // nada de lo rechazado llegó al bucket
    expect(await submissionsInDb(otherRequirementId)).toEqual(['1']);
  });

  it('un archivo de más de 25 MB se rechaza con 413 sin guardar nada', async () => {
    const antes = storage.objects.size;
    const grande = Buffer.concat([Buffer.from('%PDF-'), Buffer.alloc(25 * 1024 * 1024 + 10)]);
    const res = await upload(a.agent, otherRequirementId, grande, 'grande.pdf');
    expect(res.status).toBe(413);
    expect(storage.objects.size).toBe(antes);
  });

  it('sube el responsable dueño; otro sin asignación, el auditor y admin_monkey, 403; otra empresa, 404; ID inválido, 404', async () => {
    await upload(responsable, requirementId, pdf('func'), 'del-responsable.pdf').expect(201);
    await upload(responsable, otherRequirementId, pdf('func2'), 'del-responsable-2.pdf').expect(201); // es dueño de todos los controles
    await upload(responsableAjeno, requirementId, pdf(), 'x.pdf').expect(403);
    await upload(auditor, requirementId, pdf(), 'x.pdf').expect(403);
    await upload(monkey, requirementId, pdf(), 'x.pdf').expect(403);
    await upload(b.agent, requirementId, pdf(), 'x.pdf').expect(404);
    await upload(a.agent, 'no-es-un-uuid', pdf(), 'x.pdf').expect(404);
  });

  it('un control dado de baja no recibe evidencia nueva (409 CONTROL_RETIRED)', async () => {
    await owner(`update tenant.client_controls set is_active = false where id = $1`, [otherControlId]);
    try {
      expect((await upload(a.agent, otherRequirementId, pdf('baja'), 'baja.pdf').expect(409)).body.error.code).toBe('CONTROL_RETIRED');
    } finally {
      await owner(`update tenant.client_controls set is_active = true where id = $1`, [otherControlId]);
    }
  });

  it('sin almacenamiento responde 503 y no deja ninguna fila', async () => {
    const antes = await submissionsInDb(otherRequirementId);
    storage.available = false;
    const res = await upload(a.agent, otherRequirementId, pdf('sin-bucket'), 'sin.pdf').expect(503);
    expect(res.body.error.code).toBe('STORAGE_UNAVAILABLE');
    expect(await submissionsInDb(otherRequirementId)).toEqual(antes);
  });

  it('deja el rastro con la huella y el nombre (nunca el contenido); si el rastro falla, la entrega se revierte y el archivo se borra del bucket', async () => {
    const file = pdf('rastro');
    const audited = await auditRows(a.companyId, 'evidence.submit');
    const objectsBefore = storage.objects.size;
    const versionsBefore = await submissionsInDb(requirementId);
    const created = await upload(a.agent, requirementId, file, 'con-rastro.pdf').expect(201);
    expect(await auditRows(a.companyId, 'evidence.submit')).toBe(audited + 1);
    const row = (await owner<{ after_state: Record<string, unknown> }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'evidence.submit' order by created_at desc limit 1`, [a.companyId]))[0];
    expect(row.after_state).toMatchObject({ id: created.body.data.id, version: created.body.data.version, integrity_hash: sha256(file), file_name: 'con-rastro.pdf' });
    expect(JSON.stringify(row.after_state)).not.toContain('PDF-1.7');

    // Si el rastro falla (SEG-36), la entrega se revierte y el archivo ya subido no queda huérfano.
    auditFailsAfterInsert();
    const objectsMid = storage.objects.size;
    await upload(a.agent, requirementId, pdf('falla'), 'falla.pdf').expect(500);
    expect(storage.objects.size).toBe(objectsMid);
    expect(await submissionsInDb(requirementId)).toEqual([...versionsBefore, String(Number(versionsBefore.at(-1)) + 1)]);
    expect(objectsBefore).toBeLessThan(storage.objects.size);
  });

  it('en la técnica trae la revisión de quien pregunta, vacía mientras nadie la haya hecho (la revisión está en revision-evidencia.e2e-spec.ts)', async () => {
    const res = await a.agent.get(`/v1/evidence-requirements/${requirementId}/submissions?view=technical`).expect(200);
    expect(res.body.data.items[0].technical).toEqual({
      review: 'pending_review',
      attributes: { type_ok: null, period_ok: null, valid_ok: null, approved_ok: null, signed_ok: null, content_ok: null },
      note: null,
      reviewed_by: null,
      reviewed_at: null,
    });
    await responsable.get(`/v1/evidence-requirements/${requirementId}/submissions?view=technical`).expect(403);
  });
});

describe('MD-126 · descargar con un enlace firmado de 5 minutos', () => {
  let submissionId: string;
  beforeAll(async () => {
    submissionId = (await upload(a.agent, requirementId, pdf('descarga'), 'Contrato firmado.pdf').expect(201)).body.data.id;
  });

  it('devuelve un enlace temporal con el nombre limpio y lo deja en el rastro sin la URL firmada', async () => {
    const before = await auditRows(a.companyId, 'evidence.download');
    const res = await a.agent.get(`/v1/evidence-submissions/${submissionId}/download`).expect(200);
    expect(res.body.data).toMatchObject({ file_name: 'Contrato_firmado.pdf', file_type: 'application/pdf', expires_in: 300 });
    expect(res.body.data.url).toContain('X-Signature');
    expect(storage.links.at(-1)).toMatchObject({ fileName: 'Contrato_firmado.pdf', expiresInSeconds: 300 });
    expect(await auditRows(a.companyId, 'evidence.download')).toBe(before + 1);
    const row = (await owner<{ after_state: Record<string, unknown> }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'evidence.download' order by created_at desc limit 1`, [a.companyId]))[0];
    expect(row.after_state).toMatchObject({ id: submissionId, file_name: 'Contrato_firmado.pdf' });
    expect(JSON.stringify(row.after_state)).not.toContain('X-Signature');
  });

  it('descargan el responsable dueño y el auditor; el que no es dueño, 403; otra empresa y admin_monkey, 404/403', async () => {
    await responsable.get(`/v1/evidence-submissions/${submissionId}/download`).expect(200);
    await auditor.get(`/v1/evidence-submissions/${submissionId}/download`).expect(200);
    await responsableAjeno.get(`/v1/evidence-submissions/${submissionId}/download`).expect(403);
    await b.agent.get(`/v1/evidence-submissions/${submissionId}/download`).expect(404);
    await monkey.get(`/v1/evidence-submissions/${submissionId}/download`).expect(403);
    await a.agent.get(`/v1/evidence-submissions/no-es-un-uuid/download`).expect(404);
  });

  it('sin almacenamiento responde 503 y no registra una descarga que no ocurrió', async () => {
    const before = await auditRows(a.companyId, 'evidence.download');
    storage.available = false;
    await a.agent.get(`/v1/evidence-submissions/${submissionId}/download`).expect(503);
    expect(await auditRows(a.companyId, 'evidence.download')).toBe(before);
  });

  it('las entregas de A no se ven desde B: ni en la lista ni por requerimiento', async () => {
    await b.agent.get(`/v1/evidence-requirements/${requirementId}/submissions`).expect(404);
  });
});

describe('MD-126 · una entrega es histórico (D84, RN-04)', () => {
  it('la base impide a la app modificar o borrar una entrega', async () => {
    const [row] = await owner<{ id: string }>(`select id from tenant.evidence_submissions where tenant_id = $1 limit 1`, [a.companyId]);
    await withRollback(async (db) => {
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => {
        expect(await failure(db, `update tenant.evidence_submissions set file_size = 1 where id = $1`, [row.id])).toMatch(/permission denied/);
        expect(await failure(db, `delete from tenant.evidence_submissions where id = $1`, [row.id])).toMatch(/permission denied/);
        // Sí puede leer.
        expect((await db.query(`select count(*)::int n from tenant.evidence_submissions`)).rows[0].n).toBeGreaterThan(0);
      });
    });
  });

  it('la base impide repetir una versión del mismo requerimiento', async () => {
    const [row] = await owner<{ evidence_requirement_id: string; version: string; submitted_by: string; tenant_id: string }>(
      `select evidence_requirement_id, version, submitted_by, tenant_id from tenant.evidence_submissions where tenant_id = $1 limit 1`, [a.companyId]);
    await withRollback(async (db) => {
      expect(
        await failure(
          db,
          `insert into tenant.evidence_submissions (id, tenant_id, evidence_requirement_id, submitted_by, file_path, file_type, file_size, storage_location, integrity_hash, version)
           values (gen_random_uuid(), $1, $2, $3, 'k', 'application/pdf', 1, 's3', 'h', $4)`,
          [row.tenant_id, row.evidence_requirement_id, row.submitted_by, row.version],
        ),
      ).toMatch(/duplicate key|unique/);
    });
  });
});
