import { Page } from '../../../../common/pagination/page';

// Lectura del catálogo maestro para Monkey Admin (contracts/modules/monkey-admin-catalog.md). El catálogo es global: no hay empresa ni tenant.

export type CatalogOrigin = 'committee' | 'monkey_admin';

export type PageQuery = { page: number; pageSize: number };

/** Filtros comunes de las listas. `search` busca en el código y el nombre (o la descripción, según el elemento). */
export type CatalogFilter = PageQuery & { search?: string; isActive?: boolean; origin?: CatalogOrigin };

export type ControlFilter = CatalogFilter & { domain?: string; requirementCode?: string; hasEvidenceTemplate?: boolean };

/** La lista global de controles: de un marco, o los que no pertenecen a ninguno (p. ej. CPL-1, o uno recién creado que aún no se vincula a un requisito). */
export type AllControlsFilter = ControlFilter & { frameworkId?: string; unlinked?: boolean };

type Stamped = { id: string; code: string; origin: CatalogOrigin };

export type FrameworkSummary = {
  id: string;
  code: string;
  name: string;
  version: string;
  type: string;
  availability: string;
  scopeDescription: string;
  // `controls` son los vinculados a algún requisito del marco; los que no (CPL-1) salen en `GET /catalog/controls?unlinked=true`.
  counts: { requirements: number; controls: number; tests: number };
};

export type FrameworkDetail = FrameworkSummary & {
  trustCriteria: Array<{ criterion: string; isMandatory: boolean }>;
  requirements: Array<{ code: string; tscCategory: string; criterion: string; trustCriterion: string; pointsOfFocusCount: number; controlsCount: number }>;
};

export type ControlSummary = Stamped & {
  name: string;
  domain: string | null;
  /** Los dominios distintos de sus puntos de enfoque, en orden; `domain` es el primero. */
  domains: string[];
  isActive: boolean;
  dimensions: string[];
  testsCount: number;
  evidenceTemplatesCount: number;
};

export type ControlDetail = Stamped & {
  name: string;
  description: string;
  domain: string | null;
  /** Los dominios distintos de sus puntos de enfoque, en orden; `domain` es el primero. */
  domains: string[];
  sourceRef: string | null;
  isActive: boolean;
  pointsOfFocus: Array<{ id: string; frameworkCode: string; requirementCode: string; number: number; description: string }>;
  dimensions: Array<{ dimension: string; type: string; requiresProbe: boolean; requiresAi: boolean; requiresComplianceConfirmation: boolean }>;
  tests: Array<{ id: string; code: string; dimension: string; displayName: string | null; isActive: boolean }>;
  evidenceTemplates: Array<{ id: string; code: string; description: string; sequence: number }>;
  policies: Array<{ name: string; requiresEmployeeAcceptance: boolean }>;
  causes: Array<{ id: string; code: string; name: string | null }>;
};

export type RiskSummary = Stamped & { name: string; trustCriterion: string; isActive: boolean; causesCount: number };

export type RiskDetail = Stamped & {
  name: string;
  description: string;
  trustCriterion: string;
  potentialImpact: unknown;
  isActive: boolean;
  causes: Array<{ id: string; code: string; name: string | null }>;
};

export type CauseSummary = Stamped & { name: string | null; failureCategory: string | null; isActive: boolean; risksCount: number; controlsCount: number };

export type CauseDetail = Stamped & {
  name: string | null;
  description: string;
  failureCategory: string | null;
  isActive: boolean;
  risks: Array<{ id: string; code: string; name: string }>;
  controls: Array<{ id: string; code: string; name: string }>;
};

export type TestSummary = Stamped & {
  dimension: string;
  name: string | null;
  displayName: string | null;
  type: string | null;
  isActive: boolean;
  controlsCount: number;
};

// Los textos del comité se ven aquí porque quien lee es `admin_monkey`; al cliente no salen nunca (D70).
export type TestDetail = Stamped & {
  dimension: string;
  name: string | null;
  displayName: string | null;
  displayDescription: string | null;
  isActive: boolean;
  committee: {
    objective: string;
    type: string | null;
    tool: string | null;
    population: string | null;
    period: string | null;
    populationSize: string | null;
    suggestedSampleSize: string | null;
    selectionMethod: string | null;
    evidenceToRequest: string | null;
    prerequisites: string | null;
    stepByStep: unknown;
    attributesToValidate: unknown;
    complianceCriterion: string | null;
    exceptions: string | null;
    exceptionsHandling: string | null;
    evidenceToRetain: string | null;
    automatedCoverage: string | null;
    complementaryManualValidation: string | null;
    limitations: string | null;
  };
  controls: Array<{ id: string; code: string; name: string }>;
};

export type EvidenceTemplateSummary = Stamped & { description: string; dimension: string; isActive: boolean; controlsCount: number };

export abstract class CatalogAdminRepository {
  abstract listFrameworks(query: PageQuery): Promise<Page<FrameworkSummary>>;
  abstract findFramework(id: string): Promise<FrameworkDetail | null>;
  /** `null` si el marco no existe. */
  abstract listFrameworkControls(frameworkId: string, filter: ControlFilter): Promise<Page<ControlSummary> | null>;
  abstract listControls(filter: AllControlsFilter): Promise<Page<ControlSummary>>;
  abstract findControl(id: string): Promise<ControlDetail | null>;
  abstract listRisks(filter: CatalogFilter): Promise<Page<RiskSummary>>;
  abstract findRisk(id: string): Promise<RiskDetail | null>;
  abstract listCauses(filter: CatalogFilter): Promise<Page<CauseSummary>>;
  abstract findCause(id: string): Promise<CauseDetail | null>;
  abstract listTests(filter: CatalogFilter & { dimension?: string }): Promise<Page<TestSummary>>;
  abstract findTest(id: string): Promise<TestDetail | null>;
  abstract listEvidenceTemplates(filter: CatalogFilter): Promise<Page<EvidenceTemplateSummary>>;
  abstract findEvidenceTemplate(id: string): Promise<EvidenceTemplateSummary | null>;
}
