import type { Client } from 'pg';
import { asApp, connect, failure, seedTwoTenants, withRollback } from '../support/db';

// MD-157 · Los cinco roles y la asignación de consultores (modelo-datos.md §5.1 y §5.2, D63, D64). Comprobado con el rol real de la app
// (monkey_app, NOBYPASSRLS). Cada prueba se revierte.
const RLS = /row-level security|violates row-level/i;

type Cuentas = { a: string; b: string; monkeyId: string; consultorId: string; otroConsultorId: string; asignacionA: string; asignacionB: string };

// Dos empresas atendidas por un consultor de Next, más otro consultor que solo atiende a la B. Se crea como dueño (sin RLS).
async function preparar(db: Client): Promise<Cuentas> {
  const { a, b } = await seedTwoTenants(db);
  const monkey = await db.query<{ id: string }>(
    `insert into platform.companies (id, name, admin_email, updated_at) values (gen_random_uuid(), 'Monkey interna', 'interna@aislamiento.test', now()) returning id`,
  );
  const usuario = async (email: string, role: string) =>
    (
      await db.query<{ id: string }>(
        `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
         values (gen_random_uuid(), $1, $2, 'x', 'y', 'no-es-un-hash', $3::platform.user_role) returning id`,
        [monkey.rows[0].id, email, role],
      )
    ).rows[0].id;
  const monkeyId = await usuario('admin@interna.test', 'admin_monkey');
  const consultorId = await usuario('consultor@interna.test', 'consultor');
  const otroConsultorId = await usuario('otro-consultor@interna.test', 'consultor');
  const asignar = async (consultor: string, company: string) =>
    (
      await db.query<{ id: string }>(
        `insert into platform.consultant_assignments (id, consultant_user_id, company_id, assigned_by) values (gen_random_uuid(), $1, $2, $3) returning id`,
        [consultor, company, monkeyId],
      )
    ).rows[0].id;
  const asignacionA = await asignar(consultorId, a.companyId);
  const asignacionB = await asignar(consultorId, b.companyId);
  await asignar(otroConsultorId, b.companyId);
  return { a: a.companyId, b: b.companyId, monkeyId, consultorId, otroConsultorId, asignacionA, asignacionB };
}

describe('El modelo de los cinco roles', () => {
  let db: Client;
  beforeAll(async () => {
    db = await connect();
  });
  afterAll(async () => {
    await db.end();
  });

  it('el enum de roles tiene exactamente los cinco del comité', async () => {
    const r = await db.query(`select unnest(enum_range(null::platform.user_role))::text as rol`);
    expect(r.rows.map((x) => x.rol).sort()).toEqual(['admin_empresa', 'admin_monkey', 'auditor', 'consultor', 'funcional']);
  });

  it('existe la asignación de consultores y no existen los roles personalizados ni la asignación de auditores (D63, D64)', async () => {
    const tablas = await db.query(`select table_name from information_schema.tables where table_schema = 'platform'`);
    const nombres = tablas.rows.map((t) => t.table_name);
    expect(nombres).toContain('consultant_assignments');
    expect(nombres).not.toContain('custom_roles');
    expect(nombres).not.toContain('auditor_assignments');
    const columna = await db.query(`select 1 from information_schema.columns where table_schema = 'platform' and table_name = 'users' and column_name = 'custom_role_id'`);
    expect(columna.rowCount).toBe(0);
  });

  it('el estado de una asignación es activa, suspendida o retirada', async () => {
    const r = await db.query(`select unnest(enum_range(null::platform.consultant_assignment_status))::text as estado`);
    expect(r.rows.map((x) => x.estado)).toEqual(['active', 'suspended', 'revoked']);
  });

  it('el correo sigue siendo único en todo el sistema: una sola cuenta por consultor', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const msg = await failure(
        tx,
        `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
         select gen_random_uuid(), company_id, email, 'x', 'y', 'h', 'consultor' from platform.users where id = $1`,
        [c.consultorId],
      );
      expect(msg).toMatch(/duplicate key|unique/i);
    }));

  it('un consultor tiene una sola asignación por empresa', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const msg = await failure(tx, `insert into platform.consultant_assignments (id, consultant_user_id, company_id, assigned_by) values (gen_random_uuid(), $1, $2, $3)`, [
        c.consultorId,
        c.a,
        c.monkeyId,
      ]);
      expect(msg).toMatch(/duplicate key|unique/i);
    }));
});

