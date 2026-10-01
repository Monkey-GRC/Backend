import { countsOf } from './build';
import {
  EXPECTED_CAUSES_WITHOUT_RISK,
  EXPECTED_COUNTS,
  EXPECTED_REQUIREMENTS_BY_PREFIX,
  EXPECTED_UNASSIGNED_CONTROLS,
  PREFIX_TO_CRITERION,
  Soc2Catalog,
  TEST_PREFIX_TO_DIMENSION,
  TrustCriterion,
} from './types';

const ALLOWED_CONTROL_KEYS = ['code', 'name', 'description', 'domain', 'sourceRef'];

const isClean = (v: unknown): boolean =>
  typeof v === 'string' && v.length > 0 && v === v.trim();

function duplicates<T>(items: T[], key: (t: T) => string): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const it of items) {
    const k = key(it);
    if (seen.has(k)) dup.add(k);
    seen.add(k);
  }
  return [...dup];
}

/**
 * Valida el catálogo completo ANTES de tocar la base de datos. Devuelve TODOS los errores, no solo
 * el primero, agrupados por regla; lista vacía = catálogo consistente.
 */
export function validateCatalog(c: Soc2Catalog): string[] {
  const e: string[] = [];
  const err = (rule: string, msg: string) => e.push(`[${rule}] ${msg}`);

  // 1. Conteos exactos ---------------------------------------------------------------------
  const actual = countsOf(c);
  for (const k of Object.keys(EXPECTED_COUNTS) as (keyof typeof EXPECTED_COUNTS)[]) {
    if (actual[k] !== EXPECTED_COUNTS[k]) {
      err('conteos', `${k}: esperado ${EXPECTED_COUNTS[k]}, hay ${actual[k]}`);
    }
  }
  const byPrefix: Record<string, number> = {};
  for (const r of c.requirements) {
    const p = /^([A-Z]+)\d/.exec(r.code)?.[1] ?? '?';
    byPrefix[p] = (byPrefix[p] ?? 0) + 1;
  }
  for (const [p, n] of Object.entries(EXPECTED_REQUIREMENTS_BY_PREFIX)) {
    if ((byPrefix[p] ?? 0) !== n) {
      err('conteos', `requisitos con prefijo ${p}: esperado ${n}, hay ${byPrefix[p] ?? 0}`);
    }
  }
  for (const p of Object.keys(byPrefix)) {
    if (!(p in EXPECTED_REQUIREMENTS_BY_PREFIX)) err('conteos', `prefijo de requisito desconocido: ${p}`);
  }

  // 2. Campos obligatorios, sin vacíos ni espacios sobrantes ---------------------------------
  for (const [k, v] of Object.entries(c.framework)) {
    if (!isClean(v)) err('campos', `framework.${k} vacío o con espacios sobrantes`);
  }
  c.requirements.forEach((r) => {
    for (const f of ['code', 'tscCategory', 'criterion'] as const) {
      if (!isClean(r[f])) err('campos', `requirement ${r.code || '(sin código)'}: ${f} vacío o con espacios`);
    }
  });
  c.pointsOfFocus.forEach((p) => {
    if (!isClean(p.description)) err('campos', `punto de enfoque ${p.requirementCode}#${p.number}: descripción vacía o con espacios`);
    if (!Number.isInteger(p.number) || p.number < 1) err('campos', `punto de enfoque ${p.requirementCode}: número inválido (${p.number})`);
  });
  c.controls.forEach((k) => {
    for (const f of ALLOWED_CONTROL_KEYS) {
      if (!isClean((k as unknown as Record<string, unknown>)[f])) err('campos', `control ${k.code || '(sin código)'}: ${f} vacío o con espacios`);
    }
  });

  // 3. Unicidad de claves naturales -----------------------------------------------------------
  for (const d of duplicates(c.requirements, (r) => r.code)) err('unicidad', `requisito repetido: ${d}`);
  for (const d of duplicates(c.pointsOfFocus, (p) => `${p.requirementCode}#${p.number}`)) err('unicidad', `punto de enfoque repetido: ${d}`);
  for (const d of duplicates(c.controls, (k) => k.code)) err('unicidad', `control repetido: ${d}`);
  for (const d of duplicates(c.pointOfFocusControls, (r) => `${r.requirementCode}#${r.pointNumber}#${r.controlCode}`)) err('unicidad', `relación repetida: ${d}`);
  for (const d of duplicates(c.trustCriteria, (t) => t.criterion)) err('unicidad', `criterio de confianza repetido: ${d}`);

  // 4. Integridad referencial -----------------------------------------------------------------
  const reqCodes = new Set(c.requirements.map((r) => r.code));
  const pofKeys = new Set(c.pointsOfFocus.map((p) => `${p.requirementCode}#${p.number}`));
  const ctrlCodes = new Set(c.controls.map((k) => k.code));
  const criteria = new Set<TrustCriterion>(c.trustCriteria.map((t) => t.criterion));
  for (const p of c.pointsOfFocus) {
    if (!reqCodes.has(p.requirementCode)) err('referencias', `punto de enfoque ${p.requirementCode}#${p.number} apunta a un requisito inexistente`);
  }
  for (const r of c.requirements) {
    if (!criteria.has(r.trustCriterion)) err('referencias', `requisito ${r.code} apunta a un criterio inexistente (${r.trustCriterion})`);
  }
  for (const r of c.pointOfFocusControls) {
    if (!pofKeys.has(`${r.requirementCode}#${r.pointNumber}`)) err('referencias', `relación a un punto de enfoque inexistente: ${r.requirementCode}#${r.pointNumber} ↔ ${r.controlCode}`);
    if (!ctrlCodes.has(r.controlCode)) err('referencias', `relación a un control inexistente: ${r.controlCode}`);
  }
  const wantCriteria: TrustCriterion[] = ['security', 'availability', 'confidentiality', 'integrity', 'privacy'];
  for (const w of wantCriteria) {
    if (!criteria.has(w)) err('referencias', `falta el criterio de confianza ${w}`);
  }
  for (const t of c.trustCriteria) {
    if (t.isMandatory !== (t.criterion === 'security')) err('referencias', `is_mandatory de ${t.criterion} debe ser ${t.criterion === 'security'}`);
  }

  // 5. Estructura ----------------------------------------------------------------------------
  const pofByReq = new Map<string, number[]>();
  for (const p of c.pointsOfFocus) {
    pofByReq.set(p.requirementCode, [...(pofByReq.get(p.requirementCode) ?? []), p.number]);
  }
  for (const r of c.requirements) {
    const nums = (pofByReq.get(r.code) ?? []).slice().sort((a, b) => a - b);
    if (nums.length === 0) err('estructura', `el requisito ${r.code} no tiene puntos de enfoque`);
    else if (nums.some((n, i) => n !== i + 1)) err('estructura', `puntos de enfoque de ${r.code} no son contiguos desde 1: [${nums.join(', ')}]`);
  }
  const pofWithControl = new Set(c.pointOfFocusControls.map((r) => `${r.requirementCode}#${r.pointNumber}`));
  for (const k of pofKeys) {
    if (!pofWithControl.has(k)) err('estructura', `el punto de enfoque ${k} no tiene ningún control`);
  }
  const assignedCodes = new Set(c.pointOfFocusControls.map((r) => r.controlCode));
  const unassigned = c.controls.map((k) => k.code).filter((k) => !assignedCodes.has(k)).sort();
  if (JSON.stringify(unassigned) !== JSON.stringify([...EXPECTED_UNASSIGNED_CONTROLS].sort())) {
    err('estructura', `controles sin punto de enfoque: [${unassigned.join(', ')}]; se esperaba solo [${EXPECTED_UNASSIGNED_CONTROLS.join(', ')}]`);
  }
  // Regla estructural: el control es atómico, no cuelga de un marco ni de un requisito.
  for (const k of c.controls) {
    const extra = Object.keys(k).filter((key) => !ALLOWED_CONTROL_KEYS.includes(key));
    if (extra.length) err('estructura', `control ${k.code} lleva campos que lo atarían a un marco o requisito: ${extra.join(', ')}`);
  }

  // 6. Prefijo TSC ↔ criterio de confianza -----------------------------------------------------
  for (const r of c.requirements) {
    const prefix = /^([A-Z]+)\d/.exec(r.code)?.[1];
    const want = prefix ? PREFIX_TO_CRITERION[prefix] : undefined;
    if (!want) err('prefijo', `requisito ${r.code}: prefijo sin criterio conocido`);
    else if (want !== r.trustCriterion) err('prefijo', `requisito ${r.code}: el prefijo dice ${want} pero trae ${r.trustCriterion}`);
  }

  e.push(...validateExtras(c));
  return e;
}

