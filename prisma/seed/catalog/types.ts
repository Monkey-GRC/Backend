// Forma del catálogo v2 (VF18, RC-01) que viaja entre `catalog:extract` (libro → JSON) y `catalog:load` (JSON → base).
// Los valores de los enums son los de contracts/enums/catalogo-maestro.md; las etiquetas en español del libro se traducen en `labels.ts`.
// Regla (D38): el dato real manda. Los totales de abajo son los de la tabla 10 de la hoja 01_DESARROLLO.

export type Dimension = 'policy' | 'app' | 'server' | 'database' | 'cloud' | 'network' | 'endpoint' | 'physical' | 'process';
export type ControlType = 'manual' | 'it_dependent_manual' | 'automated';
export type Periodicity = 'permanent' | 'daily' | 'weekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual' | 'on_demand';
export type ItemType = 'documentary' | 'population' | 'operational' | 'technical';
export type PrimarySource = 'document' | 'manual' | 'probe' | 'cloud_engine' | 'probe_and_cloud_engine' | 'integration';
export type TestLevel = 'design' | 'implementation' | 'effectiveness' | 'implementation_and_effectiveness';
export type TestAutomation = 'manual' | 'semi_automated' | 'automated';
export type CheckRole = 'direct' | 'complementary' | 'dependency';
export type CauseOrigin = 'internal' | 'external';
export type CauseType =
  | 'human' | 'processes' | 'information' | 'measurement' | 'technology' | 'physical_infrastructure' | 'criminal_security' | 'third_parties' | 'legal_regulatory'
  | 'environmental' | 'organizational_governance' | 'internal_financial' | 'strategic' | 'external_technology' | 'climate' | 'biological' | 'political' | 'economic';
export type DocumentType = 'policy' | 'procedure' | 'matrix' | 'manual' | 'document';
export type DocumentOrigin = 'internal' | 'external';
export type DocumentAcceptance = 'users_who_apply' | 'all_users' | 'not_required';
export type TrustCriterion = 'security' | 'availability' | 'confidentiality' | 'integrity' | 'privacy';
export type RiskCriterion = 'confidentiality' | 'integrity' | 'availability' | 'privacy' | 'compliance' | 'continuity' | 'fraud';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface TestRow {
  code: string;
  // Nulo en las T-DOC: su control es el de los documentos (control_documents).
  controlCode: string | null;
  type: ItemType;
  dimension: Dimension;
  objective: string;
  whyItMatters: string;
  primarySource: PrimarySource;
  standardProcedureCode: string;
  stepByStep: string;
  correctIf: string;
  exceptionIf: string;
  observationIf: string;
  evidenceToRetain: string;
  level: TestLevel;
  frequencySample: string;
  // Nombre de la categoría de integración; nulo si el libro dice «N/A».
  integrationCategoryName: string | null;
  automation: TestAutomation;
  // Lo que ve el cliente (D70, D82): derivado en `display-names.ts`.
  displayName: string;
  displayNameReviewed: boolean;
  displayDescription: string;
  displayNameEn: null;
}

export interface TestCheckRow {
  testCode: string;
  role: CheckRole;
  // Clave del check (platform + policy_id + check_id). Nulos solo en los vínculos «N/A» (módulo o puntaje global, P49).
  platform: string | null;
  policyId: string | null;
  checkId: string | null;
  moduleRef: string | null;
  commonObjective: string;
  ownerControlCode: string | null;
  appliesWhen: string;
}

