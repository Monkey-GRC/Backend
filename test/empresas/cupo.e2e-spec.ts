import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as auditInsert from '../../src/infrastructure/audit/audit-log.insert';
import { Agent, bootApp, login, owner, PASSWORD, RUN, seedAdminMonkey } from '../support/app';
import { claveEnviadaA } from '../support/correo-en-memoria';
import { empresaConCupo } from '../support/escenario';
import { invitarYActivar, sembrarEquipo } from '../support/equipo';

// D103 · SEG-72 · El cupo de usuarios de una empresa (contracts/empresas.md): lo fija y lo cambia SOLO admin_monkey, nunca por debajo de las cuentas que ya cuentan
// (activas, pendientes y suspendidas, de cualquier rol), y deja su rastro. Todo por HTTP real contra el Postgres desechable, con el rol de la app (sujeto a RLS).
let app: INestApplication;
let monkey: Agent;
const realInsert = auditInsert.insertAuditLog;
const correo = (k: string) => `${k}-${RUN}@cupo.test`;
const CUENTAN = `('active', 'pending', 'suspended')`;
const contadas = (companyId: string) => owner<{ n: number }>(`select count(*)::int n from platform.users where company_id = $1 and status in ${CUENTAN}`, [companyId]).then((r) => r[0].n);
const cupoDe = (companyId: string) => owner<{ max_users: number | null }>('select max_users from platform.companies where id = $1', [companyId]).then((r) => r[0].max_users);

/** Invita a alguien con el rol dado, activa su cuenta y devuelve su id y su sesión. Un delegado va al equipo `equipo`. */
async function activo(admin: Agent, k: string, role: 'responsable' | 'delegado' | 'auditor', equipo?: string): Promise<{ id: string; session: Agent }> {
  const extra = role === 'delegado' ? { group_id: equipo, is_internal: true } : {};
  return invitarYActivar(app, admin, { email: correo(k), name: 'Persona', last_name: 'De Prueba', role, ...extra });
}

beforeAll(async () => {
  app = await bootApp();
  monkey = await login(app, (await seedAdminMonkey()).email);
});
afterAll(async () => {
  await app?.close();
});
afterEach(() => jest.restoreAllMocks());

describe('Registrar una empresa con su cupo', () => {
  const body = (k: string, extra: object = {}) => ({ name: `Empresa ${k} ${RUN}`, requires_dedicated_database: false, admin_email: correo(`reg-${k}`), framework_codes: ['soc2'], ...extra });

  it('max_users es obligatorio, entero y >= 1: sin él, en 0, negativo, decimal o texto es 422 y no se crea nada', async () => {
    for (const [k, extra] of [['falta', {}], ['cero', { max_users: 0 }], ['neg', { max_users: -3 }], ['dec', { max_users: 2.5 }], ['txt', { max_users: '10' }]] as Array<[string, object]>) {
      const res = await monkey.post('/v1/companies').send(body(k, extra)).expect(422);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      expect((res.body.error.fields as Array<{ field: string }>).map((f) => f.field)).toContain('max_users');
    }
    expect(await owner('select 1 from platform.companies where admin_email like $1', [`reg-%-${RUN}@cupo.test`])).toHaveLength(0);
  });

  it('con un cupo válido se crea, y la respuesta trae max_users y users_count = 0', async () => {
    const res = await monkey.post('/v1/companies').send(body('ok', { max_users: 5 })).expect(201);
    expect(res.body.data).toMatchObject({ max_users: 5, users_count: 0 });
    expect(await cupoDe(res.body.data.id)).toBe(5);
  });
});