describe('Quién ve y quién crea una asignación (RLS)', () => {
  it('sin tenant ni sesión no se ve ninguna: falla cerrado', () =>
    withRollback(async (tx) => {
      await preparar(tx);
      const r = await asApp(tx, {}, () => tx.query('select id from platform.consultant_assignments'));
      expect(r.rowCount).toBe(0);
    }));

  it('una empresa ve solo quiénes la atienden a ella', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const r = await asApp(tx, { tenantId: c.a, role: 'admin_empresa' }, () => tx.query('select id, company_id from platform.consultant_assignments'));
      expect(r.rows).toEqual([{ id: c.asignacionA, company_id: c.a }]);
    }));

  it('el consultor ve SUS asignaciones sin importar la empresa activa, y no las de otro consultor', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const r = await asApp(tx, { tenantId: c.a, role: 'consultor', userId: c.consultorId }, () =>
        tx.query('select id from platform.consultant_assignments order by company_id'),
      );
      expect(r.rows.map((x) => x.id).sort()).toEqual([c.asignacionA, c.asignacionB].sort());
    }));

  it('admin_monkey las ve todas', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const r = await asApp(tx, { tenantId: c.a, role: 'admin_monkey', userId: c.monkeyId }, () => tx.query('select id from platform.consultant_assignments'));
      expect(r.rowCount).toBe(3);
    }));

  it('solo admin_monkey asigna: ni una empresa ni un consultor pueden crear una asignación', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const nueva = `insert into platform.consultant_assignments (id, consultant_user_id, company_id, assigned_by) values (gen_random_uuid(), $1, $2, $3)`;
      const empresa = await asApp(tx, { tenantId: c.a, role: 'admin_empresa' }, () => failure(tx, nueva, [c.otroConsultorId, c.a, c.monkeyId]));
      expect(empresa).toMatch(RLS);
      const consultor = await asApp(tx, { tenantId: c.a, role: 'consultor', userId: c.otroConsultorId }, () => failure(tx, nueva, [c.otroConsultorId, c.a, c.monkeyId]));
      expect(consultor).toMatch(RLS);
      const monkey = await asApp(tx, { tenantId: c.a, role: 'admin_monkey', userId: c.monkeyId }, () => failure(tx, nueva, [c.otroConsultorId, c.a, c.monkeyId]));
      expect(monkey).toBeNull();
    }));

  it('una asignación nunca se borra: su final es «retirada»', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      for (const ctx of [
        { tenantId: c.a, role: 'admin_monkey', userId: c.monkeyId },
        { tenantId: c.a, role: 'admin_empresa' },
      ]) {
        const r = await asApp(tx, ctx, () => tx.query('delete from platform.consultant_assignments where id = $1', [c.asignacionA]));
        expect(r.rowCount).toBe(0);
      }
      expect((await tx.query('select 1 from platform.consultant_assignments where id = $1', [c.asignacionA])).rowCount).toBe(1);
    }));
});