export interface CatalogV2 {
  meta: {
    sourceFile: string;
    sourceSha256: string;
    catalogVersion: 2;
    sondaVersion: string;
    cloudEngineVersion: string;
    counts: Counts;
    // Avisos conocidos que no impiden la carga (IN-07 en VUL-1/VUL-2, tipo de pérdida de R003/R004).
    warnings: string[];
  };
  framework: { code: 'soc2'; name: string; version: string; type: 'attestation'; scopeDescription: string };
  trustCriteria: { criterion: TrustCriterion; isMandatory: boolean; sourceName: string }[];
  requirements: { code: string; tscCategory: string; criterion: string; trustCriterion: TrustCriterion }[];
  pointsOfFocus: { requirementCode: string; number: number; description: string }[];
  controls: {
    code: string;
    name: string;
    description: string;
    type: ControlType;
    periodicity: Periodicity;
    suggestedOwnerRole: string;
  }[];
  pointOfFocusControls: { requirementCode: string; pointNumber: number; controlCode: string; domain: string }[];
  controlDimensions: { controlCode: string; dimension: Dimension }[];
  controlRequirements: {
    code: string;
    controlCode: string;
    pointNumber: number;
    text: string;
    type: ItemType;
    periodicity: Periodicity;
    isMandatory: boolean;
    assemblyNote: string | null;
  }[];
  controlRequirementTests: { requirementCode: string; testCode: string }[];
  controlRequirementDocuments: { requirementCode: string; documentCode: string }[];
  // Puente con el código v1 (control_tests): la columna «Test» de Controles Monkey.
  controlTests: { controlCode: string; testCode: string }[];
  controlDocuments: { controlCode: string; documentCode: string }[];
  documents: {
    code: string;
    type: DocumentType;
    name: string;
    description: string;
    minimumContent: string;
    reviewPeriodicity: Periodicity;
    suggestedApproverRole: string | null;
    suggestedOwnerRole: string;
    origin: DocumentOrigin;
    suggestedAcceptance: DocumentAcceptance;
    testCode: string;
  }[];
  standardProcedures: { code: string; name: string; whenUsed: string; genericSteps: string; typicalEvidence: string }[];
  // `procedureCodes`: la categoría puede citar varios procedimientos en el libro («PE-INT-01; PE-ACC-01»); se cargan todos (`integration_category_procedures`).
  integrationCategories: { name: string; exampleTools: string; evidenceProvided: string; procedureCodes: string[] }[];
  integrationCategoryControls: { categoryName: string; controlCode: string }[];
  tests: TestRow[];
  testChecks: TestCheckRow[];
  controlFrameworkMappings: { controlCode: string; frameworkCode: string; requirementRef: string; relationType: 'direct'; justification: string }[];
  risks: {
    code: string;
    name: string;
    description: string;
    trustCriterion: RiskCriterion;
    potentialImpact: string[];
    likelihood: number;
    impact: number;
    inherentRiskValue: number;
    inherentRiskLevel: RiskLevel;
  }[];
  causes: { code: string; causeOrigin: CauseOrigin; causeType: CauseType; description: string }[];
  riskCauses: { riskCode: string; causeCode: string }[];
  causeControls: { causeCode: string; controlCode: string }[];
}

export interface Counts {
  controls: number;
  pointOfFocusControls: number;
  trustCriteria: number;
  requirements: number;
  pointsOfFocus: number;
  controlRequirements: number;
  controlRequirementTests: number;
  controlRequirementDocuments: number;
  controlTests: number;
  controlDimensions: number;
  tests: number;
  testChecks: number;
  documents: number;
  controlDocuments: number;
  causes: number;
  risks: number;
  riskCauses: number;
  causeControls: number;
  standardProcedures: number;
  integrationCategories: number;
  integrationCategoryControls: number;
  controlFrameworkMappings: number;
}

// Tabla 10 de 01_DESARROLLO (y las cifras del contrato). `TOTALS_DETAIL` son los desgloses.
export const EXPECTED_COUNTS: Counts = {
  controls: 114,
  pointOfFocusControls: 472,
  // «TSC Ref» (61): son los 61 criterios de 8_MATRIZ_MAESTRA; los 5 criterios de confianza (trust_criteria) no cambian.
  trustCriteria: 5,
  requirements: 61,
  pointsOfFocus: 302,
  controlRequirements: 576,
  controlRequirementTests: 862,
  // 232 requisitos citan un documento; uno cita dos.
  controlRequirementDocuments: 233,
  controlTests: 658,
  controlDimensions: 374, // 267 de las columnas «Definido» + 107 de `process` (MD-499)
  tests: 472,
  testChecks: 4684,
  documents: 42,
  controlDocuments: 228,
  causes: 100,
  risks: 10,
  riskCauses: 551,
  causeControls: 771,
  standardProcedures: 8,
  integrationCategories: 14,
  integrationCategoryControls: 64,
  controlFrameworkMappings: 472,
};

export const EXPECTED_DETAIL = {
  requirementsByType: { documentary: 232, operational: 244, technical: 97, population: 3 } as Record<ItemType, number>,
  testsByType: { documentary: 43, population: 38, operational: 237, technical: 154 } as Record<ItemType, number>,
  testChecksByRole: { direct: 1728, complementary: 2001, dependency: 955 } as Record<CheckRole, number>,
  // Vínculos sin check (módulo o puntaje global, P49).
  moduleLinks: 19,
};

export const CATALOG_V2_JSON = 'prisma/seed/data/catalog-v2.json';

export const FRAMEWORK = {
  code: 'soc2' as const,
  name: 'SOC 2',
  version: '2017',
  type: 'attestation' as const,
  scopeDescription:
    'Informe de atestación sobre los controles de una organización de servicios relevantes para la seguridad, la disponibilidad, la integridad del procesamiento, ' +
    'la confidencialidad y la privacidad, según los Trust Services Criteria de la AICPA.',
};
