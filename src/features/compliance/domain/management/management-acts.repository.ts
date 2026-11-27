import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { RequestMeta } from '../../../../common/http/request-meta';
import type { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { ControlReadout } from '../controls/control-readout';
import type { ManagementState } from '../controls/management-state';
import type { ManagementContext } from './control-management.repository';

// MD-529 (contracts/cumplimiento/aprobacion.md) · Los actos de gestión que se suman a la aprobación: corregir el nivel (R5), el plan de remediación, el «No aplica» de un requisito y las ocurrencias de los
// requisitos «cuando sea requerido». Toda escritura recibe su rastro, que se escribe en la MISMA transacción (SEG-36, G-09), y deja el evento de estado del control (D91) y los avisos.

/** Quién actúa y la foto del servicio leída bajo el bloqueo del control (de ahí salen los eventos de estado). */
export type ActContext = { actorId: string; meta: RequestMeta; before: ManagementContext['before'] };
/** `readout` es el control ya leído con lo escrito (la foto de después de la misma transacción). */
export type ActSaved = { id: string; stateAfter: ManagementState; readout: ControlReadout };
export type ActAudit = (stateAfter: ManagementState) => AuditEntry | AuditEntry[];
export type RequestKind = 'level' | 'plan' | 'not_applicable';

export type NewLevelOverride = { suggestedValue: number; proposedValue: number; justification: string; windowStart: Date | null; direct: boolean; staleIds: readonly string[]; supersedeIds: readonly string[] };
export type DecideRequest = { decision: 'approve' | 'reject'; reason: string | null; supersedeIds?: readonly string[] };
export type NewPlan = { testId: string; requirementId: string | null; what: string; assigneeId: string; dueDate: Date; windowStart: Date | null; direct: boolean; staleIds: readonly string[] };
export type NewApplicability = { requirementId: string; reason: string; direct: boolean };
export type NewOccurrence = { requirementId: string; occurredOn: Date; description: string };
export type NewDeclaration = { requirementId: string; windowStart: Date; windowEnd: Date; note: string | null };

export abstract class ManagementActsRepository {
  /** El control al que pertenece una solicitud (`null` si no existe para esta empresa). */
  abstract controlOfRequest(scope: TenantScope, kind: RequestKind, requestId: string): Promise<string | null>;
  /** ¿La persona es una cuenta activa de la empresa con un rol que puede llevar un plan (`admin_empresa`, `responsable`, `delegado`)? */
  abstract isAssignable(scope: TenantScope, userId: string): Promise<boolean>;

  abstract createLevelOverride(scope: TenantScope, controlId: string, input: NewLevelOverride, act: ActContext, audit: ActAudit): Promise<ActSaved>;
  abstract decideLevelOverride(scope: TenantScope, controlId: string, id: string, input: DecideRequest, act: ActContext, audit: ActAudit): Promise<ActSaved>;

  abstract createPlan(scope: TenantScope, controlId: string, input: NewPlan, act: ActContext, audit: ActAudit): Promise<ActSaved>;
  abstract decidePlan(scope: TenantScope, controlId: string, id: string, input: DecideRequest, act: ActContext, audit: ActAudit): Promise<ActSaved>;

  abstract createApplicabilityRequest(scope: TenantScope, controlId: string, input: NewApplicability, act: ActContext, audit: ActAudit): Promise<ActSaved>;
  abstract decideApplicability(scope: TenantScope, controlId: string, id: string, requirementId: string, input: DecideRequest, act: ActContext, audit: ActAudit): Promise<ActSaved>;
  abstract revertApplicability(scope: TenantScope, controlId: string, requestId: string, requirementId: string, reason: string, act: ActContext, audit: ActAudit): Promise<ActSaved>;

  abstract createOccurrence(scope: TenantScope, controlId: string, input: NewOccurrence, act: ActContext, audit: ActAudit): Promise<ActSaved & { invalidatedDeclarationIds: string[] }>;
  /** Escribe entradas de rastro sueltas dentro de la transacción en curso (lo que no acompaña a una escritura propia). */
  abstract auditExtra(scope: TenantScope, entries: readonly AuditEntry[]): Promise<void>;
  abstract createDeclaration(scope: TenantScope, controlId: string, input: NewDeclaration, act: ActContext, audit: ActAudit): Promise<ActSaved>;
}
