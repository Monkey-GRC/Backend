import type { TransactionClient } from './prisma.service';

// Qué conexiones y qué recursos ve el cliente. Lo usan `GET /v1/assets/{id}/resources` (technical-control) y `GET /v1/integrations`: una sola definición, para que el
// número que muestra una pantalla sea el que cuenta la otra.

/** Una conexión vigente: activo `active`, sin activo padre (D61) y con aprovisionamiento (sin él no tiene método, estado ni regiones). */
export const liveConnectionWhere = (companyId: string) => ({
  organization: { companyId },
  status: 'active' as const,
  parentAssetId: null,
  provisionings: { some: {} },
});

/** El recurso que el cliente reconoce: de una clase conocida (lo que solo conoce la evaluación no es un activo) y de una región declarada o sin región. */
export const recognizedResourceWhere = (regions: string[]) => ({
  kind: { not: 'other' },
  OR: [{ region: null }, { region: { in: regions } }],
});

/** Los activos descubiertos dentro de una conexión (D61) que se muestran: vigentes y con un recurso reconocido. */
export const recognizedChildWhere = (connectionId: string, regions: string[]) => ({
  parentAssetId: connectionId,
  status: 'active' as const,
  resource: { is: recognizedResourceWhere(regions) },
});

/** Cuántos recursos reconocidos tiene cada conexión, en una sola consulta. Una conexión sin nada (o sin descubrimiento) queda en 0. */
export async function countRecognizedResources(tx: TransactionClient, connections: { id: string; regions: string[]; inventoryAt: Date | null }[]): Promise<Map<string, number>> {
  const counts = new Map(connections.map((c) => [c.id, 0]));
  const inventoried = connections.filter((c) => c.inventoryAt);
  if (inventoried.length === 0) return counts;
  const groups = await tx.assetResource.groupBy({
    by: ['assetId'],
    where: { OR: inventoried.map((c) => ({ assetId: c.id, childAsset: { is: recognizedChildWhere(c.id, c.regions) } })) },
    _count: { _all: true },
  });
  for (const g of groups) counts.set(g.assetId, g._count._all);
  return counts;
}
