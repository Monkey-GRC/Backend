import { Prisma } from '../../../../../generated/prisma/client';
import { VerdictDecision } from '../../domain/verdicts/test-verdict';
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

export type LatestVerdictRow = { serviceId: string; testId: string; clientControlId: string; registeredBy: string; registeredAt: Date; result: string; decisions: VerdictDecision[] };

// El último veredicto de cada (servicio, test) con las decisiones de sus revisiones, en una sola consulta y sin listas de ids. Las claves son los tests que llevan los controles del servicio.
export function latestVerdictsSql(serviceIds: string[]): Prisma.Sql {
  return Prisma.sql`
    SELECT v.service_id AS "serviceId", v.test_id AS "testId", v.client_control_id AS "clientControlId", v.registered_by AS "registeredBy", v.registered_at AS "registeredAt", v.result::text AS "result",
           ARRAY(SELECT r.decision::text FROM tenant.test_verdict_reviews r WHERE r.test_verdict_id = v.id) AS "decisions"
      FROM (SELECT DISTINCT cc.service_id, cct.test_id
              FROM tenant.client_controls cc
              JOIN tenant.client_control_requirements ccr ON ccr.client_control_id = cc.id
              JOIN catalog.control_requirement_tests cct ON cct.control_requirement_id = ccr.control_requirement_id
             WHERE cc.service_id = ANY(${serviceIds}::uuid[])) k
     CROSS JOIN LATERAL (SELECT v.*
                           FROM tenant.test_verdicts v
                          WHERE v.service_id = k.service_id AND v.test_id = k.test_id
                          ORDER BY v.registered_at DESC, v.id DESC
                          LIMIT 1) v`;
}

export function latestVerdicts(tx: TransactionClient, serviceIds: string[]): Promise<LatestVerdictRow[]> {
  return serviceIds.length ? tx.$queryRaw<LatestVerdictRow[]>(latestVerdictsSql(serviceIds)) : Promise.resolve([]);
}

// Los ids del último veredicto APROBADO (alguna aprobación y ningún rechazo) de cada test del control: el filtro va antes de elegir el último. Son a lo más los tests de un control.
export function latestApprovedVerdictIdsSql(serviceId: string, controlId: string): Prisma.Sql {
  return Prisma.sql`
    SELECT v.id
      FROM tenant.client_control_tests k
     CROSS JOIN LATERAL (SELECT v.id
                           FROM tenant.test_verdicts v
                          WHERE v.service_id = ${serviceId}::uuid AND v.test_id = k.test_id
                            AND EXISTS (SELECT 1 FROM tenant.test_verdict_reviews r WHERE r.test_verdict_id = v.id AND r.decision = 'approve')
                            AND NOT EXISTS (SELECT 1 FROM tenant.test_verdict_reviews r WHERE r.test_verdict_id = v.id AND r.decision = 'reject')
                          ORDER BY v.registered_at DESC, v.id DESC
                          LIMIT 1) v
     WHERE k.client_control_id = ${controlId}::uuid`;
}

export async function latestApprovedVerdictIds(tx: TransactionClient, serviceId: string, controlId: string): Promise<string[]> {
  return (await tx.$queryRaw<{ id: string }[]>(latestApprovedVerdictIdsSql(serviceId, controlId))).map((r) => r.id);
}
