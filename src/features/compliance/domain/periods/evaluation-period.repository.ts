import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { EvaluationPeriod } from './evaluation-period';

// El período auditado y la fecha de corte de UN marco de un servicio (tenant.service_frameworks; D87, MD-168). La escritura recibe su `audit`, que se escribe en la
// MISMA transacción (SEG-36): si el rastro falla, el cambio se revierte.

export type EvaluationPeriodRecord = EvaluationPeriod & { frameworkCode: string; catalogVersion: number };

export abstract class EvaluationPeriodRepository {
  // null si el servicio no es de la empresa o el marco no está contratado y activo en él.
  abstract set(
    scope: TenantScope,
    serviceId: string,
    frameworkCode: string,
    period: { periodStart: Date; periodEnd: Date; cutoffDate: Date | null },
    audit: AuditIntent<{ before: EvaluationPeriodRecord; after: EvaluationPeriodRecord }>,
  ): Promise<{ before: EvaluationPeriodRecord; after: EvaluationPeriodRecord } | null>;
}
