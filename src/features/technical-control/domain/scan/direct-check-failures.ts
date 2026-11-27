import type { FailureParam } from '../../../../common/notifications/notification-draft';
import { priorityRank, type GapPriority } from './gap-priority';

// D153, D138 punto 3 · Qué checks Directos PASAN a FAIL en una recolección. Avisa el cambio, no el estado: un check que ya fallaba en la recolección anterior del mismo activo no vuelve a avisar.
// Función pura: recibe lo que la recolección actual y la anterior dijeron (ya cargado por lote) y devuelve, por control, los checks que cambiaron.
//
// · Solo los vínculos Directos (S-04: un Complementario en FAIL es observación y no avisa).
// · La primera recolección de un activo es la línea base: quien llama no corre esto si no hay una anterior.
// · Un FAIL con una excepción vigente (PR-04) de esa prueba en el activo es `fail_with_exception`: no avisa.

/** Los checks Directos (id del catálogo) que una prueba de un control del servicio mide. */
export type DirectTestLink = { serviceId: string; controlId: string; testId: string; checkIds: readonly string[] };

/** Los checks con al menos un resultado FAIL en la recolección, por servicio: un recurso con activo propio que no es del servicio no cuenta para él. */
export type FailedChecksByService = ReadonlyMap<string, ReadonlySet<string>>;

export type NewDirectFailuresInput = {
  links: readonly DirectTestLink[];
  current: FailedChecksByService;
  previous: FailedChecksByService;
  /** Las pruebas con una excepción vigente en este activo. */
  exceptedTestIds: ReadonlySet<string>;
};

/** Por control, los ids de los checks que pasaron a FAIL (ordenados, sin repetir). */
export function newDirectFailures(input: NewDirectFailuresInput): Map<string, string[]> {
  const byControl = new Map<string, Set<string>>();
  for (const link of input.links) {
    if (input.exceptedTestIds.has(link.testId)) continue;
    const now = input.current.get(link.serviceId);
    if (!now) continue;
    const before = input.previous.get(link.serviceId);
    for (const checkId of link.checkIds) {
      if (!now.has(checkId) || before?.has(checkId)) continue;
      (byControl.get(link.controlId) ?? byControl.set(link.controlId, new Set()).get(link.controlId)!).add(checkId);
    }
  }
  return new Map([...byControl].map(([controlId, ids]) => [controlId, [...ids].sort()]));
}

/** Cuántos pares activo-check lleva el aviso; el resto va como «y N más». */
export const GROUPED_FAILURES = 5;

export type CheckTitle = { en: string | null; es: string | null };
/** Un check que pasó a FAIL con su prioridad (D162): la misma función que arma la brecha del detalle del control (`gapPriority`). */
export type FailedCheck = { id: string; priority: GapPriority };

/**
 * El contenido del aviso de un control: hasta 5 pares activo-check (los de mayor prioridad primero y, a igual prioridad, por título) y el total. Los títulos del catálogo salen de `checkTitles`
 * (el armador de la brecha, D138 punto 3) y ya pasaron por el filtro de proveedor (SEG-39): uno que nombra al proveedor llega nulo y el texto pone uno genérico.
 */
export function failureParams(assetName: string, failed: readonly FailedCheck[], titles: ReadonlyMap<string, CheckTitle>): { failures: FailureParam[]; failureCount: number } {
  const all = failed.map(({ id, priority }) => ({ id, priority, title: titles.get(id) ?? { en: null, es: null } }));
  all.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || (a.title.en ?? '').localeCompare(b.title.en ?? '') || (a.id < b.id ? -1 : 1));
  return {
    failures: all.slice(0, GROUPED_FAILURES).map(({ title }) => ({ asset_name: assetName, check_title_en: title.en, check_title_es: title.es })),
    failureCount: all.length,
  };
}
