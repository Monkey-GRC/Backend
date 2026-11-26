import type { WindowMode } from '../../../../common/evaluation-parameters/parameter-definitions';
import type { Periodicity } from '../engine/v2/types';
import { currentWindow, isCalendarPeriodicity } from '../engine/v2/windows';
import { scopeOf } from '../../../../common/authorization/permission-matrix';
import { isOwnerOf, type Parties } from './control-access';

// MD-504 (D132, contracts/cumplimiento/aprobacion.md) · El estado de gestión del control: lo que las personas hicieron (aprobar, devolver, cargar) sobre lo que el motor v2 dice. Se DERIVA al leer:
// nadie lo escribe. Lógica pura, sin Prisma ni Nest.

export const MANAGEMENT_STATES = ['non_compliant', 'in_progress', 'returned', 'pending_approval', 'owner_approved', 'approved'] as const;
export type ManagementState = (typeof MANAGEMENT_STATES)[number];

export type ApprovalStep = 'owner' | 'final';
export type ApprovalDecision = 'approved' | 'returned';
export type PersonRef = { id: string; name: string | null; lastName: string | null };

/** Una fila de `control_approvals`. `windowStart` es el inicio de la ventana del control cuando se dio; `invalidatedAt` se escribe cuando el control dejó de cumplir. */
export type ApprovalRecord = {
  id: string;
  step: ApprovalStep;
  decision: ApprovalDecision;
  reason: string | null;
  actor: PersonRef;
  at: Date;
  windowStart: Date | null;
  invalidatedAt: Date | null;
};

/**
 * El inicio de la ventana vigente del CONTROL: el más reciente de las ventanas de calendario de sus requisitos. Otra ventana = otras aprobaciones (D132). Solo cuentan las periodicidades de
 * calendario en el modo `calendar`: la anual y la móvil (`rolling`) arrancan en la última evidencia, que se mueve con cada entrega; su vencimiento hace que el control deje de cumplir y por eso
 * se invalida la aprobación (`invalidateOnDrop`). Sin ninguna, `null`: no hay ventana que cambie.
 */
export function controlWindowStart(periodicities: readonly (Periodicity | null)[], now: Date, mode: WindowMode): Date | null {
  if (mode === 'rolling') return null;
  let latest: Date | null = null;
  for (const periodicity of periodicities) {
    if (!isCalendarPeriodicity(periodicity)) continue;
    const start = currentWindow({ periodicity, now })?.start ?? null;
    if (start && (!latest || start > latest)) latest = start;
  }
  return latest;
}

export type ManagementInput = {
  /** El motor da el 100 % de los requisitos aplicables (`complies`). */
  complies: boolean;
  /** Algún check Directo automático está en FAIL. */
  directFail: boolean;
  windowStart: Date | null;
  approvals: readonly ApprovalRecord[];
  /** Cuándo se cargó cada evidencia o se registró cada resultado manual del control. */
  loads: readonly Date[];
};

export type ManagementReadout = {
  state: ManagementState;
  ownerApproved: { by: PersonRef; at: Date } | null;
  approved: { by: PersonRef; at: Date } | null;
  returned: { reason: string; by: PersonRef; at: Date } | null;
};

const sameWindow = (a: ApprovalRecord, windowStart: Date | null): boolean => (a.windowStart === null || windowStart === null ? a.windowStart === windowStart : a.windowStart.getTime() === windowStart.getTime());
const latest = (rows: readonly ApprovalRecord[]): ApprovalRecord | null => rows.reduce<ApprovalRecord | null>((best, r) => (!best || r.at > best.at ? r : best), null);

/**
 * La tabla del contrato, en este orden:
 *  1. `returned`: la última devolución de la ventana vigente sin una aprobación posterior ni una carga nueva desde entonces.
 *  2. El motor da el 100 %: `approved` si hay una aprobación final vigente; `owner_approved` si hay la del responsable; si no, `pending_approval`.
 *  3. El motor no lo da: `non_compliant` si un check Directo falla; `in_progress` si en la ventana vigente hay evidencia o un resultado; si no, `non_compliant`.
 * Una aprobación vigente es la de esta ventana que nadie invalidó; si el control dejó de cumplir, `complies` ya la deja fuera de la rama 2.
 */
