import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { EvidenceAttribute } from '../engine/documentary-test';
import type { EvidenceReviewRecord, ReviewerRole, StoredReview } from '../evidence';

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
  /** La revisión de QUIEN PREGUNTA (la del consultor para la empresa y el consultor; la del auditor para el auditor). Nunca la del otro rol (D84, SEG-61). */
  review: EvidenceReviewRecord | null;
};

/** La prueba documental a la que sirve un requerimiento (D88). */
export type RequirementTest = { id: string; code: string; displayName: string | null };

export type RequirementRecord = {
  id: string;
  code: string;
  sequence: number;
  description: string;
  dimension: string;
  /** `null` = compartido con todas las pruebas documentales del control; si no, la prueba de ESTE control a la que sirve (D88). */
  test: RequirementTest | null;
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

export type NewSubmission = { fileKey: string; fileType: string; fileSize: number; integrityHash: string; submittedBy: string; meta: { ipAddress: string; userAgent: string } };

export type NewReview = {
  reviewerRole: ReviewerRole;
  reviewedBy: string;
  typeOk: EvidenceAttribute;
  periodOk: EvidenceAttribute;
  validOk: EvidenceAttribute;
  approvedOk: EvidenceAttribute;
  signedOk: EvidenceAttribute;
  contentOk: EvidenceAttribute;
  review: StoredReview;
  note: string | null;
  meta: { ipAddress: string; userAgent: string };
};

/** Lo que cambió al revisar: la revisión anterior del mismo rol (si la había) y la nueva, para el rastro. La entrega ya trae SOLO la revisión de quien revisó. */
export type ReviewSaved = { submission: SubmissionRecord; access: EvidenceAccess; before: EvidenceReviewRecord | null; after: EvidenceReviewRecord };

/** Qué hace falta saber de un control para agregarle una evidencia propia (D88). */
export type ControlEvidenceFacts = {
  controlId: string;
  serviceId: string;
  active: boolean;
  ownCode: string;
  assignedUserIds: string[];
  /** Dimensiones que el control exige y aplican. */
  dimensions: string[];
  /** Las pruebas que el control lleva (el vínculo `client_control_tests`). */
  tests: Array<{ id: string; code: string; displayName: string | null; dimension: string }>;
  /** El período de vigencia que ya usa el servicio en sus evidencias, si lo hay. */
  validityWithinPeriod: string | null;
};

/** El código (`EV-<control>-NN`) y la posición los pone el repositorio, dentro de la transacción y con el control bloqueado. */
export type NewRequirement = { description: string; dimension: string; testId: string | null; validityWithinPeriod: string };

export abstract class EvidenceRepository {
  /** Los requerimientos del control con sus entregas. `null` si el control no existe para esta empresa. `viewer`: de quién es la revisión que se lee. */
  abstract listByControl(scope: TenantScope, controlId: string, viewer: ReviewerRole): Promise<{ assignedUserIds: string[]; requirements: RequirementRecord[] } | null>;
  /** `null` si el requerimiento no existe para esta empresa. */
  abstract findRequirement(scope: TenantScope, requirementId: string): Promise<EvidenceAccess | null>;
  abstract listSubmissions(scope: TenantScope, requirementId: string, page: number, pageSize: number, viewer: ReviewerRole): Promise<Page<SubmissionRecord> | null>;
  /** Guarda la entrega con la versión siguiente y su rastro de auditoría en la misma transacción. `null` si el requerimiento no existe. */
  abstract createSubmission(scope: TenantScope, requirementId: string, input: NewSubmission, audit: AuditIntent<SubmissionRecord>): Promise<SubmissionRecord | null>;
  abstract findSubmission(scope: TenantScope, submissionId: string, viewer: ReviewerRole): Promise<{ submission: SubmissionRecord; access: EvidenceAccess } | null>;
  /** Crea o reemplaza la revisión de ESE rol sobre la entrega, con su rastro en la misma transacción (D84). `null` si la entrega no existe para esta empresa. */
  abstract saveReview(scope: TenantScope, submissionId: string, input: NewReview, audit: AuditIntent<ReviewSaved>): Promise<ReviewSaved | null>;
  /** `null` si el control no existe para esta empresa. */
  abstract controlEvidenceFacts(scope: TenantScope, controlId: string): Promise<ControlEvidenceFacts | null>;
  /** Agrega una evidencia propia al control, con su rastro en la misma transacción. */
  abstract createRequirement(scope: TenantScope, controlId: string, input: NewRequirement, audit: AuditIntent<RequirementRecord>): Promise<RequirementRecord | null>;
  /**
   * El lugar donde se entrega la evidencia de UNA prueba en un control (D88): el requerimiento de esa prueba, o uno nuevo si aún no existe. Con el control bloqueado, dos
   * primeras entregas a la vez no crean dos. El rastro solo se escribe si lo crea. `null` si el control no existe para esta empresa.
   */
  abstract findOrCreateTestRequirement(scope: TenantScope, controlId: string, testId: string, input: NewRequirement, audit: AuditIntent<RequirementRecord>): Promise<{ requirementId: string; created: boolean } | null>;
}
