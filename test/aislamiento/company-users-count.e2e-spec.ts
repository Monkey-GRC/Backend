import { asApp, connect, seedTwoTenants, withRollback } from '../support/db';

// SEG-77 · platform.company_users_count es la única puerta que cuenta cuentas entre empresas (el cupo de usuarios, D103). Es SECURITY DEFINER, así que salta la RLS de
// platform.users: por eso el aislamiento tiene que estar DENTRO de la función. Se comprueba con el rol real de la app (monkey_app, NOBYPASSRLS). Cada prueba se revierte.
const cuenta = (db: Parameters<typeof asApp>[0], ctx: { tenantId?: string; role?: string }, ids: string[]) =>
  asApp(db, ctx as never, async () => (await db.query<{ company_id: string; users_count: number }>('select * from platform.company_users_count($1::uuid[])', [ids])).rows);

describe('platform.company_users_count (SEG-77)', () => {
  it('un admin_empresa solo obtiene el conteo de SU empresa: las ids ajenas se ignoran, sin error ni dato', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const ambas = await cuenta(db, { tenantId: a.companyId, role: 'admin_empresa' }, [a.companyId, b.companyId]);
      expect(ambas).toEqual([{ company_id: a.companyId, users_count: 1 }]);
      expect(await cuenta(db, { tenantId: a.companyId, role: 'admin_empresa' }, [b.companyId])).toEqual([]); // preguntar solo por la ajena no devuelve nada
    }));

  it('admin_monkey obtiene el conteo de cualquier empresa', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      const filas = await cuenta(db, { tenantId: a.companyId, role: 'admin_monkey' }, [a.companyId, b.companyId]);
      expect(filas.sort((x, y) => x.company_id.localeCompare(y.company_id))).toEqual(
        [
          { company_id: a.companyId, users_count: 1 },
          { company_id: b.companyId, users_count: 1 },
        ].sort((x, y) => x.company_id.localeCompare(y.company_id)),
      );
    }));

  it('falla cerrado: sin tenant ni rol no devuelve nada, y un rol que no es admin_monkey con el tenant de otra empresa tampoco ve la ajena', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db);
      expect(await cuenta(db, {}, [a.companyId, b.companyId])).toEqual([]);
      for (const role of ['responsable', 'delegado', 'auditor', 'admin_empresa']) {
        expect(await cuenta(db, { tenantId: b.companyId, role }, [a.companyId])).toEqual([]);
      }
    }));

  it('cuentan active, pending y suspended de cualquier rol; inactive no; y una empresa sin cuentas contadas da 0', () =>
    withRollback(async (db) => {
      const { a, b } = await seedTwoTenants(db); // 1 admin_empresa active cada una
      for (const [status, role] of [['pending', 'responsable'], ['suspended', 'auditor'], ['active', 'delegado'], ['inactive', 'delegado'], ['inactive', 'auditor']] as const) {
        await db.query(
          `insert into platform.users (id, company_id, email, name, last_name, password_hash, role, status, is_internal)
           values (gen_random_uuid(), $1, $2, 'x', 'y', 'no-es-un-hash', $3::platform.user_role, $4::platform.user_status, $5)`,
          [a.companyId, `${status}-${role}-${Math.random()}@cupo.test`, role, status, role === 'delegado' ? true : null],
        );
      }
      expect(await cuenta(db, { tenantId: a.companyId, role: 'admin_monkey' }, [a.companyId, b.companyId])).toEqual(
        expect.arrayContaining([
          { company_id: a.companyId, users_count: 4 }, // admin + pending + suspended + active = 4; los dos inactive no
          { company_id: b.companyId, users_count: 1 },
        ]),
      );
      await db.query(`update platform.users set status = 'inactive' where company_id = $1`, [b.companyId]);
      expect(await cuenta(db, { tenantId: a.companyId, role: 'admin_monkey' }, [b.companyId])).toEqual([{ company_id: b.companyId, users_count: 0 }]);
    }));

  it('devuelve solo (company_id, users_count): nunca un dato de una persona', () =>
    withRollback(async (db) => {
      const { a } = await seedTwoTenants(db);
      const [fila] = await cuenta(db, { tenantId: a.companyId, role: 'admin_empresa' }, [a.companyId]);
      expect(Object.keys(fila).sort()).toEqual(['company_id', 'users_count']);
    }));

  it('es SECURITY DEFINER angosta como las otras puertas: search_path fijo, sin permiso para PUBLIC y con permiso para la app', async () => {
    const db = await connect();
    try {
      const [fn] = (
        await db.query<{ prosecdef: boolean; config: string[]; acl: string | null; app: boolean }>(
          `select p.prosecdef, p.proconfig as config, p.proacl::text as acl, has_function_privilege('monkey_app', p.oid, 'execute') as app
           from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'platform' and p.proname = 'company_users_count'`,
        )
      ).rows;
      expect(fn.prosecdef).toBe(true);
      expect(fn.config).toContain('search_path=platform, pg_temp');
      expect(fn.acl ?? '').not.toMatch(/(^\{|,)=X\//); // ninguna entrada para PUBLIC
      expect(fn.app).toBe(true);
    } finally {
      await db.end();
    }
  });
});
