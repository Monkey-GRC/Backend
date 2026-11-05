import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { RUN } from '../support/app';
import { connect } from '../support/db';

// D104 / MD-189 · La migración 20261105000400_group_kind: `user_groups.kind` NOT NULL, rellenado según quién lidera, y un solo `team` por responsable.
// Se ejecuta el SQL real sobre datos sembrados en el estado de ANTES (columna sin NOT NULL, valores nulos y sin el índice parcial).
const SQL = readFileSync(join(__dirname, '../../prisma/migrations/20261105000400_group_kind/migration.sql'), 'utf8');

type Db = Awaited<ReturnType<typeof connect>>;
let db: Db;

const empresa = async (k: string): Promise<string> => {
  const id = randomUUID();
  await db.query(`insert into platform.companies (id, name, admin_email, updated_at) values ($1, $2, $3, now())`, [id, `Kind ${k} ${RUN}`, `admin-${k}-${RUN}@kind.test`]);
  return id;
};
const usuario = async (companyId: string, k: string, role: string, createdAt: string, groupId: string | null = null, status = 'active'): Promise<string> => {
  const id = randomUUID();
  await db.query(
    `insert into platform.users (id, company_id, email, password_hash, role, status, group_id, is_internal, created_at) values ($1, $2, $3, 'x', $4::platform.user_role, $8::platform.user_status, $5, $6, $7)`,
    [id, companyId, `${k}-${RUN}@kind.test`, role, groupId, role === 'delegado' ? true : null, createdAt, status],
  );
  return id;
};
const grupo = async (companyId: string, name: string, leaderId: string, createdAt = '2026-01-01'): Promise<string> => {
  const id = randomUUID();
  await db.query('insert into platform.user_groups (id, company_id, name, leader_id, created_at) values ($1, $2, $3, $4, $5)', [id, companyId, name, leaderId, createdAt]);
  return id;
};
const rows = async <T>(sql: string, params: unknown[] = []): Promise<T[]> => (await db.query(sql, params)).rows as T[];
const kindOf = (id: string) => rows<{ kind: string | null }>('select kind::text from platform.user_groups where id = $1', [id]).then((r) => r[0].kind);
const groupOf = (id: string) => rows<{ group_id: string | null }>('select group_id from platform.users where id = $1', [id]).then((r) => r[0].group_id);
const rls = () =>
  rows<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
    `select relname, relrowsecurity, relforcerowsecurity from pg_class where oid in ('platform.users'::regclass, 'platform.user_groups'::regclass) order by relname`,
  );

beforeAll(async () => {
  db = await connect();
});
afterAll(async () => {
  await db.end();
});

