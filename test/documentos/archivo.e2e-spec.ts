import { randomBytes } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { FileStorage } from '../../src/common/storage/file-storage';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { Agent, bootApp, owner } from '../support/app';
import { APROBADORES, docx, documentosDe, hoy, pdf, png, publicar, xlsx } from '../support/documentos';
import { dosEmpresas, Tenant } from '../support/escenario';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// SEG-60, SEG-59, D152 · El archivo de una versión: se valida el CONTENIDO (PDF, DOCX, PNG o JPG, hasta 25 MB), el almacenamiento nunca queda con huérfanos y los datos de la aprobación se validan por campo.
let app: INestApplication;
let a: Tenant;
let admin: Agent;
let doc: string;
const storage = new StorageEnMemoria();
const realInsert = auditInsert.insertAuditLog;

const versiones = () => owner('select 1 from tenant.document_versions where company_document_id = $1', [doc]).then((r) => r.length);
const campos = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => `${field}:${code}`);

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  ({ a } = await dosEmpresas(app));
  admin = a.agent;
  doc = (await documentosDe(a.companyId, 'users_who_apply'))[0].id;
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('el archivo', () => {
  it('sin archivo es 422 FILE_REQUIRED; vacío, también', async () => {
    expect((await publicar(admin, doc, { file: null }).expect(422)).body.error.code).toBe('FILE_REQUIRED');
    expect((await publicar(admin, doc, { file: Buffer.alloc(0) }).expect(422)).body.error.code).toBe('FILE_REQUIRED');
    expect(await versiones()).toBe(0);
  });

  it('se valida el contenido, no la extensión: un PDF falso, un XLSX (no se admite aquí) o un tipo ajeno son 415', async () => {
    for (const [file, name] of [[Buffer.from('no soy un pdf'), 'politica.pdf'], [xlsx(), 'matriz.xlsx'], [pdf(), 'politica.exe'], [docx(), 'politica.pdf'], [Buffer.from('MZ'), 'x.png']] as const) {
      expect({ name, status: (await publicar(admin, doc, { file, name })).status }).toEqual({ name, status: 415 });
    }
    expect(await versiones()).toBe(0);
    expect(storage.objects.size).toBe(0);
  });

  it('PDF, DOCX, PNG y JPG se aceptan, cada uno con su tipo canónico y su huella', async () => {
    const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from('jpg')]);
    const tipos: string[] = [];
    for (const [file, name] of [[pdf('1'), 'a.pdf'], [docx(), 'b.docx'], [png('1'), 'c.png'], [jpg, 'd.jpg']] as const) tipos.push((await publicar(admin, doc, { file, name }).expect(201)).body.data.file_type);
    expect(tipos).toEqual(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']);
    expect(await versiones()).toBe(4);
  });

  it('el límite es 25 MB: más es 413 FILE_TOO_LARGE y no deja nada', async () => {
    const antes = await versiones();
    const grande = Buffer.concat([Buffer.from('%PDF-1.4\n'), randomBytes(25 * 1024 * 1024 + 10)]);
    expect((await publicar(admin, doc, { file: grande }).expect(413)).body.error.code).toBe('FILE_TOO_LARGE');
    expect(await versiones()).toBe(antes);
  });

  it('el nombre sale limpio (sin rutas ni acentos) y la llave lleva empresa, documento y versión', async () => {
    const res = (await publicar(admin, doc, { file: pdf('n'), name: '../../Política ñandú (final).pdf' }).expect(201)).body.data;
    expect(res.file_name).toMatch(/^[A-Za-z0-9._-]+\.pdf$/);
    expect(res.file_name).not.toContain('/');
    expect([...storage.objects.keys()].some((k) => k.startsWith(`${a.companyId}/documents/${doc}/${res.id}/`))).toBe(true);
  });
});

