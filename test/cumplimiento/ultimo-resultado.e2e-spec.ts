import type { INestApplication } from '@nestjs/common';
import { bootApp, owner } from '../support/app';
import { connect } from '../support/db';
import { dosEmpresas, Tenant } from '../support/escenario';
import { latestEvaluationsSql, latestVerdictsSql } from '../../src/features/compliance/infrastructure/shared/latest-results.query';

// MD-220 · El último resultado de cada (control, test, activo) no crece con el histórico: la base entrega una fila por clave (DISTINCT ON) y el resumen no cambia por tener 50 corridas.
let app: INestApplication;
let a: Tenant;
let links: { id: string; test_id: string; catalog_version_id: string }[];
const path = () => `/v1/services/${a.serviceId}/compliance-overview`;

// `runs` corridas por control/test sobre el activo, de la más antigua a la más reciente; la más reciente es la única que debe contar.
async function corridas(from: number, to: number, newest: 'compliant' | 'non_compliant'): Promise<void> {
  await owner(
    `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, dimension, result, origin, evaluated_at)
     select gen_random_uuid(), $1, $2, l.c, l.t, $3, l.v, 'cloud',
            (case when g = $8 then $9 else 'compliant' end)::tenant.evaluation_result, 'automated', now() - (g || ' hours')::interval
       from unnest($4::uuid[], $5::uuid[], $6::uuid[]) as l(c, t, v) cross join generate_series($7::int, $10::int) g`,
    [a.companyId, a.serviceId, a.assetId, links.map((l) => l.id), links.map((l) => l.test_id), links.map((l) => l.catalog_version_id), from, from, newest, to],
  );
}

async function leidas(): Promise<{ returned: number; rows: { clientControlId: string; testId: string; result: string }[]; buffers: number; plan: string }> {
  const db = await connect();
  try {
    const q = latestEvaluationsSql(a.serviceId, links.map((l) => l.id));
    await db.query('vacuum analyze tenant.evaluations');
    const explained = (await db.query(`explain (analyze, buffers, format json) ${q.text}`, q.values)).rows[0]['QUERY PLAN'][0].Plan;
    const rows = (await db.query(q.text, q.values)).rows;
    return { returned: explained['Actual Rows'], rows, buffers: explained['Shared Hit Blocks'] + explained['Shared Read Blocks'], plan: JSON.stringify(explained) };
  } finally {
    await db.end();
  }
}

beforeAll(async () => {
  app = await bootApp();
  ({ a } = await dosEmpresas(app));
  await owner(`update tenant.service_frameworks set period_start = '2026-01-01', period_end = '2026-12-31', cutoff_date = '2026-10-14' where service_id = $1`, [a.serviceId]);
  links = await owner(
    `select distinct c.id, cct.test_id, sf.catalog_version_id from tenant.client_controls c join tenant.client_control_tests cct on cct.client_control_id = c.id
       join catalog.tests t on t.id = cct.test_id and t.dimension = 'cloud' join tenant.service_frameworks sf on sf.service_id = c.service_id
      where c.service_id = $1 and c.is_active`,
    [a.serviceId],
  );
});
afterAll(async () => {
  await app?.close();
});

