import { Prisma } from '../../../../../generated/prisma/client';
import type { ComplianceReadings } from '../../../../common/compliance/compliance-readings.port';
import { exceptionEndsOn } from '../../../../common/evaluation-parameters/exception-window';
import type { EvaluationParameters } from '../../../../common/evaluation-parameters/parameters';
import type { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import type { FailedRow, FindingSource } from '../../domain/scan/findings';
import type { TranslationOrigin } from '../../domain/scan/gap-message';

// D138 punto 3, MD-502 · Lo que hace falta para armar las brechas de una prueba. Un número FIJO de consultas sin importar cuántos activos o checks haya: la lectura del motor v2 (puerto de compliance),
// una consulta por las últimas corridas, una por sus FAIL, una por los textos de los checks DISTINTOS, una por la racha de cada FAIL, y las excepciones y las criticidades.
const dateOf = (d: Date): string => d.toISOString().slice(0, 10);
const DAY_MS = 86_400_000;

/** La racha se mira hasta 90 días atrás: más allá de eso, `failing_since` es el inicio de la ventana (no se recorre todo el historial). */
export const STREAK_WINDOW_DAYS = 90;

export async function loadFindingSource(tx: TransactionClient, compliance: ComplianceReadings, input: { serviceId: string; controlId: string; testId: string }, parameters: EvaluationParameters): Promise<FindingSource | null> {
  const { serviceId, testId } = input;
  const scope = await compliance.loadGapScope(tx, { serviceId, controlId: input.controlId, testId, parameters });
  if (!scope) return null;

  const base = {
    control: scope.control,
    test: scope.test,
    direct: new Map(scope.assets.map((a) => [a.id, a.direct] as const)),
    plan: scope.plan ? { assignee: scope.plan.assignee, dueDate: dateOf(scope.plan.dueDate) } : null,
    controlOwner: scope.owner,
  };
  const none = { ...base, measuredAt: null, rows: [], exceptions: new Map() };
  const roleOf = new Map(scope.checks.map((c) => [c.id, c.role] as const));
  const checkIds = [...roleOf.keys()];
  const inScope = new Set(scope.assets.map((a) => a.id));
  if (checkIds.length === 0 || inScope.size === 0) return none;

  // Las conexiones del servicio: la corrida es de la conexión; un recurso descubierto con activo propio (D61) falla como su propio activo.
  const connections = (await tx.serviceAsset.findMany({ where: { serviceId, asset: { parentAssetId: null, status: 'active' } }, select: { assetId: true } })).map((c) => c.assetId);
  if (connections.length === 0) return none;
  // La «última corrida» de cada conexión y el orden de la racha son el MISMO orden: por `finished_at` (las sin fecha, las más viejas) y, a igual fecha, por id.
  const executions = await tx.$queryRaw<{ id: string; assetId: string; finishedAt: Date | null }[]>(Prisma.sql`
    SELECT DISTINCT ON (asset_id) id, asset_id AS "assetId", finished_at AS "finishedAt"
      FROM tenant.executions
     WHERE asset_id = ANY(${connections}::uuid[]) AND kind = 'assessment' AND status = 'completed'
     ORDER BY asset_id, finished_at DESC NULLS LAST, id DESC`);
  if (executions.length === 0) return none;
  const connectionOf = new Map(executions.map((e) => [e.id, e.assetId] as const));
  const measuredAt = executions.reduce<Date | null>((latest, e) => (e.finishedAt && (!latest || e.finishedAt > latest) ? e.finishedAt : latest), null);

  // Las filas FAIL no traen los textos del catálogo (se repetirían por cada recurso): se leen una vez por check distinto.
  const failed = await tx.checkResult.findMany({
    where: { executionId: { in: executions.map((e) => e.id) }, result: 'failed', checkId: { in: checkIds } },
    select: {
      executionId: true,
      checkId: true,
      region: true,
      engineSeverity: true,
      assetResource: { select: { resourceUid: true, name: true, region: true, childAsset: { select: { id: true } } } },
    },
  });
  if (failed.length === 0) return { ...none, measuredAt };
  const failedChecks = [...new Set(failed.map((r) => r.checkId))];
  const catalog = new Map(
    (await tx.check.findMany({ where: { id: { in: failedChecks } }, select: { id: true, titleEn: true, titleEs: true, condition: true, remediation: true, remediationEs: true, translationOrigin: true } })).map((c) => [c.id, c] as const),
  );

  // La racha actual de cada FAIL (por check y activo): desde la primera corrida de la última tanda seguida de corridas en que falló, mirando solo la ventana. Si la tanda llega al inicio de la
  // ventana y hay corridas más viejas, no se sabe cuándo empezó: `since` es el inicio de la ventana.
  const windowStart = new Date(scope.now.getTime() - STREAK_WINDOW_DAYS * DAY_MS);
  const streaks = await tx.$queryRaw<{ checkId: string; assetId: string; since: Date }[]>(Prisma.sql`
    WITH ex AS (
      SELECT id, asset_id, COALESCE(finished_at, started_at, queued_at) AS at,
             row_number() OVER (PARTITION BY asset_id ORDER BY finished_at ASC NULLS FIRST, id ASC) AS n
        FROM tenant.executions
       WHERE asset_id = ANY(${connections}::uuid[]) AND kind = 'assessment' AND status = 'completed'
         AND COALESCE(finished_at, started_at, queued_at) >= ${windowStart}),
    older AS (
      SELECT DISTINCT asset_id FROM tenant.executions
       WHERE asset_id = ANY(${connections}::uuid[]) AND kind = 'assessment' AND status = 'completed' AND COALESCE(finished_at, started_at, queued_at) < ${windowStart}),
    fails AS (
      SELECT ex.asset_id AS conn, ex.n, ex.at, cr.check_id, COALESCE(child.id, ex.asset_id) AS target
        FROM ex
        JOIN tenant.check_results cr ON cr.execution_id = ex.id AND cr.result = 'failed' AND cr.check_id = ANY(${failedChecks}::uuid[])
        LEFT JOIN tenant.asset_resources ar ON ar.id = cr.asset_resource_id
        LEFT JOIN tenant.assets child ON child.resource_id = ar.id
       GROUP BY 1, 2, 3, 4, 5),
    islands AS (
      SELECT conn, n, at, check_id, target, n - row_number() OVER (PARTITION BY conn, check_id, target ORDER BY n) AS grp FROM fails),
    bounds AS (SELECT asset_id, min(n) AS first_n, max(n) AS last_n FROM ex GROUP BY asset_id)
    SELECT i.check_id AS "checkId", i.target AS "assetId",
           CASE WHEN MIN(i.n) = b.first_n AND EXISTS (SELECT 1 FROM older o WHERE o.asset_id = i.conn) THEN ${windowStart}::timestamp ELSE MIN(i.at) END AS since
      FROM islands i
      JOIN bounds b ON b.asset_id = i.conn
     GROUP BY i.conn, i.check_id, i.target, i.grp, b.first_n, b.last_n
    HAVING MAX(i.n) = b.last_n`);
  const sinceOf = new Map(streaks.map((s) => [`${s.assetId}:${s.checkId}`, s.since] as const));
  const fallbackSince = measuredAt ?? scope.now;

  const assets = await tx.asset.findMany({ where: { id: { in: [...inScope] } }, select: { id: true, name: true, criticality: true } });
  const assetById = new Map(assets.map((a) => [a.id, a] as const));

  const rows: FailedRow[] = [];
  for (const r of failed) {
    const assetId = r.assetResource?.childAsset?.id ?? connectionOf.get(r.executionId);
    const asset = assetId ? assetById.get(assetId) : undefined;
    const role = roleOf.get(r.checkId);
    const check = catalog.get(r.checkId);
    if (!assetId || !asset || !role || !check || !inScope.has(assetId)) continue;
    rows.push({
      checkId: r.checkId,
      role,
      assetId,
      assetName: asset.name,
      assetCriticality: asset.criticality,
      severity: r.engineSeverity,
      check: { titleEn: check.titleEn, titleEs: check.titleEs, condition: check.condition, remediation: check.remediation, remediationEs: check.remediationEs, translationOrigin: check.translationOrigin as TranslationOrigin },
      resourceName: r.assetResource?.name ?? null,
      resourceUid: r.assetResource?.resourceUid ?? null,
      region: r.region ?? r.assetResource?.region ?? null,
      failingSince: sinceOf.get(`${assetId}:${r.checkId}`) ?? fallbackSince,
    });
  }

  // D135 · La excepción aprobada y vigente de la prueba en cada activo: la misma regla (PR-04) con la que el motor la deja pasar.
  const now = scope.now;
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const exclusions = await tx.exclusion.findMany({
    where: { serviceId, testId, status: 'approved', assetId: { in: [...inScope] }, validFrom: { lte: today }, validUntil: { gte: today } },
    select: { id: true, assetId: true, validFrom: true, validUntil: true },
  });
  const exceptions = new Map<string, { id: string; effectiveUntil: string }>();
  for (const x of exclusions) {
    const ends = exceptionEndsOn(x.validFrom, x.validUntil, parameters);
    if (ends.getTime() < today.getTime() || !x.assetId) continue;
    const known = exceptions.get(x.assetId);
    if (!known || known.effectiveUntil < dateOf(ends)) exceptions.set(x.assetId, { id: x.id, effectiveUntil: dateOf(ends) });
  }
  return { ...base, measuredAt, rows, exceptions };
}
