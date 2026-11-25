import type { Client } from 'pg';
import { asApp, connect, failure, withRollback } from '../support/db';
import { bootApp, owner } from '../support/app';
import { dosEmpresas } from '../support/escenario';
import type { INestApplication } from '@nestjs/common';

// SEG-88 · La aceptación es inmutable para TODOS los roles de la base: `monkey_app` no tiene el permiso y un trigger lo impone también al dueño; solo la purga de una empresa archivada la borra (D97).
// Lo mismo, con matices, para la versión (solo pasa de vigente a archivada) y la asignación (solo se quita marcando `revoked_at`). RLS FORZADA por empresa en las cuatro tablas.
let app: INestApplication;
let a: { companyId: string; userId: string };
let b: { companyId: string; userId: string };

const sha = 'a'.repeat(64);
async function sembrar(db: Client, companyId: string, userId: string): Promise<{ documento: string; version: string; asignacion: string; aceptacion: string }> {
  const [d] = (await db.query<{ id: string }>(`select id from catalog.documents limit 1`)).rows;
  const documento = (await db.query<{ id: string }>(`insert into tenant.company_documents (id, tenant_id, document_id, origin, acceptance) values (gen_random_uuid(), $1, $2, 'internal', 'all_users') on conflict (tenant_id, document_id) do update set origin = 'internal' returning id`, [companyId, d.id])).rows[0].id;
  const version = (await db.query<{ id: string }>(
    `insert into tenant.document_versions (id, tenant_id, company_document_id, number, status, file_path, file_name, file_type, file_size, integrity_hash, approvers, approved_at, created_by)
     values (gen_random_uuid(), $1, $2, 1, 'current', 'k', 'n.pdf', 'application/pdf', 10, $3, '[{"name":"A","role_label":"B"}]', '2026-11-01', $4) returning id`,
    [companyId, documento, sha, userId],
  )).rows[0].id;
  const asignacion = (await db.query<{ id: string }>(
    `insert into tenant.document_assignments (id, tenant_id, company_document_id, user_id, assigned_by, assigned_at, due_at) values (gen_random_uuid(), $1, $2, $3, $3, now(), now() + interval '30 days') returning id`,
    [companyId, documento, userId],
  )).rows[0].id;
  const aceptacion = (await db.query<{ id: string }>(`insert into tenant.document_acceptances (id, tenant_id, document_version_id, user_id, integrity_hash) values (gen_random_uuid(), $1, $2, $3, $4) returning id`, [companyId, version, userId, sha])).rows[0].id;
  return { documento, version, asignacion, aceptacion };
}

beforeAll(async () => {
  app = await bootApp();
  const { a: ta, b: tb } = await dosEmpresas(app);
  const admin = async (companyId: string) => (await owner<{ id: string }>(`select id from platform.users where company_id = $1 and role = 'admin_empresa' limit 1`, [companyId]))[0].id;
  a = { companyId: ta.companyId, userId: await admin(ta.companyId) };
  b = { companyId: tb.companyId, userId: await admin(tb.companyId) };
});
afterAll(async () => {
  await app?.close();
});