/** Riesgos, causas, pruebas y plantillas de evidencia. */
function validateExtras(c: Soc2Catalog): string[] {
  const e: string[] = [];
  const err = (rule: string, msg: string) => e.push(`[${rule}] ${msg}`);
  const blank = (v: unknown) => !isClean(v);

  // campos --------------------------------------------------------------------------------
  c.risks.forEach((r) => {
    for (const f of ['code', 'name', 'description'] as const) if (blank(r[f])) err('campos', `riesgo ${r.code || '(sin código)'}: ${f} vacío o con espacios`);
    if (!r.trustCriterion) err('campos', `riesgo ${r.code}: sin categoría`);
    if (r.potentialImpact.length === 0 || r.potentialImpact.some(blank)) err('campos', `riesgo ${r.code}: impactos potenciales vacíos`);
  });
  c.causes.forEach((k) => {
    for (const f of ['code', 'name', 'description'] as const) if (blank(k[f])) err('campos', `causa ${k.code || '(sin código)'}: ${f} vacío o con espacios`);
    if (!k.failureCategory) err('campos', `causa ${k.code}: sin categoría de falla`);
  });
  c.riskCauses.forEach((r) => {
    for (const f of ['code', 'riskCode', 'causeCode'] as const) if (blank(r[f])) err('campos', `relación riesgo↔causa ${r.code || '(sin código)'}: ${f} vacío`);
  });
  const TEXT_FIELDS = ['name', 'objective', 'type', 'tool', 'population', 'period', 'populationSize', 'suggestedSampleSize', 'selectionMethod', 'evidenceToRequest', 'prerequisites', 'complianceCriterion', 'exceptions', 'exceptionsHandling', 'evidenceToRetain', 'automatedCoverage', 'complementaryManualValidation', 'limitations'] as const;
  c.tests.forEach((t) => {
    for (const f of TEXT_FIELDS) if (blank(t[f])) err('campos', `prueba ${t.code}: ${f} vacío o con espacios`);
    if (t.stepByStep.length === 0 || t.stepByStep.some(blank)) err('campos', `prueba ${t.code}: paso a paso vacío`);
    if (t.attributesToValidate.length === 0 || t.attributesToValidate.some(blank)) err('campos', `prueba ${t.code}: atributos a validar vacíos`);
  });
  c.evidenceTemplates.forEach((t) => {
    if (blank(t.code) || blank(t.description)) err('campos', `plantilla de evidencia ${t.code || '(sin código)'}: código o descripción vacíos`);
  });

  // unicidad --------------------------------------------------------------------------------
  for (const d of duplicates(c.risks, (r) => r.code)) err('unicidad', `riesgo repetido: ${d}`);
  for (const d of duplicates(c.causes, (r) => r.code)) err('unicidad', `causa repetida: ${d}`);
  for (const d of duplicates(c.riskCauses, (r) => r.code)) err('unicidad', `código de relación riesgo↔causa repetido: ${d}`);
  for (const d of duplicates(c.riskCauses, (r) => `${r.riskCode}#${r.causeCode}`)) err('unicidad', `par riesgo↔causa repetido: ${d}`);
  for (const d of duplicates(c.causeControls, (r) => `${r.causeCode}#${r.controlCode}`)) err('unicidad', `par causa↔control repetido: ${d}`);
  for (const d of duplicates(c.tests, (r) => r.code)) err('unicidad', `prueba repetida: ${d}`);
  for (const d of duplicates(c.controlTests, (r) => `${r.controlCode}#${r.testCode}`)) err('unicidad', `par control↔prueba repetido: ${d}`);
  for (const d of duplicates(c.evidenceTemplates, (r) => r.code)) err('unicidad', `código de plantilla repetido: ${d}`);
  for (const d of duplicates(c.evidenceTemplates, (r) => r.description)) err('unicidad', `plantilla con descripción repetida: ${d}`);
  for (const d of duplicates(c.controlEvidenceTemplates, (r) => `${r.controlCode}#${r.templateCode}`)) err('unicidad', `par control↔plantilla repetido: ${d}`);
  for (const d of duplicates(c.controlEvidenceTemplates, (r) => `${r.controlCode}#${r.sequence}`)) err('unicidad', `secuencia repetida en un control: ${d}`);

  // referencias ------------------------------------------------------------------------------
  const riskCodes = new Set(c.risks.map((r) => r.code));
  const causeCodes = new Set(c.causes.map((r) => r.code));
  const ctrlCodes = new Set(c.controls.map((r) => r.code));
  const testCodes = new Set(c.tests.map((r) => r.code));
  const tplCodes = new Set(c.evidenceTemplates.map((r) => r.code));
  for (const r of c.riskCauses) {
    if (!riskCodes.has(r.riskCode)) err('referencias', `relación ${r.code}: riesgo inexistente ${r.riskCode}`);
    if (!causeCodes.has(r.causeCode)) err('referencias', `relación ${r.code}: causa inexistente ${r.causeCode}`);
  }
  for (const r of c.causeControls) {
    if (!causeCodes.has(r.causeCode)) err('referencias', `causa↔control: causa inexistente ${r.causeCode}`);
    if (!ctrlCodes.has(r.controlCode)) err('referencias', `causa↔control: control inexistente ${r.controlCode}`);
  }
  for (const r of c.controlTests) {
    if (!ctrlCodes.has(r.controlCode)) err('referencias', `control↔prueba: control inexistente ${r.controlCode}`);
    if (!testCodes.has(r.testCode)) err('referencias', `control↔prueba: prueba inexistente ${r.testCode}`);
  }
  for (const r of c.controlEvidenceTemplates) {
    if (!ctrlCodes.has(r.controlCode)) err('referencias', `control↔plantilla: control inexistente ${r.controlCode}`);
    if (!tplCodes.has(r.templateCode)) err('referencias', `control↔plantilla: plantilla inexistente ${r.templateCode}`);
  }

  // estructura -------------------------------------------------------------------------------
  const risksWithCause = new Set(c.riskCauses.map((r) => r.riskCode));
  const causesWithRisk = new Set(c.riskCauses.map((r) => r.causeCode));
  const causesWithControl = new Set(c.causeControls.map((r) => r.causeCode));
  for (const r of c.risks) if (!risksWithCause.has(r.code)) err('estructura', `el riesgo ${r.code} no tiene ninguna causa`);
  for (const k of c.causes) if (!causesWithControl.has(k.code)) err('estructura', `la causa ${k.code} no tiene ningún control que la mitigue`);
  const noRisk = c.causes.map((k) => k.code).filter((k) => !causesWithRisk.has(k)).sort();
  if (JSON.stringify(noRisk) !== JSON.stringify([...EXPECTED_CAUSES_WITHOUT_RISK].sort())) {
    err('estructura', `causas sin riesgo: [${noRisk.join(', ')}]; se esperaban exactamente [${EXPECTED_CAUSES_WITHOUT_RISK.join(', ')}]`);
  }
  const testsWithControl = new Set(c.controlTests.map((r) => r.testCode));
  for (const t of c.tests) if (!testsWithControl.has(t.code)) err('estructura', `la prueba ${t.code} no tiene ningún control`);
  const controlsWithTest = new Set(c.controlTests.map((r) => r.controlCode));
  const noTest = c.controls.map((k) => k.code).filter((k) => !controlsWithTest.has(k)).sort();
  if (JSON.stringify(noTest) !== JSON.stringify([...EXPECTED_UNASSIGNED_CONTROLS].sort())) {
    err('estructura', `controles sin ninguna prueba: [${noTest.join(', ')}]; se esperaba solo [${EXPECTED_UNASSIGNED_CONTROLS.join(', ')}]`);
  }
  for (const t of c.tests) {
    const prefix = /^T-([A-Z]+)-\d+$/.exec(t.code)?.[1];
    if (!prefix || TEST_PREFIX_TO_DIMENSION[prefix] !== t.dimension) err('estructura', `la prueba ${t.code} no corresponde a su dimensión ${t.dimension}`);
  }
  const tplWithControl = new Set(c.controlEvidenceTemplates.map((r) => r.templateCode));
  for (const t of c.evidenceTemplates) if (!tplWithControl.has(t.code)) err('estructura', `la plantilla ${t.code} no está ligada a ningún control`);
  const seqByControl = new Map<string, number[]>();
  for (const r of c.controlEvidenceTemplates) seqByControl.set(r.controlCode, [...(seqByControl.get(r.controlCode) ?? []), r.sequence]);
  for (const [k, seqs] of seqByControl) {
    if (seqs.slice().sort((a, b) => a - b).some((n, i) => n !== i + 1)) err('estructura', `las plantillas del control ${k} no están numeradas 1..N: [${seqs.join(', ')}]`);
  }
  // políticas y dimensiones (D39) ---------------------------------------------------------------
  for (const d of duplicates(c.policies, (r) => r.name)) err('unicidad', `política repetida: ${d}`);
  for (const d of duplicates(c.controlPolicies, (r) => `${r.controlCode}#${r.policyName}`)) err('unicidad', `par control↔política repetido: ${d}`);
  for (const d of duplicates(c.controlDimensions, (r) => `${r.controlCode}#${r.dimension}`)) err('unicidad', `dimensión repetida en un control: ${d}`);
  c.policies.forEach((p) => {
    if (blank(p.name)) err('campos', 'política con nombre vacío o con espacios');
  });
  const policyNames = new Set(c.policies.map((p) => p.name));
  for (const r of c.controlPolicies) {
    if (!ctrlCodes.has(r.controlCode)) err('referencias', `control↔política: control inexistente ${r.controlCode}`);
    if (!policyNames.has(r.policyName)) err('referencias', `control↔política: política inexistente ${r.policyName}`);
  }
  const withControl = new Set(c.controlPolicies.map((r) => r.policyName));
  for (const p of c.policies) if (!withControl.has(p.name)) err('estructura', `la política ${p.name} no está ligada a ningún control`);
  const testDim = new Map(c.tests.map((t) => [t.code, t.dimension]));
  const expectedDims = new Set(c.controlTests.map((r) => `${r.controlCode}#${testDim.get(r.testCode)}`));
  const gotDims = new Set(c.controlDimensions.map((r) => `${r.controlCode}#${r.dimension}`));
  for (const k of expectedDims) if (!gotDims.has(k)) err('estructura', `al control ${k.split('#')[0]} le falta su dimensión ${k.split('#')[1]}: tiene pruebas de esa dimensión`);
  for (const r of c.controlDimensions) {
    if (!ctrlCodes.has(r.controlCode)) err('referencias', `dimensión: control inexistente ${r.controlCode}`);
    if (!expectedDims.has(`${r.controlCode}#${r.dimension}`)) err('estructura', `el control ${r.controlCode} declara la dimensión ${r.dimension} sin ninguna prueba de esa dimensión`);
    if (r.requiresProbe && (r.dimension === 'policy' || r.type === 'manual' || r.type === 'technical_manual')) err('estructura', `${r.controlCode}/${r.dimension}: requires_probe no cuadra con el tipo ${r.type}`);
    if (r.requiresAi !== (r.dimension === 'policy')) err('estructura', `${r.controlCode}/${r.dimension}: requires_ai solo aplica a la dimensión documental`);
    if (r.requiresComplianceConfirmation === (r.type === 'automated')) err('estructura', `${r.controlCode}/${r.dimension}: el gate de confirmación no cuadra con el tipo ${r.type}`);
  }
  if (c.controlDimensions.some((r) => r.dimension === 'app')) err('estructura', 'hay una dimensión de aplicación: no hay ninguna prueba T-APP definida (P9)');
  return e;
}
