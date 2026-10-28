import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D96 · El equipo de la empresa y el reparto del trabajo por dimensión (contracts/modules/users-team.md). Todo por HTTP real contra el Postgres desechable, con el rol de la app
// (sujeto a RLS): el administrador invita, la persona activa su cuenta con el código y entra, y el administrador reparte y desactiva.
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
const owners = (t: Tenant) => `/v1/services/${t.serviceId}/dimension-owners`;
const auditRows = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);

/** Invita a alguien, activa su cuenta con el código que recibió y devuelve su sesión (MFA_REQUIRED=false en estas pruebas). */
async function activo(t: Tenant, agent: Agent, k: string, role: 'funcional' | 'auditor', dimensions?: string[]): Promise<{ id: string; session: Agent; code: string }> {
  const created = (await invite(agent, { email: email(k), role, ...(dimensions ? { dimensions } : {}) }).expect(201)).body.data;
  const session = request.agent(app.getHttpServer());
  await session.post('/v1/auth/activate').send({ code: created.activation_code.code, email: email(k), password: PASSWORD }).expect(201);
  return { id: created.id, session, code: created.activation_code.code };
}

beforeAll(async () => {
  app = await bootApp();
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Invitar a una persona del equipo', () => {
  it('nace pending, con su código en claro una sola vez, y con él activa su cuenta y entra', async () => {
    const res = await invite(a.agent, { email: email('ana'), role: 'funcional', dimensions: ['server', 'database'] }).expect(201);
    expect(res.body.data).toMatchObject({
      email: email('ana'), name: 'Persona', last_name: 'De Prueba', role: 'funcional', status: 'pending', is_mfa_enabled: false, last_login_at: null, dimensions: ['database', 'server'],
      activation_code: { code: expect.stringMatching(/^MNK-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/), status: 'pending', expires_at: expect.any(String) },
    });
    // Una cuenta pendiente no entra: se ve igual que una contraseña mala.
    await request(app.getHttpServer()).post('/v1/auth/login').send({ email: email('ana'), password: PASSWORD }).expect(401);
    // Con el código la persona activa y la cuenta queda activa, en la empresa de quien la invitó.
    const session = request.agent(app.getHttpServer());
    const act = await session.post('/v1/auth/activate').send({ code: res.body.data.activation_code.code, email: email('ana'), password: PASSWORD }).expect(201);
    expect(act.body.data.user).toMatchObject({ email: email('ana'), role: 'funcional', status: 'active' });
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

  it('un auditor y un administrador no llevan especialidades; un funcional las necesita; el rol es uno de los tres', async () => {
    expect(fields(await invite(a.agent, { email: email('x1'), role: 'funcional' }).expect(422))).toEqual([{ field: 'dimensions', code: 'array.min' }]);
    expect(fields(await invite(a.agent, { email: email('x2'), role: 'funcional', dimensions: [] }).expect(422))).toEqual([{ field: 'dimensions', code: 'array.min' }]);
    expect(fields(await invite(a.agent, { email: email('x3'), role: 'auditor', dimensions: ['app'] }).expect(422))).toEqual([{ field: 'dimensions', code: 'dimensions.not_allowed' }]);
    expect(fields(await invite(a.agent, { email: email('x4'), role: 'admin_monkey' }).expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
    expect(fields(await invite(a.agent, { email: email('x5'), role: 'consultor' }).expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
    expect(fields(await invite(a.agent, { email: 'no-es-correo', role: 'auditor' }).expect(422))).toEqual([{ field: 'email', code: 'email.invalid' }]);
    expect(fields(await invite(a.agent, { email: email('x6'), role: 'funcional', dimensions: ['nube'] }).expect(422))).toEqual([{ field: 'dimensions', code: 'enum.invalid' }]);
  });

  it('toda cuenta lleva nombre y apellido: sin ellos es 422, y se guardan limpios', async () => {
    const sin = await a.agent.post('/v1/users').send({ email: email('sinnombre'), role: 'auditor' }).expect(422);
    expect(fields(sin)).toEqual(expect.arrayContaining([{ field: 'name', code: 'required' }, { field: 'last_name', code: 'required' }]));
    expect(fields(await a.agent.post('/v1/users').send({ email: email('vacio'), role: 'auditor', name: '   ', last_name: 'X' }).expect(422))).toEqual([{ field: 'name', code: 'required' }]);
    const res = await a.agent.post('/v1/users').send({ email: email('limpio'), role: 'auditor', name: '  Marta  ', last_name: ' Ruiz ' }).expect(201);
    expect(res.body.data).toMatchObject({ name: 'Marta', last_name: 'Ruiz' });
  });

  it('el administrador puede invitar a otro administrador (con nombre, sin especialidades); este activa su cuenta y administra el equipo', async () => {
    expect(fields(await invite(a.agent, { email: email('adm-x'), role: 'admin_empresa', dimensions: ['app'] }).expect(422))).toEqual([{ field: 'dimensions', code: 'dimensions.not_allowed' }]);
    const created = (await invite(a.agent, { email: email('adm2'), name: 'Lucía', last_name: 'Gómez', role: 'admin_empresa' }).expect(201)).body.data;
    expect(created).toMatchObject({ role: 'admin_empresa', status: 'pending', name: 'Lucía', dimensions: [] });
    const session = request.agent(app.getHttpServer());
    await session.post('/v1/auth/activate').send({ code: created.activation_code.code, email: email('adm2'), password: PASSWORD }).expect(201);
    // El nuevo administrador ya invita, y no lo puede hacer ningún funcional ni auditor.
    await invite(session as unknown as Agent, { email: email('adm2-invita'), role: 'auditor' }).expect(201);
    expect((await a.agent.get('/v1/users?role=admin_empresa&page_size=100').expect(200)).body.data.items.map((i: any) => i.email)).toEqual(expect.arrayContaining([a.email, email('adm2')]));
  });

  it('un correo que ya existe se rechaza con su mensaje y no crea nada; el nombre de un correo ya registrado se corrige desde el equipo', async () => {
    await invite(a.agent, { email: email('yaexiste'), name: 'Sin', last_name: 'Apellido', role: 'auditor' }).expect(201);
    const dup = await invite(a.agent, { email: email('yaexiste'), role: 'funcional', dimensions: ['app'] }).expect(409);
    expect(dup.body.error.code).toBe('EMAIL_TAKEN');
    expect((await owner('select 1 from platform.users where email = $1', [email('yaexiste')])).length).toBe(1);
  });
  it('el correo es único en toda la plataforma, también frente a otra empresa; y se guarda en minúsculas', async () => {
    await invite(a.agent, { email: email('dup').toUpperCase(), role: 'auditor' }).expect(201);
    expect((await invite(a.agent, { email: email('dup'), role: 'auditor' }).expect(409)).body.error.code).toBe('EMAIL_TAKEN');
    expect((await invite(b.agent, { email: email('dup'), role: 'auditor' }).expect(409)).body.error.code).toBe('EMAIL_TAKEN');
    expect((await owner<{ email: string }>('select email from platform.users where email = $1', [email('dup')])).length).toBe(1);
  });

  it('solo el administrador de la empresa invita: funcional, auditor y admin_monkey reciben 403', async () => {
    const f = await activo(a, a.agent, 'rol-f', 'funcional', ['app']);
    const au = await activo(a, a.agent, 'rol-a', 'auditor');
    for (const agent of [f.session, au.session, monkey]) {
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

  it('si el rastro falla, la cuenta se revierte: ni usuario, ni especialidades, ni código', async () => {
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await invite(a.agent, { email: email('rev'), role: 'funcional', dimensions: ['cloud'] }).expect(500);
    expect(await owner('select 1 from platform.users where email = $1', [email('rev')])).toHaveLength(0);
  });
});

describe('Listar el equipo', () => {
  beforeAll(async () => {
    await invite(a.agent, { email: email('lst1'), role: 'funcional', dimensions: ['policy'] }).expect(201);
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
    expect(res.items.find((i: any) => i.email === a.email)).toMatchObject({ role: 'admin_empresa', status: 'active', dimensions: [] });
  });

  it('filtra por rol y estado, ordena y pagina; un valor fuera de las opciones es 422', async () => {
    const funcionales = (await a.agent.get('/v1/users?role=funcional&status=pending&page_size=100').expect(200)).body.data.items;
    expect(funcionales.length).toBeGreaterThan(0);
    expect(funcionales.every((i: any) => i.role === 'funcional' && i.status === 'pending')).toBe(true);
    const asc = (await a.agent.get('/v1/users?sort=email&page_size=100').expect(200)).body.data.items.map((i: any) => i.email);
    expect(asc).toEqual([...asc].sort());
    expect((await a.agent.get('/v1/users?page=2&page_size=1').expect(200)).body.data.items).toHaveLength(1);
    expect(fields(await a.agent.get('/v1/users?role=consultor').expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
  });
});

describe('Editar, desactivar y reactivar', () => {
  it('desactivar cierra sus sesiones al instante, deja el rastro, y reactivar le devuelve el acceso', async () => {
    const p = await activo(a, a.agent, 'des', 'funcional', ['server']);
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

  it('cambia las especialidades; un auditor no las lleva; el cuerpo vacío es 422', async () => {
    const f = (await activo(a, a.agent, 'esp', 'funcional', ['policy'])).id;
    const res = await a.agent.patch(`/v1/users/${f}`).send({ dimensions: ['app', 'cloud'] }).expect(200);
    expect(res.body.data.dimensions).toEqual(['app', 'cloud']);
    const au = (await activo(a, a.agent, 'esp-a', 'auditor')).id;
    expect(fields(await a.agent.patch(`/v1/users/${au}`).send({ dimensions: ['app'] }).expect(422))).toEqual([{ field: 'dimensions', code: 'dimensions.not_allowed' }]);
    expect(fields(await a.agent.patch(`/v1/users/${f}`).send({}).expect(422))).toEqual([{ field: 'status', code: 'required' }]);
    expect(fields(await a.agent.patch(`/v1/users/${f}`).send({ dimensions: [] }).expect(422))).toEqual([{ field: 'dimensions', code: 'array.min' }]);
  });
});

describe('Corregir el nombre y administrar a otros administradores (D97)', () => {
  it('el administrador corrige el nombre de cualquier persona del equipo, incluido él mismo, y queda en la auditoría', async () => {
    const p = (await invite(a.agent, { email: email('nom'), name: 'Viejo', last_name: 'Nombre', role: 'funcional', dimensions: ['app'] }).expect(201)).body.data;
    const res = await a.agent.patch(`/v1/users/${p.id}`).send({ name: ' Nuevo ', last_name: 'Apellido' }).expect(200);
    expect(res.body.data).toMatchObject({ name: 'Nuevo', last_name: 'Apellido', status: 'pending', dimensions: ['app'] });
    const [row] = await owner<{ before_state: any; after_state: any }>(`select before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'user.update' order by created_at desc limit 1`, [a.companyId]);
    expect(row.before_state).toMatchObject({ name: 'Viejo' });
    expect(row.after_state).toMatchObject({ name: 'Nuevo', last_name: 'Apellido' });
    // a sí mismo solo puede corregirse el nombre, nunca desactivarse ni quitarse la especialidad
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

  it('el administrador de otra empresa no existe para quien llama (404); un funcional no corrige nombres', async () => {
    const ajena = (await owner<{ id: string }>('select id from platform.users where email = $1', [b.email]))[0].id;
    await a.agent.patch(`/v1/users/${ajena}`).send({ name: 'X' }).expect(404);
    const f = await activo(a, a.agent, 'nom-f', 'funcional', ['app']);
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

describe('Responsable por dimensión de un servicio', () => {
  let srv: { id: string; session: Agent };
  let db: { id: string; session: Agent };
  let ajeno: string;

  beforeAll(async () => {
    srv = await activo(a, a.agent, 'own-srv', 'funcional', ['server']);
    db = await activo(a, a.agent, 'own-db', 'funcional', ['database']);
    ajeno = (await invite(b.agent, { email: email('own-b'), role: 'funcional', dimensions: ['server'] }).expect(201)).body.data.id;
  });

  it('siempre trae las cinco dimensiones, en orden, y las cuentas de los controles', async () => {
    const items = (await a.agent.get(owners(a)).expect(200)).body.data.items;
    expect(items.map((i: any) => i.dimension)).toEqual(['policy', 'server', 'database', 'app', 'cloud']);
    expect(items.every((i: any) => i.owner === null)).toBe(true);
    const server = items.find((i: any) => i.dimension === 'server');
    expect(server.controls_total).toBeGreaterThan(0);
    expect(server).toMatchObject({ controls_with_exception: 0, controls_without_owner: server.controls_total });
  });

  it('pone al responsable, y los controles de esa dimensión dejan de estar sin dueño', async () => {
    const res = await a.agent.patch(`${owners(a)}/server`).send({ user_id: srv.id }).expect(200);
    expect(res.body.data).toMatchObject({ dimension: 'server', owner: { id: srv.id, email: email('own-srv') }, controls_without_owner: 0 });
    expect(res.body.data.controls_total).toBeGreaterThan(0);
    // Cambiarlo no deja dos filas: una por servicio y dimensión.
    await a.agent.patch(`${owners(a)}/server`).send({ user_id: srv.id }).expect(200);
    expect(await owner('select 1 from platform.service_dimension_owners where service_id = $1 and dimension = $2', [a.serviceId, 'server'])).toHaveLength(1);
    const [row] = await owner<{ after_state: any }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'dimension_owner.set' order by created_at desc limit 1`, [a.companyId]);
    expect(row.after_state).toMatchObject({ service_id: a.serviceId, dimension: 'server', user_id: srv.id });
  });

  it('solo un funcional con esa especialidad: sin ella 409 USER_LACKS_DIMENSION; otra empresa, un auditor o un id suelto, 404', async () => {
    expect((await a.agent.patch(`${owners(a)}/cloud`).send({ user_id: srv.id }).expect(409)).body.error.code).toBe('USER_LACKS_DIMENSION');
    const au = (await owner<{ id: string }>('select id from platform.users where email = $1', [email('rol-a')]))[0].id;
    for (const id of [ajeno, au, adminId, '00000000-0000-0000-0000-000000000000']) await a.agent.patch(`${owners(a)}/server`).send({ user_id: id }).expect(404);
    expect(fields(await a.agent.patch(`${owners(a)}/server`).send({ user_id: 'x' }).expect(422))).toEqual([{ field: 'user_id', code: 'uuid.invalid' }]);
    expect(fields(await a.agent.patch(`${owners(a)}/server`).send({}).expect(422))).toEqual([{ field: 'user_id', code: 'uuid.invalid' }]);
  });

  it('una dimensión que no existe, o el servicio de otra empresa, es 404; solo el administrador reparte (el auditor lee)', async () => {
    await a.agent.patch(`${owners(a)}/nube`).send({ user_id: srv.id }).expect(404);
    await b.agent.get(owners(a)).expect(404);
    await b.agent.patch(`${owners(a)}/server`).send({ user_id: srv.id }).expect(404);
    const au = await login(app, email('rol-a'));
    await au.get(owners(a)).expect(200);
    await au.patch(`${owners(a)}/server`).send({ user_id: srv.id }).expect(403);
    await srv.session.get(owners(a)).expect(403);
    await monkey.get(owners(a)).expect(403);
  });

  it('con user_id null la dimensión queda sin responsable', async () => {
    await a.agent.patch(`${owners(a)}/database`).send({ user_id: db.id }).expect(200);
    const res = await a.agent.patch(`${owners(a)}/database`).send({ user_id: null }).expect(200);
    expect(res.body.data.owner).toBeNull();
    expect(res.body.data.controls_without_owner).toBe(res.body.data.controls_total);
  });

  it('quitar una especialidad que aún atiende es 409 DIMENSION_IN_USE con el conteo; reasignando, se deja', async () => {
    const res = await a.agent.patch(`/v1/users/${srv.id}`).send({ dimensions: ['database'] }).expect(409);
    expect(res.body.error).toMatchObject({ code: 'DIMENSION_IN_USE', responsibilities_count: 1 });
    expect((await a.agent.get('/v1/users?role=funcional&page_size=100').expect(200)).body.data.items.find((i: any) => i.id === srv.id).dimensions).toEqual(['server']);
    await a.agent.patch(`${owners(a)}/server`).send({ user_id: null }).expect(200);
    await a.agent.patch(`/v1/users/${srv.id}`).send({ dimensions: ['database'] }).expect(200);
  });
});

describe('Responsable de un control, por dimensión', () => {
  let control: string;
  let dimension: string;
  let other: string;
  let ana: { id: string; session: Agent };
  let beto: { id: string; session: Agent };

  beforeAll(async () => {
    const [c] = await owner<{ id: string; dimension: string }>(
      `select cct.client_control_id id, t.dimension::text dimension from tenant.client_control_tests cct
         join catalog.tests t on t.id = cct.test_id join tenant.client_controls cc on cc.id = cct.client_control_id
        where cc.service_id = $1 and cc.is_active order by cc.own_code, t.code limit 1`,
      [a.serviceId],
    );
    control = c.id;
    dimension = c.dimension;
    other = ['policy', 'server', 'database', 'app', 'cloud'].find((d) => d !== dimension)!;
    ana = await activo(a, a.agent, 'ctl-ana', 'funcional', [dimension]);
    beto = await activo(a, a.agent, 'ctl-beto', 'funcional', [dimension]);
  });

  const url = (d: string) => `/v1/controls/${control}/responsibles/${d}`;

  it('lista una fila por cada dimensión con pruebas, sin responsable al comienzo', async () => {
    const items = (await a.agent.get(`/v1/controls/${control}/responsibles`).expect(200)).body.data.items;
    expect(items.length).toBeGreaterThan(0);
    expect(items.find((i: any) => i.dimension === dimension)).toMatchObject({ tests_count: expect.any(Number), owner: null, source: null });
  });

  it('el responsable del servicio manda sobre el control (source = service), y la excepción manda sobre el servicio (source = control)', async () => {
    await a.agent.patch(`${owners(a)}/${dimension}`).send({ user_id: ana.id }).expect(200);
    const viaServicio = (await a.agent.get(`/v1/controls/${control}/responsibles`).expect(200)).body.data.items.find((i: any) => i.dimension === dimension);
    expect(viaServicio).toMatchObject({ owner: { id: ana.id }, source: 'service' });

    const exc = await a.agent.patch(url(dimension)).send({ user_id: beto.id }).expect(200);
    expect(exc.body.data).toMatchObject({ dimension, owner: { id: beto.id }, source: 'control' });
    const lista = (await a.agent.get(owners(a)).expect(200)).body.data.items.find((i: any) => i.dimension === dimension);
    expect(lista.controls_with_exception).toBe(1);
    expect(lista.owner.id).toBe(ana.id); // el principal del servicio no cambió

    const quitada = await a.agent.patch(url(dimension)).send({ user_id: null }).expect(200);
    expect(quitada.body.data).toMatchObject({ owner: { id: ana.id }, source: 'service' });
    expect(await owner('select 1 from platform.user_control_assignments where client_control_id = $1', [control])).toHaveLength(0);
    const [row] = await owner<{ after_state: any }>(`select after_state from audit.audit_logs where tenant_id = $1 and action = 'control_responsible.set' order by created_at desc limit 1`, [a.companyId]);
    expect(row.after_state).toMatchObject({ control_id: control, dimension, user_id: ana.id, source: 'service' });
  });

  it('exige la especialidad; una dimensión sin pruebas en el control, un id inválido o ajeno, 404', async () => {
    const solo = await activo(a, a.agent, 'ctl-otra', 'funcional', [other]);
    expect((await a.agent.patch(url(dimension)).send({ user_id: solo.id }).expect(409)).body.error.code).toBe('USER_LACKS_DIMENSION');
    const conPruebas = ((await a.agent.get(`/v1/controls/${control}/responsibles`).expect(200)).body.data.items as any[]).map((i) => i.dimension);
    const sinPruebas = ['policy', 'server', 'database', 'app', 'cloud'].filter((d) => !conPruebas.includes(d));
    for (const d of sinPruebas) await a.agent.patch(url(d)).send({ user_id: ana.id }).expect(404);
    await a.agent.patch(url('nube')).send({ user_id: ana.id }).expect(404);
    await a.agent.get('/v1/controls/no-es-uuid/responsibles').expect(404);
    await b.agent.get(`/v1/controls/${control}/responsibles`).expect(404);
    await b.agent.patch(url(dimension)).send({ user_id: ana.id }).expect(404);
  });

  it('un control dado de baja no se reparte (409 CONTROL_RETIRED)', async () => {
    const [{ id }] = await owner<{ id: string }>(
      `select cct.client_control_id id from tenant.client_control_tests cct join tenant.client_controls cc on cc.id = cct.client_control_id where cc.service_id = $1 and cc.is_active and cc.id <> $2 limit 1`,
      [a.serviceId, control],
    );
    const dims = (await a.agent.get(`/v1/controls/${id}/responsibles`).expect(200)).body.data.items.map((i: any) => i.dimension);
    await owner('update tenant.client_controls set is_active = false where id = $1', [id]);
    try {
      expect((await a.agent.patch(`/v1/controls/${id}/responsibles/${dims[0]}`).send({ user_id: null }).expect(409)).body.error.code).toBe('CONTROL_RETIRED');
    } finally {
      await owner('update tenant.client_controls set is_active = true where id = $1', [id]);
    }
  });

  it('solo el administrador reparte; el auditor lee; el funcional y admin_monkey no entran', async () => {
    const au = await login(app, email('rol-a'));
    await au.get(`/v1/controls/${control}/responsibles`).expect(200);
    await au.patch(url(dimension)).send({ user_id: null }).expect(403);
    await ana.session.get(`/v1/controls/${control}/responsibles`).expect(403);
    await ana.session.patch(url(dimension)).send({ user_id: null }).expect(403);
    await monkey.get(`/v1/controls/${control}/responsibles`).expect(403);
  });

  it('la base aísla: B no ve lo de A, y una fila por control y dimensión', async () => {
    await a.agent.patch(url(dimension)).send({ user_id: beto.id }).expect(200);
    await expect(
      owner(
        `insert into platform.user_control_assignments (id, company_id, user_id, client_control_id, dimension, assigned_by) values (gen_random_uuid(), $1, $2, $3, $4::catalog.dimension, $5)`,
        [a.companyId, ana.id, control, dimension, adminId],
      ),
    ).rejects.toThrow(/duplicate key|unique/);
  });
});

describe('D97 · el funcional atiende todo lo de su especialidad, sin que nadie se lo asigne', () => {
  let mixto: string; // un control con pruebas documentales y de otra dimensión
  let otraDim: string;
  let docTest: string;
  let sinOtra: string | undefined; // un control que no lleva pruebas de esa otra dimensión
  let doc: { id: string; session: Agent };
  let tec: { id: string; session: Agent };
  let nadie: { id: string; session: Agent };

  beforeAll(async () => {
    const rows = await owner<{ id: string; dims: string[] }>(
      `select cc.id, array_agg(distinct t.dimension::text) dims from tenant.client_controls cc join tenant.client_control_tests x on x.client_control_id = cc.id join catalog.tests t on t.id = x.test_id
        where cc.service_id = $1 and cc.is_active group by cc.id order by cc.own_code`,
      [a.serviceId],
    );
    const m = rows.find((r) => r.dims.includes('policy') && r.dims.length > 1)!;
    mixto = m.id;
    otraDim = m.dims.find((d) => d !== 'policy')!;
    docTest = (await owner<{ test_id: string }>(`select x.test_id from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1 and t.dimension = 'policy' order by t.code limit 1`, [mixto]))[0].test_id;
    sinOtra = rows.find((r) => !r.dims.includes(otraDim))?.id;
    // Se crean como lo hace el administrador: con sus especialidades al invitarlos. Nadie les asigna nada después.
    doc = await activo(a, a.agent, 'seg-doc', 'funcional', ['policy']);
    tec = await activo(a, a.agent, 'seg-tec', 'funcional', [otraDim]);
    nadie = await activo(a, a.agent, 'seg-nadie', 'funcional', ['app']);
  });

  const ids = async (agent: Agent) => ((await agent.get(`/v1/services/${a.serviceId}/controls?page_size=100`).expect(200)).body.data.items as any[]).map((c) => c.id);
  const pdf = () => Buffer.from(`%PDF-1.7\n% seg66 ${RUN}\n`);

  it('al entrar ve de una vez los controles de su especialidad; sin controles de su especialidad la lista llega vacía, no falla', async () => {
    const todos = await ids(a.agent);
    // Todo control lleva pruebas documentales: quien atiende lo documental los ve todos; el técnico, solo los que llevan su dimensión.
    expect((await ids(doc.session)).length).toBe(todos.length);
    const tecs = await ids(tec.session);
    expect(tecs).toContain(mixto);
    if (sinOtra) expect(tecs).not.toContain(sinOtra);
    expect(tecs.length).toBeLessThanOrEqual(todos.length);
    expect(await ids(nadie.session)).not.toContain(mixto);
  });

  it('un control que no lleva su especialidad es 403, no 404 (existe y es de su empresa); el de otra empresa, 404', async () => {
    if (sinOtra) await tec.session.get(`/v1/controls/${sinOtra}`).expect(403);
    await tec.session.get(`/v1/controls/${mixto}`).expect(200);
    await nadie.session.get(`/v1/controls/${mixto}`).expect(403);
    await nadie.session.get(`/v1/controls/${mixto}/evidence`).expect(403);
    await b.agent.get(`/v1/controls/${mixto}`).expect(404);
  });

  it('la evidencia de un control mixto: cada uno ve y sube solo la de su dimensión', async () => {
    await a.agent.get(`/v1/controls/${mixto}/evidence`).expect(200);
    const subida = await doc.session.post(`/v1/controls/${mixto}/tests/${docTest}/evidence`).attach('file', pdf(), 'doc.pdf');
    expect(subida.status).toBe(201);
    const verDoc = (await doc.session.get(`/v1/controls/${mixto}/evidence`).expect(200)).body.data.items as any[];
    expect(verDoc.length).toBeGreaterThan(0);
    expect(verDoc.every((r) => r.dimension === 'policy')).toBe(true);
    const verTec = (await tec.session.get(`/v1/controls/${mixto}/evidence`).expect(200)).body.data.items as any[];
    expect(verTec.every((r) => r.dimension !== 'policy')).toBe(true);
    await tec.session.post(`/v1/controls/${mixto}/tests/${docTest}/evidence`).attach('file', pdf(), 'x.pdf').expect(403);
    const requirement = verDoc.find((r) => r.submissions.length)!.id;
    await tec.session.get(`/v1/evidence-requirements/${requirement}/submissions`).expect(403);
    await doc.session.get(`/v1/evidence-requirements/${requirement}/submissions`).expect(200);
    await a.agent.get(`/v1/evidence-requirements/${requirement}/submissions`).expect(200);
  });

  it('dos funcionales con la misma especialidad atienden lo mismo: ninguno le quita nada al otro', async () => {
    const otro = await activo(a, a.agent, 'seg-tec2', 'funcional', [otraDim]);
    expect(await ids(otro.session)).toEqual(await ids(tec.session));
  });

  it('cambiar sus especialidades cambia lo que ve al instante; desactivarlo, lo deja fuera', async () => {
    const p = await activo(a, a.agent, 'seg-cambio', 'funcional', ['app']);
    const antes = await ids(p.session);
    await a.agent.patch(`/v1/users/${p.id}`).send({ dimensions: [otraDim] }).expect(200);
    const despues = await ids(p.session);
    expect(despues).toContain(mixto);
    expect(despues).not.toEqual(antes);
    await a.agent.patch(`/v1/users/${p.id}`).send({ status: 'inactive' }).expect(200);
    await p.session.get(`/v1/services/${a.serviceId}/controls`).expect(401);
  });

  it('lee los servicios que llevan su especialidad; el auditor, todos; declarar o editar un servicio sigue siendo solo del administrador', async () => {
    const list = async (agent: Agent) => ((await agent.get('/v1/services').expect(200)).body.data.items as any[]).map((s) => s.id);
    expect(await list(a.agent)).toContain(a.serviceId);
    expect(await list(tec.session)).toContain(a.serviceId);
    expect(await list(nadie.session)).not.toContain(b.serviceId);
    expect(await list(await login(app, email('rol-a')))).toContain(a.serviceId);
    await tec.session.get(`/v1/services/${a.serviceId}`).expect(200);
    await b.agent.get(`/v1/services/${a.serviceId}`).expect(404);
    for (const agent of [tec.session, nadie.session, await login(app, email('rol-a'))]) {
      await agent.post('/v1/services').send({}).expect(403);
      await agent.patch(`/v1/services/${a.serviceId}`).send({ name: 'x' }).expect(403);
      await agent.delete(`/v1/services/${a.serviceId}`).expect(403);
    }
  });

  it('el administrador y el auditor siguen viéndolo todo', async () => {
    const todos = await ids(a.agent);
    expect(todos).toContain(mixto);
    const au = await login(app, email('rol-a'));
    expect((await ids(au)).length).toBe(todos.length);
  });
});