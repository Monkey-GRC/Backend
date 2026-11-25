import type { INestApplication } from '@nestjs/common';
import { FileStorage } from '../../src/common/storage/file-storage';
import { Agent, bootApp, owner } from '../support/app';
import { auditoria, docx, documentosDe, pdf, publicar, sha256 } from '../support/documentos';
import { dosEmpresas, servicePayload, Tenant } from '../support/escenario';
import { personaDe, Roles, unaPersonaPorRol } from '../support/roles';
import { StorageEnMemoria } from '../support/storage-en-memoria';

// MD-503 (D152, contracts/documentos.md) · El recorrido del corte mínimo de Documentos por la API real: los documentos nacen al clonar el marco, el administrador publica la versión
// (aprobación importada), la asigna, la persona la ve en «Mis documentos», la lee y la acepta; una versión nueva pide aceptar otra vez; todo deja su rastro.
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let r: Roles;
let colab2: { id: string; agent: Agent };
const storage = new StorageEnMemoria();
let doc: { id: string; code: string; acceptance: string };
let sinAceptacion: { id: string; code: string };

const mine = async (agent: Agent, q = '') => (await agent.get(`/v1/me/documents${q}`).expect(200)).body.data;
const detalle = async (id: string) => (await r.admin_empresa.get(`/v1/documents/${id}`).expect(200)).body.data;
const asignar = (id: string, ...ids: string[]) => r.admin_empresa.post(`/v1/documents/${id}/assignments`).send({ user_ids: ids });
const aceptar = (agent: Agent, id: string, versionId: string) => agent.post(`/v1/documents/${id}/acceptance`).send({ version_id: versionId });

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(storage));
  const escenario = await dosEmpresas(app);
  ({ a, b } = escenario);
  r = await unaPersonaPorRol(app, a, escenario.monkey);
  colab2 = await personaDe(app, a, 'colaborador', 'colab2');
  doc = (await documentosDe(a.companyId, 'users_who_apply'))[0] ?? (await documentosDe(a.companyId, 'all_users'))[0];
  sinAceptacion = (await documentosDe(a.companyId, 'not_required'))[0];
});
afterAll(async () => {
  await app?.close();
});