describe('Ver el cupo y el uso', () => {
  it('el detalle y el listado traen max_users y users_count (lo que cuenta: active, pending y suspended; inactive no)', async () => {
    const e = await empresaConCupo(app, monkey, 'Ver', 10);
    const detalle = async () => (await monkey.get(`/v1/companies/${e.companyId}`).expect(200)).body.data;
    const enLista = async () => (await monkey.get('/v1/companies?page_size=100').expect(200)).body.data.items.find((c: { id: string }) => c.id === e.companyId);

    expect(await detalle()).toMatchObject({ max_users: 10, users_count: 1 }); // solo el administrador
    await e.agent.post('/v1/users').send({ email: correo('ver-p'), name: 'P', last_name: 'P', role: 'auditor' }).expect(201); // pending: cuenta
    expect(await detalle()).toMatchObject({ max_users: 10, users_count: 2 });
    expect(await enLista()).toMatchObject({ max_users: 10, users_count: 2 });

    await owner(`update platform.users set status = 'suspended' where email = $1`, [correo('ver-p')]);
    expect((await detalle()).users_count).toBe(2); // suspended: cuenta
    await owner(`update platform.users set status = 'inactive' where email = $1`, [correo('ver-p')]);
    expect((await detalle()).users_count).toBe(1); // inactive: no cuenta, libera el cupo
  });

  it('una empresa anterior al cupo (NULL) lo muestra como null, y cuenta igual', async () => {
    const e = await empresaConCupo(app, monkey, 'Nulo', null);
    expect((await monkey.get(`/v1/companies/${e.companyId}`).expect(200)).body.data).toMatchObject({ max_users: null, users_count: 1 });
  });
});

describe('PATCH /v1/companies/{id}/max-users', () => {
  it('solo admin_monkey: un admin_empresa, un responsable, un delegado y un auditor reciben 403 y el cupo no cambia; sin sesión es 401', async () => {
    const e = await empresaConCupo(app, monkey, 'Roles', 10);
    const responsable = await activo(e.agent, 'roles-r', 'responsable');
    const sesiones = {
      admin_empresa: e.agent,
      responsable: responsable.session,
      delegado: (await activo(e.agent, 'roles-d', 'delegado', await sembrarEquipo(e.companyId, responsable.id))).session,
      auditor: (await activo(e.agent, 'roles-a', 'auditor')).session,
    };
    for (const [rol, sesion] of Object.entries(sesiones)) {
      const res = await sesion.patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 99 });
      expect({ rol, status: res.status }).toEqual({ rol, status: 403 });
    }
    await request(app.getHttpServer()).patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 99 }).expect(401);
    expect(await cupoDe(e.companyId)).toBe(10);
  });

  it('admin_monkey lo cambia (sube y baja) mientras no quede por debajo de las cuentas que cuentan; responde con la empresa', async () => {
    const e = await empresaConCupo(app, monkey, 'Cambia', 10);
    const subir = await monkey.patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 25 }).expect(200);
    expect(subir.body.message).toBe('Cupo de usuarios actualizado.'); // la API ya devuelve el texto traducido (es por defecto)
    expect(subir.body.data).toMatchObject({ id: e.companyId, max_users: 25, users_count: 1 });
    await monkey.patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 1 }).expect(200); // igual a lo que ya cuenta: se permite
    expect(await cupoDe(e.companyId)).toBe(1);
  });

  it('por debajo de las cuentas que ya cuentan es 409 MAX_USERS_BELOW_CURRENT con los dos números, y el cupo no cambia (lo cuenta bien aunque admin_monkey no sea de esa empresa)', async () => {
    const e = await empresaConCupo(app, monkey, 'Debajo', 10);
    const responsable = await activo(e.agent, 'debajo-r', 'responsable');
    await activo(e.agent, 'debajo-d', 'delegado', await sembrarEquipo(e.companyId, responsable.id)); // administrador + 2 = 3 cuentas
    expect(await contadas(e.companyId)).toBe(3);
    const res = await monkey.patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 2 }).expect(409);
    expect(res.body.error).toMatchObject({ code: 'MAX_USERS_BELOW_CURRENT', max_users: 2, users_count: 3 });
    expect(await cupoDe(e.companyId)).toBe(10);
    await monkey.patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 3 }).expect(200);
  });

  it('un valor que no es un entero >= 1 es 422; una empresa que no existe es 404', async () => {
    const e = await empresaConCupo(app, monkey, 'Valida', 10);
    for (const max_users of [undefined, 0, -1, 2.5, '7', null]) {
      const res = await monkey.patch(`/v1/companies/${e.companyId}/max-users`).send(max_users === undefined ? {} : { max_users }).expect(422);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    }
    await monkey.patch('/v1/companies/00000000-0000-4000-8000-000000000000/max-users').send({ max_users: 5 }).expect(404);
    expect(await cupoDe(e.companyId)).toBe(10);
  });

  it('deja company.max_users_update con antes y después y de qué empresa es, hecha por quien la cambió', async () => {
    const e = await empresaConCupo(app, monkey, 'Rastro', 10);
    await monkey.patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 40 }).expect(200);
    const rows = await owner<{ user_id: string; tenant_id: string | null; result: string; before_state: unknown; after_state: unknown }>(
      `select user_id, tenant_id, result::text, before_state, after_state from audit.audit_logs where action = 'company.max_users_update' and after_state->>'company_id' = $1`,
      [e.companyId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ tenant_id: null, result: 'success', before_state: { company_id: e.companyId, max_users: 10 }, after_state: { company_id: e.companyId, max_users: 40 } });
    expect(rows[0].user_id).toBeTruthy();
  });

  it('si el rastro falla, el cupo no cambia (todo en la misma transacción)', async () => {
    const e = await empresaConCupo(app, monkey, 'Atomico', 10);
    jest.spyOn(auditInsert, 'insertAuditLog').mockImplementationOnce(async (db, entry) => {
      await realInsert(db, entry);
      throw new Error('audit_down');
    });
    await monkey.patch(`/v1/companies/${e.companyId}/max-users`).send({ max_users: 40 }).expect(500);
    expect(await cupoDe(e.companyId)).toBe(10);
    expect(await owner(`select 1 from audit.audit_logs where action = 'company.max_users_update' and after_state->>'company_id' = $1`, [e.companyId])).toHaveLength(0);
  });
});

