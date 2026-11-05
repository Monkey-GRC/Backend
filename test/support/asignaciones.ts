import { owner } from './app';

// D102 · El dueño (y el ejecutor) de un control salen de platform.client_control_assignments. Las pruebas asignan directamente en la base (lo que harán los endpoints de MD-192).

async function adminDe(companyId: string): Promise<string> {
  return (await owner<{ id: string }>(`select id from platform.users where company_id = $1 and role = 'admin_empresa' order by created_at limit 1`, [companyId]))[0].id;
}

/** Deja a `ownerId` como dueño de un control (y a `executorId` como su ejecutor, si se manda). */
export async function asignarControl(companyId: string, controlId: string, ownerId: string, executorId: string | null = null): Promise<void> {
  const by = await adminDe(companyId);
  await owner(
    `insert into platform.client_control_assignments (id, company_id, client_control_id, owner_id, executor_id, assigned_by, updated_at) values (gen_random_uuid(), $1, $2, $3, $4, $5, now())
     on conflict (client_control_id) do update set owner_id = excluded.owner_id, executor_id = excluded.executor_id, updated_at = now()`,
    [companyId, controlId, ownerId, executorId, by],
  );
}

/** Deja a `ownerId` como dueño de todos los controles activos del servicio. */
export async function asignarServicio(companyId: string, serviceId: string, ownerId: string): Promise<void> {
  for (const c of await controlesDe(serviceId)) await asignarControl(companyId, c, ownerId);
}

export async function controlesDe(serviceId: string): Promise<string[]> {
  return (await owner<{ id: string }>(`select id from tenant.client_controls where service_id = $1 and is_active order by own_code`, [serviceId])).map((r) => r.id);
}

/** Las dimensiones en las que un control tiene pruebas. */
export async function dimensionesDe(controlId: string): Promise<string[]> {
  const rows = await owner<{ dimension: string }>(
    `select distinct t.dimension::text as dimension from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1`,
    [controlId],
  );
  return rows.map((r) => r.dimension);
}

/** Dos controles activos del servicio, uno con pruebas de una dimensión técnica y otro sin ellas. */
export async function controlesQueSeparan(serviceId: string): Promise<{ dimension: string; con: string; sin: string }> {
  const rows = await owner<{ id: string; dims: string[] }>(
    `select cc.id, array_agg(distinct t.dimension::text) dims from tenant.client_controls cc join tenant.client_control_tests x on x.client_control_id = cc.id join catalog.tests t on t.id = x.test_id
      where cc.service_id = $1 and cc.is_active group by cc.id order by cc.own_code`,
    [serviceId],
  );
  for (const dimension of ['cloud', 'server', 'database'] as const) {
    const con = rows.find((r) => r.dims.includes(dimension));
    const sin = rows.find((r) => !r.dims.includes(dimension));
    if (con && sin) return { dimension, con: con.id, sin: sin.id };
  }
  throw new Error('el servicio de prueba no tiene dos controles que se distingan por dimensión');
}

/** Los controles activos del servicio que llevan pruebas de esa dimensión. */
export async function controlesConDimension(serviceId: string, dimension: string): Promise<string[]> {
  const rows = await owner<{ id: string }>(
    `select distinct cc.id from tenant.client_controls cc join tenant.client_control_tests x on x.client_control_id = cc.id join catalog.tests t on t.id = x.test_id
      where cc.service_id = $1 and cc.is_active and t.dimension = $2::catalog.dimension`,
    [serviceId, dimension],
  );
  return rows.map((r) => r.id);
}
