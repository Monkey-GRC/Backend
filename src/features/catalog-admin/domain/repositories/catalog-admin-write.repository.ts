import { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { CatalogOrigin } from './catalog-admin.repository';

// Escritura del catálogo maestro desde Monkey Admin (contracts/modules/monkey-admin-catalog.md). Cada operación hace su efecto y su fila de auditoría en la
// MISMA transacción (SEG-36). Devuelven `null` cuando el elemento (o el otro lado de un vínculo) no existe.
export type Snapshot = Record<string, unknown>;

/** Lo que cambió: el elemento y cómo estaba antes y cómo quedó. Es lo que la auditoría guarda. */
export type Change = { id: string; code: string; before: Snapshot | null; after: Snapshot | null };

export type Audit = AuditIntent<Change>;

export type TestTexts = Partial<{
  tool: string;
  population: string;
  period: string;
  populationSize: string;
  suggestedSampleSize: string;
  selectionMethod: string;
  evidenceToRequest: string;
  prerequisites: string;
  stepByStep: string[];
  attributesToValidate: string[];
  complianceCriterion: string;
  exceptions: string;
  exceptionsHandling: string;
  evidenceToRetain: string;
  automatedCoverage: string;
  complementaryManualValidation: string;
  limitations: string;
}>;

export type NewTest = TestTexts & { code: string; dimension: string; name: string; displayName: string; displayDescription: string; objective: string; type: string };
export type TestPatch = TestTexts & Partial<{ name: string; displayName: string; displayDescription: string; objective: string; type: string; isActive: boolean }>;

export type PointOfFocusRef = { id: string; frameworkCode: string; requirementCode: string; number: number; description: string; controlsCount: number };

export abstract class CatalogAdminWriteRepository {
  abstract createControl(scope: TenantScope, input: { code: string; name: string; description: string; domain: string; sourceRef?: string }, audit: Audit): Promise<Change>;
  abstract updateControl(scope: TenantScope, id: string, patch: Partial<{ name: string; description: string; domain: string; sourceRef: string; isActive: boolean }>, audit: Audit): Promise<Change | null>;

  abstract createRisk(scope: TenantScope, input: { code?: string; name: string; description: string; trustCriterion: string; potentialImpact: string[] }, audit: Audit): Promise<Change>;
  abstract updateRisk(scope: TenantScope, id: string, patch: Partial<{ name: string; description: string; trustCriterion: string; potentialImpact: string[]; isActive: boolean }>, audit: Audit): Promise<Change | null>;

  abstract createCause(scope: TenantScope, input: { code?: string; name: string; description: string; failureCategory: string }, audit: Audit): Promise<Change>;
  abstract updateCause(scope: TenantScope, id: string, patch: Partial<{ name: string; description: string; failureCategory: string; isActive: boolean }>, audit: Audit): Promise<Change | null>;

  abstract createEvidenceTemplate(scope: TenantScope, input: { code: string; description: string; dimension?: string }, audit: Audit): Promise<Change>;
  abstract updateEvidenceTemplate(scope: TenantScope, id: string, patch: Partial<{ description: string; isActive: boolean }>, audit: Audit): Promise<Change | null>;

  abstract createTest(scope: TenantScope, input: NewTest, audit: Audit): Promise<Change>;
  abstract updateTest(scope: TenantScope, id: string, patch: TestPatch, audit: Audit): Promise<Change | null>;

  abstract linkEvidenceTemplate(scope: TenantScope, controlId: string, templateId: string, sequence: number | undefined, audit: Audit): Promise<Change | null>;
  abstract unlinkEvidenceTemplate(scope: TenantScope, controlId: string, templateId: string, audit: Audit): Promise<Change | null>;
  abstract linkTest(scope: TenantScope, controlId: string, testId: string, audit: Audit): Promise<Change | null>;
  abstract unlinkTest(scope: TenantScope, controlId: string, testId: string, audit: Audit): Promise<Change | null>;
  abstract linkPointOfFocus(scope: TenantScope, controlId: string, pointOfFocusId: string, audit: Audit): Promise<Change | null>;
  abstract unlinkPointOfFocus(scope: TenantScope, controlId: string, pointOfFocusId: string, audit: Audit): Promise<Change | null>;
  abstract linkCauseToControl(scope: TenantScope, causeId: string, controlId: string, audit: Audit): Promise<Change | null>;
  abstract unlinkCauseFromControl(scope: TenantScope, causeId: string, controlId: string, audit: Audit): Promise<Change | null>;
  abstract linkRiskToCause(scope: TenantScope, riskId: string, causeId: string, audit: Audit): Promise<Change | null>;
  abstract unlinkRiskFromCause(scope: TenantScope, riskId: string, causeId: string, audit: Audit): Promise<Change | null>;
  abstract addDimension(
    scope: TenantScope,
    controlId: string,
    input: { dimension: string; type: string; requiresProbe: boolean; requiresAi: boolean; requiresComplianceConfirmation: boolean },
    audit: Audit,
  ): Promise<Change | null>;
  abstract removeDimension(scope: TenantScope, controlId: string, dimension: string, audit: Audit): Promise<Change | null>;

  /** Los puntos de enfoque de un marco, para elegir a cuál se vincula un control. `null` si el marco no existe. */
  abstract listPointsOfFocus(frameworkId: string, requirementCode?: string): Promise<PointOfFocusRef[] | null>;
}

export type { CatalogOrigin };
