import { owner } from './app';

// D97 · Un `funcional` atiende todo lo de sus especialidades. Las pruebas le dan sus especialidades directamente en la base (lo que hace el módulo de equipo al invitarlo).
export type Dimension = 'policy' | 'server' | 'database' | 'app' | 'cloud';

export async function darEspecialidades(companyId: string, userId: string, ...dimensions: Dimension[]): Promise<void> {
  for (const dimension of dimensions) {
    await owner(
      `insert into platform.user_dimensions (id, company_id, user_id, dimension) values (gen_random_uuid(), $1, $2, $3::catalog.dimension) on conflict (user_id, dimension) do nothing`,
      [companyId, userId, dimension],
    );
  }
}

/** Las dimensiones en las que un control tiene pruebas. */
export async function dimensionesDe(controlId: string): Promise<Dimension[]> {
  const rows = await owner<{ dimension: Dimension }>(
    `select distinct t.dimension::text as dimension from tenant.client_control_tests x join catalog.tests t on t.id = x.test_id where x.client_control_id = $1`,
    [controlId],
  );
  return rows.map((r) => r.dimension);
}

/** Dos controles activos del servicio, uno con pruebas de una dimensión técnica y otro sin ellas: lo que separa a un especialista de otro. */
export async function controlesQueSeparan(serviceId: string): Promise<{ dimension: Dimension; con: string; sin: string }> {
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
  throw new Error('el servicio de prueba no tiene controles que se distingan por dimensión');
}