it('rellena kind según el líder, funde los equipos repetidos de un mismo responsable sin borrar nada, deja NOT NULL y el índice parcial, es repetible y conserva RLS con FORCE', async () => {
  // El estado de antes: sin NOT NULL y sin el índice que impide dos equipos del mismo líder.
  await db.query('alter table platform.user_groups alter column kind drop not null');
  await db.query('drop index platform.user_groups_one_team_per_leader');

  // Empresa 1: un grupo de responsables (lo lidera el admin) y un equipo (lo lidera un responsable).
  const e1 = await empresa('1');
  const admin1 = await usuario(e1, 'e1-admin', 'admin_empresa', '2026-01-01');
  const resp1 = await usuario(e1, 'e1-resp', 'responsable', '2026-02-01');
  const gResp = await grupo(e1, 'Responsables', admin1);
  const gTeam = await grupo(e1, 'Equipo 1', resp1);

  // Empresa 2: un responsable con DOS equipos (el más antiguo manda), cada uno con un delegado.
  const e2 = await empresa('2');
  // El más antiguo está dado de baja: el sobrante lo recibe el administrador activo, no el más viejo.
  await usuario(e2, 'e2-admin-viejo', 'admin_empresa', '2026-01-01', null, 'inactive');
  const admin2 = await usuario(e2, 'e2-admin-nuevo', 'admin_empresa', '2026-05-01');
  const resp2 = await usuario(e2, 'e2-resp', 'responsable', '2026-02-01');
  const viejo = await grupo(e2, 'Equipo viejo', resp2, '2026-03-01');
  const nuevo = await grupo(e2, 'Equipo nuevo', resp2, '2026-04-01');
  const d1 = await usuario(e2, 'e2-d1', 'delegado', '2026-03-02', viejo);
  const d2 = await usuario(e2, 'e2-d2', 'delegado', '2026-04-02', nuevo);

  // Empresa 3: lo mismo, pero sin ningún admin_empresa que reciba el grupo sobrante.
  const e3 = await empresa('3');
  const resp3 = await usuario(e3, 'e3-resp', 'responsable', '2026-02-01');
  const g3a = await grupo(e3, 'A', resp3, '2026-03-01');
  const g3b = await grupo(e3, 'B', resp3, '2026-04-01');

  await db.query('update platform.user_groups set kind = null where company_id = any($1)', [[e1, e2, e3]]);

  // Sin admin_empresa no se adivina: la migración aborta COMPLETA (ni los datos ni FORCE cambian) y dice qué hacer.
  await expect(db.query(SQL)).rejects.toThrow(/más de un equipo y ningún admin_empresa/);
  expect(await kindOf(gResp)).toBeNull();
  expect(await kindOf(g3a)).toBeNull();
  expect((await rls()).every((t) => t.relrowsecurity && t.relforcerowsecurity)).toBe(true);

  // Con un administrador que reciba el sobrante, corre.
  // Sin ningún activo: manda el pendiente aunque haya uno inactivo más antiguo.
  await usuario(e3, 'e3-admin-inactivo', 'admin_empresa', '2025-12-01', null, 'inactive');
  const admin3 = await usuario(e3, 'e3-admin', 'admin_empresa', '2026-01-01', null, 'pending');
  await db.query(SQL);

  expect(await kindOf(gResp)).toBe('responsables');
  expect(await kindOf(gTeam)).toBe('team');

  // Empresa 2: el más antiguo sigue siendo el equipo; el otro no se borra, queda vacío, de responsables, con el admin más antiguo y un nombre que dice qué pasó.
  expect(await kindOf(viejo)).toBe('team');
  const sobrante = (await rows<{ kind: string; name: string; leader_id: string }>('select kind::text, name, leader_id from platform.user_groups where id = $1', [nuevo]))[0];
  expect(sobrante).toEqual({ kind: 'responsables', name: 'Equipo nuevo (fusionado 1)', leader_id: admin2 }); // el administrador activo
  expect(await groupOf(d1)).toBe(viejo);
  expect(await groupOf(d2)).toBe(viejo);
  expect(await rows('select 1 from platform.users where group_id = $1', [nuevo])).toHaveLength(0);
  expect(await rows('select 1 from platform.user_groups where company_id = $1', [e2])).toHaveLength(2);
  expect(await rows('select 1 from platform.users where company_id = $1', [e2])).toHaveLength(5);

  expect(await kindOf(g3a)).toBe('team');
  expect((await rows<{ kind: string; leader_id: string }>('select kind::text, leader_id from platform.user_groups where id = $1', [g3b]))[0]).toEqual({ kind: 'responsables', leader_id: admin3 });

  // Repetirla a mano no falla ni cambia nada.
  const antes = await rows('select id, name, kind::text, leader_id from platform.user_groups where company_id = any($1) order by id', [[e1, e2, e3]]);
  await db.query(SQL);
  expect(await rows('select id, name, kind::text, leader_id from platform.user_groups where company_id = any($1) order by id', [[e1, e2, e3]])).toEqual(antes);

  // Estado final: NOT NULL, el índice parcial rechaza un segundo `team` del mismo responsable (y deja varios grupos de responsables), RLS habilitado y forzado.
  const col = await rows<{ is_nullable: string; column_default: string | null }>(
    `select is_nullable, column_default from information_schema.columns where table_schema = 'platform' and table_name = 'user_groups' and column_name = 'kind'`,
  );
  expect(col).toEqual([{ is_nullable: 'NO', column_default: null }]);
  await expect(db.query(`insert into platform.user_groups (id, company_id, name, kind, leader_id) values (gen_random_uuid(), $1, 'Otro equipo', 'team', $2)`, [e1, resp1])).rejects.toThrow(/user_groups_one_team_per_leader/);
  await db.query(`insert into platform.user_groups (id, company_id, name, kind, leader_id) values (gen_random_uuid(), $1, 'Otro de responsables', 'responsables', $2)`, [e1, admin1]);
  await db.query(`insert into platform.user_groups (id, company_id, name, kind, leader_id) values (gen_random_uuid(), $1, 'Otro más', 'responsables', $2)`, [e1, admin1]);
  await expect(db.query(`insert into platform.user_groups (id, company_id, name, leader_id) values (gen_random_uuid(), $1, 'Sin clase', $2)`, [e1, admin1])).rejects.toThrow(/kind/);
  const estado = await rls();
  expect(estado).toHaveLength(2);
  for (const t of estado) expect({ t: t.relname, rls: t.relrowsecurity, force: t.relforcerowsecurity }).toEqual({ t: t.relname, rls: true, force: true });
});
