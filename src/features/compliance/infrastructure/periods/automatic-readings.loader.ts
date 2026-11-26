import { Prisma } from '../../../../../generated/prisma/client';
import type { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import type { AutomaticReading } from '../../domain/notifications/stale-evidence-notifications';

// D153 · La última recolección completada de cada activo que mide una prueba automática de un control activo, para la pasada diaria de `automatic_evidence_stale`. Un número FIJO de
// consultas por empresa (no por servicio ni por control). Una prueba de nube lee la recolección del activo de nube; las de servidor, base de datos y aplicación, la de un activo con sonda
// (misma regla que `writeEvaluations`). Un activo que nunca se leyó no está desactualizado: está sin datos y no entra.
export async function loadAutomaticReadings(tx: TransactionClient): Promise<AutomaticReading[]> {
  const links = await tx.clientControlTest.findMany({
    where: {
      clientControl: { isActive: true, service: { frameworks: { some: { status: 'active' } } } },
      test: { dimension: { in: ['cloud', 'server', 'database', 'app'] }, testChecks: { some: { role: 'direct', checkId: { not: null } } } },
    },
    select: { clientControlId: true, clientControl: { select: { serviceId: true } }, test: { select: { dimension: true } } },
  });
  if (links.length === 0) return [];
  const serviceIds = [...new Set(links.map((l) => l.clientControl.serviceId))];
  const serviceAssets = await tx.serviceAsset.findMany({
    where: { serviceId: { in: serviceIds }, asset: { status: 'active', parentAssetId: null } },
    select: { serviceId: true, asset: { select: { id: true, name: true, agent: { select: { id: true } } } } },
  });
  if (serviceAssets.length === 0) return [];
  const assetIds = [...new Set(serviceAssets.map((s) => s.asset.id))];
  const latest = await tx.$queryRaw<{ assetId: string; executionId: string; finishedAt: Date }[]>(Prisma.sql`
    SELECT a.id AS "assetId", ex.id AS "executionId", ex.finished_at AS "finishedAt"
      FROM unnest(${assetIds}::uuid[]) AS a(id)
     CROSS JOIN LATERAL (SELECT x.id, x.finished_at FROM tenant.executions x
                          WHERE x.asset_id = a.id AND x.kind = 'assessment' AND x.status = 'completed' AND x.finished_at IS NOT NULL
                          ORDER BY x.finished_at DESC LIMIT 1) ex`);
  const lastOf = new Map(latest.map((l) => [l.assetId, l]));

  const assetsOfService = new Map<string, typeof serviceAssets>();
  for (const sa of serviceAssets) assetsOfService.set(sa.serviceId, [...(assetsOfService.get(sa.serviceId) ?? []), sa]);
  const readings: AutomaticReading[] = [];
  for (const link of links) {
    const wantsProbe = link.test.dimension !== 'cloud';
    for (const { asset } of assetsOfService.get(link.clientControl.serviceId) ?? []) {
      const last = lastOf.get(asset.id);
      if (!last || !!asset.agent !== wantsProbe) continue;
      readings.push({ controlId: link.clientControlId, assetId: asset.id, assetName: asset.name, executionId: last.executionId, finishedAt: last.finishedAt });
    }
  }
  return readings;
}