describe('El último resultado no depende del largo del histórico', () => {
  it('con 1 corrida y con 50 la base devuelve las mismas filas y el resumen no cambia', async () => {
    expect(links.length).toBeGreaterThan(0);
    await corridas(1, 1, 'non_compliant');
    const one = await leidas();
    const overviewOne = (await a.agent.get(path()).expect(200)).body.data;

    // 49 corridas anteriores, todas «cumple»: si la lectura tomara una de ellas en vez de la más reciente, el resumen cambiaría.
    await corridas(2, 50, 'compliant');
    const fifty = await leidas();
    const overviewFifty = (await a.agent.get(path()).expect(200)).body.data;

    expect(one.returned).toBe(links.length);
    expect(fifty.returned).toBe(one.returned);
    // Una búsqueda acotada por clave en el índice: el plan no recorre las evaluaciones.
    expect(fifty.plan).toContain('evaluations_latest_idx');
    expect(fifty.plan).toContain('"Node Type":"Limit"');
    expect(fifty.plan).not.toMatch(/Seq Scan[^{}]*"Relation Name":"evaluations"/);
    expect(overviewFifty).toEqual(overviewOne);

    // Con 4× más histórico (200 corridas) sigue siendo un LIMIT 1 por clave en el índice y la base devuelve las mismas filas (el costo crece solo con la profundidad del índice).
    await corridas(51, 200, 'compliant');
    const many = await leidas();
    expect(many.returned).toBe(one.returned);
    expect(many.plan).toContain('"Node Type":"Limit"');
    expect(many.plan).not.toMatch(/Seq Scan[^{}]*"Relation Name":"evaluations"/);
    const failing = overviewFifty.frameworks.flatMap((f: any) => f.categories.flatMap((c: any) => c.failing_controls));
    expect(failing.length).toBeGreaterThan(0);
  });

  it('con el mismo evaluated_at gana la de mayor id', async () => {
    const [c] = links;
    const ids = ['00000000-0000-4000-8000-000000000001', 'ffffffff-ffff-4fff-8fff-ffffffffffff'];
    for (const [id, result] of [[ids[1], 'compliant'], [ids[0], 'non_compliant']]) {
      await owner(
        `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, dimension, result, origin, evaluated_at)
         values ($1, $2, $3, $4, $5, $6, $7, 'cloud', $8::tenant.evaluation_result, 'automated', $9::timestamp)`,
        [id, a.companyId, a.serviceId, c.id, c.test_id, a.assetId, c.catalog_version_id, result, '2030-01-01T00:00:00Z'],
      );
    }
    const mine = (await leidas()).rows.find((r) => r.clientControlId === c.id && r.testId === c.test_id);
    expect(mine?.result).toBe('compliant');
  });

  it('una evaluación manual más reciente no cuenta', async () => {
    const c = links[links.length - 1];
    const before = (await leidas()).rows.find((r) => r.clientControlId === c.id && r.testId === c.test_id)?.result;
    await owner(
      `insert into tenant.evaluations (id, tenant_id, service_id, client_control_id, test_id, asset_id, catalog_version_id, dimension, result, origin, evaluated_at)
       values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'cloud', $7::tenant.evaluation_result, 'manual', now() + interval '2 days')`,
      [a.companyId, a.serviceId, c.id, c.test_id, a.assetId, c.catalog_version_id, before === 'compliant' ? 'non_compliant' : 'compliant'],
    );
    expect((await leidas()).rows.find((r) => r.clientControlId === c.id && r.testId === c.test_id)?.result).toBe(before);
  });

  it('una exclusión pendiente o rechazada no superpone «excluida»; la aprobada sí', async () => {
    const c = links[0];
    const [user] = await owner<{ id: string }>(`select id from platform.users where company_id = $1 limit 1`, [a.companyId]);
    const insertar = (status: string, testId = c.test_id) =>
      owner(
        `insert into tenant.exclusions (id, tenant_id, service_id, test_id, asset_id, proposed_by, decided_by, decided_at, decision_note, status, justification, valid_from, valid_until)
         values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, case when $6::uuid is null then null else now() end, case when $7 = 'rejected' then 'no procede' end, $7::tenant.exclusion_status, 'prueba', current_date - 1, current_date + 30)`,
        [a.companyId, a.serviceId, testId, a.assetId, user.id, status === 'pending' ? null : user.id, status],
      );
    const base = (await a.agent.get(path()).expect(200)).body.data;
    await insertar('pending');
    await insertar('rejected');
    expect((await a.agent.get(path()).expect(200)).body.data).toEqual(base);
    // Un control de la v2 lleva varias pruebas de nube sobre el mismo activo: se excluyen todas para que el cambio se vea en el resumen.
    for (const testId of new Set(links.map((l) => l.test_id))) await insertar('approved', testId);
    expect((await a.agent.get(path()).expect(200)).body.data).not.toEqual(base);
  });

  it('el último veredicto por test sale con su desempate y sin listas de ids', async () => {
    const q = latestVerdictsSql([a.serviceId]);
    const db = await connect();
    try {
      expect((await db.query(`explain ${q.text}`, q.values)).rows.length).toBeGreaterThan(0);
    } finally {
      await db.end();
    }
  });

  it('los índices del último resultado existen y el de evaluaciones es parcial en lo que lee la consulta', async () => {
    const defs = (await owner<{ indexdef: string }>(`select indexdef from pg_indexes where schemaname = 'tenant' and indexname in ('evaluations_latest_idx', 'test_verdicts_service_id_test_id_registered_at_id_idx')`)).map((r) => r.indexdef);
    expect(defs).toHaveLength(2);
    expect(defs.join(' ')).toMatch(/WHERE \(origin <> 'manual'/);
  });
});
