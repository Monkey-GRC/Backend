import { DomainError } from '../../../common/errors/domain-error';
import { FieldError, ValidationException } from '../../../common/errors/validation.exception';
import type { MemberChange, ReleasedControl } from './repositories/team-user.repository';
import { TEAM_ROLES } from './team.types';

// contracts/gestion-usuarios.md · PATCH /v1/users/{id}. Las reglas del cambio, puras (sin base ni Nest): el repositorio solo bloquea, lee, escribe y audita.
// Orden de errores: 404 · LAST_ADMIN (uno mismo) · 422 (group_id / is_internal) · USER_NOT_ACTIVATED · RESPONSIBLE_HAS_DELEGATES · USER_HAS_ASSIGNMENTS.

/** Lo que la regla necesita saber de la persona, ya leído con su fila bloqueada. */
export type MemberState = { id: string; role: string; status: string; groupId: string | null; leaderId: string | null };
export type MemberPlan = { isDelegate: boolean; deactivating: boolean; reactivating: boolean };
export type TargetTeam = { id: string; leaderId: string };
/** El responsable cuya fila hay que bloquear (y su equipo) antes de seguir, y qué error dar si ya no está vigente. */
export type LeaderCheck = { groupId: string; leaderId: string; onDead: 'NOT_FOUND' | 'TEAM_LEADER_INACTIVE' };
export type AssignmentRow = { id: string; clientControlId: string; ownerId: string; executorId: string | null };

const isTeamRole = (role: string) => (TEAM_ROLES as readonly string[]).includes(role);

/** null = para quien llama no existe (admin_monkey): 404. Lanza el primer error de la lista que corresponda. */
export function planMemberChange(found: MemberState, change: MemberChange, actorId: string | undefined): MemberPlan | null {
  if (!isTeamRole(found.role)) return null;
  // Nadie se desactiva a sí mismo: la empresa se quedaría sin quien la administre. Corregir el nombre, o «reactivarse» (no-op), sí.
  if (found.id === actorId && change.status === 'inactive') throw new DomainError('LAST_ADMIN');
  const isDelegate = found.role === 'delegado';
  const invalid: FieldError[] = [];
  if (change.groupId !== undefined && !isDelegate) invalid.push({ field: 'group_id', code: 'group_id.not_allowed' });
  if (change.isInternal !== undefined && !isDelegate) invalid.push({ field: 'is_internal', code: 'is_internal.not_allowed' });
  if (invalid.length > 0) throw new ValidationException(invalid);
  if (change.status && found.status === 'pending') throw new DomainError('USER_NOT_ACTIVATED');
  return { isDelegate, deactivating: change.status === 'inactive' && found.status !== 'inactive', reactivating: change.status === 'active' && found.status !== 'active' };
}

export const isMoving = (found: MemberState, target: TargetTeam | null): boolean => target !== null && target.id !== found.groupId;

/**
 * Qué responsable importa: el del destino al mover; el actual al reactivar a un delegado. Un delegado sin equipo no se puede reactivar.
 * Ya con su fila bloqueada, si no está activo ni pendiente se responde `onDead`.
 */
export function leaderToCheck(plan: MemberPlan, found: MemberState, target: TargetTeam | null): LeaderCheck | null {
  if (target) return { groupId: target.id, leaderId: target.leaderId, onDead: 'NOT_FOUND' };
  if (plan.reactivating && plan.isDelegate) {
    if (!found.groupId || !found.leaderId) throw new DomainError('TEAM_LEADER_INACTIVE');
    return { groupId: found.groupId, leaderId: found.leaderId, onDead: 'TEAM_LEADER_INACTIVE' };
  }
  return null;
}

/** Solo desactivar o mover libera controles. */
export const releasesControls = (plan: MemberPlan, moving: boolean): boolean => plan.deactivating || moving;

/** Un responsable con delegados activos o pendientes no se desactiva; la confirmación no lo salta. */
export function assertNoLiveDelegates(found: MemberState, plan: MemberPlan, liveDelegates: number): void {
  if (plan.deactivating && found.role === 'responsable' && liveDelegates > 0) throw new DomainError('RESPONSIBLE_HAS_DELEGATES', { delegates_count: liveDelegates });
}

/** Como dueño, el control queda «Sin asignar» (se borra la asignación); como ejecutor, queda sin ejecutor y sigue con su dueño. Sin confirmar, USER_HAS_ASSIGNMENTS. */
export function partitionReleased(rows: AssignmentRow[], userId: string, confirmed: boolean): { owned: AssignmentRow[]; executed: AssignmentRow[] } {
  if (rows.length > 0 && !confirmed) throw new DomainError('USER_HAS_ASSIGNMENTS', { controls_count: rows.length });
  return { owned: rows.filter((r) => r.ownerId === userId), executed: rows.filter((r) => r.ownerId !== userId) };
}

/** El antes y el después de los controles QUE REALMENTE cambiaron (las filas que la base devolvió al borrar o actualizar). */
export function describeReleased(owned: AssignmentRow[], executed: AssignmentRow[]): ReleasedControl[] {
  return [
    ...owned.map((r) => ({ controlId: r.clientControlId, before: { ownerId: r.ownerId, executorId: r.executorId }, after: { ownerId: null, executorId: null } })),
    ...executed.map((r) => ({ controlId: r.clientControlId, before: { ownerId: r.ownerId, executorId: r.executorId }, after: { ownerId: r.ownerId, executorId: null } })),
  ];
}