describe('el almacenamiento y el rastro', () => {
  it('sin almacenamiento: 503 STORAGE_UNAVAILABLE y no se crea la versión', async () => {
    const antes = await versiones();
    storage.available = false;
    try {
      expect((await publicar(admin, doc).expect(503)).body.error.code).toBe('STORAGE_UNAVAILABLE');
    } finally {
      storage.available = true;
    }
    expect(await versiones()).toBe(antes);
  });

  it('si el rastro falla, todo se revierte: ni versión (la anterior sigue vigente) ni archivo huérfano', async () => {
    const antes = await versiones();
    const objetos = storage.objects.size;
    const vigente = await owner<{ id: string }>(`select id from tenant.document_versions where company_document_id = $1 and status = 'current'`, [doc]);
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await publicar(admin, doc, { file: pdf('falla') }).expect(500);
    expect(await versiones()).toBe(antes);
    expect(storage.objects.size).toBe(objetos);
    expect(await owner<{ id: string }>(`select id from tenant.document_versions where company_document_id = $1 and status = 'current'`, [doc])).toEqual(vigente);
  });

  it('asignar y aceptar también son atómicos con su rastro', async () => {
    const version = (await owner<{ id: string }>(`select id from tenant.document_versions where company_document_id = $1 and status = 'current'`, [doc]))[0].id;
    const adminId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await admin.post(`/v1/documents/${doc}/assignments`).send({ user_ids: [adminId] }).expect(500);
    expect(await owner('select 1 from tenant.document_assignments where company_document_id = $1', [doc])).toHaveLength(0);
    await admin.post(`/v1/documents/${doc}/assignments`).send({ user_ids: [adminId] }).expect(200);
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await admin.post(`/v1/documents/${doc}/acceptance`).send({ version_id: version }).expect(500);
    expect(await owner('select 1 from tenant.document_acceptances where document_version_id = $1', [version])).toHaveLength(0);
    await admin.post(`/v1/documents/${doc}/acceptance`).send({ version_id: version }).expect(201);
  });

  it('sin almacenamiento, pedir el enlace es 503 y no deja rastro de descarga', async () => {
    const version = (await owner<{ id: string }>(`select id from tenant.document_versions where company_document_id = $1 and status = 'current'`, [doc]))[0].id;
    const antes = (await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'document_version.download'`, [a.companyId]))[0].n;
    storage.available = false;
    try {
      expect((await admin.get(`/v1/documents/${doc}/versions/${version}/file`).expect(503)).body.error.code).toBe('STORAGE_UNAVAILABLE');
    } finally {
      storage.available = true;
    }
    expect((await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = 'document_version.download'`, [a.companyId]))[0].n).toBe(antes);
  });
});

describe('los datos de la aprobación', () => {
  it('la fecha: AAAA-MM-DD real y no futura', async () => {
    expect(campos(await publicar(admin, doc, { approved_at: hoy(2) }).expect(422))).toEqual(['approved_at:approved_at.future']);
    for (const mala of ['2026-02-30', '25/11/2026', 'ayer', '2026-11-20T10:00:00Z']) expect({ mala, campos: campos(await publicar(admin, doc, { approved_at: mala }).expect(422)) }).toEqual({ mala, campos: [expect.stringMatching(/^approved_at:/)] });
    expect((await publicar(admin, doc, { approved_at: hoy() }).expect(201)).body.data.approved_at).toBe(hoy());
  });

  it('de 1 a 3 aprobadores, con nombre y cargo (máx. 100); el JSON mal formado es array.invalid', async () => {
    const a1 = { name: 'Ana', role_label: 'CEO' };
    expect(campos(await publicar(admin, doc, { approvers: [] }).expect(422))).toEqual(['approvers:array.min']);
    expect(campos(await publicar(admin, doc, { approvers: [a1, a1, a1, a1] }).expect(422))).toEqual(['approvers:array.max']);
    expect(campos(await publicar(admin, doc, { approvers: 'esto no es json' }).expect(422))).toContain('approvers:array.invalid');
    expect(campos(await publicar(admin, doc, { approvers: [{ role_label: 'CEO' }] }).expect(422))).toContain('approvers[0].name:string.invalid');
    expect(campos(await publicar(admin, doc, { approvers: [{ name: ' ', role_label: 'CEO' }] }).expect(422))).toEqual(['approvers[0].name:required']);
    expect(campos(await publicar(admin, doc, { approvers: [{ name: 'x'.repeat(101), role_label: 'CEO' }] }).expect(422))).toEqual(['approvers[0].name:string.max']);
    expect(campos(await publicar(admin, doc, { approvers: [{ name: 'Ana', role_label: 'CEO', cargo: 'otro' }] }).expect(422))).toEqual(['approvers[0].cargo:field.not_allowed']);
    expect((await publicar(admin, doc, { approvers: [a1, a1, a1] }).expect(201)).body.data.imported_approval.approvers).toHaveLength(3);
  });

  it('la nota: máx. 500; vacía es lo mismo que no mandarla; campos de más, 422', async () => {
    expect(campos(await publicar(admin, doc, { note: 'x'.repeat(501) }).expect(422))).toEqual(['note:string.max']);
    expect((await publicar(admin, doc, { note: '   ' }).expect(201)).body.data.imported_approval.note).toBeNull();
    expect(campos(await publicar(admin, doc, { extra: { status: 'draft' } }).expect(422))).toEqual(['status:field.not_allowed']);
    expect(APROBADORES).toHaveLength(1);
  });

  it('un documento que no existe o no es uuid es 404', async () => {
    await publicar(admin, '00000000-0000-4000-8000-000000000001').expect(404);
    await publicar(admin, 'no-es-uuid').expect(404);
  });
});