describe('la aceptación (SEG-88)', () => {
  it('monkey_app no puede editarla, borrarla ni vaciar la tabla; el dueño tampoco (trigger)', () =>
    withRollback(async (db) => {
      const s = await sembrar(db, a.companyId, a.userId);
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa', userId: a.userId }, async () => {
        expect(await failure(db, `update tenant.document_acceptances set integrity_hash = $1 where id = $2`, ['b'.repeat(64), s.aceptacion])).toMatch(/permission denied/);
        expect(await failure(db, `delete from tenant.document_acceptances where id = $1`, [s.aceptacion])).toMatch(/permission denied/);
        expect(await failure(db, `truncate tenant.document_acceptances`)).toMatch(/permission denied/);
      });
      expect(await failure(db, `update tenant.document_acceptances set integrity_hash = $1 where id = $2`, ['b'.repeat(64), s.aceptacion])).toMatch(/es inmutable/);
      expect(await failure(db, `delete from tenant.document_acceptances where id = $1`, [s.aceptacion])).toMatch(/es inmutable/);
      expect(await failure(db, `truncate tenant.document_acceptances`)).toMatch(/es inmutable/);
      expect((await db.query('select 1 from tenant.document_acceptances where id = $1', [s.aceptacion])).rowCount).toBe(1);
    }));

  it('una sola por persona y versión (índice único)', () =>
    withRollback(async (db) => {
      const s = await sembrar(db, a.companyId, a.userId);
      expect(await failure(db, `insert into tenant.document_acceptances (id, tenant_id, document_version_id, user_id, integrity_hash) values (gen_random_uuid(), $1, $2, $3, $4)`, [a.companyId, s.version, a.userId, sha])).toMatch(/document_acceptances_document_version_id_user_id_key/);
    }));

  it('la huella tiene la forma de un SHA-256', () =>
    withRollback(async (db) => {
      const s = await sembrar(db, a.companyId, a.userId);
      expect(await failure(db, `insert into tenant.document_acceptances (id, tenant_id, document_version_id, user_id, integrity_hash) values (gen_random_uuid(), $1, $2, $3, 'corta')`, [a.companyId, s.version, b.userId])).toMatch(/integrity_hash_check/);
    }));
});

describe('la versión', () => {
  it('conserva su archivo, su huella y su aprobación; solo pasa de vigente a archivada; no se borra', () =>
    withRollback(async (db) => {
      const s = await sembrar(db, a.companyId, a.userId);
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa', userId: a.userId }, async () => {
        expect(await failure(db, `update tenant.document_versions set file_name = 'otro.pdf' where id = $1`, [s.version])).toMatch(/permission denied/);
        expect(await failure(db, `delete from tenant.document_versions where id = $1`, [s.version])).toMatch(/permission denied/);
      });
      for (const cambio of [`file_name = 'otro.pdf'`, `integrity_hash = '${'c'.repeat(64)}'`, `approved_at = '2020-01-01'`, `number = 9`]) {
        expect({ cambio, error: await failure(db, `update tenant.document_versions set ${cambio} where id = $1`, [s.version]) }).toEqual({ cambio, error: expect.stringMatching(/es inmutable/) });
      }
      expect(await failure(db, `delete from tenant.document_versions where id = $1`, [s.version])).toMatch(/no está permitido/);
      // Archivarla sí, también como monkey_app (solo `status`); y archivada no vuelve a vigente.
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa', userId: a.userId }, async () => {
        expect((await db.query(`update tenant.document_versions set status = 'archived' where id = $1`, [s.version])).rowCount).toBe(1);
      });
      expect(await failure(db, `update tenant.document_versions set status = 'current' where id = $1`, [s.version])).toMatch(/es inmutable/);
    }));

  it('una sola vigente por documento', () =>
    withRollback(async (db) => {
      const s = await sembrar(db, a.companyId, a.userId);
      expect(await failure(db, `insert into tenant.document_versions (id, tenant_id, company_document_id, number, status, file_path, file_name, file_type, file_size, integrity_hash, approvers, approved_at, created_by)
        values (gen_random_uuid(), $1, $2, 2, 'current', 'k', 'n.pdf', 'application/pdf', 10, $3, '[{"name":"A","role_label":"B"}]', '2026-11-01', $4)`, [a.companyId, s.documento, sha, a.userId])).toMatch(/document_versions_one_current_idx/);
    }));

  it('de 1 a 3 aprobadores y número desde 1, también en la base', () =>
    withRollback(async (db) => {
      const s = await sembrar(db, a.companyId, a.userId);
      const insertar = (n: number, approvers: string) =>
        failure(db, `insert into tenant.document_versions (id, tenant_id, company_document_id, number, status, file_path, file_name, file_type, file_size, integrity_hash, approvers, approved_at, created_by)
          values (gen_random_uuid(), $1, $2, $3, 'archived', 'k', 'n.pdf', 'application/pdf', 10, $4, $5::jsonb, '2026-11-01', $6)`, [a.companyId, s.documento, n, sha, approvers, a.userId]);
      expect(await insertar(2, '[]')).toMatch(/approvers_check/);
      expect(await insertar(2, JSON.stringify([1, 2, 3, 4].map((i) => ({ name: `n${i}`, role_label: 'r' }))))).toMatch(/approvers_check/);
      expect(await insertar(0, '[{"name":"A","role_label":"B"}]')).toMatch(/number_check/);
      expect(await insertar(2, '[{"name":"A","role_label":"B"}]')).toBeNull();
    }));
});