describe('Quién cambia el estado de una asignación (CC6.3, D64)', () => {
  const cambiar = (tx: Client, id: string, estado: string) =>
    failure(tx, `update platform.consultant_assignments set status = $2::platform.consultant_assignment_status where id = $1`, [id, estado]);
  const estado = async (tx: Client, id: string) => (await tx.query('select status::text s, status_changed_by, status_changed_at from platform.consultant_assignments where id = $1', [id])).rows[0];

  it('la empresa suspende al consultor y queda sellado quién y cuándo', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const empresa = (await tx.query<{ id: string }>('select id from platform.users where company_id = $1', [c.a])).rows[0].id;
      await asApp(tx, { tenantId: c.a, role: 'admin_empresa', userId: empresa }, () =>
        tx.query(`update platform.consultant_assignments set status = 'suspended' where id = $1`, [c.asignacionA]),
      );
      const fila = await estado(tx, c.asignacionA);
      expect(fila.s).toBe('suspended');
      expect(fila.status_changed_by).toBe(empresa);
      expect(fila.status_changed_at).not.toBeNull();
    }));

  it('admin_monkey NO puede suspender: solo la empresa corta el acceso a sus datos', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const msg = await asApp(tx, { tenantId: c.a, role: 'admin_monkey', userId: c.monkeyId }, () => cambiar(tx, c.asignacionA, 'suspended'));
      expect(msg).toMatch(/Solo la empresa puede suspender/);
    }));

  it('admin_monkey NO puede reactivar una suspensión de la empresa; la empresa sí', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      await asApp(tx, { tenantId: c.a, role: 'admin_empresa' }, () => tx.query(`update platform.consultant_assignments set status = 'suspended' where id = $1`, [c.asignacionA]));
      const monkey = await asApp(tx, { tenantId: c.a, role: 'admin_monkey', userId: c.monkeyId }, () => cambiar(tx, c.asignacionA, 'active'));
      expect(monkey).toMatch(/solo la reactiva la empresa/);
      const empresa = await asApp(tx, { tenantId: c.a, role: 'admin_empresa' }, () => cambiar(tx, c.asignacionA, 'active'));
      expect(empresa).toBeNull();
    }));

  it('solo admin_monkey retira una asignación', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const empresa = await asApp(tx, { tenantId: c.a, role: 'admin_empresa' }, () => cambiar(tx, c.asignacionA, 'revoked'));
      expect(empresa).toMatch(/Solo admin_monkey retira/);
      // El consultor ni siquiera ve la fila para escribirla (la política de escritura no le da acceso): no cambia nada.
      const consultor = await asApp(tx, { tenantId: c.a, role: 'consultor', userId: c.consultorId }, () =>
        tx.query(`update platform.consultant_assignments set status = 'revoked' where id = $1`, [c.asignacionA]),
      );
      expect(consultor.rowCount).toBe(0);
      expect((await estado(tx, c.asignacionA)).s).toBe('active');
      const monkey = await asApp(tx, { tenantId: c.a, role: 'admin_monkey', userId: c.monkeyId }, () => cambiar(tx, c.asignacionA, 'revoked'));
      expect(monkey).toBeNull();
    }));

  it('el propio consultor no puede tocar su asignación', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const r = await asApp(tx, { tenantId: c.a, role: 'consultor', userId: c.consultorId }, () =>
        tx.query(`update platform.consultant_assignments set status = 'active' where id = $1`, [c.asignacionA]),
      );
      // La política de escritura no le da fila a un consultor: no es una empresa ni admin_monkey.
      expect(r.rowCount).toBe(0);
    }));

  it('una empresa no puede tocar la asignación de otra', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const r = await asApp(tx, { tenantId: c.a, role: 'admin_empresa' }, () =>
        tx.query(`update platform.consultant_assignments set status = 'suspended' where id = $1`, [c.asignacionB]),
      );
      expect(r.rowCount).toBe(0);
      expect((await estado(tx, c.asignacionB)).s).toBe('active');
    }));

  it('una asignación no cambia de consultor, de empresa ni de quien la hizo', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      const msg = await asApp(tx, { tenantId: c.a, role: 'admin_monkey', userId: c.monkeyId }, () =>
        failure(tx, `update platform.consultant_assignments set consultant_user_id = $2 where id = $1`, [c.asignacionA, c.otroConsultorId]),
      );
      expect(msg).toMatch(/no cambia de consultor/);
    }));

  it('no se puede falsear quién cambió el estado sin cambiarlo', () =>
    withRollback(async (tx) => {
      const c = await preparar(tx);
      await asApp(tx, { tenantId: c.a, role: 'admin_monkey', userId: c.monkeyId }, () =>
        tx.query(`update platform.consultant_assignments set status_changed_by = $2, status_changed_at = now() where id = $1`, [c.asignacionA, c.otroConsultorId]),
      );
      const fila = await estado(tx, c.asignacionA);
      expect(fila.status_changed_by).toBeNull();
      expect(fila.status_changed_at).toBeNull();
    }));
});

describe('El aislamiento no depende del rol', () => {
  it.each(['auditor', 'consultor', 'funcional'] as const)('un %s con la empresa A activa no ve ni toca nada de la B', (role) =>
    withRollback(async (tx) => {
      const { a, b } = await seedTwoTenants(tx);
      await asApp(tx, { tenantId: a.companyId, role }, async () => {
        expect((await tx.query('select company_id from tenant.organizations')).rows).toEqual([{ company_id: a.companyId }]);
        expect((await tx.query('select id from tenant.organizations where id = $1', [b.orgId])).rowCount).toBe(0);
        expect((await tx.query('update tenant.organizations set description = $2 where id = $1', [b.orgId, 'x'])).rowCount).toBe(0);
      });
    }),
  );
});
