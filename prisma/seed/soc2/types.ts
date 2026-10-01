// Forma del catálogo maestro de SOC 2 que viaja entre `extract` (Excel → JSON), `load` (JSON → BD)
// y `verify` (BD ↔ JSON). Núcleo de SOC 2 (MD-65), riesgos y causas, pruebas y plantillas de evidencia.
// Regla (D38): el dato real manda. Las cifras de abajo se midieron sobre las hojas, no se copiaron de
// ningún resumen; si el Excel cambia, `extract` falla hasta que se actualicen de forma consciente.
// Ver prisma/seed/README.md.

export type TrustCriterion =
  | 'security'
  | 'availability'
  | 'confidentiality'
  | 'integrity'
  | 'privacy';

export type Dimension = 'policy' | 'server' | 'database' | 'app' | 'cloud';

export type RiskCriterion =
  | 'confidentiality' | 'integrity' | 'availability' | 'privacy' | 'compliance' | 'security'
  | 'continuity' | 'third_parties' | 'fraud' | 'reputation' | 'operations';

export type FailureCategory =
  | 'human_resource' | 'processes' | 'information_technology' | 'infrastructure' | 'external' | 'governance';

export interface TestRow {
  code: string;
  dimension: Dimension;
  name: string;
  objective: string;
  type: string;
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
}

export interface Soc2Catalog {
  meta: {
    sourceFile: string;
    sourceSha256: string;
    sheets: Record<string, string>;
    counts: Counts;
    // Lo que el Excel dice y los datos no confirman, y qué se hizo (no se adivina nada).
    sourceNotes: string[];
  };
  framework: {
    code: string;
    name: string;
    version: string;
    type: 'attestation';
    scopeDescription: string;
  };
  trustCriteria: { criterion: TrustCriterion; isMandatory: boolean; sourceName: string }[];
  requirements: {
    code: string;
    tscCategory: string;
    criterion: string;
    trustCriterion: TrustCriterion;
  }[];
  pointsOfFocus: { requirementCode: string; number: number; description: string }[];
  // El control NO lleva marco ni requisito: se vincula solo a puntos de enfoque (modelo-datos.md §3.2).
  controls: {
    code: string;
    name: string;
    description: string;
    domain: string;
    sourceRef: string;
  }[];
  pointOfFocusControls: {
    requirementCode: string;
    pointNumber: number;
    controlCode: string;
  }[];
  // Riesgos y causas (plantillas: el cliente trabaja sobre su copia, D28).
  risks: {
    code: string;
    name: string;
    description: string;
    trustCriterion: RiskCriterion;
    potentialImpact: string[];
    isActive: boolean;
  }[];
  causes: { code: string; name: string; failureCategory: FailureCategory; description: string }[];
  riskCauses: { code: string; riskCode: string; causeCode: string }[];
  causeControls: { causeCode: string; controlCode: string }[];
  // Pruebas propias del comité y su asignación a controles (hoja Pruebas).
  tests: TestRow[];
  controlTests: { controlCode: string; testCode: string }[];
  // Plantillas de evidencia: los documentos que el comité vincula a cada control.
  evidenceTemplates: { code: string; description: string; dimension: Dimension }[];
  controlEvidenceTemplates: { controlCode: string; templateCode: string; sequence: number }[];
}

export interface Counts {
  trustCriteria: number;
  requirements: number;
  pointsOfFocus: number;
  controls: number;
  assignedControls: number;
  pointOfFocusControls: number;
  risks: number;
  causes: number;
  riskCauses: number;
  causeControls: number;
  tests: number;
  controlTests: number;
  evidenceTemplates: number;
  controlEvidenceTemplates: number;
}

