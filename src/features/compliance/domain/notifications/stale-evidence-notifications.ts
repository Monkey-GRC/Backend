import { createHash } from 'node:crypto';
import type { ControlNotificationEvent } from '../../../../common/notifications/notification-emitter';

// D153 · `automatic_evidence_stale`: la última recolección completada de un activo con prueba automática supera la frescura PR-05. Un aviso por control (agrupa sus activos). Función pura.
//
// No se repite: la clave lleva la última recolección de cada activo desactualizado, así que el aviso solo vuelve cuando hay una recolección fresca que también envejece (o cuando otro
// activo del control se desactualiza). Con muchos activos la clave sería larga (36 caracteres por recolección): se usa un hash estable (SHA-256, 24 hex) de los ids ordenados.

/** Cuántos activos lleva el aviso; el resto va como «y N más». */
export const STALE_GROUPED_ASSETS = 5;
const HOUR_MS = 3_600_000;

/** La última recolección completada de un activo que mide un control. */
export type AutomaticReading = { controlId: string; assetId: string; assetName: string; executionId: string; finishedAt: Date };

export const staleDedupeSuffix = (executionIds: readonly string[]): string => createHash('sha256').update([...executionIds].sort().join(',')).digest('hex').slice(0, 24);

export function staleEvidenceEvents(readings: readonly AutomaticReading[], now: Date, freshnessHours: number): ControlNotificationEvent[] {
  const limit = now.getTime() - freshnessHours * HOUR_MS;
  const byControl = new Map<string, Map<string, AutomaticReading>>();
  for (const r of readings) {
    if (r.finishedAt.getTime() >= limit) continue;
    const assets = byControl.get(r.controlId) ?? new Map<string, AutomaticReading>();
    assets.set(r.assetId, r);
    byControl.set(r.controlId, assets);
  }
  const events: ControlNotificationEvent[] = [];
  for (const [controlId, assets] of [...byControl].sort(([a], [b]) => (a < b ? -1 : 1))) {
    // Los más viejos primero: es lo que más urge. Desempata por nombre para que el aviso sea estable.
    const stale = [...assets.values()].sort((a, b) => a.finishedAt.getTime() - b.finishedAt.getTime() || a.assetName.localeCompare(b.assetName));
    events.push({
      type: 'automatic_evidence_stale',
      controlId,
      dedupeSuffix: staleDedupeSuffix(stale.map((s) => s.executionId)),
      staleAssets: stale.slice(0, STALE_GROUPED_ASSETS).map((s) => ({ name: s.assetName, last_collected_at: s.finishedAt.toISOString() })),
      staleCount: stale.length,
    });
  }
  return events;
}