describe('Los documentos de la empresa nacen al clonar el marco', () => {
  it('uno por documento del catálogo vinculado a los controles de sus servicios, sin versión y con la aceptación sugerida', async () => {
    const lista = await owner<{ n: number; distintos: number }>(
      `select count(*)::int n, count(distinct document_id)::int distintos from tenant.company_documents where tenant_id = $1`,
      [a.companyId],
    );
    expect(lista[0].n).toBeGreaterThan(0);
    expect(lista[0].n).toBe(lista[0].distintos);
    const esperados = await owner<{ n: number }>(
      `select count(distinct cd.document_id)::int n from tenant.client_controls cc join catalog.control_documents cd on cd.control_id = cc.control_id where cc.tenant_id = $1 and cc.is_active`,
      [a.companyId],
    );
    expect(lista[0].n).toBe(esperados[0].n);
    const sugerida = await owner<{ n: number }>(
      `select count(*)::int n from tenant.company_documents x join catalog.documents d on d.id = x.document_id where x.tenant_id = $1 and (x.acceptance <> d.suggested_acceptance or x.origin <> d.origin)`,
      [a.companyId],
    );
    expect(sugerida[0].n).toBe(0);
    expect(await owner('select 1 from tenant.document_versions where tenant_id = $1', [a.companyId])).toHaveLength(0);
  });

  it('crear otro servicio no los repite (el único es por empresa y documento)', async () => {
    const antes = (await documentosDe(a.companyId)).length;
    await a.agent.post('/v1/services').send(servicePayload(`Servicio doc ${Date.now()}`)).expect(201);
    expect((await documentosDe(a.companyId)).length).toBe(antes);
  });

  it('el administrador los lista paginados por código; sin versión vigente y sin asignados', async () => {
    const res = (await r.admin_empresa.get('/v1/documents?page_size=100').expect(200)).body;
    expect(res.message).toBe('Documentos de tu empresa.');
    const items = res.data.items as any[];
    expect(res.data).toMatchObject({ page: 1, page_size: 100, total: items.length });
    expect(items.map((i) => i.code)).toEqual([...items.map((i) => i.code)].sort());
    expect(items[0]).toEqual({
      id: expect.any(String), code: expect.stringMatching(/^[A-Z]{3}-\d{3}$/), name: expect.any(String), type: expect.any(String), origin: expect.any(String), acceptance: expect.any(String),
      current_version: null, assignments: { total: 0, accepted: 0, pending: 0, overdue: 0 },
    });
  });

  it('filtra por tipo, por versión vigente y por código o nombre sin mayúsculas ni acentos; pagina', async () => {
    const todos = (await r.admin_empresa.get('/v1/documents?page_size=100').expect(200)).body.data.items as any[];
    const politicas = (await r.admin_empresa.get('/v1/documents?page_size=100&type=policy').expect(200)).body.data.items as any[];
    expect(politicas.length).toBeGreaterThan(0);
    expect(politicas.every((i) => i.type === 'policy')).toBe(true);
    expect((await r.admin_empresa.get('/v1/documents?has_current_version=true').expect(200)).body.data.total).toBe(0);
    expect((await r.admin_empresa.get('/v1/documents?has_current_version=false&page_size=100').expect(200)).body.data.total).toBe(todos.length);
    const porCodigo = (await r.admin_empresa.get(`/v1/documents?q=${todos[0].code.toLowerCase()}`).expect(200)).body.data.items as any[];
    expect(porCodigo.map((i) => i.code)).toContain(todos[0].code);
    const conAcento = todos.find((i) => /[áéíóúñ]/i.test(i.name));
    if (conAcento) {
      const plano = conAcento.name.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
      expect(((await r.admin_empresa.get(`/v1/documents?q=${encodeURIComponent(plano)}&page_size=100`).expect(200)).body.data.items as any[]).map((i) => i.id)).toContain(conAcento.id);
    }
    expect(((await r.admin_empresa.get('/v1/documents?page_size=2&page=2').expect(200)).body.data.items as any[]).map((i) => i.code)).toEqual(todos.slice(2, 4).map((i) => i.code));
    expect(((await r.admin_empresa.get('/v1/documents?sort=-updated_at&page_size=100').expect(200)).body.data.items as any[]).length).toBe(todos.length);
    expect((await r.admin_empresa.get('/v1/documents?type=nada').expect(422)).body.error.fields).toEqual([expect.objectContaining({ field: 'type', code: 'enum.invalid' })]);
  });
});

