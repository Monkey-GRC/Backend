import type { ControlAccess } from '../controls/control-access';
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
  /** D132 · Si el control se devolvió por esta entrega: el motivo y cuándo. `null` = no fue devuelta y cuenta. */
  returned: { reason: string; at: Date } | null;
};

/** La prueba documental a la que sirve un requerimiento (D88). */
export type RequirementTest = { id: string; code: string; displayName: string | null; displayNameEn: string | null };

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
  /** Dueño y ejecutor del control (D102): un `responsable` o `delegado` solo actúa sobre lo de sus controles. */
  access: ControlAccess;
};

export type NewSubmission = { fileKey: string; fileType: string; fileSize: number; integrityHash: string; submittedBy: string; meta: { ipAddress: string; userAgent: string } };

/** Qué hace falta saber de un control para agregarle una evidencia propia (D88). */
export type ControlEvidenceFacts = {
  controlId: string;
  serviceId: string;
  active: boolean;
  ownCode: string;
  /** Dueño y ejecutor del control (D102). */
  access: ControlAccess;
  /** Dimensiones que el control exige y aplican. */
  dimensions: string[];
  /** Las pruebas que el control lleva (el vínculo `client_control_tests`). */
  tests: Array<{ id: string; code: string; displayName: string | null; displayNameEn: string | null; dimension: string; primarySource: string | null; integrationCategory: string | null }>;
  /** El período de vigencia que ya usa el servicio en sus evidencias, si lo hay. */
  validityWithinPeriod: string | null;
};

/** El código (`EV-<control>-NN`) y la posición los pone el repositorio, dentro de la transacción y con el control bloqueado. */
export type NewRequirement = { description: string; dimension: string; testId: string | null; validityWithinPeriod: string };

/** Un control que lleva un test, con su dueño y ejecutor (D102): para decidir qué ve un `responsable` o `delegado`. */
export type TestEvidenceControl = { id: string; code: string; access: ControlAccess };

/** Lo que se subió para un test manual o documental, visto desde un control que lo lleva (D85, D88). */
export type TestEvidence = {
  testId: string;
  dimension: string;
  serviceId: string;
  /** Lo que la regla única necesita para decidir si la prueba acepta subida (`evidenceAcceptanceOf`); `dimensionApplies`: la dimensión de la prueba aplica en el control de origen. */
  test: { primarySource: string | null; integrationCategory: string | null; dimensionApplies: boolean };
  /** Los controles vigentes del servicio que llevan el test, el de origen incluido y primero. Si el test es documental solo está el de origen (D88). */
  controls: TestEvidenceControl[];
  /** Los requerimientos de esos controles que sirven al test, cada uno con el control de que es. */
  items: Array<{ controlId: string; requirement: RequirementRecord }>;
};

/** Los controles vigentes de un servicio con quién los atiende (D102) y los requerimientos de todos ellos, cargados en bloque. */
export type ServiceEvidence = {
  controls: Array<{ id: string; ownCode: string; access: ControlAccess }>;
  items: Array<{ controlId: string; requirement: RequirementRecord }>;
};

export abstract class EvidenceRepository {
  /** `null` si el servicio no existe para esta empresa. Número fijo de consultas. */
  abstract listByService(scope: TenantScope, serviceId: string): Promise<ServiceEvidence | null>;
  /** Los requerimientos del control con sus entregas. `null` si el control no existe para esta empresa. */
  abstract listByControl(scope: TenantScope, controlId: string): Promise<{ access: ControlAccess; requirements: RequirementRecord[] } | null>;
  /** `null` si el control no existe o no lleva el test. Trae los hechos de la prueba (`test`): si acepta subida o si hay histórico lo decide el caso de uso con la regla única. */
  abstract listByTest(scope: TenantScope, controlId: string, testId: string): Promise<TestEvidence | null>;
  /** `null` si el requerimiento no existe para esta empresa. */
  abstract findRequirement(scope: TenantScope, requirementId: string): Promise<EvidenceAccess | null>;
  abstract listSubmissions(scope: TenantScope, requirementId: string, page: number, pageSize: number): Promise<Page<SubmissionRecord>>;
  /** Guarda la entrega con la versión siguiente y su rastro de auditoría en la misma transacción. `null` si el requerimiento no existe. */
  abstract createSubmission(scope: TenantScope, requirementId: string, input: NewSubmission, audit: AuditIntent<SubmissionRecord>): Promise<SubmissionRecord | null>;
  abstract findSubmission(scope: TenantScope, submissionId: string): Promise<{ submission: SubmissionRecord; access: EvidenceAccess } | null>;
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
