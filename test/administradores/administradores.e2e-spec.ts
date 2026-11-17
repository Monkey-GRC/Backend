import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PurgeExpiredAdminsUseCase } from '../../src/features/admin-users/application/use-cases/purge-expired-admins.use-case';
import { Agent, bootApp, login, owner, PASSWORD, RUN } from '../support/app';
import { claveEnviadaA, correo } from '../support/correo-en-memoria';
import { dosEmpresas, empresaConCupo } from '../support/escenario';

// MD-215 · D117 · Cuentas de administrador de Monkey (contracts/gestion-usuarios/administradores.md): invitar, desactivar, reactivar y la purga con sello.
let app: INestApplication;
let a: Agent; // el admin_monkey que siembra la prueba
let aId: string;
let empresaAdmin: Agent;
let internalCompanyId: string;
let n = 0;
const email = (k: string) => `${k}-${RUN}-${n++}@administradores.test`;
const code = '123456'; // las pruebas corren con MFA_REQUIRED=false: el segundo factor no se exige y el valor solo debe estar presente

const invitar = (agent: Agent, over: Record<string, unknown> = {}) => agent.post('/v1/admins').send({ email: email('adm'), name: 'Beta', last_name: 'Prueba', role: 'admin_monkey', totp_code: code, ...over });
const activar = async (correoDe: string): Promise<Agent> => {
  const s = request.agent(app.getHttpServer());
  await s.post('/v1/auth/activate').send({ code: claveEnviadaA(correoDe), email: correoDe, password: PASSWORD }).expect(201);
  return s;
};
/** Invita con `por` y activa: devuelve la cuenta y su sesión. */
async function nuevoAdmin(por: Agent): Promise<{ id: string; email: string; session: Agent }> {
  const body = { email: email('adm'), name: 'Beta', last_name: 'Prueba', role: 'admin_monkey', totp_code: code };
  const id = (await por.post('/v1/admins').send(body).expect(201)).body.data.id as string;
  return { id, email: body.email, session: await activar(body.email) };
}
const estado = (id: string) => owner<{ status: string; purge_at: Date | null }>('select status::text, purge_at from platform.users where id = $1', [id]).then((r) => r[0]);
const activos = () => owner<{ n: number }>(`select count(*)::int n from platform.users where company_id = $1 and role = 'admin_monkey' and status = 'active'`, [internalCompanyId]).then((r) => r[0].n);
const auditoria = (action: string, where = '') => owner<any>(`select user_id, tenant_id, result, before_state, after_state from audit.audit_logs where action = $1 ${where} order by created_at`, [action]);

beforeAll(async () => {
  app = await bootApp();
  const { a: tenant, monkey } = await dosEmpresas(app);
  a = monkey;
  empresaAdmin = tenant.agent;
  const [me] = await owner<{ id: string; company_id: string }>(`select id, company_id from platform.users where email = $1`, [`admin-monkey-${RUN}@aislamiento.test`]);
  aId = me.id;
  internalCompanyId = me.company_id;
});
afterAll(async () => {
  await app?.close();
});

describe('quién puede', () => {
  it('solo admin_monkey: cualquier otro rol recibe 403 en los cinco endpoints; sin sesión, 401', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    for (const res of [
      await empresaAdmin.get('/v1/admins'),
      await empresaAdmin.post('/v1/admins').send({ email: 'x@y.co', name: 'X', last_name: 'Y', role: 'admin_monkey', totp_code: code }),
      await empresaAdmin.post(`/v1/admins/${id}/activation-code`),
      await empresaAdmin.post(`/v1/admins/${id}/deactivation`).send({ totp_code: code }),
      await empresaAdmin.post(`/v1/admins/${id}/reactivation`),
    ]) {
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    }
    expect((await request(app.getHttpServer()).get('/v1/admins')).status).toBe(401);
  });
});