describe('Publicar la versión vigente (aprobación importada)', () => {
  it('asignar antes de publicar es 409 DOCUMENT_NOT_PUBLISHED y no asigna nada', async () => {
    const res = await asignar(doc.id, r.colaborador.id).expect(409);
    expect(res.body.error.code).toBe('DOCUMENT_NOT_PUBLISHED');
    expect(await owner('select 1 from tenant.document_assignments where company_document_id = $1', [doc.id])).toHaveLength(0);
  });

  it('la versión 1 queda vigente con su huella, su aprobación, el archivo en el almacenamiento y el rastro sin la llave', async () => {
    const archivo = pdf('v1');
    const res = await publicar(r.admin_empresa, doc.id, { file: archivo, name: 'Política de Seguridad v1.pdf', approved_at: '2026-11-10', approvers: [{ name: 'María Pérez', role_label: 'Gerente general' }, { name: 'Luis Gómez', role_label: 'CISO' }], note: 'Acta 14' }).expect(201);
    expect(res.body.message).toBe('Listo, publicamos la versión del documento.');
    expect(res.body.data).toEqual({
      id: expect.any(String), number: 1, status: 'current', approved_at: '2026-11-10', is_imported_approval: true,
      imported_approval: { approvers: [{ name: 'María Pérez', role_label: 'Gerente general' }, { name: 'Luis Gómez', role_label: 'CISO' }], approved_at: '2026-11-10', note: 'Acta 14' },
      file_name: 'Politica_de_Seguridad_v1.pdf', file_type: 'application/pdf', file_size: archivo.length, integrity_hash: sha256(archivo),
      created_by: { id: expect.any(String), name: null, last_name: null }, created_at: expect.any(String),
    });
    expect([...storage.objects.keys()].filter((k) => k.startsWith(`${a.companyId}/documents/${doc.id}/`))).toHaveLength(1);
    const [rastro] = await auditoria(a.companyId, 'document_version.import');
    expect(rastro.after_state).toMatchObject({ document_id: doc.id, number: 1, integrity_hash: sha256(archivo), archived_version_id: null, approvers: expect.any(Array) });
    expect(JSON.stringify(rastro)).not.toContain('/documents/');
  });

  it('la versión 2 archiva la 1 (nunca se borra) y queda la única vigente; el número crece de uno en uno', async () => {
    const v2 = (await publicar(r.admin_empresa, doc.id, { file: docx(), name: 'politica.docx', note: 'Cambió el alcance' }).expect(201)).body.data;
    expect(v2).toMatchObject({ number: 2, status: 'current', file_type: expect.stringContaining('wordprocessingml') });
    const versiones = await owner<{ number: number; status: string }>('select number, status::text from tenant.document_versions where company_document_id = $1 order by number', [doc.id]);
    expect(versiones).toEqual([{ number: 1, status: 'archived' }, { number: 2, status: 'current' }]);
    const d = await detalle(doc.id);
    expect(d.versions.map((v: any) => [v.number, v.status])).toEqual([[2, 'current'], [1, 'archived']]);
    expect(d.current_version).toMatchObject({ id: v2.id, number: 2 });
    expect((await auditoria(a.companyId, 'document_version.import')).at(-1)?.after_state.archived_version_id).toBe(d.versions[1].id);
  });

  it('el detalle trae la descripción y el contenido mínimo del catálogo; la lista, la vigente', async () => {
    const d = await detalle(doc.id);
    expect(d).toMatchObject({ id: doc.id, code: doc.code, description: expect.anything(), assignees: [] });
    expect(d).toHaveProperty('minimum_content');
    const item = ((await r.admin_empresa.get('/v1/documents?page_size=100&has_current_version=true').expect(200)).body.data.items as any[]).find((i) => i.id === doc.id);
    expect(item.current_version).toMatchObject({ number: 2, is_imported_approval: true, file_type: expect.stringContaining('wordprocessingml') });
  });
});

