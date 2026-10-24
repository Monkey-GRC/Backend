import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// La evaluación del consultor y la del auditor sobre un servicio y un marco (contracts/modules/compliance-overview.md, D77, MD-155). Inmutable: la base impide editarla o borrarla
// (SEG-56); para cambiar de opinión se emite otra y la vigente es la última de ese rol. No cambia el estado calculado.

export type AssessorRole = 'consultor' | 'auditor';
export type AssessmentVerdictValue = 'ready' | 'not_ready' | 'certified' | 'not_certified';

/** Qué puede emitir cada rol (SEG-56): el consultor prepara, el auditor certifica. */
export const VERDICTS_OF: Record<AssessorRole, readonly AssessmentVerdictValue[]> = {
  consultor: ['ready', 'not_ready'],
  auditor: ['certified', 'not_certified'],
};

export type AssessmentRecord = {
  id: string;
  serviceId: string;
  frameworkCode: string;
  assessorRole: AssessorRole;
  verdict: AssessmentVerdictValue;
  rationale: string;
  evaluation: { catalogVersion: number; periodStart: Date; periodEnd: Date; cutoffDate: Date };
  issuedBy: { id: string; name: string; lastName: string };
  issuedAt: Date;
  isCurrent: boolean;
};

export type NewAssessment = { assessorRole: AssessorRole; verdict: AssessmentVerdictValue; rationale: string; issuedBy: string; today: Date };

export type AssessmentFilters = { assessorRole?: AssessorRole; current?: boolean };

export abstract class FrameworkAssessmentRepository {
  /**
   * Emite la evaluación con su rastro en la misma transacción (SEG-36). Al emitirla **congela la fecha de corte** si la evaluación no la tenía (D87). `null` si el servicio no es
   * de la empresa o el marco no está contratado y activo en él. Lanza `EVALUATION_NOT_DEFINED` si falta el período.
   */
  abstract issue(scope: TenantScope, serviceId: string, frameworkCode: string, input: NewAssessment, audit: AuditIntent<AssessmentRecord>): Promise<AssessmentRecord | null>;

  /** La más reciente primero. `null` si el servicio no es de la empresa o el marco no está contratado y activo en él. */
  abstract list(scope: TenantScope, serviceId: string, frameworkCode: string, filters: AssessmentFilters, page: number, pageSize: number): Promise<Page<AssessmentRecord> | null>;
}
