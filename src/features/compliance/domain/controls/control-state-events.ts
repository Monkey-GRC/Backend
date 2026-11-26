import type { ControlState } from '../engine/states';
import type { ControlLevel } from '../engine/v2/types';
import type { ControlReadout, Readiness } from './control-readout';
import type { ManagementState } from './management-state';

// El historial de cambios de estado de un control (D91, REQ-043, REQ-044): cada vez que algo que se escribe mueve el estado o el semáforo de un control, queda un evento
// inmutable con el estado anterior y el nuevo. Lógica pura: compara dos fotos del servicio, la de antes y la de después de la escritura.

export type ControlStateSnapshot = {
  /** El código visible del control (`IAC-12` o `C01`). */
  code: string;
  state: ControlState;
  readiness: Readiness;
  progress: { done: number; total: number };
  /** MD-498: el nivel v2 (§9). Un cambio de nivel también es un cambio de estado derivado. */
  level: ControlLevel;
  levelValue: number;
  /** MD-504 · El estado de gestión (D132): aprobar, devolver o cargar también lo mueve. */
  managementState: ManagementState;
};

export type ControlStateChange = { controlId: string; code: string; before: ControlStateSnapshot; after: ControlStateSnapshot };

/**
 * Los controles cuyo estado o semáforo cambió. Solo cuentan los que estaban antes y siguen después: un control que nace o se da de baja tiene su propio evento
 * (`client_control.create`), y un cambio del porcentaje que no mueve el estado ni el semáforo no es un cambio de estado.
 */
export function diffControlStates(before: ReadonlyMap<string, ControlStateSnapshot>, after: ReadonlyMap<string, ControlStateSnapshot>): ControlStateChange[] {
  const changes: ControlStateChange[] = [];
  for (const [controlId, was] of before) {
    const now = after.get(controlId);
    if (now && (now.state !== was.state || now.readiness !== was.readiness || now.level !== was.level || now.managementState !== was.managementState)) changes.push({ controlId, code: now.code, before: was, after: now });
  }
  return changes;
}

/** El control cumplía (Adecuado o Sólido) y dejó de cumplir: sus aprobaciones dejan de valer (D132). */
export const droppedFromComplying = (c: ControlStateChange): boolean => ['adequate', 'solid'].includes(c.before.level) && !['adequate', 'solid'].includes(c.after.level);

/** El control llegó a «Cumple – por aprobar»: se avisa a quien aprueba (D132). */
export const reachedPendingApproval = (c: ControlStateChange): boolean => c.after.managementState === 'pending_approval' && c.before.managementState !== 'pending_approval';

/** La foto de un control tal como la compara el historial de estados. */
export const snapshotOf = (r: ControlReadout): ControlStateSnapshot => ({
  code: r.control.catalogCode ?? r.control.ownCode, state: r.state, readiness: r.readiness, progress: r.progress, level: r.level, levelValue: r.levelValue, managementState: r.managementState,
});
