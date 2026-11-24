import type { INestApplication } from '@nestjs/common';
import { bootApp } from '../support/app';
import { definirPeriodo, dosEmpresas, Tenant } from '../support/escenario';
import { asApp, connect, failure, seedTwoTenants, withRollback } from '../support/db';

// Aislamiento entre empresas (MD-147, DT-33 del lado de la base): lo que una empresa NO puede ver ni tocar de otra,
// comprobado con el rol real de la app (monkey_app, NOBYPASSRLS), no con el dueño. Cada prueba se revierte.
const RLS = /row-level security|violates row-level/i;

describe('Aislamiento por empresa (RLS) — comportamiento', () => {
  it('sin tenant fijado no se ve ninguna fila (falla cerrado)', () =>
    withRollback(async (db) => {
      await seedTwoTenants(db);
      const rows = await asApp(db, {}, async () => {
        const rules = await db.query('select id from tenant.schedule_rules');
        const orgs = await db.query('select id from tenant.organizations');
        const users = await db.query('select id from platform.users');
        const companies = await db.query('select id from platform.companies');
        return [rules.rowCount, orgs.rowCount, users.rowCount, companies.rowCount];
      });
      expect(rows).toEqual([0, 0, 0, 0]);
    }));

  it('cada empresa ve solo lo suyo', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const visto = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => ({
        reglas: (await db.query('select id from tenant.schedule_rules')).rows.map((r) => r.id),
        orgs: (await db.query('select id from tenant.organizations')).rows.map((r) => r.id),
        usuarios: (await db.query('select id from platform.users')).rows.map((r) => r.id),
        empresas: (await db.query('select id from platform.companies')).rows.map((r) => r.id),
      }));
      expect(visto.reglas).toEqual([a.ruleId]);
      expect(visto.orgs).toEqual([a.orgId]);
      expect(visto.usuarios).toEqual([a.userId]);
      expect(visto.empresas).toEqual([a.companyId]);
      expect(JSON.stringify(visto)).not.toContain(b.companyId);
    }));

  it('pedir por id una fila de otra empresa no devuelve nada', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const r = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () =>
        db.query('select id from tenant.schedule_rules where id = $1', [b.ruleId]),
      );
      expect(r.rowCount).toBe(0);
    }));

  it('no se puede insertar una fila con el tenant de otra empresa', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const msg = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () =>
        failure(
          db,
          `insert into tenant.schedule_rules (id, tenant_id, rule, applies_to, affected_asset_count, next_run_at)
           values (gen_random_uuid(), $1, 'intrusa', 'todos', 1, now())`,
          [b.companyId],
        ),
      );
      expect(msg).toMatch(RLS);
    }));

  it('no se puede modificar ni borrar una fila de otra empresa', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const { upd, del } = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => ({
        upd: await db.query(`update tenant.schedule_rules set rule = 'hackeada' where id = $1`, [b.ruleId]),
        del: await db.query('delete from tenant.schedule_rules where id = $1', [b.ruleId]),
      }));
      expect(upd.rowCount).toBe(0);
      expect(del.rowCount).toBe(0);
      const intacta = await db.query('select rule from tenant.schedule_rules where id = $1', [b.ruleId]);
      expect(intacta.rows[0].rule).toBe('regla b');
    }));

  it('no se puede "regalar" una fila propia a otra empresa cambiando su tenant', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const msg = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () =>
        failure(db, 'update tenant.schedule_rules set tenant_id = $1 where id = $2', [b.companyId, a.ruleId]),
      );
      expect(msg).toMatch(RLS);
    }));

  it('un valor de tenant que no es un uuid falla en vez de abrir el acceso', () =>
    withRollback(async (db) => {
      await seedTwoTenants(db);
      const msg = await asApp(db, { tenantId: 'no-es-un-uuid' }, () => failure(db, 'select id from tenant.schedule_rules'));
      expect(msg).not.toBeNull();
    }));

  it('el tenant fijado en una transacción no se filtra a la siguiente de la misma conexión (pool)', async () => {
    const db = await connect();
    try {
      await db.query('BEGIN');
      await db.query(`select set_config('app.tenant_id', gen_random_uuid()::text, true)`);
      await db.query('COMMIT');
      await db.query('BEGIN');
      const r = await db.query(`select coalesce(nullif(current_setting('app.tenant_id', true), ''), '(vacío)') v`);
      await db.query('ROLLBACK');
      expect(r.rows[0].v).toBe('(vacío)');
    } finally {
      await db.end();
    }
  });

  it('el audit trail también está aislado: ni se lee ni se escribe el de otra empresa', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const insertAudit = `insert into audit.audit_logs (id, tenant_id, user_id, action, resource, ip_address, user_agent, result)
        values (gen_random_uuid(), $1, $2, 'prueba.aislamiento', 'prueba', '127.0.0.1', 'test', 'success')`;
      await db.query(insertAudit, [a.companyId, a.userId]);
      await db.query(insertAudit, [b.companyId, b.userId]);
      const visto = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () =>
        db.query(`select tenant_id from audit.audit_logs where action = 'prueba.aislamiento'`),
      );
      expect(visto.rows.map((r) => r.tenant_id)).toEqual([a.companyId]);
      const msg = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () =>
        failure(db, insertAudit, [b.companyId, b.userId]),
      );
      expect(msg).toMatch(RLS);
    }));

  it('solo admin_monkey ve las empresas de todos; un usuario de empresa no, aunque diga ser de otra', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const comoMonkey = await asApp(db, { tenantId: a.companyId, role: 'admin_monkey' }, () =>
        db.query('select id from platform.companies where id = any($1)', [[a.companyId, b.companyId]]),
      );
      expect(comoMonkey.rowCount).toBe(2);
      const comoResponsable = await asApp(db, { tenantId: a.companyId, role: 'responsable' }, () =>
        db.query('select id from platform.companies where id = any($1)', [[a.companyId, b.companyId]]),
      );
      expect(comoResponsable.rows.map((r) => r.id)).toEqual([a.companyId]);
    }));

  it('el catálogo se lee libre pero una empresa no puede escribirlo', () =>
    withRollback(async (db) => {
      const { a } = await seedTwoTenants(db);
      const { frameworks, msg } = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => ({
        frameworks: (await db.query('select count(*)::int n from catalog.frameworks')).rows[0].n,
        msg: await failure(db, `delete from catalog.frameworks`),
      }));
      expect(frameworks).toBeGreaterThanOrEqual(0); // el catálogo puede estar vacío en CI: lo que importa es que no falle
      // delete sin permiso de escritura no borra nada: o falla, o afecta 0 filas
      const total = await db.query('select count(*)::int n from catalog.frameworks');
      expect(total.rows[0].n).toBe(frameworks);
      expect(msg === null || RLS.test(msg) || /permission denied/i.test(msg)).toBe(true);
    }));
});

