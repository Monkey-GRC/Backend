import type { Client } from 'pg';
import { asApp, failure, seedTwoTenants, withRollback } from '../support/db';

// MD-515 · SEG-87 · Un aviso solo lo lee y lo marca su destinatario: ni otra persona de la misma empresa, ni el `admin_empresa`, ni `admin_monkey`, ni otra empresa. Comprobado con el rol real
// de la app (`monkey_app`, NOBYPASSRLS) directo en la base. Cada prueba se revierte.
const RLS = /row-level security|violates row-level/i;
const PERMISO = /permission denied/i;

async function escenario(db: Client) {
  const { a, b } = await seedTwoTenants(db);
  const colega = (
    await db.query<{ id: string }>(
      `insert into platform.users (id, company_id, email, name, last_name, password_hash, role) values (gen_random_uuid(), $1, 'colega-a@aislamiento.test', 'x', 'y', 'no-es-un-hash', 'responsable') returning id`,
      [a.companyId],
    )
  ).rows[0].id;
  const aviso = async (companyId: string, userId: string, dedupe: string, createdAt = 'now()') =>
    (
      await db.query<{ id: string }>(
        `insert into platform.notifications (id, company_id, user_id, type, target_kind, target_id, dedupe_key, created_at)
         values (gen_random_uuid(), $1, $2, 'window_due_soon', 'control', gen_random_uuid(), $3, ${createdAt}) returning id`,
        [companyId, userId, dedupe],
      )
    ).rows[0].id;
  return {
    a, b, colega,
    admin: a.userId,
    delAdmin: await aviso(a.companyId, a.userId, 'k1'),
    delColega: await aviso(a.companyId, colega, 'k2'),
    delOtraEmpresa: await aviso(b.companyId, b.userId, 'k3'),
    viejo: await aviso(a.companyId, colega, 'k4', `now() - interval '100 days'`),
  };
}

