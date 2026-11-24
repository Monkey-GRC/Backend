import type { ControlState } from '../engine/states';
import type { ControlLevel } from '../engine/v2/types';
import type { Readiness } from './control-readout';

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
    if (now && (now.state !== was.state || now.readiness !== was.readiness || now.level !== was.level)) changes.push({ controlId, code: now.code, before: was, after: now });
  }
  return changes;
}
