import { Prisma } from '../../../../../generated/prisma/client';
import { CLOUD_MEASURED_DIMENSIONS, PROBE_MEASURED_DIMENSIONS } from '../../../../common/catalogs/technical-catalogs';
import { exceptionEndsOn } from '../../../../common/evaluation-parameters/exception-window';
import type { ControlNotificationEvent } from '../../../../common/notifications/notification-emitter';
import type { EvaluationParameters } from '../../../../common/evaluation-parameters/parameters';
import { publicText } from '../../../../common/text/provider-names';
import type { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { failureParams, newDirectFailures, type CheckTitle, type DirectTestLink, type FailedChecksByService } from '../../domain/scan/direct-check-failures';

// D153 · Los checks Directos que pasan a FAIL en la recolección que se cierra, contra la recolección completada anterior del MISMO activo. Corre en la transacción que cierra la recolección.
// Un número FIJO de consultas por recolección (las dos recolecciones comparadas, una consulta cada una, sin importar cuántos servicios tenga el activo), sobre `execution_id` (índice) y los checks
// Directos de las pruebas del activo. Sin recolección anterior es la línea base: no avisa.
export type DirectFailureScan = { executionId: string; assetId: string; source: 'cloud' | 'sca'; includeProposed: boolean; parameters: EvaluationParameters; now: Date };

export async function collectDirectCheckFailures(tx: TransactionClient, scan: DirectFailureScan): Promise<ControlNotificationEvent[]> {
  const { executionId, assetId } = scan;
  const current = await tx.execution.findFirst({ where: { id: executionId }, select: { finishedAt: true } });
  const previous = await tx.execution.findFirst({
    where: { assetId, kind: 'assessment', status: 'completed', id: { not: executionId }, ...(current?.finishedAt ? { finishedAt: { lte: current.finishedAt } } : {}) },
    orderBy: { finishedAt: 'desc' },
    select: { id: true },
  });
  if (!previous) return [];

  const serviceIds = (await tx.serviceAsset.findMany({ where: { assetId }, select: { serviceId: true } })).map((s) => s.serviceId);
  if (serviceIds.length === 0) return [];
  const rows = await tx.clientControlTest.findMany({
    where: {
      clientControl: { serviceId: { in: serviceIds }, isActive: true },
      // D160 · Las mismas dimensiones que `writeEvaluations`: la nube también decide pruebas de aplicación, base de datos y servidores.
      test: { dimension: { in: [...(scan.source === 'cloud' ? CLOUD_MEASURED_DIMENSIONS : PROBE_MEASURED_DIMENSIONS)] } },
    },
    select: {
      clientControlId: true,
      testId: true,
      clientControl: { select: { serviceId: true } },
      test: { select: { testChecks: { where: { role: 'direct' as const, ...(scan.source === 'cloud' ? { check: { policyId: 'cloud_configuration' } } : { checkId: { not: null } }), ...(scan.includeProposed ? {} : { provenance: 'committee_ratified' as const }) }, select: { check: { select: { id: true, titleEn: true, titleEs: true } } } } } },
    },
  });
  const titles = new Map<string, CheckTitle>();
  const links: DirectTestLink[] = [];
  for (const r of rows) {
    const checks = r.test.testChecks.flatMap((t) => (t.check ? [t.check] : []));
    if (checks.length === 0) continue;
    for (const c of checks) titles.set(c.id, { en: publicText(c.titleEn), es: publicText(c.titleEs) });
    links.push({ serviceId: r.clientControl.serviceId, controlId: r.clientControlId, testId: r.testId, checkIds: checks.map((c) => c.id) });
  }
  if (links.length === 0) return [];

  const checkIds = [...titles.keys()];
  const serviceIdList = [...new Set(links.map((l) => l.serviceId))];
  // UNA consulta por recolección, sin importar cuántos servicios tenga el activo: los checks en FAIL de la recolección por servicio, con el alcance resuelto en la base. Un recurso con activo propio
  // (`assets.resource_id`) que NO es de ese servicio no se mide para él; la cuenta entera (sin recurso o sin activo propio) es de todos (misma regla que `executionResults`).
  const failedIn = async (execution: string): Promise<FailedChecksByService> => {
    const rows = await tx.$queryRaw<{ checkId: string; serviceId: string }[]>(Prisma.sql`
      SELECT DISTINCT cr.check_id AS "checkId", sv.service_id AS "serviceId"
        FROM tenant.check_results cr
        LEFT JOIN tenant.asset_resources ar ON ar.id = cr.asset_resource_id
        LEFT JOIN tenant.assets child ON child.resource_id = ar.id
       CROSS JOIN unnest(${serviceIdList}::uuid[]) AS sv(service_id)
       WHERE cr.execution_id = ${execution}::uuid AND cr.result = 'failed' AND cr.check_id = ANY(${checkIds}::uuid[])
         AND (child.id IS NULL OR EXISTS (SELECT 1 FROM tenant.service_assets sa WHERE sa.asset_id = child.id AND sa.service_id = sv.service_id))`);
    const out = new Map<string, Set<string>>(serviceIdList.map((id) => [id, new Set<string>()]));
    for (const r of rows) out.get(r.serviceId)?.add(r.checkId);
    return out;
  };
  const [now, before] = [await failedIn(executionId), await failedIn(previous.id)];

  // D135 · Una excepción aprobada y vigente (PR-04: dura como máximo `checkExceptionMaxDays` días desde su inicio) deja pasar el FAIL de esa prueba en este activo.
  const today = new Date(Date.UTC(scan.now.getUTCFullYear(), scan.now.getUTCMonth(), scan.now.getUTCDate()));
  const exclusions = await tx.exclusion.findMany({
    where: { assetId, serviceId: { in: serviceIds }, status: 'approved', validFrom: { lte: today }, validUntil: { gte: today } },
    select: { testId: true, validFrom: true, validUntil: true },
  });
  const exceptedTestIds = new Set(
    exclusions.filter((x) => exceptionEndsOn(x.validFrom, x.validUntil, scan.parameters).getTime() >= today.getTime()).map((x) => x.testId),
  );

  const failures = newDirectFailures({ links, current: now, previous: before, exceptedTestIds });
  if (failures.size === 0) return [];
  const asset = await tx.asset.findFirstOrThrow({ where: { id: assetId }, select: { name: true } });
  return [...failures].map(([controlId, ids]) => ({ type: 'direct_check_failed' as const, controlId, dedupeSuffix: executionId, ...failureParams(asset.name, ids, titles) }));
}
