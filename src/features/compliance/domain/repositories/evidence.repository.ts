import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

export type PersonRef = { id: string; name: string | null; lastName: string | null };

// Una entrega: el archivo concreto que alguien de la empresa subió para cumplir un requerimiento. Una versión nueva nunca pisa la anterior (RN-04).
export type SubmissionRecord = {
  id: string;
  requirementId: string;
  version: number;
  /** La llave del objeto en el almacenamiento privado; nunca sale en un response. */
  fileKey: string;
  fileType: string;
  fileSize: number;
  integrityHash: string;
  submittedBy: PersonRef;
  submittedAt: Date;
  aiVerdict: string | null;
};

export type RequirementRecord = {
  id: string;
  code: string;
  sequence: number;
  description: string;
  dimension: string;
  validityWithinPeriod: string;
  origin: 'catalog' | 'own';
  responsible: { id: string; type: string; personName: string } | null;
  /** La más reciente primero. */
  submissions: SubmissionRecord[];
};

/** Dónde está un requerimiento o una entrega y a quién le toca: lo que hace falta para decidir si una persona puede actuar sobre él. */
export type EvidenceAccess = {
  requirementId: string;
  controlId: string;
  serviceId: string;
  controlActive: boolean;
  /** Usuarios con cuenta a los que está asignado el control; un `funcional` solo actúa sobre los suyos. */
  assignedUserIds: string[];
};

export type NewSubmission = { fileKey: string; fileType: string; fileSize: number; integrityHash: string; submittedBy: string };

export abstract class EvidenceRepository {
  /** Los requerimientos del control con sus entregas. `null` si el control no existe para esta empresa. */
  abstract listByControl(scope: TenantScope, controlId: string): Promise<{ assignedUserIds: string[]; requirements: RequirementRecord[] } | null>;
  /** `null` si el requerimiento no existe para esta empresa. */
  abstract findRequirement(scope: TenantScope, requirementId: string): Promise<EvidenceAccess | null>;
  abstract listSubmissions(scope: TenantScope, requirementId: string, page: number, pageSize: number): Promise<Page<SubmissionRecord> | null>;
  /** Guarda la entrega con la versión siguiente y su rastro de auditoría en la misma transacción. `null` si el requerimiento no existe. */
  abstract createSubmission(scope: TenantScope, requirementId: string, input: NewSubmission, audit: AuditIntent<SubmissionRecord>): Promise<SubmissionRecord | null>;
  abstract findSubmission(scope: TenantScope, submissionId: string): Promise<{ submission: SubmissionRecord; access: EvidenceAccess } | null>;
}
