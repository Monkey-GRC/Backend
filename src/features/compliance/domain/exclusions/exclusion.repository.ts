import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// Las exclusiones de UN servicio (tenant.exclusions): un activo que sale del universo de un test (REQ-008, D96). El admin_empresa la crea y la decide en un solo acto:
// nace aprobada. `pending` y `rejected` quedan en el enum sin uso. Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).

export type ExclusionStatus = 'pending' | 'approved' | 'rejected';
export type Person = { id: string; name: string | null; lastName: string | null };

export type ExclusionRecord = {
  id: string;
  serviceId: string;
  test: { id: string; displayName: string | null; dimension: string };
  asset: { id: string; name: string };
  justification: string;
  technicalJustification: string | null;
  status: ExclusionStatus;
  validFrom: Date;
  validUntil: Date;
  proposedBy: Person;
  requestedAt: Date;
  decidedBy: Person | null;
  decisionNote: string | null;
  decidedAt: Date | null;
};

export type ExclusionFilters = { status?: ExclusionStatus; testId?: string; assetId?: string; expired?: boolean; page: number; pageSize: number };

export abstract class ExclusionRepository {
  // null si el servicio no existe (o es de otra empresa).
  abstract list(scope: TenantScope, serviceId: string, filters: ExclusionFilters): Promise<Page<ExclusionRecord> | null>;

  // El activo debe ser del servicio y el test aplicarle; si no, NOT_FOUND. La vigencia es hoy hasta el `period_end` del servicio: sin período, EVALUATION_NOT_DEFINED.
  // EXCLUSION_ALREADY_EXISTS si ya hay una aprobada vigente de lo mismo (o una pendiente heredada). Un test automático exige sustentación técnica (422). Nace aprobada y deja
  // el evento de cumplimiento y, si mueve un control, el evento de su estado.
  abstract create(
    scope: TenantScope,
    serviceId: string,
    input: { testId: string; assetId: string; justification: string; technicalJustification: string | null; decidedBy: string; meta: { ipAddress: string; userAgent: string } },
    audit: AuditIntent<ExclusionRecord>,
  ): Promise<ExclusionRecord | null>;
}