export function deriveManagement(input: ManagementInput): ManagementReadout {
  const inWindow = input.approvals.filter((a) => sameWindow(a, input.windowStart));
  const approvedRows = inWindow.filter((a) => a.decision === 'approved' && a.invalidatedAt === null);
  const ownerRow = latest(approvedRows.filter((a) => a.step === 'owner'));
  const finalRow = latest(approvedRows.filter((a) => a.step === 'final'));
  const lastReturn = latest(inWindow.filter((a) => a.decision === 'returned'));
  const approvedAfterReturn = !!lastReturn && inWindow.some((a) => a.decision === 'approved' && a.at > lastReturn.at);
  const loadedAfterReturn = !!lastReturn && input.loads.some((d) => d > lastReturn.at);
  const none = { ownerApproved: null, approved: null, returned: null };

  if (lastReturn && !approvedAfterReturn && !loadedAfterReturn) return { state: 'returned', ...none, returned: { reason: lastReturn.reason ?? '', by: lastReturn.actor, at: lastReturn.at } };

  if (input.complies) {
    if (finalRow) return { state: 'approved', ...none, ownerApproved: ownerRow ? { by: ownerRow.actor, at: ownerRow.at } : null, approved: { by: finalRow.actor, at: finalRow.at } };
    if (ownerRow) return { state: 'owner_approved', ...none, ownerApproved: { by: ownerRow.actor, at: ownerRow.at } };
    return { state: 'pending_approval', ...none };
  }

  if (input.directFail) return { state: 'non_compliant', ...none };
  const started = input.loads.some((d) => input.windowStart === null || d >= input.windowStart);
  return { state: started ? 'in_progress' : 'non_compliant', ...none };
}

/** El único estado que cuenta como cumplido en la categoría y el marco (D130 puntos 4 y 5). */
export const countsAsCompliant = (state: ManagementState): boolean => state === 'approved';

/**
 * Con qué paso puede actuar quien llama, según la matriz y no según el nombre del rol: el paso final exige `controls.approve_final` sin acotar; el primero, `controls.approve_first` acotado a
 * lo suyo (ser el responsable del control). `null`: no actúa sobre este control.
 */
export function approverStepOf(p: { role: string; userId: string }, access: Parties): ApprovalStep | null {
  if (scopeOf('controls.approve_final', p.role) === 'all') return 'final';
  return scopeOf('controls.approve_first', p.role) === 'scoped' && isOwnerOf(p.userId, access) ? 'owner' : null;
}

/** El paso que da quien aprueba (G-05) o por qué no puede. */
export type ApprovalAction = { step: ApprovalStep } | { error: 'FORBIDDEN' | 'OWNER_APPROVAL_REQUIRED' | 'CONTROL_NOT_COMPLIANT' | 'ALREADY_APPROVED' };

/**
 * Qué paso da `p` al aprobar un control en `state`. Quien puede el paso final aprueba sobre `owner_approved`; sobre `pending_approval` solo si es el responsable o el control no tiene uno
 * (su aprobación es la única); si hay otro responsable, primero aprueba ese (`OWNER_APPROVAL_REQUIRED`). El responsable solo da la primera y solo si es el dueño. Un paso ya dado: `ALREADY_APPROVED`.
 */
export function approvalStepFor(p: { role: string; userId: string }, access: Parties, state: ManagementState): ApprovalAction {
  const kind = approverStepOf(p, access);
  if (kind === 'final') {
    if (state === 'approved') return { error: 'ALREADY_APPROVED' };
    if (state === 'owner_approved') return { step: 'final' };
    if (state !== 'pending_approval') return { error: 'CONTROL_NOT_COMPLIANT' };
    const soleApprover = access.owner === null || isOwnerOf(p.userId, access);
    return soleApprover ? { step: 'final' } : { error: 'OWNER_APPROVAL_REQUIRED' };
  }
  if (kind === 'owner') {
    if (state === 'owner_approved' || state === 'approved') return { error: 'ALREADY_APPROVED' };
    return state === 'pending_approval' ? { step: 'owner' } : { error: 'CONTROL_NOT_COMPLIANT' };
  }
  return { error: 'FORBIDDEN' };
}

/** Quién registra el resultado de una prueba manual (D140 punto 2): el responsable del control; sin responsable o con el `admin_empresa` de responsable, el `admin_empresa`. */
export function canRegisterManualResult(p: { role: string; userId: string }, access: Parties): boolean {
  if (scopeOf('verdicts.register', p.role) === 'none') return false;
  if (scopeOf('verdicts.register', p.role) === 'scoped') return isOwnerOf(p.userId, access);
  return access.owner === null || isOwnerOf(p.userId, access);
}
