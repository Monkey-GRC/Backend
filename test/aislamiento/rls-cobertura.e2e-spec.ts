import { connect } from '../support/db';
import type { Client } from 'pg';

// Guardia estructural: una tabla nueva sin RLS es una fuga entre empresas esperando a pasar. Estas pruebas leen el
// catálogo de Postgres y fallan si una tabla de datos de cliente queda sin aislamiento, sin tener que conocerla.
const TENANT_SCHEMAS = ['tenant', 'platform', 'audit'];
// La política estándar (`tenant_isolation`, schema-implementacion.md §5) compara el discriminante con app.tenant_id
// en USING y en WITH CHECK. Las demás (lectura de admin_monkey, auditor, audit_logs…) son excepciones documentadas:
// no se exige el patrón, pero ninguna puede quedar sin condición de sesión.
const PATRON_ESTANDAR = /(tenant_id|company_id)\s*=\s*\(?\s*\(?NULLIF\(current_setting\('app\.tenant_id'/i;
const USA_LA_SESION = /current_setting\('app\.(tenant_id|user_role|user_id)'/i;

let db: Client;
beforeAll(async () => {
  db = await connect();
});
afterAll(async () => {
  await db.end();
});

describe('Aislamiento por empresa (RLS) — cobertura de tablas', () => {
  it('el rol de la app no es superusuario ni se salta RLS', async () => {
    const r = await db.query(`select rolsuper, rolbypassrls from pg_roles where rolname = 'monkey_app'`);
    expect(r.rows).toEqual([{ rolsuper: false, rolbypassrls: false }]);
  });

  it('toda tabla de datos de cliente tiene RLS activa, forzada y al menos una política', async () => {
    const r = await db.query(
      `select n.nspname || '.' || c.relname as tabla, c.relrowsecurity as rls, c.relforcerowsecurity as forzada,
              (select count(*)::int from pg_policy p where p.polrelid = c.oid) as politicas
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where c.relkind = 'r' and n.nspname = any($1) order by 1`,
      [TENANT_SCHEMAS],
    );
    expect(r.rowCount).toBeGreaterThan(40);
    const mal = r.rows.filter((t) => !t.rls || !t.forzada || t.politicas < 1).map((t) => t.tabla);
    expect(mal).toEqual([]);
  });

  it('toda tabla de datos de cliente lleva su discriminante (tenant_id o company_id)', async () => {
    const r = await db.query(
      `select n.nspname || '.' || c.relname as tabla
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where c.relkind = 'r' and n.nspname = any($1)
          and not exists (select 1 from pg_attribute a where a.attrelid = c.oid and not a.attisdropped
                            and a.attname in ('tenant_id', 'company_id'))`,
      [TENANT_SCHEMAS],
    );
    // platform.companies se aísla por su propio id; audit.admin_tombstones (D117) es de la plataforma, no de una empresa: solo admin_monkey la lee y la escribe (política `admin_monkey_only`).
    expect(r.rows.map((t) => t.tabla).sort()).toEqual(['audit.admin_tombstones', 'platform.companies']);
  });

  it('las políticas tenant_isolation comparan el discriminante con app.tenant_id en USING y WITH CHECK', async () => {
    const r = await db.query(
      `select n.nspname || '.' || c.relname as tabla,
              pg_get_expr(p.polqual, p.polrelid) as usando, pg_get_expr(p.polwithcheck, p.polrelid) as con_check
         from pg_policy p join pg_class c on c.oid = p.polrelid join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = any($1) and p.polname = 'tenant_isolation'`,
      [TENANT_SCHEMAS],
    );
    expect(r.rowCount).toBeGreaterThan(30);
    const mal = r.rows.filter((p) => !(PATRON_ESTANDAR.test(p.usando ?? '') && PATRON_ESTANDAR.test(p.con_check ?? ''))).map((p) => p.tabla);
    expect(mal).toEqual([]);
  });

  it('toda política de datos de cliente depende de la sesión (tenant o rol), nunca es incondicional', async () => {
    const r = await db.query(
      `select n.nspname || '.' || c.relname || ': ' || p.polname as politica,
              pg_get_expr(p.polqual, p.polrelid) as usando, pg_get_expr(p.polwithcheck, p.polrelid) as con_check
         from pg_policy p join pg_class c on c.oid = p.polrelid join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = any($1)`,
      [TENANT_SCHEMAS],
    );
    const mal = r.rows
      .filter((p) => ![p.usando, p.con_check].filter(Boolean).every((e: string) => USA_LA_SESION.test(e) || /IS NULL/i.test(e)))
      .map((p) => p.politica);
    expect(mal).toEqual([]);
  });

  it('ninguna política abre la tabla con "true" ni con roles públicos de lectura', async () => {
    const r = await db.query(
      `select n.nspname || '.' || c.relname as tabla, p.polname
         from pg_policy p join pg_class c on c.oid = p.polrelid join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = any($1) and (pg_get_expr(p.polqual, p.polrelid) = 'true' or pg_get_expr(p.polwithcheck, p.polrelid) = 'true')`,
      [TENANT_SCHEMAS],
    );
    expect(r.rows).toEqual([]);
  });

  it('el catálogo: toda tabla tiene RLS y política de lectura; la escritura no es libre', async () => {
    const r = await db.query(
      `select n.nspname || '.' || c.relname as tabla, c.relrowsecurity as rls,
              coalesce(string_agg(p.polcmd::text, ','), '') as cmds
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
         left join pg_policy p on p.polrelid = c.oid
        where c.relkind = 'r' and n.nspname = 'catalog' group by 1, 2 order by 1`,
    );
    expect(r.rowCount).toBeGreaterThan(20);
    // polcmd: r=SELECT, a=INSERT, w=UPDATE, d=DELETE, *=ALL
    const sinRls = r.rows.filter((t) => !t.rls).map((t) => t.tabla);
    const sinLectura = r.rows.filter((t) => !/[r*]/.test(t.cmds)).map((t) => t.tabla);
    const sinEscritura = r.rows.filter((t) => !(/\*/.test(t.cmds) || (/a/.test(t.cmds) && /w/.test(t.cmds) && /d/.test(t.cmds)))).map((t) => t.tabla);
    expect({ sinRls, sinLectura, sinEscritura }).toEqual({ sinRls: [], sinLectura: [], sinEscritura: [] });
  });
});