// MD-498 · Los requisitos del control del cliente se copian al clonar el servicio: la empresa B no ve ni escribe los de A.
describe('Aislamiento por empresa (RLS) — tenant.client_control_requirements', () => {
  let app: INestApplication;
  let a: Tenant;
  let b: Tenant;
  beforeAll(async () => {
    app = await bootApp();
    ({ a, b } = await dosEmpresas(app));
    await definirPeriodo(a.serviceId, '2026-01-01', '2026-12-31');
  });
  afterAll(async () => {
    await app?.close();
  });

  it('cada empresa ve solo sus requisitos; la otra no los ve, no los cambia, no los borra y no puede crear uno con el tenant ajeno', () =>
    withRollback(async (db) => {
      const mine = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () => db.query('select id, tenant_id, client_control_id, control_requirement_id from tenant.client_control_requirements'));
      expect(mine.rowCount).toBeGreaterThan(0);
      expect(mine.rows.every((r) => r.tenant_id === a.companyId)).toBe(true);
      const [target] = mine.rows;

      const asB = { tenantId: b.companyId, role: 'admin_empresa' };
      const seen = await asApp(db, asB, () => db.query('select id from tenant.client_control_requirements where tenant_id = $1 or id = $2', [a.companyId, target.id]));
      expect(seen.rowCount).toBe(0);
      const updated = await asApp(db, asB, () => db.query('update tenant.client_control_requirements set is_applicable = false where id = $1', [target.id]));
      expect(updated.rowCount).toBe(0);
      const deleted = await asApp(db, asB, () => db.query('delete from tenant.client_control_requirements where id = $1', [target.id]));
      expect(deleted.rowCount).toBe(0);
      const msg = await asApp(db, asB, () =>
        failure(db, 'insert into tenant.client_control_requirements (id, tenant_id, client_control_id, control_requirement_id) values (gen_random_uuid(), $1, $2, $3)', [a.companyId, target.client_control_id, target.control_requirement_id]),
      );
      expect(msg).toMatch(RLS);
      // y la fila de A sigue intacta
      const still = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () => db.query('select is_applicable from tenant.client_control_requirements where id = $1', [target.id]));
      expect(still.rows[0].is_applicable).toBe(true);
    }));

  it('sin tenant fijado no se ve ninguna fila (falla cerrado)', () =>
    withRollback(async (db) => {
      const rows = await asApp(db, {}, () => db.query('select id from tenant.client_control_requirements'));
      expect(rows.rowCount).toBe(0);
    }));

  // MD-500 · Los períodos auditados (uno por fila, con histórico): la empresa B no ve ni escribe los de A.
  it('tenant.service_framework_periods: cada empresa ve solo sus períodos; la otra no los ve, no los cambia, no los borra y no puede crear uno con el tenant ajeno', () =>
    withRollback(async (db) => {
      const mine = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () => db.query('select id, tenant_id, service_framework_id from tenant.service_framework_periods'));
      expect(mine.rowCount).toBeGreaterThan(0);
      expect(mine.rows.every((r) => r.tenant_id === a.companyId)).toBe(true);
      const [target] = mine.rows;

      const asB = { tenantId: b.companyId, role: 'admin_empresa' };
      const seen = await asApp(db, asB, () => db.query('select id from tenant.service_framework_periods where tenant_id = $1 or id = $2', [a.companyId, target.id]));
      expect(seen.rowCount).toBe(0);
      const updated = await asApp(db, asB, () => db.query("update tenant.service_framework_periods set status = 'closed' where id = $1", [target.id]));
      expect(updated.rowCount).toBe(0);
      const deleted = await asApp(db, asB, () => db.query('delete from tenant.service_framework_periods where id = $1', [target.id]));
      expect(deleted.rowCount).toBe(0);
      const msg = await asApp(db, asB, () =>
        failure(db, "insert into tenant.service_framework_periods (id, tenant_id, service_framework_id, period_start, period_end) values (gen_random_uuid(), $1, $2, '2027-01-01', '2027-12-31')", [a.companyId, target.service_framework_id]),
      );
      expect(msg).toMatch(RLS);
      const still = await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, () => db.query('select status from tenant.service_framework_periods where id = $1', [target.id]));
      expect(still.rows[0].status).toBe('open');
    }));

  it('tenant.service_framework_periods: sin tenant fijado no se ve ninguna fila (falla cerrado)', () =>
    withRollback(async (db) => {
      const rows = await asApp(db, {}, () => db.query('select id from tenant.service_framework_periods'));
      expect(rows.rowCount).toBe(0);
    }));
});
