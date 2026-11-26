import { Prisma } from '../../../../../generated/prisma/client';
import { TransactionClient } from '../../../../infrastructure/database/prisma.service';

// MD-220 · «Lo último» de un histórico inmutable, acotado de verdad: se arma el conjunto de CLAVES (control, test, activo / servicio, test) y por cada una se hace UNA búsqueda en el índice con
// `LIMIT 1` (JOIN LATERAL). El costo crece con las claves, no con el histórico (Prisma no activa `nativeDistinct`: `distinct` traería todo y deduplicaría en memoria). Todo va en la MISMA
// transacción de `withScope` (RLS intacto) y los ids viajan como UN parámetro `uuid[]`, nunca como listas de miles de parámetros. Los índices viven en la migración 20261119000100.
export type LatestEvaluationRow = { clientControlId: string; testId: string; assetId: string; result: string; evaluatedAt: Date };

// El `origin <> 'manual'` va literal y es el predicado del índice parcial `evaluations_latest_idx`: con un parámetro el planificador no podría usarlo. Las claves son los tests de cada control
// por los activos vigentes del servicio: una evaluación de un activo que ya no está en el servicio nadie la lee (el motor solo pregunta por los activos vigentes).
export function latestEvaluationsSql(serviceId: string, controlIds: string[]): Prisma.Sql {
  return Prisma.sql`
    SELECT k.control_id AS "clientControlId", k.test_id AS "testId", k.asset_id AS "assetId", e.result::text AS "result", e.evaluated_at AS "evaluatedAt"
      FROM (SELECT DISTINCT ccr.client_control_id AS control_id, crt.test_id, sa.asset_id
              FROM tenant.client_control_requirements ccr
              JOIN catalog.control_requirement_tests crt ON crt.control_requirement_id = ccr.control_requirement_id
             CROSS JOIN tenant.service_assets sa
              JOIN tenant.assets a ON a.id = sa.asset_id AND a.status = 'active'
             WHERE ccr.client_control_id = ANY(${controlIds}::uuid[]) AND sa.service_id = ${serviceId}::uuid) k
     CROSS JOIN LATERAL (SELECT e.result, e.evaluated_at
                           FROM tenant.evaluations e
                          WHERE e.service_id = ${serviceId}::uuid AND e.client_control_id = k.control_id AND e.test_id = k.test_id AND e.asset_id = k.asset_id AND e.origin <> 'manual'
                          ORDER BY e.evaluated_at DESC, e.id DESC
                          LIMIT 1) e`;
}

export function latestEvaluations(tx: TransactionClient, serviceId: string, controlIds: string[]): Promise<LatestEvaluationRow[]> {
  return tx.$queryRaw<LatestEvaluationRow[]>(latestEvaluationsSql(serviceId, controlIds));
}

export type LatestManualResultRow = { clientControlId: string; testId: string; result: 'correct' | 'observation' | 'exception'; registeredAt: Date };

// MD-504 · El último resultado manual de cada (control, test) con un `LIMIT 1` por clave sobre el índice (control, test, fecha desc): el costo crece con las claves, no con el histórico.
export function latestManualResultsSql(controlIds: string[]): Prisma.Sql {
  return Prisma.sql`
    SELECT k.client_control_id AS "clientControlId", k.test_id AS "testId", r.result::text AS "result", r.registered_at AS "registeredAt"
      FROM (SELECT DISTINCT client_control_id, test_id FROM tenant.manual_test_results WHERE client_control_id = ANY(${controlIds}::uuid[])) k
     CROSS JOIN LATERAL (SELECT x.result, x.registered_at FROM tenant.manual_test_results x
                          WHERE x.client_control_id = k.client_control_id AND x.test_id = k.test_id
                          ORDER BY x.registered_at DESC, x.id DESC LIMIT 1) r`;
}

export function latestManualResults(tx: TransactionClient, controlIds: string[]): Promise<LatestManualResultRow[]> {
  return controlIds.length ? tx.$queryRaw<LatestManualResultRow[]>(latestManualResultsSql(controlIds)) : Promise.resolve([]);
}
