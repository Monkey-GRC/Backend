import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { FileStorage } from '../../src/common/storage/file-storage';
import { bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';
import { StorageEnMemoria } from '../support/storage-en-memoria';
import { dosEmpresas, empresaConCupo, Tenant } from '../support/escenario';
import { asignarControl } from '../support/asignaciones';

// D102 · El equipo de la empresa (contracts/gestion-usuarios.md). Todo por HTTP real contra el Postgres desechable, con el rol de la app
// (sujeto a RLS): quien tiene permiso invita, la persona activa su cuenta y entra, y el administrador desactiva.
type Agent = Awaited<ReturnType<typeof login>>;
type Rol = 'admin_empresa' | 'responsable' | 'delegado' | 'auditor';
let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let adminId: string;
// Dos responsables activos de la empresa A con su equipo, y tres delegados repartidos entre los dos equipos.
let r1: { id: string; session: Agent };
let r2: { id: string; session: Agent };
let t1: string;
let t2: string;
const realInsert = auditInsert.insertAuditLog;
const email = (k: string) => `${k}-${RUN}@equipo.test`;
const fields = (res: { body: any }) => (res.body.error.fields as Array<{ field: string; code: string }>).map(({ field, code }) => ({ field, code }));
// Toda cuenta lleva nombre y apellido (D97); las pruebas que no hablan del nombre mandan uno cualquiera.
const invite = (agent: Agent, body: object) => agent.post('/v1/users').send({ name: 'Persona', last_name: 'De Prueba', ...body });
const delegado = (k: string, group_id: string | null, is_internal: boolean | null = true) => ({ email: email(k), role: 'delegado', group_id, is_internal });
const auditRows = (action: string) => owner<{ n: number }>('select count(*)::int n from audit.audit_logs where tenant_id = $1 and action = $2', [a.companyId, action]).then((r) => r[0].n);
const gruposDe = (companyId: string) => owner<{ n: number }>('select count(*)::int n from platform.user_groups where company_id = $1', [companyId]).then((r) => r[0].n);
const fila = (id: string) => owner<{ role: string; status: string; group_id: string | null; is_internal: boolean | null }>('select role::text, status::text, group_id, is_internal from platform.users where id = $1', [id]).then((r) => r[0]);

/** Invita a alguien, activa su cuenta (el código sale del reenvío: el alta ya no lo devuelve) y devuelve su sesión (MFA_REQUIRED=false en estas pruebas). */
const activo = (agent: Agent, k: string, role: Rol, group?: string) =>
  invitarYActivar(app, agent, { email: email(k), name: 'Persona', last_name: 'De Prueba', role, ...(role === 'delegado' ? { group_id: group, is_internal: true } : {}) });

beforeAll(async () => {
  app = await bootApp({}, (builder) => builder.overrideProvider(FileStorage).useValue(new StorageEnMemoria()));
  ({ a, b, monkey } = await dosEmpresas(app));
  adminId = (await owner<{ id: string }>('select id from platform.users where email = $1', [a.email]))[0].id;
  r1 = await activo(a.agent, 'r1', 'responsable');
  r2 = await activo(a.agent, 'r2', 'responsable');
  [t1, t2] = [await sembrarEquipo(a.companyId, r1.id), await sembrarEquipo(a.companyId, r2.id)];
  await invite(a.agent, delegado('d1', t1, true)).expect(201);
  await invite(a.agent, delegado('d2', t1, false)).expect(201);
  await invite(a.agent, delegado('d3', t2, true)).expect(201);
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Invitar a una persona del equipo', () => {
  it('nace pending, sin el código en la respuesta, con la invitación pendiente; con el código del reenvío activa su cuenta y entra', async () => {
    const res = await invite(a.agent, { email: email('ana'), role: 'auditor' }).expect(201);
    expect(res.body.message).toBe('Listo, creamos la cuenta. La invitación queda pendiente de envío.');
    expect(res.body.data).toMatchObject({
      email: email('ana'), name: 'Persona', last_name: 'De Prueba', role: 'auditor', status: 'pending', is_mfa_enabled: false, is_internal: null, group: null, last_login_at: null,
      invitation: { delivery_status: 'pending', expires_at: expect.any(String) },
    });
    expect(res.body.data).not.toHaveProperty('responsible');
    expect(JSON.stringify(res.body)).not.toMatch(/activation_code|MNK-|code_hash/);
    // Una cuenta pendiente no entra: se ve igual que una contraseña mala.
    await request(app.getHttpServer()).post('/v1/auth/login').send({ email: email('ana'), password: PASSWORD }).expect(401);
    const code = (await a.agent.post(`/v1/users/${res.body.data.id}/activation-code`).expect(201)).body.data.activation_code.code;
    const session = request.agent(app.getHttpServer());
    const act = await session.post('/v1/auth/activate').send({ code, email: email('ana'), password: PASSWORD }).expect(201);
    expect(act.body.data.user).toMatchObject({ email: email('ana'), role: 'auditor', status: 'active' });
    expect(act.body.data.company.id).toBe(a.companyId);
    await session.get('/v1/auth/me').expect(200);
  });

  it('la vigencia es la de ACTIVATION_CODE_TTL_HOURS (7 días por defecto) y en la base solo queda la huella del código', async () => {
    const res = await invite(a.agent, { email: email('vig'), role: 'auditor' }).expect(201);
    const days = (new Date(res.body.data.invitation.expires_at).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(6.99);
    expect(days).toBeLessThan(7.01);
    const rows = await owner<{ code_hash: string; status: string }>('select code_hash, status::text from platform.user_activation_codes where user_id = $1', [res.body.data.id]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: 'pending', code_hash: expect.stringMatching(/^[0-9a-f]{64}$/) });
  });

  it('el rol es uno de los cuatro; un correo mal escrito o un apellido de más de 100 caracteres es 422', async () => {
    expect(fields(await invite(a.agent, { email: email('x4'), role: 'admin_monkey' }).expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
    expect(fields(await invite(a.agent, { email: email('x5'), role: 'superadmin' }).expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
    expect(fields(await invite(a.agent, { email: 'no-es-correo', role: 'auditor' }).expect(422))).toEqual([{ field: 'email', code: 'email.invalid' }]);
    expect(fields(await invite(a.agent, { email: email('x6'), role: 'auditor', last_name: 'x'.repeat(101) }).expect(422))).toEqual([{ field: 'last_name', code: 'string.max' }]);
    expect(fields(await invite(a.agent, { email: email('x7'), role: 'responsable', group_id: 'no-es-uuid' }).expect(422))).toEqual([{ field: 'group_id', code: 'uuid.invalid' }]);
    expect(fields(await invite(a.agent, { email: email('x8'), role: 'delegado', group_id: t1, is_internal: 'si' }).expect(422))).toEqual([{ field: 'is_internal', code: 'boolean.invalid' }]);
  });

  it('toda cuenta lleva nombre y apellido: sin ellos es 422, y se guardan limpios', async () => {
    const sin = await a.agent.post('/v1/users').send({ email: email('sinnombre'), role: 'auditor' }).expect(422);
    expect(fields(sin)).toEqual(expect.arrayContaining([{ field: 'name', code: 'required' }, { field: 'last_name', code: 'required' }]));
    expect(fields(await a.agent.post('/v1/users').send({ email: email('vacio'), role: 'auditor', name: '   ', last_name: 'X' }).expect(422))).toEqual([{ field: 'name', code: 'required' }]);
    const res = await a.agent.post('/v1/users').send({ email: email('limpio'), role: 'auditor', name: '  Marta  ', last_name: ' Ruiz ' }).expect(201);
    expect(res.body.data).toMatchObject({ name: 'Marta', last_name: 'Ruiz' });
  });

  it('el administrador puede invitar a otro administrador (con nombre); este activa su cuenta y administra el equipo', async () => {
    const otro = await invitarYActivar(app, a.agent, { email: email('adm2'), name: 'Lucía', last_name: 'Gómez', role: 'admin_empresa' });
    expect(otro.data).toMatchObject({ role: 'admin_empresa', status: 'pending', name: 'Lucía', group: null, is_internal: null });
    // El nuevo administrador ya invita, y ningún delegado ni auditor lo puede hacer.
    await invite(otro.session as unknown as Agent, { email: email('adm2-invita'), role: 'auditor' }).expect(201);
    expect((await a.agent.get('/v1/users?role=admin_empresa&page_size=100').expect(200)).body.data.items.map((i: any) => i.email)).toEqual(expect.arrayContaining([a.email, email('adm2')]));
  });

  describe('responsable', () => {
    it('nace solo en el grupo «Responsables» (que se crea una vez, liderado por el administrador que crea) y sin equipo de delegados (D104)', async () => {
      const grupos = await owner<{ id: string; leader_id: string }>(`select id, leader_id from platform.user_groups where company_id = $1 and name = 'Responsables'`, [a.companyId]);
      expect(grupos).toHaveLength(1); // r1 y r2 se crearon en el beforeAll
      expect(grupos[0].leader_id).toBe(adminId);
      const antes = await gruposDe(a.companyId);
      const res = (await invite(a.agent, { email: email('resp-nuevo'), name: 'Nora', last_name: 'Vega', role: 'responsable' }).expect(201)).body.data;
      expect(res).toMatchObject({ role: 'responsable', status: 'pending', is_internal: null, group: { id: grupos[0].id, name: 'Responsables' } });
      expect(res).not.toHaveProperty('responsible');
      expect(await fila(res.id)).toMatchObject({ group_id: grupos[0].id, is_internal: null });
      expect(await owner('select 1 from platform.user_groups where leader_id = $1', [res.id])).toHaveLength(0);
      expect(await gruposDe(a.companyId)).toBe(antes);
    });

    it('un responsable sin equipo no puede crear delegados: 409 RESPONSIBLE_HAS_NO_TEAM; con un group_id (que no puede ser el suyo) sigue siendo 403', async () => {
      const sin = await activo(a.agent, 'sin-equipo', 'responsable');
      const res = await invite(sin.session, delegado('sin-eq-d', null, true)).expect(409);
      expect(res.body.error.code).toBe('RESPONSIBLE_HAS_NO_TEAM');
      expect(res.body.message).toBe('Ese responsable aún no tiene un equipo de delegados. Crea el equipo primero y vuelve a invitar a la persona.');
      await invite(sin.session, delegado('sin-eq-d', t1, true)).expect(403);
      expect(await owner('select 1 from platform.users where email = $1', [email('sin-eq-d')])).toHaveLength(0);
      // En cuanto tiene equipo, puede.
      await sembrarEquipo(a.companyId, sin.id);
      await invite(sin.session, delegado('sin-eq-d', null, true)).expect(201);
    });

    it('si el nombre «Responsables» lo tiene un grupo que no lidera un administrador no se reutiliza: 409 RESPONSIBLES_GROUP_INVALID y no se crea nada; eligiendo otro grupo de responsables sí', async () => {
      const e = await empresaConCupo(app, monkey, 'Reservado', 10);
      const [admin] = await owner<{ id: string }>('select id from platform.users where email = $1', [e.email]);
      const [otro] = await owner<{ id: string }>(`insert into platform.user_groups (id, company_id, name, leader_id) values (gen_random_uuid(), $1, 'Responsables - IA', $2) returning id`, [e.companyId, admin.id]);
      const lider = await invitarYActivar(app, e.agent, { email: email('res-lider'), name: 'L', last_name: 'L', role: 'responsable', group_id: otro.id });
      await sembrarEquipo(e.companyId, lider.id, 'Responsables'); // lo lidera un responsable
      const grupos = await gruposDe(e.companyId);
      const res = await invite(e.agent, { email: email('res-nuevo'), role: 'responsable' }).expect(409);
      expect(res.body.error.code).toBe('RESPONSIBLES_GROUP_INVALID');
      expect(await owner('select 1 from platform.users where email = $1', [email('res-nuevo')])).toHaveLength(0);
      expect(await gruposDe(e.companyId)).toBe(grupos);
      await invite(e.agent, { email: email('res-nuevo'), role: 'responsable', group_id: otro.id }).expect(201);
    });

    it('dos responsables creados a la vez en una empresa sin «Responsables» dejan un solo grupo', async () => {
      const e = await empresaConCupo(app, monkey, 'Carrera', 10);
      const [x, y] = await Promise.all([
        invite(e.agent, { email: email('carrera-1'), role: 'responsable' }),
        invite(e.agent, { email: email('carrera-2'), role: 'responsable' }),
      ]);
      expect([x.status, y.status]).toEqual([201, 201]);
      expect(await gruposDe(e.companyId)).toBe(1);
      expect(x.body.data.group.id).toBe(y.body.data.group.id);
    });

    it('el nombre admite hasta 100 caracteres; con más es 422 y no crea nada', async () => {
      await invite(a.agent, { email: email('nombre-ok'), role: 'responsable', name: 'x'.repeat(100) }).expect(201);
      expect(fields(await invite(a.agent, { email: email('nombre-largo'), role: 'responsable', name: 'x'.repeat(101) }).expect(422))).toEqual([{ field: 'name', code: 'string.max' }]);
      expect(await owner('select 1 from platform.users where email = $1', [email('nombre-largo')])).toHaveLength(0);
    });

    it('si hay empresa sin grupo «Responsables», el primer responsable lo crea y lo lidera quien lo crea', async () => {
      const e = await empresaConCupo(app, monkey, 'SinGrupo', 10);
      expect(await gruposDe(e.companyId)).toBe(0);
      const res = (await invite(e.agent, { email: email('sg-resp'), role: 'responsable' }).expect(201)).body.data;
      expect(res.group.name).toBe('Responsables');
      const [g] = await owner<{ leader_id: string }>('select leader_id from platform.user_groups where id = $1', [res.group.id]);
      const [admin] = await owner<{ id: string }>('select id from platform.users where email = $1', [e.email]);
      expect(g.leader_id).toBe(admin.id);
      expect(await gruposDe(e.companyId)).toBe(1); // solo «Responsables»: el equipo del nuevo no nace con él
    });

    it('con group_id va a ese grupo de responsables del administrador; uno que no existe, de otra empresa o que no es de responsables es 404', async () => {
      const [g] = await owner<{ id: string }>(`insert into platform.user_groups (id, company_id, name, leader_id) values (gen_random_uuid(), $1, 'Responsables - IA', $2) returning id`, [a.companyId, adminId]);
      const res = (await invite(a.agent, { email: email('resp-ia'), role: 'responsable', group_id: g.id }).expect(201)).body.data;
      expect(res.group).toEqual({ id: g.id, name: 'Responsables - IA' });
      const ajeno = (await owner<{ id: string }>('select id from platform.user_groups where company_id = $1 limit 1', [b.companyId]))[0]?.id;
      const candidatos = ['00000000-0000-4000-8000-000000000000', t1, ...(ajeno ? [ajeno] : [])]; // t1 es el equipo de un responsable, no un grupo de responsables
      for (const group_id of candidatos) await invite(a.agent, { email: email('resp-mal'), role: 'responsable', group_id }).expect(404);
      expect(await owner('select 1 from platform.users where email = $1', [email('resp-mal')])).toHaveLength(0);
    });
  });

  describe('delegado (lo crea el administrador)', () => {
    it('queda en el equipo que se elige, con su responsable y la marca interno/externo tal cual', async () => {
      const ext = (await invite(a.agent, delegado('del-ext', t1, false)).expect(201)).body.data;
      expect(ext).toMatchObject({ role: 'delegado', status: 'pending', is_internal: false, group: { id: t1, name: expect.stringMatching(/^Equipo /) }, responsible: { id: r1.id, name: 'Persona', last_name: 'De Prueba' } });
      const int = (await invite(a.agent, delegado('del-int', t2, true)).expect(201)).body.data;
      expect(int).toMatchObject({ is_internal: true, group: { id: t2 }, responsible: { id: r2.id } });
      expect(await fila(ext.id)).toMatchObject({ role: 'delegado', status: 'pending', group_id: t1, is_internal: false });
      expect(await fila(int.id)).toMatchObject({ group_id: t2, is_internal: true });
    });

    it('group_id e is_internal son obligatorios: sin ellos es 422 con los dos campos', async () => {
      expect(fields(await invite(a.agent, { email: email('del-sin'), role: 'delegado' }).expect(422))).toEqual(expect.arrayContaining([{ field: 'group_id', code: 'required' }, { field: 'is_internal', code: 'required' }]));
      expect(fields(await invite(a.agent, delegado('del-sin', t1, null)).expect(422))).toEqual([{ field: 'is_internal', code: 'required' }]);
      expect(fields(await invite(a.agent, delegado('del-sin', null, true)).expect(422))).toEqual([{ field: 'group_id', code: 'required' }]);
      expect(await owner('select 1 from platform.users where email = $1', [email('del-sin')])).toHaveLength(0);
    });

    it('el grupo debe ser el equipo de un responsable activo o pendiente de la empresa: inexistente, de otra empresa, de responsables o de un responsable inactivo es 404', async () => {
      const [gAdmin] = await owner<{ id: string }>(`insert into platform.user_groups (id, company_id, name, leader_id) values (gen_random_uuid(), $1, 'Responsables - Otro', $2) returning id`, [a.companyId, adminId]);
      const baja = await activo(a.agent, 'r-baja', 'responsable');
      const tBaja = await sembrarEquipo(a.companyId, baja.id);
      await a.agent.patch(`/v1/users/${baja.id}`).send({ status: 'inactive' }).expect(200);
      const tAjeno = await sembrarEquipo(b.companyId, (await invite(b.agent, { email: email('b-resp'), role: 'responsable' }).expect(201)).body.data.id);
      for (const group_id of ['00000000-0000-4000-8000-000000000000', gAdmin.id, tBaja, tAjeno]) {
        await invite(a.agent, delegado('del-mal', group_id)).expect(404);
      }
      expect(await owner('select 1 from platform.users where email = $1', [email('del-mal')])).toHaveLength(0);
    });
  });

  describe('campos que un rol no admite', () => {
    it('admin_empresa y auditor no llevan grupo ni is_internal; el responsable no lleva is_internal: 422 not_allowed', async () => {
      for (const role of ['admin_empresa', 'auditor']) {
        expect(fields(await invite(a.agent, { email: email('na'), role, group_id: t1 }).expect(422))).toEqual([{ field: 'group_id', code: 'group_id.not_allowed' }]);
        expect(fields(await invite(a.agent, { email: email('na'), role, is_internal: true }).expect(422))).toEqual([{ field: 'is_internal', code: 'is_internal.not_allowed' }]);
        expect(fields(await invite(a.agent, { email: email('na'), role, group_id: t1, is_internal: false }).expect(422))).toEqual(
          expect.arrayContaining([{ field: 'group_id', code: 'group_id.not_allowed' }, { field: 'is_internal', code: 'is_internal.not_allowed' }]),
        );
      }
      const res = await invite(a.agent, { email: email('na'), role: 'responsable', is_internal: true }).expect(422);
      expect(fields(res)).toEqual([{ field: 'is_internal', code: 'is_internal.not_allowed' }]);
      expect(res.body.error.fields[0].message).toBe('Solo un delegado se marca como interno o externo.');
      expect(await owner('select 1 from platform.users where email = $1', [email('na')])).toHaveLength(0);
    });
  });

  describe('lo que crea un responsable', () => {
    it('un delegado en su equipo: sin group_id o con el suyo; la cuenta nace pending y su responsable es quien la crea', async () => {
      const sin = (await invite(r1.session, delegado('r1-sin', null, false)).expect(201)).body.data;
      expect(sin).toMatchObject({ role: 'delegado', status: 'pending', is_internal: false, group: { id: t1 }, responsible: { id: r1.id } });
      const con = (await invite(r1.session, delegado('r1-con', t1, true)).expect(201)).body.data;
      expect(con).toMatchObject({ is_internal: true, group: { id: t1 }, responsible: { id: r1.id } });
      expect(await fila(sin.id)).toMatchObject({ group_id: t1, is_internal: false, status: 'pending' });
    });

    it('is_internal es obligatorio también aquí (422), y el correo repetido es 409', async () => {
      expect(fields(await invite(r1.session, { email: email('r1-int'), role: 'delegado' }).expect(422))).toEqual([{ field: 'is_internal', code: 'required' }]);
      expect((await invite(r1.session, delegado('r1-sin', null, true)).expect(409)).body.error.code).toBe('EMAIL_TAKEN');
    });

    it('con el equipo de otro responsable, de otra empresa o inexistente es 403 FORBIDDEN y no crea nada', async () => {
      const ajeno = await sembrarEquipo(b.companyId, (await invite(b.agent, { email: email('b-resp2'), role: 'responsable' }).expect(201)).body.data.id);
      const [gAdmin] = await owner<{ id: string }>(`select id from platform.user_groups where company_id = $1 and name = 'Responsables'`, [a.companyId]);
      for (const group_id of [t2, ajeno, gAdmin.id, '00000000-0000-4000-8000-000000000000']) {
        await invite(r1.session, delegado('r1-mal', group_id)).expect(403);
      }
      expect(await owner('select 1 from platform.users where email = $1', [email('r1-mal')])).toHaveLength(0);
    });

    it('solo delegados: crear responsable, auditor o administrador es 403, aunque el cuerpo sea válido', async () => {
      for (const role of ['responsable', 'auditor', 'admin_empresa']) {
        const res = await invite(r1.session, { email: email('r1-rol'), role }).expect(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      }
      expect(await owner('select 1 from platform.users where email = $1', [email('r1-rol')])).toHaveLength(0);
    });
  });

  it('un correo que ya existe se rechaza con su mensaje y no crea nada, tampoco un grupo', async () => {
    await invite(a.agent, { email: email('yaexiste'), role: 'auditor' }).expect(201);
    const antes = await gruposDe(a.companyId);
    const dup = await invite(a.agent, { email: email('yaexiste'), role: 'responsable' }).expect(409);
    expect(dup.body.error.code).toBe('EMAIL_TAKEN');
    expect((await owner('select 1 from platform.users where email = $1', [email('yaexiste')])).length).toBe(1);
    expect(await gruposDe(a.companyId)).toBe(antes);
  });

  it('el correo es único en toda la plataforma, también frente a otra empresa; y se guarda en minúsculas', async () => {
    await invite(a.agent, { email: email('dup').toUpperCase(), role: 'auditor' }).expect(201);
    expect((await invite(a.agent, { email: email('dup'), role: 'auditor' }).expect(409)).body.error.code).toBe('EMAIL_TAKEN');
    expect((await invite(b.agent, { email: email('dup'), role: 'auditor' }).expect(409)).body.error.code).toBe('EMAIL_TAKEN');
    expect((await owner<{ email: string }>('select email from platform.users where email = $1', [email('dup')])).length).toBe(1);
  });

  it('con el cupo lleno el responsable no se crea y tampoco el grupo «Responsables» (409 USER_LIMIT_REACHED)', async () => {
    const e = await empresaConCupo(app, monkey, 'CupoEq', 2);
    await invite(e.agent, { email: email('cq-a'), role: 'auditor' }).expect(201); // el administrador + 1 = lleno
    const res = await invite(e.agent, { email: email('cq-r'), role: 'responsable' }).expect(409);
    expect(res.body.error).toMatchObject({ code: 'USER_LIMIT_REACHED', max_users: 2, users_count: 2 });
    expect(await gruposDe(e.companyId)).toBe(0);
  });

  it('un responsable que crea un delegado también cuenta para el cupo', async () => {
    const e = await empresaConCupo(app, monkey, 'CupoDel', 3);
    const resp = await invitarYActivar(app, e.agent, { email: email('cd-r'), name: 'R', last_name: 'R', role: 'responsable' }); // 2 de 3
    await sembrarEquipo(e.companyId, resp.id);
    await invite(resp.session as unknown as Agent, delegado('cd-d1', null, true)).expect(201); // 3 de 3
    const res = await invite(resp.session as unknown as Agent, delegado('cd-d2', null, true)).expect(409);
    expect(res.body.error).toMatchObject({ code: 'USER_LIMIT_REACHED', max_users: 3, users_count: 3 });
  });

  it('quién puede crear: admin_empresa cualquier rol; delegado, auditor y admin_monkey reciben 403 con cualquier cuerpo, y también al listar', async () => {
    const d = await activo(a.agent, 'rol-d', 'delegado', t1);
    const au = await activo(a.agent, 'rol-a', 'auditor');
    for (const agent of [d.session, au.session, monkey]) {
      await invite(agent, { email: email('z'), role: 'auditor' }).expect(403);
      await invite(agent, delegado('z', t1, true)).expect(403);
      await agent.get('/v1/users').expect(403);
      await agent.get(`/v1/users?group_id=${t1}`).expect(403);
    }
    // Lo demás sigue siendo del administrador: el responsable no edita, no desactiva ni reemite.
    for (const agent of [r1.session, d.session, au.session, monkey]) {
      await agent.patch(`/v1/users/${d.id}`).send({ status: 'inactive' }).expect(403);
      await agent.post(`/v1/users/${d.id}/activation-code`).expect(403);
    }
    await request(app.getHttpServer()).post('/v1/users').send({ email: email('z'), name: 'Z', last_name: 'Z', role: 'auditor' }).expect(401);
    expect(await owner('select 1 from platform.users where email = $1', [email('z')])).toHaveLength(0);
  });

  describe('auditoría y secretos', () => {
    it('deja user.create con quien creó (el administrador o el responsable), el grupo y la marca, sin el código ni su huella', async () => {
      const before = await auditRows('user.create');
      const res = await invite(a.agent, delegado('aud', t1, false)).expect(201);
      expect(await auditRows('user.create')).toBe(before + 1);
      const [row] = await owner<{ user_id: string; tenant_id: string; resource: string; before_state: unknown; after_state: unknown }>(
        `select user_id, tenant_id, resource, before_state, after_state from audit.audit_logs where tenant_id = $1 and action = 'user.create' order by created_at desc limit 1`,
        [a.companyId],
      );
      expect(row).toMatchObject({ user_id: adminId, tenant_id: a.companyId, resource: 'user', before_state: null });
      expect(row.after_state).toMatchObject({ id: res.body.data.id, email: email('aud'), role: 'delegado', status: 'pending', group_id: t1, is_internal: false });

      const porResponsable = await invite(r1.session, delegado('aud-r', null, true)).expect(201);
      const [row2] = await owner<{ user_id: string; after_state: unknown }>(`select user_id, after_state from audit.audit_logs where tenant_id = $1 and action = 'user.create' order by created_at desc limit 1`, [a.companyId]);
      expect(row2.user_id).toBe(r1.id);
      expect(row2.after_state).toMatchObject({ id: porResponsable.body.data.id, group_id: t1 });

      // El código nace y se guarda como huella, pero ni la huella ni el código aparecen en la respuesta ni en ninguna fila de auditoría.
      const [{ code_hash }] = await owner<{ code_hash: string }>('select code_hash from platform.user_activation_codes where user_id = $1', [res.body.data.id]);
      expect(JSON.stringify(res.body)).not.toContain(code_hash);
      const rastros = await owner<{ n: number }>(`select count(*)::int n from audit.audit_logs where tenant_id = $1 and (before_state::text like $2 or after_state::text like $2 or after_state::text ~ 'MNK-')`, [a.companyId, `%${code_hash}%`]);
      expect(rastros[0].n).toBe(0);
    });

    it('si el rastro falla, todo se revierte: ni usuario, ni código, ni grupo', async () => {
      jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
        await realInsert(db, entry);
        throw new Error('audit_down');
      });
      const antes = await gruposDe(a.companyId);
      await invite(a.agent, { email: email('rev'), name: 'Rev', role: 'responsable' }).expect(500);
      expect(await owner('select 1 from platform.users where email = $1', [email('rev')])).toHaveLength(0);
      expect(await gruposDe(a.companyId)).toBe(antes);
    });
  });
});

describe('Listar el equipo', () => {
  beforeAll(async () => {
    await invite(a.agent, { email: email('lst1'), role: 'auditor' }).expect(201);
    await invite(b.agent, { email: email('otra'), role: 'auditor' }).expect(201);
  });
  const mails = (res: { body: any }) => (res.body.data.items as any[]).map((i) => i.email);

  it('el administrador ve a toda la empresa, incluido él, con la forma del contrato y sin el código ni lo de otra empresa', async () => {
    const res = (await a.agent.get('/v1/users?page_size=100').expect(200)).body;
    expect(res.message).toBe('Equipo de tu empresa.');
    expect(res.data).toMatchObject({ page: 1, page_size: 100, total_pages: 1 });
    expect(mails({ body: res })).toEqual(expect.arrayContaining([a.email, email('lst1'), email('r1'), email('d1'), email('d3')]));
    expect(mails({ body: res })).not.toContain(email('otra'));
    expect(JSON.stringify(res)).not.toMatch(/activation_code|invitation|password|mfa_secret|code_hash|MNK-/);
    const items = res.data.items as any[];
    expect(items.find((i) => i.email === a.email)).toMatchObject({ role: 'admin_empresa', status: 'active', group: null, is_internal: null });
    expect(items.find((i) => i.email === email('r1'))).toMatchObject({ role: 'responsable', is_internal: null, group: { name: 'Responsables' } });
    expect(items.find((i) => i.email === email('r1'))).not.toHaveProperty('responsible');
    expect(items.find((i) => i.email === email('d2'))).toMatchObject({ role: 'delegado', is_internal: false, group: { id: t1 }, responsible: { id: r1.id } });
  });

  it('filtra por rol, estado, grupo e interno, ordena y pagina; un valor fuera de las opciones es 422', async () => {
    const responsables = (await a.agent.get('/v1/users?role=responsable&status=active&page_size=100').expect(200)).body.data.items;
    expect(responsables.length).toBeGreaterThanOrEqual(2);
    expect(responsables.every((i: any) => i.role === 'responsable' && i.status === 'active')).toBe(true);
    expect(mails(await a.agent.get('/v1/users?role=delegado&status=pending&page_size=100').expect(200))).toEqual(expect.arrayContaining([email('d1'), email('d2'), email('d3')]));
    expect(mails(await a.agent.get(`/v1/users?group_id=${t1}&page_size=100`).expect(200)).sort()).toEqual(expect.arrayContaining([email('d1'), email('d2')]));
    expect(mails(await a.agent.get(`/v1/users?group_id=${t1}&page_size=100`).expect(200))).not.toContain(email('d3'));
    const externos = (await a.agent.get('/v1/users?is_internal=false&page_size=100').expect(200)).body.data.items;
    expect(externos.length).toBeGreaterThan(0);
    expect(externos.every((i: any) => i.role === 'delegado' && i.is_internal === false)).toBe(true);
    expect((await a.agent.get('/v1/users?is_internal=true&page_size=100').expect(200)).body.data.items.every((i: any) => i.is_internal === true)).toBe(true);
    const asc = mails(await a.agent.get('/v1/users?sort=email&page_size=100').expect(200));
    const enBase = await owner<{ email: string }>('select email from platform.users where company_id = $1 order by email', [a.companyId]);
    expect(asc).toEqual(enBase.map((r) => r.email));
    const desc = mails(await a.agent.get('/v1/users?sort=-email&page_size=100').expect(200));
    expect(desc).toEqual([...asc].reverse());
    expect((await a.agent.get('/v1/users?page=2&page_size=1').expect(200)).body.data.items).toHaveLength(1);
    expect(fields(await a.agent.get('/v1/users?role=superadmin').expect(422))).toEqual([{ field: 'role', code: 'enum.invalid' }]);
    expect(fields(await a.agent.get('/v1/users?group_id=x').expect(422))).toEqual([{ field: 'group_id', code: 'uuid.invalid' }]);
    expect(fields(await a.agent.get('/v1/users?is_internal=quizas').expect(422))).toEqual([{ field: 'is_internal', code: 'boolean.invalid' }]);
    expect(fields(await a.agent.get('/v1/users?sort=name').expect(422))).toEqual([{ field: 'sort', code: 'enum.invalid' }]);
  });

  it('el responsable ve solo su equipo; un group_id ajeno no lo amplía, y los filtros se suman al suyo', async () => {
    const propio = mails(await r1.session.get('/v1/users?page_size=100').expect(200));
    expect(propio).toEqual(expect.arrayContaining([email('d1'), email('d2')]));
    for (const ajeno of [a.email, email('r1'), email('r2'), email('d3'), email('lst1'), email('otra')]) expect(propio).not.toContain(ajeno);
    expect(mails(await r1.session.get(`/v1/users?group_id=${t1}&page_size=100`).expect(200)).sort()).toEqual(propio.sort());
    expect(mails(await r1.session.get(`/v1/users?group_id=${t2}&page_size=100`).expect(200))).toEqual([]);
    const [gAdmin] = await owner<{ id: string }>(`select id from platform.user_groups where company_id = $1 and name = 'Responsables'`, [a.companyId]);
    expect(mails(await r1.session.get(`/v1/users?group_id=${gAdmin.id}&page_size=100`).expect(200))).toEqual([]);
    const externos = await r1.session.get('/v1/users?is_internal=false&page_size=100').expect(200);
    expect(mails(externos)).toContain(email('d2'));
    expect(mails(externos)).not.toContain(email('d1'));
    expect((externos.body.data.items as any[]).every((i) => i.is_internal === false && i.group.id === t1)).toBe(true);
    expect(mails(await r1.session.get('/v1/users?role=responsable&page_size=100').expect(200))).toEqual([]);
    const otro = mails(await r2.session.get('/v1/users?page_size=100').expect(200));
    expect(otro).toContain(email('d3'));
    expect(otro).not.toContain(email('d1'));
    // el delegado que crea un responsable aparece de inmediato en su lista
    await invite(r1.session, delegado('lst-r1', null, true)).expect(201);
    expect(mails(await r1.session.get('/v1/users?page_size=100').expect(200))).toContain(email('lst-r1'));
  });

  it('una empresa no ve a la otra, ni su equipo, ni sus grupos', async () => {
    const delB = (await invite(b.agent, { email: email('b-resp-l'), role: 'responsable' }).expect(201)).body.data;
    expect(mails(await a.agent.get('/v1/users?page_size=100').expect(200))).not.toContain(email('b-resp-l'));
    expect(mails(await b.agent.get('/v1/users?page_size=100').expect(200))).toEqual(expect.arrayContaining([b.email, email('b-resp-l')]));
    expect(mails(await a.agent.get(`/v1/users?group_id=${delB.group.id}&page_size=100`).expect(200))).toEqual([]);
  });
});

describe('Editar, desactivar y reactivar', () => {
  it('desactivar cierra sus sesiones al instante, deja el rastro, y reactivar le devuelve el acceso', async () => {
    const p = await activo(a.agent, 'des', 'responsable');
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
    const f = (await activo(a.agent, 'esp', 'responsable')).id;
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
    const otro = await activo(a.agent, 'adm-baja', 'admin_empresa');
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
    const f = await activo(a.agent, 'nom-f', 'responsable');
    await f.session.patch(`/v1/users/${f.id}`).send({ name: 'Yo' }).expect(403);
  });
});

describe('Reemitir el código de activación', () => {
  it('revoca el anterior, el nuevo sí activa, y una cuenta ya activa no lo necesita (409 USER_ALREADY_ACTIVE)', async () => {
    const first = (await invite(a.agent, { email: email('reem'), role: 'auditor' }).expect(201)).body.data;
    const one = (await a.agent.post(`/v1/users/${first.id}/activation-code`).expect(201)).body.data;
    const second = (await a.agent.post(`/v1/users/${first.id}/activation-code`).expect(201)).body.data;
    expect(second.id).toBe(first.id);
    expect(second.activation_code.code).not.toBe(one.activation_code.code);
    expect((await request(app.getHttpServer()).post('/v1/auth/activate').send({ code: one.activation_code.code, email: email('reem'), password: PASSWORD }).expect(404)).body.error.code).toBe('ACTIVATION_CODE_INVALID');
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
    const dueño = await activo(a.agent, 'vis-resp', 'responsable');
    const ejecutor = await activo(a.agent, 'vis-del', 'delegado', await sembrarEquipo(a.companyId, dueño.id));
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
    const responsable = await activo(a.agent, 'vis-403r', 'responsable');
    const ejecutor = await activo(a.agent, 'vis-403', 'delegado', await sembrarEquipo(a.companyId, responsable.id));
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
    for (const ruta of cerradas) expect({ ruta, status: (await ejecutor.session.get(ruta)).status }).toEqual({ ruta, status: 403 });
    // El mismo recorrido con el responsable no se cierra por el rol: puede dar 200 o 404 según el recurso, pero nunca 403 por ser responsable.
    for (const ruta of [`/v1/services/${a.serviceId}/compliance-overview`, `/v1/services/${a.serviceId}/risks`, '/v1/services']) {
      expect({ ruta, status: (await responsable.session.get(ruta)).status }).toEqual({ ruta, status: 200 });
    }
  });
});

describe('Grupo y responsable en el perfil (D104)', () => {
  it('el delegado ve su grupo y a su responsable en /auth/me, en el login y al activar; los demás roles solo su grupo o nada', async () => {
    const d = await activo(a.agent, 'perfil-d', 'delegado', t1);
    const me = (await d.session.get('/v1/auth/me').expect(200)).body.data.user;
    expect(me).toMatchObject({ role: 'delegado', group: { id: t1, name: expect.any(String) }, responsible: { id: r1.id, name: 'Persona', last_name: 'De Prueba' } });
    const login = (await request(app.getHttpServer()).post('/v1/auth/login').send({ email: email('perfil-d'), password: PASSWORD }).expect(200)).body.data.user;
    expect(login.responsible).toEqual({ id: r1.id, name: 'Persona', last_name: 'De Prueba' });
    expect(login.group.id).toBe(t1);

    const resp = (await r1.session.get('/v1/auth/me').expect(200)).body.data.user;
    expect(resp).toMatchObject({ role: 'responsable', group: { name: 'Responsables' } });
    expect(resp).not.toHaveProperty('responsible');

    const admin = (await a.agent.get('/v1/auth/me').expect(200)).body.data.user;
    expect(admin.group).toBeNull();
    expect(admin).not.toHaveProperty('responsible');
    const au = await activo(a.agent, 'perfil-a', 'auditor');
    expect((await au.session.get('/v1/auth/me').expect(200)).body.data.user.group).toBeNull();
    expect((await monkey.get('/v1/auth/me').expect(200)).body.data.user.group).toBeNull();
  });
});
