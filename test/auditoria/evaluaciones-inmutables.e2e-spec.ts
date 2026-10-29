import type { INestApplication } from '@nestjs/common';
import { bootApp, owner } from '../support/app';
import { asApp, failure, withRollback } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';

// MD-145 · SEG-38 (D27): una evaluación registrada se agrega y nunca se edita ni se borra, para TODOS los roles de la
// base —también el dueño de la tabla—. La única excepción es el cierre humano (§7.5): confirmed_by y
// closure_observation_reason. Cada intento que debe fallar corre en una transacción que siempre se revierte.
let app: INestApplication;
let a: Tenant;
let evaluationId: string;
let userId: string;

const REJECTED = /es inmutable|permission denied/;

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
  [{ id: userId }] = await owner<{ id: string }>(`select id from platform.users where company_id = $1 limit 1`, [a.companyId]);
  const [c] = await owner<{ id: string; test_id: string; catalog_version_id: string }>(
    `select c.id, t.id as test_id, sf.catalog_version_id
       from tenant.client_controls c
       join tenant.client_control_tests cct on cct.client_control_id = c.id
       join catalog.tests t on t.id = cct.test_id and t.dimension = 'cloud'
       join tenant.service_frameworks sf on sf.service_id = c.service_id
      where c.service_id = $1 and c.is_active order by c.own_code limit 1`,
    [a.serviceId],
  );
  [{ id: evaluationId }] = await owner<{ id: string }>(
    `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, dimension, result, origin)
     values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'cloud', 'compliant'::tenant.evaluation_result, 'automated') returning id`,
    [a.companyId, a.serviceId, c.id, c.test_id, a.assetId, c.catalog_version_id],
  );
});
afterAll(async () => {
  await app?.close();
});

describe('Como el dueño de la tabla (el rol de las migraciones)', () => {
  it.each([
    ['cambiar lo medido', `update tenant.evaluations set result = 'non_compliant'::tenant.evaluation_result where id = $1`],
    ['cambiar el instante', `update tenant.evaluations set evaluated_at = now() - interval '1 day' where id = $1`],
    ['cambiar la respuesta del cliente', `update tenant.evaluations set client_response = 'otra' where id = $1`],
    ['borrarla', `delete from tenant.evaluations where id = $1`],
  ])('no puede %s', async (_what, sql) => {
    await withRollback(async (db) => {
      expect(await failure(db, sql, [evaluationId])).toMatch(REJECTED);
    });
  });

  it('no puede vaciar la tabla', async () => {
    await withRollback(async (db) => {
      expect(await failure(db, `truncate tenant.evaluations cascade`)).toMatch(REJECTED);
    });
  });

  it('el cierre humano sí: completa quién confirma y la razón, y no cambia lo medido', async () => {
    await withRollback(async (db) => {
      await db.query(`update tenant.evaluations set confirmed_by = $2, closure_observation_reason = 'Cierra con una observación abierta' where id = $1`, [evaluationId, userId]);
      const { rows } = await db.query(`select result, confirmed_by, closure_observation_reason from tenant.evaluations where id = $1`, [evaluationId]);
      expect(rows[0]).toEqual({ result: 'compliant', confirmed_by: userId, closure_observation_reason: 'Cierra con una observación abierta' });
    });
  });

  it('el cierre humano no puede venir acompañado de un cambio de lo medido', async () => {
    await withRollback(async (db) => {
      const sql = `update tenant.evaluations set confirmed_by = $2, result = 'non_compliant'::tenant.evaluation_result where id = $1`;
      expect(await failure(db, sql, [evaluationId, userId])).toMatch(REJECTED);
    });
  });

  it('agregar una evaluación nueva sigue funcionando', async () => {
    const [{ n }] = await owner<{ n: number }>(`select count(*)::int n from tenant.evaluations where tenant_id = $1`, [a.companyId]);
    expect(n).toBeGreaterThan(0);
  });
});

describe('Como la app (monkey_app)', () => {
  it.each([
    ['cambiar lo medido', `update tenant.evaluations set result = 'non_compliant'::tenant.evaluation_result where id = $1`],
    ['borrarla', `delete from tenant.evaluations where id = $1`],
  ])('no puede %s', async (_what, sql) => {
    await withRollback(async (db) => {
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => {
        expect(await failure(db, sql, [evaluationId])).toMatch(REJECTED);
      });
    });
  });

  it('no puede vaciar la tabla', async () => {
    await withRollback(async (db) => {
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => {
        expect(await failure(db, `truncate tenant.evaluations cascade`)).toMatch(REJECTED);
      });
    });
  });

  it('sí puede cerrar: confirmed_by y closure_observation_reason', async () => {
    await withRollback(async (db) => {
      await asApp(db, { tenantId: a.companyId, role: 'admin_empresa' }, async () => {
        const r = await db.query(`update tenant.evaluations set confirmed_by = $2, closure_observation_reason = 'razón' where id = $1`, [evaluationId, userId]);
        expect(r.rowCount).toBe(1);
      });
    });
  });
});