describe('Asignar y «Mis documentos»', () => {
  it('asigna a las cuatro roles que aceptan: added cuenta las nuevas, repetir no cambia nada, y el plazo es asignación + PR-14', async () => {
    const res = await asignar(doc.id, r.colaborador.id, r.responsable.id, r.delegado.id, (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id).expect(200);
    expect(res.body).toMatchObject({ message: 'Listo, asignamos el documento.', data: { added: 4 } });
    expect((await asignar(doc.id, r.colaborador.id, colab2.id).expect(200)).body.data).toEqual({ added: 1 });
    expect((await asignar(doc.id, r.colaborador.id).expect(200)).body.data).toEqual({ added: 0 });
    const dias = await owner<{ dias: number }>(`select distinct extract(epoch from (due_at - assigned_at)) / 86400 as dias from tenant.document_assignments where company_document_id = $1`, [doc.id]);
    expect(dias.map((x) => Number(x.dias))).toEqual([30]);
    expect((await auditoria(a.companyId, 'document_assignment.add')).filter((x) => x.result === 'success')).toHaveLength(5);
  });

  it('todo o nada: un auditor, una cuenta inactiva o un admin_monkey en la lista rechazan la petición entera con error.user_ids; una persona de otra empresa es 404', async () => {
    const nueva = await personaDe(app, a, 'colaborador', 'colab-todo-o-nada');
    const antes = await owner('select 1 from tenant.document_assignments where company_document_id = $1', [doc.id]);
    const res = await asignar(doc.id, nueva.id, r.auditor.id).expect(409);
    expect(res.body.error).toMatchObject({ code: 'ASSIGNEE_NOT_ELIGIBLE', user_ids: [r.auditor.id] });
    await owner(`update platform.users set status = 'inactive' where id = $1`, [colab2.id]);
    expect((await asignar(doc.id, nueva.id, colab2.id).expect(409)).body.error.user_ids).toEqual([colab2.id]);
    await owner(`update platform.users set status = 'active' where id = $1`, [colab2.id]);
    const deB = (await owner<{ id: string }>('select id from platform.users where company_id = $1 limit 1', [b.companyId]))[0].id;
    expect((await asignar(doc.id, nueva.id, deB).expect(404)).body.error.code).toBe('NOT_FOUND');
    expect(await owner('select 1 from tenant.document_assignments where company_document_id = $1', [doc.id])).toHaveLength(antes.length);
  });

  it('validaciones: 1 a 200 ids, uuid y sin repetir', async () => {
    const campos = async (body: object) => ((await r.admin_empresa.post(`/v1/documents/${doc.id}/assignments`).send(body).expect(422)).body.error.fields as any[]).map((f) => `${f.field}:${f.code}`);
    expect(await campos({ user_ids: [] })).toEqual(['user_ids:array.min']);
    expect(await campos({ user_ids: [r.colaborador.id, r.colaborador.id] })).toEqual(['user_ids:array.unique']);
    expect(await campos({ user_ids: ['x'] })).toEqual(['user_ids:uuid.invalid']);
    expect(await campos({ user_ids: Array.from({ length: 201 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`) })).toEqual(['user_ids:array.max']);
  });

  it('«Mis documentos»: el colaborador ve lo suyo con la versión vigente, por aceptar y dentro del plazo; quien no tiene nada, lista vacía', async () => {
    const m = await mine(r.colaborador.agent);
    expect(m.items).toHaveLength(1);
    expect(m.items[0]).toEqual({
      document: { id: doc.id, code: doc.code, name: expect.any(String), type: expect.any(String) },
      version: { id: expect.any(String), number: 2, approved_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
      requires_acceptance: true, status: 'pending', assigned_at: expect.any(String), due_at: expect.any(String), accepted_at: null,
    });
    expect((await mine(r.colaborador.agent, '?status=accepted')).items).toEqual([]);
    expect((await mine(r.responsable.agent)).total).toBe(1);
    const sinNada = await personaDe(app, a, 'colaborador', 'sin-nada');
    expect(await mine(sinNada.agent)).toMatchObject({ items: [], total: 0 });
    expect((await r.colaborador.agent.get('/v1/me/documents?status=nada').expect(422)).body.error.fields[0]).toMatchObject({ field: 'status', code: 'enum.invalid' });
  });
});

describe('Ver el archivo', () => {
  it('quien lo tiene asignado ve la vigente con un enlace firmado de 5 minutos; DOCX solo se descarga; la versión archivada que no aceptó es 403', async () => {
    const d = await detalle(doc.id);
    const [v2, v1] = d.versions;
    const link = (await r.colaborador.agent.get(`/v1/documents/${doc.id}/versions/${v2.id}/file`).expect(200)).body.data;
    expect(link).toMatchObject({ file_name: v2.file_name, file_type: v2.file_type, disposition: 'attachment', expires_in: 300 });
    expect(link.url).toContain(`${a.companyId}/documents/${doc.id}/${v2.id}/`);
    expect(storage.links.at(-1)).toMatchObject({ expiresInSeconds: 300, disposition: 'attachment', contentType: v2.file_type });
    const inline = await r.colaborador.agent.get(`/v1/documents/${doc.id}/versions/${v2.id}/file?disposition=inline`).expect(422);
    expect(inline.body.error.fields).toEqual([expect.objectContaining({ field: 'disposition', code: 'disposition.not_inline' })]);
    await r.colaborador.agent.get(`/v1/documents/${doc.id}/versions/${v1.id}/file`).expect(403);
    // El administrador y el auditor ven cualquier versión; el PDF también en pantalla.
    for (const agent of [r.admin_empresa, r.auditor.agent]) {
      await agent.get(`/v1/documents/${doc.id}/versions/${v1.id}/file`).expect(200);
      expect((await agent.get(`/v1/documents/${doc.id}/versions/${v1.id}/file?disposition=inline`).expect(200)).body.data.disposition).toBe('inline');
    }
    const rastros = await auditoria(a.companyId, 'document_version.download');
    expect(rastros.length).toBeGreaterThan(2);
    // Los `200` dejan `success`; el `403` de la versión archivada deja `error` con su código, y el 422 (DOCX en pantalla) no deja nada: no se entregó ni se negó un acceso.
    expect(rastros.filter((x) => x.result === 'success')).toHaveLength(5);
    expect(rastros.filter((x) => x.result === 'error')).toEqual([expect.objectContaining({ after_state: expect.objectContaining({ id: v1.id, document_id: doc.id, error_code: 'FORBIDDEN' }) })]);
    expect(JSON.stringify(await auditoria(a.companyId, 'document_version.download'))).not.toContain('storage.prueba');
  });

  it('quien no lo tiene asignado, 403 (aunque sea de la empresa); una versión que no es de ese documento, 404', async () => {
    const d = await detalle(doc.id);
    const sinAsignar = await personaDe(app, a, 'colaborador', 'sin-asignar');
    await sinAsignar.agent.get(`/v1/documents/${doc.id}/versions/${d.versions[0].id}/file`).expect(403);
    await r.admin_empresa.get(`/v1/documents/${doc.id}/versions/00000000-0000-4000-8000-000000000001/file`).expect(404);
    await r.admin_empresa.get(`/v1/documents/${sinAceptacion.id}/versions/${d.versions[0].id}/file`).expect(404);
  });
});

describe('Aceptar', () => {
  it('la versión que ya no es la vigente es 409 DOCUMENT_VERSION_NOT_CURRENT; la vigente se acepta con su huella', async () => {
    const d = await detalle(doc.id);
    const [v2, v1] = d.versions;
    expect((await aceptar(r.colaborador.agent, doc.id, v1.id).expect(409)).body.error.code).toBe('DOCUMENT_VERSION_NOT_CURRENT');
    const res = await aceptar(r.colaborador.agent, doc.id, v2.id).expect(201);
    expect(res.body.message).toBe('Listo, registramos tu aceptación.');
    expect(res.body.data).toEqual({ id: expect.any(String), document_id: doc.id, version: { id: v2.id, number: 2 }, accepted_at: expect.any(String), integrity_hash: v2.integrity_hash });
    expect((await aceptar(r.colaborador.agent, doc.id, v2.id).expect(409)).body.error.code).toBe('DOCUMENT_ALREADY_ACCEPTED');
    expect(await owner('select 1 from tenant.document_acceptances where user_id = $1', [r.colaborador.id])).toHaveLength(1);
  });

  it('«Mis documentos» lo marca aceptado y el detalle cuenta: 6 asignados, 1 aceptó, 5 por aceptar', async () => {
    const m = await mine(r.colaborador.agent);
    expect(m.items[0]).toMatchObject({ status: 'accepted', accepted_at: expect.any(String) });
    expect((await mine(r.colaborador.agent, '?status=pending')).items).toEqual([]);
    const d = await detalle(doc.id);
    expect(d.assignments).toEqual({ total: 5, accepted: 1, pending: 4, overdue: 0 });
    const yo = d.assignees.find((x: any) => x.user.id === r.colaborador.id);
    expect(yo).toMatchObject({ status: 'accepted', accepted_version_number: 2, accepted_at: expect.any(String), user: { role: 'colaborador', name: 'Persona' } });
    const item = ((await r.admin_empresa.get('/v1/documents?page_size=100').expect(200)).body.data.items as any[]).find((i) => i.id === doc.id);
    expect(item.assignments).toEqual({ total: 5, accepted: 1, pending: 4, overdue: 0 });
  });

  it('quien no lo tiene asignado, 403; el auditor y el admin_monkey, 403; un documento o una versión que no existen, 404; el cuerpo exige version_id', async () => {
    const d = await detalle(doc.id);
    const sinAsignar = await personaDe(app, a, 'colaborador', 'sin-asignar-2');
    expect((await aceptar(sinAsignar.agent, doc.id, d.versions[0].id)).status).toBe(403);
    for (const agent of [r.auditor.agent, r.admin_monkey]) expect((await aceptar(agent, doc.id, d.versions[0].id)).status).toBe(403);
    expect((await aceptar(r.colaborador.agent, '00000000-0000-4000-8000-000000000001', d.versions[0].id)).status).toBe(404);
    expect((await aceptar(r.colaborador.agent, doc.id, '00000000-0000-4000-8000-000000000001')).status).toBe(404);
    expect((await r.colaborador.agent.post(`/v1/documents/${doc.id}/acceptance`).send({}).expect(422)).body.error.fields[0]).toMatchObject({ field: 'version_id' });
  });

  it('una versión nueva pide aceptar otra vez (D152): quien aceptó la 2 vuelve a «por aceptar» y el detalle recuerda la 2', async () => {
    const v3 = (await publicar(r.admin_empresa, doc.id, { file: pdf('v3'), name: 'politica-v3.pdf' }).expect(201)).body.data;
    expect(v3.number).toBe(3);
    expect((await mine(r.colaborador.agent)).items[0]).toMatchObject({ status: 'pending', accepted_at: null, version: { id: v3.id, number: 3 } });
    const yo = (await detalle(doc.id)).assignees.find((x: any) => x.user.id === r.colaborador.id);
    expect(yo).toMatchObject({ status: 'pending', accepted_version_number: 2 });
    // Aceptó la 2: la ve aunque ya no sea la vigente.
    const [, v2] = (await detalle(doc.id)).versions;
    await r.colaborador.agent.get(`/v1/documents/${doc.id}/versions/${v2.id}/file`).expect(200);
  });

  it('fuera de plazo: se ve «vencido» (orden primero), cuenta como vencida y se acepta igual dejando was_overdue', async () => {
    await owner(`update tenant.document_assignments set assigned_at = now() - interval '31 days', due_at = now() - interval '1 day' where company_document_id = $1 and user_id = $2`, [doc.id, r.colaborador.id]);
    expect((await mine(r.colaborador.agent)).items[0].status).toBe('overdue');
    expect((await mine(r.colaborador.agent, '?status=overdue')).total).toBe(1);
    expect((await detalle(doc.id)).assignments.overdue).toBe(1);
    const v3 = (await detalle(doc.id)).current_version;
    await aceptar(r.colaborador.agent, doc.id, v3.id).expect(201);
    const [fila] = await owner<{ was_overdue: boolean }>('select was_overdue from tenant.document_acceptances where document_version_id = $1 and user_id = $2', [v3.id, r.colaborador.id]);
    expect(fila.was_overdue).toBe(true);
    const rastro = (await auditoria(a.companyId, 'document.accept')).filter((x) => x.result === 'success');
    expect(rastro.at(-1)?.after_state).toMatchObject({ document_id: doc.id, version_number: 3, was_overdue: true, integrity_hash: expect.stringMatching(/^[0-9a-f]{64}$/) });
  });

  it('un documento que no pide aceptación se asigna y se lee, pero aceptarlo es 409 DOCUMENT_ACCEPTANCE_NOT_REQUIRED', async () => {
    await publicar(r.admin_empresa, sinAceptacion.id).expect(201);
    expect((await asignar(sinAceptacion.id, r.colaborador.id).expect(200)).body.data.added).toBe(1);
    const item = (await mine(r.colaborador.agent)).items.find((i: any) => i.document.id === sinAceptacion.id);
    expect(item).toMatchObject({ requires_acceptance: false, status: null, accepted_at: null });
    // Vencido el plazo sigue sin estado: nunca `pending` ni `overdue`, ni en «Mis documentos» ni en los conteos del administrador.
    await owner(`update tenant.document_assignments set assigned_at = now() - interval '31 days', due_at = now() - interval '1 day' where company_document_id = $1`, [sinAceptacion.id]);
    expect((await mine(r.colaborador.agent)).items.find((i: any) => i.document.id === sinAceptacion.id).status).toBeNull();
    for (const status of ['pending', 'overdue', 'accepted']) expect((await mine(r.colaborador.agent, `?status=${status}`)).items.map((i: any) => i.document.id)).not.toContain(sinAceptacion.id);
    const listado = ((await r.admin_empresa.get('/v1/documents?page_size=100').expect(200)).body.data.items as any[]).find((i) => i.id === sinAceptacion.id);
    expect(listado.assignments).toEqual({ total: 1, accepted: 0, pending: 0, overdue: 0 });
    const asignado = (await detalle(sinAceptacion.id)).assignees[0];
    expect(asignado.status).toBeNull();
    expect((await detalle(sinAceptacion.id)).assignments).toEqual({ total: 1, accepted: 0, pending: 0, overdue: 0 });
    const d = await detalle(sinAceptacion.id);
    expect((await aceptar(r.colaborador.agent, sinAceptacion.id, d.current_version.id).expect(409)).body.error.code).toBe('DOCUMENT_ACCEPTANCE_NOT_REQUIRED');
  });

  it('los 403 y 409 de las mutaciones quedan en el rastro con result = error', async () => {
    const errores = (await auditoria(a.companyId, 'document.accept')).filter((x) => x.result === 'error').map((x) => x.after_state.error_code);
    expect(errores).toEqual(expect.arrayContaining(['DOCUMENT_VERSION_NOT_CURRENT', 'DOCUMENT_ALREADY_ACCEPTED', 'FORBIDDEN', 'DOCUMENT_ACCEPTANCE_NOT_REQUIRED']));
    expect((await auditoria(a.companyId, 'document_assignment.add')).filter((x) => x.result === 'error').map((x) => x.after_state.error_code)).toEqual(expect.arrayContaining(['DOCUMENT_NOT_PUBLISHED', 'ASSIGNEE_NOT_ELIGIBLE']));
  });
});

describe('Quitar una asignación', () => {
  it('204: la persona deja de verlo y de contar, sus aceptaciones se conservan; quitar otra vez es 404; se puede volver a asignar con plazo nuevo', async () => {
    const antes = await owner('select 1 from tenant.document_acceptances where user_id = $1', [r.colaborador.id]);
    await r.admin_empresa.delete(`/v1/documents/${doc.id}/assignments/${r.colaborador.id}`).expect(204);
    expect((await mine(r.colaborador.agent)).items.map((i: any) => i.document.id)).not.toContain(doc.id);
    expect((await detalle(doc.id)).assignees.map((x: any) => x.user.id)).not.toContain(r.colaborador.id);
    expect(await owner('select 1 from tenant.document_acceptances where user_id = $1', [r.colaborador.id])).toHaveLength(antes.length);
    await r.admin_empresa.delete(`/v1/documents/${doc.id}/assignments/${r.colaborador.id}`).expect(404);
    await r.colaborador.agent.get(`/v1/documents/${doc.id}/versions/${(await detalle(doc.id)).versions[0].id}/file`).expect(403);
    expect((await aceptar(r.colaborador.agent, doc.id, (await detalle(doc.id)).current_version.id)).status).toBe(403);
    expect((await asignar(doc.id, r.colaborador.id).expect(200)).body.data.added).toBe(1);
    // La aceptación de la 3 sigue valiendo.
    expect((await mine(r.colaborador.agent)).items.find((i: any) => i.document.id === doc.id).status).toBe('accepted');
    expect((await auditoria(a.companyId, 'document_assignment.remove'))).toHaveLength(1);
  });
});

describe('Documento externo', () => {
  it('publicar uno externo es 409 DOCUMENT_EXTERNAL y no sube nada', async () => {
    const [externo] = await owner<{ id: string }>(`update tenant.company_documents set origin = 'external' where id = (select id from tenant.company_documents where tenant_id = $1 and id <> $2 and id <> $3 limit 1) returning id`, [a.companyId, doc.id, sinAceptacion.id]);
    const antes = storage.objects.size;
    expect((await publicar(r.admin_empresa, externo.id).expect(409)).body.error.code).toBe('DOCUMENT_EXTERNAL');
    expect(storage.objects.size).toBe(antes);
  });
});

describe('Otra empresa: todo es 404 y no se mezcla', () => {
  it('B no ve, no publica, no asigna, no acepta ni descarga lo de A; su lista no lleva los de A', async () => {
    const d = await detalle(doc.id);
    await b.agent.get(`/v1/documents/${doc.id}`).expect(404);
    await publicar(b.agent, doc.id).expect(404);
    await b.agent.post(`/v1/documents/${doc.id}/assignments`).send({ user_ids: [r.colaborador.id] }).expect(404);
    await b.agent.delete(`/v1/documents/${doc.id}/assignments/${r.colaborador.id}`).expect(404);
    await b.agent.get(`/v1/documents/${doc.id}/versions/${d.versions[0].id}/file`).expect(404);
    await b.agent.post(`/v1/documents/${doc.id}/acceptance`).send({ version_id: d.versions[0].id }).expect(404);
    const deB = ((await b.agent.get('/v1/documents?page_size=100').expect(200)).body.data.items as any[]).map((i) => i.id);
    expect(deB).not.toContain(doc.id);
    expect(deB.length).toBeGreaterThan(0);
    expect(((await b.agent.get('/v1/documents?page_size=100').expect(200)).body.data.items as any[]).every((i) => i.current_version === null)).toBe(true);
    await b.agent.get('/v1/documents/no-es-un-uuid').expect(404);
  });
});

describe('Quién puede qué', () => {
  it('el auditor lee la lista y el detalle (solo lectura) y no publica, asigna, acepta ni tiene «Mis documentos»; el responsable, el delegado y el colaborador no listan', async () => {
    expect((await r.auditor.agent.get('/v1/documents').expect(200)).body.data.total).toBeGreaterThan(0);
    await r.auditor.agent.get(`/v1/documents/${doc.id}`).expect(200);
    await publicar(r.auditor.agent, doc.id).expect(403);
    await r.auditor.agent.post(`/v1/documents/${doc.id}/assignments`).send({ user_ids: [r.colaborador.id] }).expect(403);
    await r.auditor.agent.get('/v1/me/documents').expect(403);
    for (const p of [r.responsable, r.delegado, r.colaborador]) {
      await p.agent.get('/v1/documents').expect(403);
      await p.agent.get(`/v1/documents/${doc.id}`).expect(403);
      await publicar(p.agent, doc.id).expect(403);
      await p.agent.post(`/v1/documents/${doc.id}/assignments`).send({ user_ids: [p.id] }).expect(403);
      await p.agent.delete(`/v1/documents/${doc.id}/assignments/${p.id}`).expect(403);
    }
    for (const agent of [r.admin_monkey]) {
      await agent.get('/v1/documents').expect(403);
      await agent.get('/v1/me/documents').expect(403);
    }
  });

  it('sin sesión, 401 en todo', async () => {
    const anon = (await import('supertest')).default(app.getHttpServer());
    await anon.get('/v1/documents').expect(401);
    await anon.get('/v1/me/documents').expect(401);
    await anon.post(`/v1/documents/${doc.id}/acceptance`).send({ version_id: doc.id }).expect(401);
  });

  it('el administrador acepta lo suyo como cualquiera (también está en «Mis documentos»)', async () => {
    const m = await mine(r.admin_empresa);
    expect(m.items.map((i: any) => i.document.id)).toContain(doc.id);
    const d = await detalle(doc.id);
    expect((await aceptar(r.admin_empresa, doc.id, d.current_version.id).expect(201)).body.data.version.number).toBe(3);
  });
});
