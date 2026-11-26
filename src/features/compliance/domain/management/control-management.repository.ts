import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import type { RequestMeta } from '../../../../common/http/request-meta';
import type { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { ControlReadout } from '../controls/control-readout';
import type { ControlStateSnapshot } from '../controls/control-state-events';
import type { ServiceReadoutData } from '../controls/control.repository';
import type { ApprovalDecision, ApprovalStep, ManagementState, PersonRef } from '../controls/management-state';

// MD-504 (D132, D140) · Aprobar o devolver un control y registrar el resultado de una prueba manual. Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36, G-09).

export type ApprovalWrite = {
  step: ApprovalStep;
  decision: ApprovalDecision;
  reason: string | null;
  actorId: string;
  /** El inicio de la ventana vigente del control: la aprobación solo vale en ella. */
  windowStart: Date | null;
  /** Las entregas que causan la devolución: quedan devueltas y dejan de contar. */
  returnedSubmissionIds: readonly string[];
  /** El estado de gestión del control antes del acto, para el rastro. */
  stateBefore: ManagementState;
  meta: RequestMeta;
};
export type ApprovalSaved = { id: string; controlId: string; controlCode: string; at: Date; write: ApprovalWrite; stateAfter: ManagementState };

export type ResultWrite = { result: 'correct' | 'observation' | 'exception'; note: string | null; registeredBy: string; meta: RequestMeta };
export type ResultSaved = { id: string; controlId: string; testId: string; result: ResultWrite['result']; note: string | null; registeredBy: PersonRef; registeredAt: Date; stateBefore: ManagementState; stateAfter: ManagementState };

/** Lo que se lee UNA vez con el control bloqueado: la foto del servicio, el control leído con el motor y el «antes» de todos los controles del servicio. */
export type ManagementContext = { data: ServiceReadoutData; readout: ControlReadout; before: ReadonlyMap<string, ControlStateSnapshot> };

export abstract class ControlManagementRepository {
  /**
   * Bloquea la fila del control hasta el final de la transacción (dos decisiones a la vez no se pisan) y, ya bajo el bloqueo, lee el servicio una sola vez. `null` si el control no existe para
   * esta empresa o está dado de baja (404).
   */
  abstract lockAndRead(scope: TenantScope, controlId: string): Promise<ManagementContext | null>;

  /** De los ids, los que son entregas de evidencia de ESTE control. */
  abstract submissionsOfControl(scope: TenantScope, controlId: string, submissionIds: readonly string[]): Promise<string[]>;

  /**
   * Guarda la aprobación o la devolución. Una devolución además invalida las aprobaciones vigentes del control y marca devueltas las entregas dadas. Deja el evento del estado (contra `before`,
   * la foto leída bajo el bloqueo), avisa (`control_owner_approved` o `control_returned`) y escribe el rastro, todo en la misma transacción.
   */
  abstract recordApproval(scope: TenantScope, controlId: string, input: ApprovalWrite, before: ManagementContext['before'], audit: AuditIntent<ApprovalSaved>): Promise<ApprovalSaved>;

  /** Guarda el resultado de la prueba en el control (una fila nueva e inmutable), deja el evento del estado y escribe el rastro. */
  abstract recordResult(scope: TenantScope, controlId: string, testId: string, input: ResultWrite, before: ManagementContext['before'], audit: AuditIntent<ResultSaved>): Promise<ResultSaved>;
}
