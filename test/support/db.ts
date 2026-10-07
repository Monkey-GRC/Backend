import { Client } from 'pg';

// Las pruebas de base de datos hablan con un Postgres DESECHABLE (docker local o el servicio de CI), nunca con la
// base compartida de dev: crean y revierten filas reales. Por eso la URL es explícita y se rechaza un servidor remoto.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);

export function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'Falta TEST_DATABASE_URL (rol dueño de un Postgres desechable con las migraciones aplicadas). ' +
        'Ejemplo: postgresql://postgres:test@localhost:55432/monkey',
    );
  }
  const host = new URL(url).hostname;
  if (!LOCAL_HOSTS.has(host) && process.env.ALLOW_REMOTE_TEST_DB !== '1') {
    throw new Error(`TEST_DATABASE_URL apunta a "${host}", que no es local: estas pruebas escriben datos. Usa un Postgres desechable.`);
  }
  return url;
}

export async function connect(): Promise<Client> {
  const client = new Client({ connectionString: testDatabaseUrl() });
  await client.connect();
  return client;
}

/** Corre `fn` dentro de una transacción que SIEMPRE se revierte: ninguna prueba deja rastro. */
export async function withRollback<T>(fn: (db: Client) => Promise<T>): Promise<T> {
  const db = await connect();
  try {
    await db.query('BEGIN');
    return await fn(db);
  } finally {
    await db.query('ROLLBACK').catch(() => undefined);
    await db.end();
  }
}

export type AppContext = { tenantId?: string; role?: string; userId?: string };

/**
 * Ejecuta `fn` como `monkey_app` (el rol de la app: NOBYPASSRLS), con las variables de sesión que fijaría la app.
 * Sin `tenantId` no se fija ninguna: es el caso "falla cerrado".
 */
export async function asApp<T>(db: Client, ctx: AppContext, fn: () => Promise<T>): Promise<T> {
  if (ctx.tenantId) await db.query(`select set_config('app.tenant_id', $1, true)`, [ctx.tenantId]);
  if (ctx.role) await db.query(`select set_config('app.user_role', $1, true)`, [ctx.role]);
  if (ctx.userId) await db.query(`select set_config('app.user_id', $1, true)`, [ctx.userId]);
  await db.query('SET LOCAL ROLE monkey_app');
  try {
    return await fn();
  } finally {
    await db.query('RESET ROLE');
  }
}

/** Una sentencia que DEBE fallar, aislada en un savepoint para no abortar la transacción. Devuelve el mensaje. */
export async function failure(db: Client, sql: string, params: unknown[] = []): Promise<string | null> {
  await db.query('SAVEPOINT intento');
  try {
    await db.query(sql, params);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  } finally {
    await db.query('ROLLBACK TO SAVEPOINT intento');
  }
}

/** Dos empresas con su organización y una regla de schedule cada una, creadas como dueño (sin RLS). */
export async function seedTwoTenants(db: Client) {
  const out: Record<'a' | 'b', { companyId: string; userId: string; ruleId: string; orgId: string }> = {} as never;
  for (const k of ['a', 'b'] as const) {
    const company = await db.query<{ id: string }>(
      `insert into platform.companies (id, name, admin_email, updated_at)
       values (gen_random_uuid(), $1, $2, now()) returning id`,
      [`Empresa ${k.toUpperCase()}`, `admin-${k}@aislamiento.test`],
    );
    const companyId = company.rows[0].id;
    const user = await db.query<{ id: string }>(
      `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
       values (gen_random_uuid(), $1, $2, 'x', 'y', 'no-es-un-hash', 'admin_empresa') returning id`,
      [companyId, `admin-${k}@aislamiento.test`],
    );
    const org = await db.query<{ id: string }>(
      `insert into tenant.organizations (id, company_id, name, description, updated_at, size, industry, business_model, compliance_maturity)
       values (gen_random_uuid(), $1, $2, 'x', now(),
         (enum_range(null::tenant.organization_size))[1], (enum_range(null::tenant.industry))[1],
         (enum_range(null::tenant.business_model))[1], (enum_range(null::tenant.compliance_maturity))[1]) returning id`,
      [companyId, `Organización ${k.toUpperCase()}`],
    );
    const rule = await db.query<{ id: string }>(
      `insert into tenant.schedule_rules (id, tenant_id, rule, applies_to, affected_asset_count, next_run_at)
       values (gen_random_uuid(), $1, $2, 'todos', 1, now()) returning id`,
      [companyId, `regla ${k}`],
    );
    out[k] = { companyId, userId: user.rows[0].id, ruleId: rule.rows[0].id, orgId: org.rows[0].id };
  }
  return out;
}
