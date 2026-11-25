import { DomainError } from '../../../common/errors/domain-error';
import { AssignmentState, isLiveStatus, ReleasedControl } from './team.types';

// Reglas de asignar dueño y ejecutor (contracts/gestion-usuarios.md · Asignación de controles, SEG-73). Lógica pura: el repositorio bloquea y lee los hechos, aquí se decide.
// «Sin asignar» es no tener fila en `client_control_assignments` (como lo deja la baja del dueño, MD-191): su estado es `{ ownerId: null, executorId: null }`.

export const NO_ASSIGNMENT: AssignmentState = { ownerId: null, executorId: null };

export type ControlFact = { id: string; isActive: boolean; assignment: AssignmentState | null };
/** Una persona leída con su fila ya bloqueada; `leaderId` y `groupKind` son los de su grupo. */
export type PersonFact = { id: string; role: string; status: string; groupKind: string | null; leaderId: string | null };

const sameState = (a: AssignmentState, b: AssignmentState): boolean => a.ownerId === b.ownerId && a.executorId === b.executorId;

// Comprobaciones comunes, en este orden: la persona (404) · todos los controles existen para la empresa (404). Después, lo propio de cada operación.
function assertExist(requested: readonly string[], controls: readonly ControlFact[]): void {
  if (new Set(controls.map((c) => c.id)).size !== new Set(requested).size) throw new DomainError('NOT_FOUND');
}

const assertNoneRetired = (controls: readonly ControlFact[]): void => {
  if (controls.some((c) => !c.isActive)) throw new DomainError('CONTROL_RETIRED');
};

const changed = (controls: readonly ControlFact[], next: (before: AssignmentState) => AssignmentState): ReleasedControl[] =>
  controls.flatMap((c) => {
    const before = c.assignment ?? NO_ASSIGNMENT;
    const after = next(before);
    return sameState(before, after) ? [] : [{ controlId: c.id, before, after }];
  });

/**
 * Dueño (solo `admin_empresa`). `owner` es la fila ya bloqueada de `ownerId` (null si no existe o es de otra empresa). Un dueño distinto limpia el ejecutor; el mismo dueño no cambia nada.
 * Orden de errores: 404 · CONTROL_RETIRED · OWNER_NOT_ELIGIBLE.
 */
export function planOwnerAssignment(input: { actorId: string; ownerId: string | null; owner: PersonFact | null; requested: readonly string[]; controls: readonly ControlFact[] }): ReleasedControl[] {
  const { actorId, ownerId, owner, requested, controls } = input;
  if (ownerId !== null && !owner) throw new DomainError('NOT_FOUND');
  assertExist(requested, controls);
  assertNoneRetired(controls);
  if (owner) {
    const eligible = (owner.role === 'responsable' && isLiveStatus(owner.status)) || (owner.role === 'admin_empresa' && owner.id === actorId && owner.status === 'active');
    if (!eligible) throw new DomainError('OWNER_NOT_ELIGIBLE');
  }
  return changed(controls, (before) => (ownerId === null ? NO_ASSIGNMENT : before.ownerId === ownerId ? before : { ownerId, executorId: null }));
}

/**
 * Ejecutor (D150: `admin_empresa` y `responsable`). `onlyOwn`: el actor está acotado a sus controles (el `responsable`: solo los de los que es dueño; el administrador, a todos).
 * En todo caso el ejecutor es un `delegado` del equipo del DUEÑO de cada control: un control sin dueño solo admite `null`. `executor` es la fila ya bloqueada de `executorId`,
 * con el grupo que tiene ahora. Orden de errores: 404 (control o ejecutor) · FORBIDDEN (control que no es suyo) · CONTROL_RETIRED · EXECUTOR_NOT_IN_TEAM.
 */
export function planExecutorAssignment(input: { actorId: string; onlyOwn: boolean; executorId: string | null; executor: PersonFact | null; requested: readonly string[]; controls: readonly ControlFact[] }): ReleasedControl[] {
  const { actorId, onlyOwn, executorId, executor, requested, controls } = input;
  if (executorId !== null && !executor) throw new DomainError('NOT_FOUND');
  assertExist(requested, controls);
  if (onlyOwn && controls.some((c) => c.assignment?.ownerId !== actorId)) throw new DomainError('FORBIDDEN');
  assertNoneRetired(controls);
  const inTeamOf = (ownerId: string | null): boolean =>
    !!executor && ownerId !== null && executor.role === 'delegado' && isLiveStatus(executor.status) && executor.groupKind === 'team' && executor.leaderId === ownerId;
  if (executor && controls.some((c) => !inTeamOf(c.assignment?.ownerId ?? null))) throw new DomainError('EXECUTOR_NOT_IN_TEAM');
  return changed(controls, (before) => ({ ownerId: before.ownerId, executorId }));
}
