import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { RUN } from '../support/app';
import { connect } from '../support/db';

// D104 · La migración 20261105000300_responsables_group: los responsables sin grupo pasan a «Responsables» y el nombre de un grupo es único por empresa.
// Se ejecuta el SQL real de la migración sobre datos sembrados (con el índice único retirado antes, para poder sembrar nombres repetidos).
const SQL = readFileSync(join(__dirname, '../../prisma/migrations/20261105000300_responsables_group/migration.sql'), 'utf8');

type Db = Awaited<ReturnType<typeof connect>>;
let db: Db;

const empresa = async (k: string): Promise<string> => {
  const id = randomUUID();
  await db.query(`insert into platform.companies (id, name, admin_email, updated_at) values ($1, $2, $3, now())`, [id, `Mig ${k} ${RUN}`, `admin-${k}-${RUN}@migracion.test`]);
  return id;
};
const usuario = async (companyId: string, k: string, role: string, createdAt: string, groupId: string | null = null): Promise<string> => {
  const id = randomUUID();
  await db.query(
    `insert into platform.users (id, company_id, email, password_hash, role, status, group_id, is_internal, created_at) values ($1, $2, $3, 'x', $4::platform.user_role, 'active', $5, $6, $7)`,
    [id, companyId, `${k}-${RUN}@migracion.test`, role, groupId, role === 'delegado' ? true : null, createdAt],
  );
  return id;
};
const grupo = async (companyId: string, name: string, leaderId: string, createdAt = '2026-01-01'): Promise<string> => {
  const id = randomUUID();
  await db.query('insert into platform.user_groups (id, company_id, name, leader_id, created_at) values ($1, $2, $3, $4, $5)', [id, companyId, name, leaderId, createdAt]);
  return id;
};
const rows = async <T>(sql: string, params: unknown[] = []): Promise<T[]> => (await db.query(sql, params)).rows as T[];

beforeAll(async () => {
  db = await connect();
});
afterAll(async () => {
  await db.end();
});

it('mete a los responsables sin grupo en «Responsables» (lo crea con el admin más antiguo), respeta lo que ya tienen, omite la empresa sin admin y deja único el nombre', async () => {
  await db.query('drop index platform.user_groups_company_id_name_key');

  // Empresa 1: sin «Responsables»; dos admins (manda el más antiguo) y dos responsables sin grupo.
  const e1 = await empresa('1');
  const viejo = await usuario(e1, 'e1-admin-viejo', 'admin_empresa', '2026-01-01');
  await usuario(e1, 'e1-admin-nuevo', 'admin_empresa', '2026-06-01');
  const r1 = await usuario(e1, 'e1-r1', 'responsable', '2026-02-01');
  const r2 = await usuario(e1, 'e1-r2', 'responsable', '2026-02-02');
  // Empresa 2: ya tiene «Responsables» y un responsable dentro; otro suelto. Un delegado en un equipo no se toca.
  const e2 = await empresa('2');
  const admin2 = await usuario(e2, 'e2-admin', 'admin_empresa', '2026-01-01');
  const g2 = await grupo(e2, 'Responsables', admin2);
  const dentro = await usuario(e2, 'e2-dentro', 'responsable', '2026-02-01', g2);
  const suelto = await usuario(e2, 'e2-suelto', 'responsable', '2026-02-02');
  const equipo = await grupo(e2, 'Equipo de dentro', dentro);
  const delegado = await usuario(e2, 'e2-del', 'delegado', '2026-03-01', equipo);
  // Empresa 3: responsables sin grupo y ningún admin_empresa: se omite.
  const e3 = await empresa('3');
  const huerfano = await usuario(e3, 'e3-r', 'responsable', '2026-02-01');
  // Empresa 4: nombres repetidos en una misma empresa (sin el índice se pueden sembrar).
  const e4 = await empresa('4');
  const admin4 = await usuario(e4, 'e4-admin', 'admin_empresa', '2026-01-01');
  const primero = await grupo(e4, 'Repetido', admin4, '2026-01-01');
  const segundo = await grupo(e4, 'Repetido', admin4, '2026-02-01');

  // Empresa 5: «Responsables» lo tiene un equipo de un responsable (y «Responsables (2)» ya existe): el nombre se reserva, el equipo se renombra al primer n libre
  // y el responsable sin grupo va al «Responsables» de verdad, que se crea con su admin.
  const e5 = await empresa('5');
  const admin5 = await usuario(e5, 'e5-admin', 'admin_empresa', '2026-01-01');
  const lider5 = await usuario(e5, 'e5-lider', 'responsable', '2026-02-01');
  const falso = await grupo(e5, 'Responsables', lider5, '2026-03-01');
  const ocupado = await grupo(e5, 'Responsables (2)', admin5, '2026-03-02');
  const delegado5 = await usuario(e5, 'e5-del', 'delegado', '2026-03-03', falso);

  await db.query(SQL);

  const g = (id: string) => rows<{ group_id: string | null }>('select group_id from platform.users where id = $1', [id]).then((r) => r[0].group_id);
  const creado = await rows<{ id: string; leader_id: string }>(`select id, leader_id from platform.user_groups where company_id = $1 and name = 'Responsables'`, [e1]);
  expect(creado).toHaveLength(1);
  expect(creado[0].leader_id).toBe(viejo);
  expect(await g(r1)).toBe(creado[0].id);
  expect(await g(r2)).toBe(creado[0].id);

  expect(await g(dentro)).toBe(g2);
  expect(await g(suelto)).toBe(g2);
  expect(await g(delegado)).toBe(equipo);
  expect(await rows(`select 1 from platform.user_groups where company_id = $1 and name = 'Responsables'`, [e2])).toHaveLength(1);

  expect(await g(huerfano)).toBeNull();
  expect(await rows('select 1 from platform.user_groups where company_id = $1', [e3])).toHaveLength(0);

  const nombres = await rows<{ id: string; name: string }>('select id, name from platform.user_groups where company_id = $1 order by created_at', [e4]);
  expect(nombres).toEqual([{ id: primero, name: 'Repetido' }, { id: segundo, name: 'Repetido (2)' }]);

  const nombres5 = await rows<{ id: string; name: string; leader_id: string }>('select id, name, leader_id from platform.user_groups where company_id = $1 order by created_at, id', [e5]);
  expect(nombres5.find((x) => x.id === falso)?.name).toBe('Responsables (3)');
  expect(nombres5.find((x) => x.id === ocupado)?.name).toBe('Responsables (2)');
  const verdadero = nombres5.filter((x) => x.name === 'Responsables');
  expect(verdadero).toHaveLength(1);
  expect(verdadero[0].leader_id).toBe(admin5);
  expect(await g(lider5)).toBe(verdadero[0].id);
  expect(await g(delegado5)).toBe(falso); // el delegado sigue en el equipo, solo cambió su nombre

  // Repetir la migración a mano no falla ni deja FORCE apagado.
  await db.query(SQL);

  // El índice único volvió, y RLS sigue habilitado y forzado.
  await expect(grupo(e4, 'Repetido', admin4)).rejects.toThrow(/user_groups_company_id_name_key/);
  const rls = await rows<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
    `select relname, relrowsecurity, relforcerowsecurity from pg_class where oid in ('platform.users'::regclass, 'platform.user_groups'::regclass)`,
  );
  expect(rls).toHaveLength(2);
  for (const t of rls) expect({ t: t.relname, rls: t.relrowsecurity, force: t.relforcerowsecurity }).toEqual({ t: t.relname, rls: true, force: true });
});