describe('Canjear la clave de acceso: la primera cuenta también pasa por el cupo', () => {
  it('el primer administrador entra aunque el cupo sea 1: esa cuenta es justo la que lo llena', async () => {
    const e = await empresaConCupo(app, monkey, 'Uno', 1);
    expect(await contadas(e.companyId)).toBe(1);
    await e.agent.get('/v1/auth/me').expect(200);
    await e.agent.post('/v1/users').send({ email: correo('uno-x'), name: 'P', last_name: 'P', role: 'auditor' }).expect(409); // y ya no cabe nadie más
  });

  it('si el cupo no cupiera, el canje es 409 USER_LIMIT_REACHED, no crea la cuenta y la clave sigue pendiente (se puede reintentar)', async () => {
    const admin = correo('canje-admin');
    const company = (await monkey.post('/v1/companies').send({ name: `Empresa Canje ${RUN}`, requires_dedicated_database: false, max_users: 1, admin_email: admin, framework_codes: ['soc2'] }).expect(201)).body.data;
    // Una cuenta que ya ocupa el único lugar (metida a mano: la API no deja llegar a este estado, y justo por eso se comprueba la regla).
    await owner(`insert into platform.users (id, company_id, email, password_hash, role, status) values (gen_random_uuid(), $1, $2, 'x', 'auditor', 'active')`, [company.id, correo('canje-previo')]);

    const res = await request(app.getHttpServer()).post('/v1/auth/redeem').send({ code: claveEnviadaA(admin), email: admin, password: PASSWORD });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatchObject({ code: 'USER_LIMIT_REACHED', max_users: 1, users_count: 1 });
    expect(await owner('select 1 from platform.users where email = $1', [admin])).toHaveLength(0);
    const [key] = await owner<{ status: string; used_at: unknown }>('select status::text, used_at from platform.access_keys where company_id = $1', [company.id]);
    expect(key).toMatchObject({ status: 'pending', used_at: null });
  });
});
