import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import type { ControlAccess } from '../controls/control-access';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ObservationStatus, ObservationType } from './observation-lifecycle';

// Las observaciones del auditor de UN servicio (tenant.audit_observations, §7.6). Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).
// La regla de quién puede qué y del ciclo de vida la decide el caso de uso; el repositorio la ejecuta con la fila bloqueada para que dos peticiones a la vez no se pisen.

export type Person = { id: string; name: string | null; lastName: string | null };

export type ObservationRecord = {
  id: string;
  serviceId: string;
  clientControlId: string | null;
  evidenceSubmissionId: string | null;
  type: ObservationType;
  body: string;
  status: ObservationStatus;
  createdBy: Person & { role: string };
  createdAt: Date;
  answerNote: string | null;
  answerEvidenceId: string | null;
  answeredBy: Person | null;
  answeredAt: Date | null;
  closedBy: Person | null;
  closedAt: Date | null;
};

export type ObservationFilters = {
  status?: ObservationStatus;
  type?: ObservationType;
  clientControlId?: string;
  /** Solo las de los controles de los que este usuario es responsable (el `responsable`): las de un servicio completo no cuentan. */
  onlyControlsOf?: string;
  page: number;
  pageSize: number;
};

/** La observación y los usuarios responsables de su control (vacío si no habla de un control): con eso el caso de uso decide si el `responsable` la toca. */
export type ObservationAccess = { record: ObservationRecord; access: ControlAccess };

/** Lo que cambia una escritura. Lo que no se nombra no se toca; la respuesta anterior se conserva al devolverla a `open`. */
export type ObservationChange = {
  body?: string;
  status?: ObservationStatus;
  answer?: { note: string; evidenceId: string | null; by: string; at: Date };
  closed?: { by: string; at: Date };
};

export abstract class ObservationRepository {
  // null si el servicio no existe (o es de otra empresa). NOT_FOUND si el control o la evidencia no son del servicio; CONTROL_RETIRED si el control se dio de baja;
  // 422 si traen los dos y la evidencia no es de ese control. Si solo trae la evidencia, el control se completa con el de su entrega.
  abstract create(
    scope: TenantScope,
    serviceId: string,
    input: { type: ObservationType; body: string; clientControlId: string | null; evidenceSubmissionId: string | null; createdBy: string },
    audit: AuditIntent<ObservationRecord>,
  ): Promise<ObservationRecord | null>;

  // null si el servicio no existe (o es de otra empresa).
  abstract list(scope: TenantScope, serviceId: string, filters: ObservationFilters): Promise<Page<ObservationRecord> | null>;

  // null si no existe (o es de otra empresa).
  abstract find(scope: TenantScope, id: string): Promise<ObservationAccess | null>;

  // Lee con la fila bloqueada, deja que `decide` valide y devuelva el cambio (o lance el error del contrato), lo aplica y escribe `audit` con el antes y el después.
  // `answer.evidenceId` debe ser una entrega de un control del mismo servicio (NOT_FOUND si no). null si la observación no existe (o es de otra empresa).
  abstract mutate(
    scope: TenantScope,
    id: string,
    decide: (current: ObservationAccess) => ObservationChange,
    audit: AuditIntent<{ before: ObservationRecord; after: ObservationRecord }>,
  ): Promise<ObservationRecord | null>;
}