describe('invitar y activar', () => {
  it('la cuenta nace pending sin cupo, el código sale solo por correo y activarla la deja active', async () => {
    // D117 punto 7 · La empresa interna no tiene límite de usuarios: aunque tuviera un tope de 1, el alta no responde USER_LIMIT_REACHED.
    await owner('update platform.companies set max_users = 1 where id = $1', [internalCompanyId]);
    try {
      const to = email('inv');
      const res = await invitar(a, { email: to.toUpperCase() });
      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ email: to, status: 'pending', role: 'admin_monkey', purge_at: null, invitation: { delivery_status: 'sent' }, invited_by: { id: aId } });
      expect(JSON.stringify(res.body)).not.toMatch(/MNK-|code_hash|password/i);
      const mail = correo.paraEl(to)[0];
      expect(mail.text).toMatch(/MNK-/);
      expect(`${mail.subject}${mail.text}${mail.html}`).not.toMatch(/wazuh|prowler/i);
      const [row] = await owner<{ company_id: string }>('select company_id from platform.users where id = $1', [res.body.data.id]);
      expect(row.company_id).toBe(internalCompanyId);

      expect((await a.post(`/v1/admins/${res.body.data.id}/activation-code`).expect(200)).body.data.invitation.delivery_status).toBe('sent');
      await activar(to);
      expect((await estado(res.body.data.id)).status).toBe('active');
      await a.post(`/v1/admins/${res.body.data.id}/activation-code`).expect(409);

      expect((await invitar(a, { email: to })).body.error.code).toBe('EMAIL_TAKEN');
      const otroRol = await invitar(a, { role: 'admin_empresa' });
      expect(otroRol.status).toBe(422);
      expect(otroRol.body.error.fields).toEqual([expect.objectContaining({ field: 'role', code: 'role.not_allowed' })]);
      expect((await invitar(a, { totp_code: undefined })).status).toBe(422);

      const lista = (await a.get('/v1/admins?status=active&sort=-created_at').expect(200)).body.data;
      expect(lista.items.map((i: any) => i.id)).toContain(res.body.data.id);
      const acciones = (await auditoria('admin.invite', `and after_state->>'id' = '${res.body.data.id}'`))[0];
      expect(acciones).toMatchObject({ result: 'success', user_id: aId, tenant_id: internalCompanyId });
      expect(JSON.stringify(acciones)).not.toMatch(/MNK-|totp/i);
    } finally {
      await owner('update platform.companies set max_users = null where id = $1', [internalCompanyId]);
    }
  });
});

describe('desactivar y reactivar dentro de la gracia', () => {
  it('nadie se desactiva a sí mismo; una pending no se desactiva; lo rechazado deja registro', async () => {
    const own = await a.post(`/v1/admins/${aId}/deactivation`).send({ totp_code: code });
    expect([own.status, own.body.error.code]).toEqual([409, 'CANNOT_DEACTIVATE_SELF']);
    expect((await estado(aId)).status).toBe('active');
    const rechazos = await auditoria('admin.deactivate', `and result = 'error' and after_state->>'target_id' = '${aId}'`);
    expect(rechazos.at(-1)).toMatchObject({ user_id: aId, after_state: { target_id: aId, reason: 'cannot_deactivate_self' } });

    const pendiente = await invitar(a);
    const res = await a.post(`/v1/admins/${pendiente.body.data.id}/deactivation`).send({ totp_code: code });
    expect([res.status, res.body.error.code]).toEqual([409, 'USER_NOT_ACTIVATED']);
  });

  it('desactivar: inactive con purge_at a 7 días, sesión cerrada al instante, auditoría; reactivar sin segundo factor lo devuelve a active', async () => {
    const b = await nuevoAdmin(a);
    await b.session.get('/v1/admins').expect(200);
    const res = await a.post(`/v1/admins/${b.id}/deactivation`).send({ totp_code: code });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: b.id, status: 'inactive' });
    const dias = (new Date(res.body.data.purge_at).getTime() - Date.now()) / 86_400_000;
    expect(dias).toBeGreaterThan(6.9);
    expect(dias).toBeLessThan(7.1);
    expect((await b.session.get('/v1/admins')).status).toBe(401);
    const log = (await auditoria('admin.deactivate', `and after_state->>'id' = '${b.id}'`))[0];
    expect(log).toMatchObject({ result: 'success', before_state: { status: 'active', purge_at: null }, after_state: { status: 'inactive', sessions_closed: expect.any(Number) } });
    expect(log.after_state.sessions_closed).toBeGreaterThanOrEqual(1);

    const otra = await a.post(`/v1/admins/${b.id}/deactivation`).send({ totp_code: code });
    expect([otra.status, otra.body.error.code]).toEqual([409, 'ADMIN_ALREADY_INACTIVE']);
    expect((await a.get('/v1/admins?status=inactive&sort=purge_at').expect(200)).body.data.items.map((i: any) => i.id)).toContain(b.id);

    const back = await a.post(`/v1/admins/${b.id}/reactivation`);
    expect(back.status).toBe(200);
    expect(back.body.data).toMatchObject({ status: 'active', purge_at: null });
    expect((await estado(b.id)).purge_at).toBeNull();
    const again = await a.post(`/v1/admins/${b.id}/reactivation`);
    expect([again.status, again.body.error.code]).toEqual([409, 'ADMIN_NOT_INACTIVE']);
    expect(await auditoria('admin.reactivate', `and after_state->>'id' = '${b.id}'`)).toHaveLength(1);
    // Las sesiones de antes siguen cerradas: hay que iniciar sesión de nuevo.
    expect((await b.session.get('/v1/admins')).status).toBe(401);
  });
});

