import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// Las exclusiones de UN servicio (tenant.exclusions): un activo que sale del universo de un test (REQ-008, D78). La empresa la propone y el consultor la decide;
// mientras está pendiente el activo se sigue midiendo. Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36).

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
  // EXCLUSION_ALREADY_EXISTS si ya hay una pendiente o una aprobada vigente de lo mismo. Un test automático exige sustentación técnica (422).
  abstract create(
    scope: TenantScope,
    serviceId: string,
    input: { testId: string; assetId: string; justification: string; technicalJustification: string | null; proposedBy: string },
    audit: AuditIntent<ExclusionRecord>,
  ): Promise<ExclusionRecord | null>;

  // null si no existe. ALREADY_DECIDED si ya no está pendiente. Al aprobar deja un evento de cumplimiento: cambia lo que se mide.
  abstract decide(
    scope: TenantScope,
    id: string,
    decision: { status: 'approved' | 'rejected'; note: string | null; decidedBy: string; meta: { ipAddress: string; userAgent: string } },
    audit: AuditIntent<{ before: ExclusionRecord; after: ExclusionRecord }>,
  ): Promise<{ before: ExclusionRecord; after: ExclusionRecord } | null>;

  // ¿La empresa tiene al menos un consultor activo? Sin él, la exclusión espera (P24, D83).
  abstract hasActiveConsultant(scope: TenantScope): Promise<boolean>;
}