describe('la asignación', () => {
  it('monkey_app no la borra: quitarla es marcar revoked_at, y solo puede cambiar quién, cuándo y el plazo', () =>
    withRollback(async (db) => {
      const s = await sembrar(db, a.companyId, a.userId);
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa', userId: a.userId }, async () => {
        expect(await failure(db, `delete from tenant.document_assignments where id = $1`, [s.asignacion])).toMatch(/permission denied/);
        expect(await failure(db, `update tenant.document_assignments set user_id = $2 where id = $1`, [s.asignacion, b.userId])).toMatch(/permission denied/);
        expect((await db.query(`update tenant.document_assignments set revoked_at = now() where id = $1`, [s.asignacion])).rowCount).toBe(1);
      });
    }));
});

describe('RLS por empresa (forzada)', () => {
  it('B no ve nada de A en ninguna de las cuatro tablas, ni escribe como A', () =>
    withRollback(async (db) => {
      await sembrar(db, a.companyId, a.userId);
      await asApp(db, { tenantId: b.companyId, role: 'admin_empresa', userId: b.userId }, async () => {
        for (const tabla of ['company_documents', 'document_versions', 'document_assignments', 'document_acceptances']) {
          expect({ tabla, filas: (await db.query(`select 1 from tenant.${tabla} where tenant_id = $1`, [a.companyId])).rowCount }).toEqual({ tabla, filas: 0 });
        }
        expect(await failure(db, `insert into tenant.document_acceptances (id, tenant_id, document_version_id, user_id, integrity_hash) select gen_random_uuid(), $1, id, $2, $3 from tenant.document_versions where tenant_id = $1`, [a.companyId, a.userId, sha])).toBeNull(); // no hay versiones de A que ver: inserta 0 filas
        expect(await failure(db, `insert into tenant.company_documents (id, tenant_id, document_id, origin, acceptance) select gen_random_uuid(), $1, id, 'internal', 'all_users' from catalog.documents limit 1`, [a.companyId])).toMatch(/row-level security/);
      });
    }));

  it('sin empresa fijada (falla cerrado) no se ve nada', () =>
    withRollback(async (db) => {
      await sembrar(db, a.companyId, a.userId);
      await asApp(db, {}, async () => {
        expect((await db.query('select 1 from tenant.document_versions where tenant_id = $1', [a.companyId])).rowCount).toBe(0);
        expect((await db.query('select 1 from tenant.document_versions')).rowCount).toBe(0);
      });
    }));

  it('las cuatro tablas tienen RLS activada y forzada', async () => {
    const rows = await owner<{ relname: string; relrowsecurity: boolean; relforcerowsecurity: boolean }>(
      `select c.relname, c.relrowsecurity, c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'tenant' and c.relname in ('company_documents','document_versions','document_assignments','document_acceptances') order by 1`,
    );
    expect(rows).toHaveLength(4);
    for (const r of rows) expect(r).toMatchObject({ relrowsecurity: true, relforcerowsecurity: true });
  });
});

describe('la purga de una empresa archivada (D97) sí borra lo inmutable', () => {
  it('después de purgar no queda ninguna fila de documentos de la empresa', async () => {
    const tp = b;
    const uid = b.userId;
    const db = await connect();
    try {
      await sembrar(db, tp.companyId, uid);
      await db.query(`update platform.companies set status = 'deactivated', deactivated_at = now() - interval '40 days', archive_until = now() - interval '1 day' where id = $1`, [tp.companyId]);
      await db.query('select platform.purge_company($1)', [tp.companyId]);
      for (const tabla of ['company_documents', 'document_versions', 'document_assignments', 'document_acceptances']) {
        expect({ tabla, filas: (await db.query(`select 1 from tenant.${tabla} where tenant_id = $1`, [tp.companyId])).rowCount }).toEqual({ tabla, filas: 0 });
      }
    } finally {
      await db.end();
    }
  });
});