describe('purga vencida: sello y atribución', () => {
  it('borra la cuenta y sus filas, deja el sello, la auditoría conserva user_id y el listado devuelve el sello; es idempotente', async () => {
    const b = await nuevoAdmin(a);
    // B invita a C y registra una empresa: quedan filas que lo atribuyen (activation code, clave de acceso, marcos contratados, auditoría).
    const c = await invitar(b.session).then((r) => r.body.data as { id: string });
    await empresaConCupo(app, b.session, `P${n++}`, 5);
    expect((await owner<{ n: number }>('select count(*)::int n from platform.access_keys where created_by = $1', [b.id]))[0].n).toBe(1);

    await a.post(`/v1/admins/${b.id}/deactivation`).send({ totp_code: code }).expect(200);
    const sinVencer = await app.get(PurgeExpiredAdminsUseCase).execute();
    expect(sinVencer.purged).not.toContain(b.id);
    // Reactivar después del plazo, aunque la purga aún no haya pasado, es 404.
    await owner(`update platform.users set purge_at = (now() at time zone 'utc') - interval '1 minute' where id = $1`, [b.id]);
    expect((await a.post(`/v1/admins/${b.id}/reactivation`)).status).toBe(404);

    const summary = await app.get(PurgeExpiredAdminsUseCase).execute();
    expect(summary.purged).toContain(b.id);
    expect(summary.failed).toEqual([]);
    expect(await estado(b.id)).toBeUndefined();
    expect((await owner('select 1 from platform.sessions where user_id = $1', [b.id])).length).toBe(0);
    expect((await app.get(PurgeExpiredAdminsUseCase).execute()).purged).not.toContain(b.id);
    expect(await owner('select user_id, name, last_name, role::text from audit.admin_tombstones where user_id = $1', [b.id])).toEqual([{ user_id: b.id, name: 'Beta', last_name: 'Prueba', role: 'admin_monkey' }]);
    await expect(owner('delete from audit.admin_tombstones where user_id = $1', [b.id])).rejects.toThrow(/append-only/);

    // Lo que B hizo sigue en la auditoría, atribuido a su id (el sello da el nombre); la purga la hace el sistema.
    expect((await auditoria('admin.invite', `and user_id = '${b.id}'`)).length).toBe(1);
    expect((await owner<{ n: number }>('select count(*)::int n from platform.access_keys where created_by = $1', [b.id]))[0].n).toBe(1);
    const purga = (await auditoria('admin.purge', `and after_state->>'admin_id' = '${b.id}'`))[0];
    expect(purga).toMatchObject({ user_id: null, tenant_id: internalCompanyId, result: 'success' });

    const lista = (await a.get('/v1/admins').expect(200)).body.data.items as any[];
    expect(lista.find((i) => i.id === b.id)).toBeUndefined();
    expect(lista.find((i) => i.id === c.id).invited_by).toEqual({ id: b.id, name: 'Beta', last_name: 'Prueba', role: 'admin_monkey', purged: true });
  });
});

describe('carrera', () => {
  it('dos desactivaciones cruzadas simultáneas: una gana y siempre queda un administrador activo', async () => {
    const d = await nuevoAdmin(a);
    // Solo quedan A y D activos (las demás cuentas de la prueba están pending o purgadas): desactivarse mutuamente dejaría a Monkey sin administrador.
    await owner(`update platform.users set status = 'inactive', purge_at = (now() at time zone 'utc') + interval '7 days' where company_id = $1 and role = 'admin_monkey' and status = 'active' and id not in ($2, $3)`, [internalCompanyId, aId, d.id]);
    expect(await activos()).toBe(2);
    for (let i = 0; i < 3; i++) {
      const [x, y] = await Promise.all([a.post(`/v1/admins/${d.id}/deactivation`).send({ totp_code: code }), d.session.post(`/v1/admins/${aId}/deactivation`).send({ totp_code: code })]);
      expect([x.status, y.status].filter((s) => s === 200)).toHaveLength(1);
      for (const loser of [x, y].filter((r) => r.status !== 200)) expect([401, 403, 409]).toContain(loser.status);
      expect(await activos()).toBe(1);
      // Se restablece para la siguiente ronda: reactivar a quien quedó en gracia (con la sesión del que ganó).
      const [winner, other] = x.status === 200 ? [a, d] : [d.session, a];
      const loserId = x.status === 200 ? d.id : aId;
      if (i < 2) {
        await winner.post(`/v1/admins/${loserId}/reactivation`).expect(200);
        // La sesión del reactivado sigue cerrada: se vuelve a entrar.
        if (loserId === aId) a = await login(app, `admin-monkey-${RUN}@aislamiento.test`);
        else d.session = await login(app, d.email);
        void other;
      }
    }
  });
});
