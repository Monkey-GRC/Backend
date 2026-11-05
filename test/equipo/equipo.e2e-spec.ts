import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { FileStorage } from '../../src/common/storage/file-storage';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { StorageEnMemoria } from '../support/storage-en-memoria';
import { dosEmpresas, Tenant } from '../support/escenario';
import { asignarControl } from '../support/asignaciones';

// D102 · El equipo de la empresa (contracts/gestion-usuarios.md). Todo por HTTP real contra el Postgres desechable, con el rol de la app
// (sujeto a RLS): el administrador invita, la persona activa su cuenta con el código y entra, y el administrador desactiva.
type Agent = Awaited<ReturnType<typeof login>>;
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let adminId: string;
const realInsert = auditInsert.insertAuditLog;
const email = (k: string) => `${k}-${RUN}@equipo.test`;
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));
// Toda cuenta lleva nombre y apellido (D97); las pruebas que no hablan del nombre mandan uno cualquiera.
const invite = (agent: Agent, body: object) => agent.post('/v1/users').send({ name: 'Persona', last_name: 'De Prueba', ...body });
const auditRows = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);

/** Invita a alguien, activa su cuenta con el código que recibió y devuelve su sesión (MFA_REQUIRED=false en estas pruebas). */
async function activo(t: Tenant, agent: Agent, k: string, role: 'responsable' | 'delegado' | 'auditor'): Promise<{ id: string; session: Agent; code: string }> {
  const created = (await invite(agent, { email: email(k), role }).expect(201)).body.data;
  const session = request.agent(app.getHttpServer());
  await session.post('/v1/auth/activate').send({ code: created.activation_code.code, email: email(k), password: PASSWORD }).expect(201);
  return { id: created.id, session, code: created.activation_code.code };
}

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Invitar a una persona del equipo', () => {
  it('nace pending, con su código en claro una sola vez, y con él activa su cuenta y entra', async () => {
    const res = await invite(a.agent, { email: email('ana'), role: 'responsable' }).expect(201);
    expect(res.body.data).toMatchObject({
      email: email('ana'), name: 'Persona', last_name: 'De Prueba', role: 'responsable', status: 'pending', is_mfa_enabled: false, last_login_at: null,
      activation_code: { code: expect.stringMatching(/^MNK-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/), status: 'pending', expires_at: expect.any(String) },
    });
    // Una cuenta pendiente no entra: se ve igual que una contraseña mala.
    await request(app.getHttpServer()).post('/v1/auth/login').send({ email: email('ana'), password: PASSWORD }).expect(401);
    // Con el código la persona activa y la cuenta queda activa, en la empresa de quien la invitó.
    const session = request.agent(app.getHttpServer());
    const act = await session.post('/v1/auth/activate').send({ code: res.body.data.activation_code.code, email: email('ana'), password: PASSWORD }).expect(201);
    expect(act.body.data.user).toMatchObject({ email: email('ana'), role: 'responsable', status: 'active' });
    expect(act.body.data.company.id).toBe(a.companyId);
    await session.get('/v1/auth/me').expect(200);
  });

  it('la vigencia del código es la de ACTIVATION_CODE_TTL_HOURS (7 días por defecto) y en la base solo queda su huella', async () => {
    const res = await invite(a.agent, { email: email('vig'), role: 'auditor' }).expect(201);
    const days = (new Date(res.body.data.activation_code.expires_at).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.99);
    expect(days).toBeLessThan(7.01);
    const [row] = await owner<{ code_hash: string }>('select code_hash from platform.user_activation_codes where user_id = $1', [res.body.data.id]);
    expect(row.code_hash).not.toContain(res.body.data.activation_code.code.replace(/-/g, ''));
  });

  it('el rol es uno de los cuatro que el administrador puede crear; el delegado queda como interno de forma provisional', async () => {
    expect(fields(await invite(a.agent, { email: email('x4'), role: 'admin_monkey' }).expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
    expect(fields(await invite(a.agent, { email: email('x5'), role: 'superadmin' }).expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
    expect(fields(await invite(a.agent, { email: 'no-es-correo', role: 'auditor' }).expect(422))).toEqual([{ field: 'email', code: 'email.invalid' }]);
    const d = (await invite(a.agent, { email: email('del'), role: 'delegado' }).expect(201)).body.data;
    expect(d).toMatchObject({ role: 'delegado', status: 'pending' });
    // DT-86: provisional hasta MD-188 (is_internal obligatorio y grupo en el alta del delegado)
    expect(await owner('select 1 from platform.users where id = $1 and is_internal is true', [d.id])).toHaveLength(1);
    const r = (await invite(a.agent, { email: email('resp'), role: 'responsable' }).expect(201)).body.data;
    expect(await owner('select 1 from platform.users where id = $1 and is_internal is null', [r.id])).toHaveLength(1);
  });

  it('toda cuenta lleva nombre y apellido: sin ellos es 422, y se guardan limpios', async () => {
    const sin = await a.agent.post('/v1/users').send({ email: email('sinnombre'), role: 'auditor' }).expect(422);
    expect(fields(sin)).toEqual(expect.arrayContaining([{ field: 'name', code: 'required' }, { field: 'last_name', code: 'required' }]));
    expect(fields(await a.agent.post('/v1/users').send({ email: email('vacio'), role: 'auditor', name: '   ', last_name: 'X' }).expect(422))).toEqual([{ field: 'name', code: 'required' }]);
    const res = await a.agent.post('/v1/users').send({ email: email('limpio'), role: 'auditor', name: '  Marta  ', last_name: ' Ruiz ' }).expect(201);
    expect(res.body.data).toMatchObject({ name: 'Marta', last_name: 'Ruiz' });
  });

  it('el administrador puede invitar a otro administrador (con nombre); este activa su cuenta y administra el equipo', async () => {
    const created = (await invite(a.agent, { email: email('adm2'), name: 'Lucía', last_name: 'Gómez', role: 'admin_empresa' }).expect(201)).body.data;
    expect(created).toMatchObject({ role: 'admin_empresa', status: 'pending', name: 'Lucía' });
    const session = request.agent(app.getHttpServer());
    await session.post('/v1/auth/activate').send({ code: created.activation_code.code, email: email('adm2'), password: PASSWORD }).expect(201);
    // El nuevo administrador ya invita, y no lo puede hacer ningún responsable, delegado ni auditor.
    await invite(session as unknown as Agent, { email: email('adm2-invita'), role: 'auditor' }).expect(201);
    expect((await a.agent.get('/v1/users?role=admin_empresa&page_size=100').expect(200)).body.data.items.map((i: any) => i.email)).toEqual(expect.arrayContaining([a.email, email('adm2')]));
  });

  it('un correo que ya existe se rechaza con su mensaje y no crea nada; el nombre de un correo ya registrado se corrige desde el equipo', async () => {
    await invite(a.agent, { email: email('yaexiste'), name: 'Sin', last_name: 'Apellido', role: 'auditor' }).expect(201);
    const dup = await invite(a.agent, { email: email('yaexiste'), role: 'responsable' }).expect(409);
    expect(dup.body.error.code).toBe('EMAIL_TAKEN');
    expect((await owner('select 1 from platform.users where email = $1', [email('yaexiste')])).length).toBe(1);
  });
  it('el correo es único en toda la plataforma, también frente a otra empresa; y se guarda en minúsculas', async () => {
    await invite(a.agent, { email: email('dup').toUpperCase(), role: 'auditor' }).expect(201);
    expect((await invite(a.agent, { email: email('dup'), role: 'auditor' }).expect(409)).body.error.code).toBe('EMAIL_TAKEN');
    expect((await invite(b.agent, { email: email('dup'), role: 'auditor' }).expect(409)).body.error.code).toBe('EMAIL_TAKEN');
    expect((await owner<{ email: string }>('select email from platform.users where email = $1', [email('dup')])).length).toBe(1);
  });

  it('solo el administrador de la empresa invita: responsable, delegado, auditor y admin_monkey reciben 403', async () => {
    const f = await activo(a, a.agent, 'rol-f', 'responsable');
    const d = await activo(a, a.agent, 'rol-d', 'delegado');
    const au = await activo(a, a.agent, 'rol-a', 'auditor');
    for (const agent of [f.session, d.session, au.session, monkey]) {
      await invite(agent, { email: email('z'), role: 'auditor' }).expect(403);
      await agent.get('/v1/users').expect(403);
      await agent.patch(`/v1/users/${f.id}`).send({ status: 'inactive' }).expect(403);
      await agent.post(`/v1/users/${f.id}/activation-code`).expect(403);
    }
  });

  it('deja su auditoría sin el código', async () => {
    const before = await auditRows('user.create');
    const res = await invite(a.agent, { email: email('aud'), role: 'auditor' }).expect(201);
    expect(await auditRows('user.create')).toBe(before + 1);
    const [row] = await owner<{ after_state: unknown }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'user.create' order by created_at desc limit 1`, [a.companyId]);
    expect(row.after_state).toMatchObject({ id: res.body.data.id, email: email('aud'), role: 'auditor', status: 'pending' });
    expect(JSON.stringify(row.after_state)).not.toContain(res.body.data.activation_code.code);
  });

  it('si el rastro falla, la cuenta se revierte: ni usuario ni código', async () => {
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await invite(a.agent, { email: email('rev'), role: 'responsable' }).expect(500);
    expect(await owner('select 1 from platform.users where email = $1', [email('rev')])).toHaveLength(0);
  });
});

describe('Listar el equipo', () => {
  beforeAll(async () => {
    await invite(a.agent, { email: email('lst1'), role: 'responsable' }).expect(201);
    await invite(b.agent, { email: email('otra'), role: 'auditor' }).expect(201);
  });

  it('trae a toda la empresa, incluido el administrador, sin el código ni lo de otra empresa', async () => {
    const res = (await a.agent.get('/v1/users?page_size=100').expect(200)).body.data;
    expect(res).toMatchObject({ page: 1, page_size: 100, total_pages: 1 });
    const mails = res.items.map((i: any) => i.email);
    expect(mails).toContain(a.email);
    expect(mails).toContain(email('lst1'));
    expect(mails).not.toContain(email('otra'));
    expect(JSON.stringify(res)).not.toMatch(/activation_code|password|mfa_secret|code_hash/);
    expect(res.items.find((i: any) => i.email === a.email)).toMatchObject({ role: 'admin_empresa', status: 'active' });
  });

  it('filtra por rol y estado, ordena y pagina; un valor fuera de las opciones es 422', async () => {
    const responsables = (await a.agent.get('/v1/users?role=responsable&status=pending&page_size=100').expect(200)).body.data.items;
    expect(responsables.length).toBeGreaterThan(0);
    expect(responsables.every((i: any) => i.role === 'responsable' && i.status === 'pending')).toBe(true);
    const asc = (await a.agent.get('/v1/users?sort=email&page_size=100').expect(200)).body.data.items.map((i: any) => i.email);
    expect(asc).toEqual([...asc].sort());
    expect((await a.agent.get('/v1/users?page=2&page_size=1').expect(200)).body.data.items).toHaveLength(1);
    expect(fields(await a.agent.get('/v1/users?role=superadmin').expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
  });
});

describe('Editar, desactivar y reactivar', () => {
  it('desactivar cierra sus sesiones al instante, deja el rastro, y reactivar le devuelve el acceso', async () => {
    const p = await activo(a, a.agent, 'des', 'responsable');
    await p.session.get('/v1/auth/me').expect(200);
    const res = await a.agent.patch(`/v1/users/${p.id}`).send({ status: 'inactive' }).expect(200);
    expect(res.body.data.status).toBe('inactive');
    await p.session.get('/v1/auth/me').expect(401);
    await request(app.getHttpServer()).post('/v1/auth/login').send({ email: email('des'), password: PASSWORD }).expect(403);
    const [row] = await owner<{ before_state: any; after_state: any }>(`select before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'user.update' order by created_at desc limit 1`, [a.companyId]);
    expect(row.before_state).toMatchObject({ id: p.id, status: 'active' });
    expect(row.after_state).toMatchObject({ id: p.id, status: 'inactive', sessions_closed: expect.any(Number) });
    await a.agent.patch(`/v1/users/${p.id}`).send({ status: 'active' }).expect(200);
    await login(app, email('des'));
  });

  it('no se desactiva a sí mismo (409 LAST_ADMIN); una cuenta pendiente no cambia de estado (409 USER_NOT_ACTIVATED)', async () => {
    expect((await a.agent.patch(`/v1/users/${adminId}`).send({ status: 'inactive' }).expect(409)).body.error.code).toBe('LAST_ADMIN');
    const pend = (await invite(a.agent, { email: email('pend'), role: 'auditor' }).expect(201)).body.data.id;
    expect((await a.agent.patch(`/v1/users/${pend}`).send({ status: 'inactive' }).expect(409)).body.error.code).toBe('USER_NOT_ACTIVATED');
  });

  it('sobre otro administrador, admin_monkey o alguien de otra empresa responde 404', async () => {
    const [m] = await owner<{ id: string }>(`select id from platform.users where role = 'admin_monkey' limit 1`);
    const ajena = (await owner<{ id: string }>('select id from platform.users where email = $1', [email('otra')]))[0].id;
    for (const id of [m.id, ajena, '00000000-0000-0000-0000-000000000000', 'no-es-uuid']) await a.agent.patch(`/v1/users/${id}`).send({ status: 'inactive' }).expect(404);
    expect(await owner(`select 1 from platform.users where id = $1 and status = 'active'`, [ajena])).toHaveLength(0); // sigue pendiente: no la tocó
    await b.agent.patch(`/v1/users/${adminId}`).send({ status: 'inactive' }).expect(404);
  });

  it('el cuerpo vacío es 422', async () => {
    const f = (await activo(a, a.agent, 'esp', 'responsable')).id;
    expect(fields(await a.agent.patch(`/v1/users/${f}`).send({}).expect(422))).toEqual([{ field: 'status', code: 'required' }]);
  });
});

describe('Corregir el nombre y administrar a otros administradores (D97)', () => {
  it('el administrador corrige el nombre de cualquier persona del equipo, incluido él mismo, y queda en la auditoría', async () => {
    const p = (await invite(a.agent, { email: email('nom'), name: 'Viejo', last_name: 'Nombre', role: 'responsable' }).expect(201)).body.data;
    const res = await a.agent.patch(`/v1/users/${p.id}`).send({ name: ' Nuevo ', last_name: 'Apellido' }).expect(200);
    expect(res.body.data).toMatchObject({ name: 'Nuevo', last_name: 'Apellido', status: 'pending' });
    const [row] = await owner<{ before_state: any; after_state: any }>(`select before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'user.update' order by created_at desc limit 1`, [a.companyId]);
    expect(row.before_state).toMatchObject({ name: 'Viejo' });
    expect(row.after_state).toMatchObject({ name: 'Nuevo', last_name: 'Apellido' });
    // a sí mismo solo puede corregirse el nombre, nunca desactivarse
    await a.agent.patch(`/v1/users/${adminId}`).send({ name: 'Admin', last_name: 'Principal' }).expect(200);
    expect((await a.agent.patch(`/v1/users/${adminId}`).send({ status: 'inactive' }).expect(409)).body.error.code).toBe('LAST_ADMIN');
    expect(fields(await a.agent.patch(`/v1/users/${p.id}`).send({ name: '   ' }).expect(422))).toEqual([{ field: 'name', code: 'required' }]);
  });

  it('un administrador puede desactivar y reactivar a otro administrador; la empresa nunca se queda sin administrador', async () => {
    const otro = await activo(a, a.agent, 'adm-baja', 'admin_empresa' as never);
    await a.agent.patch(`/v1/users/${otro.id}`).send({ status: 'inactive' }).expect(200);
    await otro.session.get('/v1/auth/me').expect(401);
    await a.agent.patch(`/v1/users/${otro.id}`).send({ status: 'active' }).expect(200);
    // el otro administrador tampoco puede desactivarse a sí mismo
    const mismo = await login(app, email('adm-baja'));
    expect((await mismo.patch(`/v1/users/${otro.id}`).send({ status: 'inactive' }).expect(409)).body.error.code).toBe('LAST_ADMIN');
  });

  it('el administrador de otra empresa no existe para quien llama (404); un responsable no corrige nombres', async () => {
    const ajena = (await owner<{ id: string }>('select id from platform.users where email = $1', [b.email]))[0].id;
    await a.agent.patch(`/v1/users/${ajena}`).send({ name: 'X' }).expect(404);
    const f = await activo(a, a.agent, 'nom-f', 'responsable');
    await f.session.patch(`/v1/users/${f.id}`).send({ name: 'Yo' }).expect(403);
  });
});

describe('Reemitir el código de activación', () => {
  it('revoca el anterior, el nuevo sí activa, y una cuenta ya activa no lo necesita (409 USER_ALREADY_ACTIVE)', async () => {
    const first = (await invite(a.agent, { email: email('reem'), role: 'auditor' }).expect(201)).body.data;
    const second = (await a.agent.post(`/v1/users/${first.id}/activation-code`).expect(201)).body.data;
    expect(second.id).toBe(first.id);
    expect(second.activation_code.code).not.toBe(first.activation_code.code);
    expect((await request(app.getHttpServer()).post('/v1/auth/activate').send({ code: first.activation_code.code, email: email('reem'), password: PASSWORD }).expect(404)).body.error.code).toBe('ACTIVATION_CODE_INVALID');
    await request(app.getHttpServer()).post('/v1/auth/activate').send({ code: second.activation_code.code, email: email('reem'), password: PASSWORD }).expect(201);
    expect((await a.agent.post(`/v1/users/${first.id}/activation-code`).expect(409)).body.error.code).toBe('USER_ALREADY_ACTIVE');
    expect(await auditRows('user.activation_code_regenerate')).toBeGreaterThan(0);
    await a.agent.post(`/v1/users/${adminId}/activation-code`).expect(409); // un administrador ya activo tampoco necesita código
    await b.agent.post(`/v1/users/${first.id}/activation-code`).expect(404);
  });
});

describe('Visibilidad transitoria del responsable (hasta MD-193)', () => {
  // DT-87: transitorio hasta MD-193 (visibilidad por dueño/ejecutor). El responsable ve solo los controles de los que es dueño o ejecutor.
  it('sin asignaciones no ve nada; con un control asignado ve ese y solo ese; el delegado ejecutor también', async () => {
    const dueño = await activo(a, a.agent, 'vis-resp', 'responsable');
    const ejecutor = await activo(a, a.agent, 'vis-del', 'delegado');
    const ids = async (agent: Agent) => ((await agent.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items as any[]).map((c) => c.id);
    expect(await ids(dueño.session)).toEqual([]);
    const todos = await ids(a.agent);
    expect(todos.length).toBeGreaterThan(1);
    await asignarControl(a.companyId, todos[0], dueño.id, ejecutor.id);
    expect(await ids(dueño.session)).toEqual([todos[0]]);
    expect(await ids(ejecutor.session)).toEqual([todos[0]]);
    await dueño.session.get(`/v1/controls/${todos[0]}`).expect(200);
    await dueño.session.get(`/v1/controls/${todos[1]}`).expect(403);
    await dueño.session.get(`/v1/controls/${todos[0]}?view=technical`).expect(403);
    await b.agent.get(`/v1/controls/${todos[0]}`).expect(404);
  });

  // D102 · El delegado ejecuta: ve sus controles, su evidencia y sus observaciones, y nada más. Sin avance de la empresa, sin riesgos, sin servicios, sin hallazgos de la sonda.
  it('el delegado recibe 403 en el resumen, los riesgos, los servicios y los hallazgos; el responsable sí entra a lo que el contrato le abre', async () => {
    const delegado = await activo(a, a.agent, 'vis-403', 'delegado');
    const responsable = await activo(a, a.agent, 'vis-403r', 'responsable');
    const control = (await owner<{ id: string }>('select id from tenant.client_controls where service_id = $1 and is_active limit 1', [a.serviceId]))[0].id;
    const test = '00000000-0000-4000-8000-000000000001';
    const cerradas = [
      `/v1/services/${a.serviceId}/compliance-overview`,
      `/v1/services/${a.serviceId}/risks`,
      `/v1/services/${a.serviceId}/causes`,
      '/v1/risk-matrix',
      '/v1/services',
      `/v1/services/${a.serviceId}`,
      `/v1/controls/${control}/tests/${test}/findings`,
    ];
    for (const ruta of cerradas) expect({ ruta, status: (await delegado.session.get(ruta)).status }).toEqual({ ruta, status: 403 });
    // El mismo recorrido con el responsable no se cierra por el rol: puede dar 200 o 404 según el recurso, pero nunca 403 por ser responsable.
    for (const ruta of [`/v1/services/${a.serviceId}/compliance-overview`, `/v1/services/${a.serviceId}/risks`, '/v1/services']) {
      expect({ ruta, status: (await responsable.session.get(ruta)).status }).toEqual({ ruta, status: 200 });
    }
  });
});