describe('Avisos · RLS por persona (SEG-87)', () => {
  it('cada persona ve solo lo suyo; la misma empresa no basta', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const ve = (ctx: Parameters<typeof asApp>[1]) => asApp(db, ctx, async () => (await db.query('select id from platform.notifications order by dedupe_key')).rows.map((r) => r.id));
      expect(await ve({ tenantId: s.a.companyId, userId: s.admin })).toEqual([s.delAdmin]);
      expect(await ve({ tenantId: s.a.companyId, userId: s.colega })).toEqual([s.delColega, s.viejo]);
      expect(await ve({ tenantId: s.b.companyId, userId: s.b.userId })).toEqual([s.delOtraEmpresa]);
    }));

  it('sin persona fijada no se ve nada: tampoco con el rol de administrador de la empresa ni de Monkey', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const cuenta = (ctx: Parameters<typeof asApp>[1]) => asApp(db, ctx, async () => (await db.query('select id from platform.notifications')).rowCount);
      expect(await cuenta({})).toBe(0);
      expect(await cuenta({ tenantId: s.a.companyId })).toBe(0);
      expect(await cuenta({ tenantId: s.a.companyId, role: 'admin_empresa' })).toBe(0);
      expect(await cuenta({ tenantId: s.a.companyId, role: 'admin_monkey' })).toBe(0);
    }));

  it('una persona con el tenant de OTRA empresa no ve nada, ni lo suyo ni lo ajeno', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const n = await asApp(db, { tenantId: s.b.companyId, userId: s.admin }, async () => (await db.query('select id from platform.notifications')).rowCount);
      expect(n).toBe(0);
    }));

  it('pedir por id el aviso de otra persona no devuelve nada', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const r = await asApp(db, { tenantId: s.a.companyId, userId: s.admin }, () => db.query('select id from platform.notifications where id = $1', [s.delColega]));
      expect(r.rowCount).toBe(0);
    }));

  it('solo el destinatario marca su aviso: el de otra persona no cambia (0 filas)', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const mio = await asApp(db, { tenantId: s.a.companyId, userId: s.admin }, () => db.query('update platform.notifications set read_at = now() where id = $1', [s.delAdmin]));
      const ajeno = await asApp(db, { tenantId: s.a.companyId, userId: s.admin }, () => db.query('update platform.notifications set read_at = now() where id = $1', [s.delColega]));
      expect([mio.rowCount, ajeno.rowCount]).toEqual([1, 0]);
    }));

  it('el contenido es inmutable: la app solo puede cambiar read_at y emailed_at', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const ctx = { tenantId: s.a.companyId, userId: s.admin };
      for (const columna of ['type = \'window_expired\'', 'params = \'{}\'::jsonb', 'user_id = company_id', 'dedupe_key = \'otro\'', 'created_at = now()']) {
        expect(await asApp(db, ctx, () => failure(db, `update platform.notifications set ${columna} where id = $1`, [s.delAdmin]))).toMatch(PERMISO);
      }
      expect(await asApp(db, ctx, () => failure(db, 'update platform.notifications set emailed_at = now() where id = $1', [s.delAdmin]))).toBeNull();
    }));

  it('una sesión de persona nunca borra un aviso, ni el suyo ni uno viejo', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const borrados = await asApp(db, { tenantId: s.a.companyId, userId: s.colega }, () => db.query('delete from platform.notifications'));
      expect(borrados.rowCount).toBe(0);
    }));

  it('ni la sesión de la empresa sin persona borra: solo la función de retención, y solo lo de más de 90 días de ESA empresa', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const borrados = await asApp(db, { tenantId: s.a.companyId }, () => db.query(`delete from platform.notifications where created_at < now() - interval '90 days'`));
      expect(borrados.rowCount).toBe(0);
      const n = await asApp(db, { tenantId: s.a.companyId }, async () => (await db.query('select platform.purge_expired_notifications($1) as n', [s.a.companyId])).rows[0].n);
      expect(n).toBe(1);
      const quedan = (await db.query('select id from platform.notifications where company_id = any($1::uuid[]) order by dedupe_key', [[s.a.companyId, s.b.companyId]])).rows.map((r) => r.id);
      expect(quedan).toEqual([s.delAdmin, s.delColega, s.delOtraEmpresa]);
    }));

  it('la purga de una cuenta se lleva SUS avisos y resúmenes, y los de nadie más: solo la de un admin_monkey inactivo', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      await db.query(`insert into platform.notification_digests (id, company_id, user_id, digest_date, status) values (gen_random_uuid(), $1, $2, current_date, 'sent')`, [s.a.companyId, s.colega]);
      await db.query(`update platform.users set role = 'admin_monkey', status = 'inactive' where id = $1`, [s.colega]);
      await asApp(db, { tenantId: s.a.companyId, role: 'admin_monkey' }, () => db.query('select platform.purge_user_notifications($1)', [s.colega]));
      const quedan = (await db.query('select id from platform.notifications where company_id = any($1::uuid[]) order by dedupe_key', [[s.a.companyId, s.b.companyId]])).rows.map((r) => r.id);
      expect(quedan).toEqual([s.delAdmin, s.delOtraEmpresa]);
      expect((await db.query('select 1 from platform.notification_digests where user_id = $1', [s.colega])).rowCount).toBe(0);
    }));

  it('la función de purga no vacía la campana de una persona viva: ni activa, ni un admin_monkey activo, ni de otra empresa', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const purgar = (userId: string) => asApp(db, { tenantId: s.a.companyId, role: 'admin_monkey' }, () => failure(db, 'select platform.purge_user_notifications($1)', [userId]));
      expect(await purgar(s.colega)).toMatch(/solo borra los avisos de un admin_monkey inactivo/); // un responsable activo
      await db.query(`update platform.users set status = 'inactive' where id = $1`, [s.colega]);
      expect(await purgar(s.colega)).toMatch(/solo borra los avisos de un admin_monkey inactivo/); // inactivo, pero no admin_monkey
      await db.query(`update platform.users set role = 'admin_monkey', status = 'active' where id = $1`, [s.colega]);
      expect(await purgar(s.colega)).toMatch(/solo borra los avisos de un admin_monkey inactivo/); // admin_monkey, pero activo
      expect(await purgar(s.b.userId)).toMatch(/solo borra los avisos de un admin_monkey inactivo/);
      expect(await purgar('00000000-0000-4000-8000-000000000000')).toMatch(/solo borra los avisos de un admin_monkey inactivo/);
      const quedan = (await db.query('select id from platform.notifications where company_id = any($1::uuid[])', [[s.a.companyId, s.b.companyId]])).rowCount;
      expect(quedan).toBe(4);
    }));

  it('insertar exige la empresa de la sesión: no se escribe un aviso con el tenant de otra', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const insertar = (tenantId: string, companyId: string, userId: string) =>
        asApp(db, { tenantId, userId: s.admin }, () =>
          failure(db, `insert into platform.notifications (id, company_id, user_id, type, target_kind, target_id, dedupe_key) values (gen_random_uuid(), $1, $2, 'control_assigned', 'control', gen_random_uuid(), 'nuevo')`, [companyId, userId]),
        );
      expect(await insertar(s.a.companyId, s.b.companyId, s.b.userId)).toMatch(RLS);
      // El sistema escribe el aviso de OTRA persona de su empresa (el hecho lo causó quien tiene la sesión) y no puede leerlo después.
      expect(await insertar(s.a.companyId, s.a.companyId, s.colega)).toBeNull();
      // El destinatario es de la empresa del aviso: con el tenant correcto, una persona de OTRA empresa tampoco (lo para la base, no solo la aplicación).
      expect(await insertar(s.a.companyId, s.a.companyId, s.b.userId)).toMatch(/destinatario no pertenece a la empresa/);
      expect(await insertar(s.a.companyId, s.a.companyId, '00000000-0000-4000-8000-000000000000')).toMatch(/destinatario no pertenece a la empresa/);
    }));

  it('el resumen diario (notification_digests) se aísla por empresa', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      await db.query(`insert into platform.notification_digests (id, company_id, user_id, digest_date, status) values (gen_random_uuid(), $1, $2, current_date, 'sent'), (gen_random_uuid(), $3, $4, current_date, 'sent')`, [s.a.companyId, s.admin, s.b.companyId, s.b.userId]);
      const n = await asApp(db, { tenantId: s.a.companyId }, async () => (await db.query('select id from platform.notification_digests')).rowCount);
      expect(n).toBe(1);
    }));

  it('un resumen tampoco se escribe para una persona de otra empresa', () =>
    withRollback(async (db) => {
      const s = await escenario(db);
      const insertar = (userId: string) =>
        asApp(db, { tenantId: s.a.companyId }, () => failure(db, `insert into platform.notification_digests (id, company_id, user_id, digest_date, status) values (gen_random_uuid(), $1, $2, current_date, 'sent')`, [s.a.companyId, userId]));
      expect(await insertar(s.b.userId)).toMatch(/destinatario no pertenece a la empresa/);
      expect(await insertar(s.admin)).toBeNull();
    }));
});