// Cifras del archivo del comité, medidas sobre los datos crudos de las hojas (no sobre `Resumen`,
// que está desactualizada: declara 658 relaciones donde los datos tienen 729).
export const EXPECTED_COUNTS: Counts = {
  trustCriteria: 5,
  requirements: 61,
  pointsOfFocus: 302,
  controls: 119,
  assignedControls: 118,
  pointOfFocusControls: 729,
  risks: 10,
  causes: 56,
  riskCauses: 92,
  causeControls: 209,
  tests: 61,
  // 284 pares de la hoja Pruebas (61 de 61 pruebas y 118 de 118 controles cubiertos). La matriz
  // "Análisis TEST x Control" trae 248, de los que 27 citan T-APP-001…006, que no existen (ver sourceNotes).
  controlTests: 284,
  // 89 vínculos entre 67 controles y 50 documentos distintos.
  evidenceTemplates: 50,
  controlEvidenceTemplates: 89,
};

// CPL-1 es "SOC 2 - Descripción del Sistema": existe en el catálogo pero no se vincula a ningún
// punto de enfoque (en el producto lo cubre `system_descriptions`).
export const EXPECTED_UNASSIGNED_CONTROLS = ['CPL-1'];

// 10 de las 56 causas no aparecen en ninguna de las 92 relaciones riesgo ↔ causa de la hoja Causas. Son
// datos reales del comité: se cargan tal cual, sin inventarles un riesgo. Cualquier otra causa sin riesgo
// (o una de estas que deje de serlo) hace fallar la extracción.
export const EXPECTED_CAUSES_WITHOUT_RISK = ['F003', 'F004', 'F016', 'F020', 'F026', 'F034', 'F042', 'F045', 'F053', 'F054'];

export const EXPECTED_REQUIREMENTS_BY_PREFIX: Record<string, number> = {
  A: 3,
  C: 2,
  CC: 33,
  P: 18,
  PI: 5,
};

export const PREFIX_TO_CRITERION: Record<string, TrustCriterion> = {
  A: 'availability',
  C: 'confidentiality',
  CC: 'security',
  P: 'privacy',
  PI: 'integrity',
};

// Columna "Categoría (corto)" del Excel → criterio de confianza.
export const SOURCE_NAME_TO_CRITERION: Record<string, TrustCriterion> = {
  Disponibilidad: 'availability',
  Confidencialidad: 'confidentiality',
  'Criterios Comunes (Seguridad)': 'security',
  Privacidad: 'privacy',
  'Integridad de Procesamiento': 'integrity',
};

export const FRAMEWORK = {
  code: 'soc2',
  name: 'SOC 2',
  // TSC 2017 con los puntos de enfoque revisados por la AICPA en 2022 (frameworks/soc2.md).
  version: '2017',
  type: 'attestation' as const,
  scopeDescription:
    'Informe de atestación sobre los controles de una organización de servicios relevantes para ' +
    'la seguridad, la disponibilidad, la integridad del procesamiento, la confidencialidad y la ' +
    'privacidad, según los Trust Services Criteria de la AICPA.',
};

export const CATALOG_JSON = 'prisma/seed/data/soc2-catalog.json';

export const TEST_PREFIX_TO_DIMENSION: Record<string, Dimension> = {
  DOC: 'policy',
  SRV: 'server',
  BD: 'database',
  CLD: 'cloud',
  APP: 'app',
};

// Columna "DIMENSIÓN" de la hoja Pruebas → dimensión del modelo.
export const SOURCE_DIMENSION: Record<string, Dimension> = {
  DOCUMENTAL: 'policy',
  SERVIDORES: 'server',
  BD: 'database',
  NUBE: 'cloud',
  APLICACIÓN: 'app',
  APLICACION: 'app',
};

export const SOURCE_RISK_CRITERION: Record<string, RiskCriterion> = {
  Confidencialidad: 'confidentiality',
  Integridad: 'integrity',
  Disponibilidad: 'availability',
  Privacidad: 'privacy',
  Cumplimiento: 'compliance',
  Seguridad: 'security',
  Continuidad: 'continuity',
  Terceros: 'third_parties',
  Fraude: 'fraud',
  Reputación: 'reputation',
  Operación: 'operations',
};

export const SOURCE_FAILURE_CATEGORY: Record<string, FailureCategory> = {
  'Recurso Humano': 'human_resource',
  Procesos: 'processes',
  'Tecnología de Información': 'information_technology',
  Infraestructura: 'infrastructure',
  Externos: 'external',
  Gobierno: 'governance',
};
