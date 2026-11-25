import { can, scopeOf } from '../../../common/authorization/permission-matrix';
import type { AssignmentCounts, MyDocumentStatus } from './document.types';

// Reglas puras de Documentos (contracts/documentos.md). Sin Nest ni Prisma.

const DAY_MS = 86_400_000;

/** D152 · El plazo se fija al asignar: asignación + PR-14 (días para aceptar). */
export const dueAtOf = (assignedAt: Date, acceptanceDays: number): Date => new Date(assignedAt.getTime() + acceptanceDays * DAY_MS);

/**
 * El estado de una persona frente a la versión vigente (derivado, nunca guardado): `accepted` si aceptó esa versión; si no, `overdue` cuando ya pasó su plazo; si no, `pending`.
 * Una versión nueva (D152) pide aceptar otra vez, así que quien aceptó la anterior vuelve a `pending`. Sin aceptación requerida (`not_required`) el estado es `null`.
 */
export function assignmentStatus(input: { requiresAcceptance: boolean; accepted: boolean; dueAt: Date; now: Date }): MyDocumentStatus | null {
  // Un documento que no pide aceptación se lee y ya: no hay nada que esperar ni que vencer, así que no tiene estado.
  if (!input.requiresAcceptance) return null;
  if (input.accepted) return 'accepted';
  return input.now.getTime() > input.dueAt.getTime() ? 'overdue' : 'pending';
}

/** Orden de «Mis documentos»: primero lo vencido, luego lo pendiente y al final lo aceptado. */
export const MY_STATUS_ORDER: Record<MyDocumentStatus, number> = { overdue: 0, pending: 1, accepted: 2 };

/** Cuentas a las que se asigna un documento: las de los roles que aceptan (matriz) y vigentes (`active` o `pending`). Nunca el auditor ni `admin_monkey`. */
export const isEligibleAssignee = (user: { role: string; status: string }): boolean => can('documents.accept', user.role) && (user.status === 'active' || user.status === 'pending');

/**
 * ¿Puede ver el archivo de una versión? Quien tiene `documents.view_current` sin acotar (administrador y auditor) ve cualquiera; quien lo tiene acotado (responsable, delegado, colaborador)
 * solo si tiene el documento asignado y la versión es la vigente o una que aceptó (contrato: «el archivo de la versión vigente»).
 */
export function mayReadVersionFile(input: { role: string; assigned: boolean; isCurrent: boolean; acceptedByMe: boolean }): boolean {
  const scope = scopeOf('documents.view_current', input.role);
  if (scope === 'all') return true;
  return scope === 'scoped' && input.assigned && (input.isCurrent || input.acceptedByMe);
}

export const emptyCounts = (): AssignmentCounts => ({ total: 0, accepted: 0, pending: 0, overdue: 0 });
