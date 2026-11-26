// Validador del catálogo v2: puro, sobre el JSON. Comprueba los totales exactos de la tabla 10 de 01_DESARROLLO, las reglas de integridad IN-01…IN-10 de MAP CALOR
// (IN-02, IN-03 e IN-08 necesitan las filas de origen y las comprueba `build.ts`) y la marca blanca (SEG-39). Informa TODOS los errores, no solo el primero.
import { countsOf } from './build';
import { clientVisibleTexts, namesProvider, whiteLabel } from './display-names';
import { KNOWN_LOSS_TYPE_VARIANTS, LOSS_TYPES } from './labels';
import { parseRequirementRef } from './parse';
import { CatalogV2, CheckRole, EXPECTED_COUNTS, EXPECTED_DETAIL, ItemType } from './types';

export type Validation = { errors: string[]; warnings: string[] };

// IN-07 en VUL-1 y VUL-2 es un aviso conocido (el comité lo declara): el módulo «Detección de vulnerabilidades» es Directo en los dos controles.
export const IN07_KNOWN: { moduleRef: string; controls: string[] } = { moduleRef: 'Detección de vulnerabilidades', controls: ['VUL-1', 'VUL-2'] };

const dup = (xs: readonly string[]): string[] => xs.filter((x, i) => xs.indexOf(x) !== i);
const countBy = <T>(xs: readonly T[], key: (x: T) => string): Record<string, number> => {
  const m: Record<string, number> = {};
  for (const x of xs) m[key(x)] = (m[key(x)] ?? 0) + 1;
  return m;
};

export function validateCatalog(c: CatalogV2): Validation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (m: string) => errors.push(m);

  // ---- Totales de la tabla 10 ----
  const got = countsOf(c);
  for (const k of Object.keys(EXPECTED_COUNTS) as (keyof typeof EXPECTED_COUNTS)[]) {
    if (got[k] !== EXPECTED_COUNTS[k]) err(`Total «${k}»: se esperaban ${EXPECTED_COUNTS[k]} y hay ${got[k]}.`);
  }
  const byType = (xs: readonly { type: ItemType }[]) => countBy(xs, (x) => x.type);
  for (const [t, n] of Object.entries(EXPECTED_DETAIL.requirementsByType)) {
    const have = byType(c.controlRequirements)[t] ?? 0;
    if (have !== n) err(`Requisitos de tipo ${t}: se esperaban ${n} y hay ${have}.`);
  }
  for (const [t, n] of Object.entries(EXPECTED_DETAIL.testsByType)) {
    const have = byType(c.tests)[t] ?? 0;
    if (have !== n) err(`Pruebas de tipo ${t}: se esperaban ${n} y hay ${have}.`);
  }
  const roles = countBy(c.testChecks, (x) => x.role);
  for (const [r, n] of Object.entries(EXPECTED_DETAIL.testChecksByRole) as [CheckRole, number][]) {
    if ((roles[r] ?? 0) !== n) err(`Vínculos de rol ${r}: se esperaban ${n} y hay ${roles[r] ?? 0}.`);
  }
  const modules = c.testChecks.filter((t) => t.checkId === null).length;
  if (modules !== EXPECTED_DETAIL.moduleLinks) err(`Vínculos sin check (N/A): se esperaban ${EXPECTED_DETAIL.moduleLinks} y hay ${modules}.`);

  // ---- Unicidad y referencias ----
  const controlCodes = new Set(c.controls.map((x) => x.code));
  const testCodes = new Set(c.tests.map((x) => x.code));
  const documentCodes = new Set(c.documents.map((x) => x.code));
  const requirementCodes = new Set(c.controlRequirements.map((x) => x.code));
  const causeCodes = new Set(c.causes.map((x) => x.code));
  const riskCodes = new Set(c.risks.map((x) => x.code));
  const poKey = (r: string, n: number) => `${r}|${n}`;
  const pofKeys = new Set(c.pointsOfFocus.map((p) => poKey(p.requirementCode, p.number)));
  const tscCodes = new Set(c.requirements.map((r) => r.code));
  const procedureCodes = new Set(c.standardProcedures.map((p) => p.code));
  const categoryNames = new Set(c.integrationCategories.map((x) => x.name));

  for (const d of dup(c.controls.map((x) => x.code))) err(`Control repetido: ${d}.`);
  for (const d of dup(c.tests.map((x) => x.code))) err(`Prueba repetida: ${d}.`);
  for (const d of dup(c.controlRequirements.map((x) => x.code))) err(`Requisito del control repetido: ${d}.`);
  for (const p of c.pointsOfFocus) if (!tscCodes.has(p.requirementCode)) err(`El punto de enfoque ${p.requirementCode} POC ${p.number} cuelga de un criterio que no existe.`);

  // IN-01: cada TSC Ref + POC # tiene al menos un control.
  const pofWithControl = new Set(c.pointOfFocusControls.map((x) => poKey(x.requirementCode, x.pointNumber)));
  for (const k of pofKeys) if (!pofWithControl.has(k)) err(`IN-01: ${k.replace('|', ' POC ')} no tiene ningún control.`);
  for (const x of c.pointOfFocusControls) {
    if (!pofKeys.has(poKey(x.requirementCode, x.pointNumber))) err(`${x.controlCode}: apunta a ${x.requirementCode} POC ${x.pointNumber}, que no existe.`);
    if (!controlCodes.has(x.controlCode)) err(`Punto de enfoque ${x.requirementCode} POC ${x.pointNumber}: el control ${x.controlCode} no existe.`);
  }
  const domains = new Set(c.pointOfFocusControls.map((x) => x.domain));
  if (domains.size !== 25) err(`Dominios: se esperaban 25 y hay ${domains.size}.`);

  // El mapeo a marcos coincide fila por fila con los vínculos control–punto de enfoque.
  const mapKeys = c.controlFrameworkMappings.map((m) => {
    const ref = parseRequirementRef(m.requirementRef);
    return `${m.controlCode}|${ref?.requirementCode}|${ref?.pointNumber}`;
  });
  const pocKeys = c.pointOfFocusControls.map((x) => `${x.controlCode}|${x.requirementCode}|${x.pointNumber}`);
  if ([...mapKeys].sort().join('\n') !== [...pocKeys].sort().join('\n')) err('MAPEO_MARCOS no coincide con los vínculos control–punto de enfoque de Controles Monkey.');

  // Dimensiones: todas las de TEST existen; cada control aplica la documental.
  for (const x of c.controlDimensions) if (!controlCodes.has(x.controlCode)) err(`Dimensión de un control que no existe: ${x.controlCode}.`);
  const dimsOf = new Map<string, Set<string>>();
  for (const x of c.controlDimensions) dimsOf.set(x.controlCode, (dimsOf.get(x.controlCode) ?? new Set()).add(x.dimension));
  for (const k of controlCodes) if (!dimsOf.get(k)?.has('policy')) err(`${k}: no aplica la dimensión documental (las 114 la aplican).`);
  for (const t of c.tests) {
    if (t.controlCode && !dimsOf.get(t.controlCode)?.has(t.dimension)) err(`${t.code}: su dimensión ${t.dimension} no está definida en el control ${t.controlCode}.`);
  }

  // ---- Pruebas y requisitos ----
  const isDocTest = (code: string) => code.startsWith('T-DOC-');
  for (const t of c.tests) {
    if (isDocTest(t.code) !== (t.controlCode === null)) err(`${t.code}: solo las T-DOC van sin control.`);
    if (t.controlCode && !controlCodes.has(t.controlCode)) err(`${t.code}: el control ${t.controlCode} no existe.`);
    if (!procedureCodes.has(t.standardProcedureCode)) err(`${t.code}: el procedimiento ${t.standardProcedureCode} no existe.`);
    if (t.integrationCategoryName && !categoryNames.has(t.integrationCategoryName)) err(`${t.code}: la categoría de integración «${t.integrationCategoryName}» no existe.`);
  }
  const testsOfRequirement = new Map<string, string[]>();
  for (const x of c.controlRequirementTests) {
    if (!requirementCodes.has(x.requirementCode)) err(`ID_Test de un requisito que no existe: ${x.requirementCode}.`);
    if (!testCodes.has(x.testCode)) err(`${x.requirementCode}: la prueba ${x.testCode} no existe.`);
    testsOfRequirement.set(x.requirementCode, [...(testsOfRequirement.get(x.requirementCode) ?? []), x.testCode]);
  }
  for (const r of c.controlRequirements) {
    if (!controlCodes.has(r.controlCode)) err(`${r.code}: el control ${r.controlCode} no existe.`);
    // IN-04: cada requisito tiene al menos un test.
    if ((testsOfRequirement.get(r.code) ?? []).length === 0) err(`IN-04: el requisito ${r.code} no tiene ningún test.`);
  }
  const usedTests = new Set(c.controlRequirementTests.map((x) => x.testCode));
  for (const k of testCodes) if (!usedTests.has(k)) err(`La prueba ${k} no está en ningún requisito.`);

  // ---- Documentos ----
  for (const x of c.controlRequirementDocuments) {
    if (!requirementCodes.has(x.requirementCode)) err(`ID_Documento de un requisito que no existe: ${x.requirementCode}.`);
    if (!documentCodes.has(x.documentCode)) err(`IN-05: ${x.requirementCode} cita el documento ${x.documentCode}, que no existe.`);
  }
  for (const x of c.controlDocuments) {
    if (!controlCodes.has(x.controlCode)) err(`Documentos de un control que no existe: ${x.controlCode}.`);
    if (!documentCodes.has(x.documentCode)) err(`IN-05: ${x.controlCode} cita el documento ${x.documentCode}, que no existe.`);
  }
  const testByCode = new Map(c.tests.map((t) => [t.code, t]));
  for (const d of c.documents) {
    // IN-05 (y la regla de la T-DOC): cada documento tiene su prueba documental, sin control.
    const t = testByCode.get(d.testCode);
    if (!t) err(`IN-05: el documento ${d.code} no tiene su T-DOC (${d.testCode}).`);
    else if (t.controlCode !== null || t.type !== 'documentary') err(`IN-05: ${d.testCode} no es una prueba documental sin control.`);
    // IN-10
    if (!d.suggestedOwnerRole) err(`IN-10: el documento ${d.code} no tiene rol responsable sugerido.`);
    if (d.origin === 'internal' && !d.suggestedApproverRole) err(`IN-10: el documento interno ${d.code} no tiene rol aprobador sugerido.`);
  }
  if (new Set(c.documents.map((d) => d.testCode)).size !== c.documents.length) err('Dos documentos comparten la misma prueba documental.');

  // IN-09
  for (const k of c.controls) if (!k.suggestedOwnerRole) err(`IN-09: el control ${k.code} no tiene rol responsable sugerido.`);

  // ---- Puente control_tests: 430 por tests.control_id + 228 T-DOC por control_documents ----
  const bridgeExpected = new Set<string>();
  for (const t of c.tests) if (t.controlCode) bridgeExpected.add(`${t.controlCode}|${t.code}`);
  const docTestOf = new Map(c.documents.map((d) => [d.code, d.testCode]));
  for (const x of c.controlDocuments) {
    const tc = docTestOf.get(x.documentCode);
    if (tc) bridgeExpected.add(`${x.controlCode}|${tc}`);
  }
  const bridgeGot = new Set(c.controlTests.map((x) => `${x.controlCode}|${x.testCode}`));
  if (bridgeGot.size !== c.controlTests.length) err('La columna «Test» de Controles Monkey repite un par control–prueba.');
  for (const k of bridgeExpected) if (!bridgeGot.has(k)) err(`control_tests: falta el par ${k} (tests.control_id o control_documents).`);
  for (const k of bridgeGot) if (!bridgeExpected.has(k)) err(`control_tests: el par ${k} de la columna «Test» no sale de tests.control_id ni de control_documents.`);

  // ---- Integración–control ----
  for (const x of c.integrationCategoryControls) {
    if (!categoryNames.has(x.categoryName)) err(`Integración–control: la categoría ${x.categoryName} no existe.`);
    if (!controlCodes.has(x.controlCode)) err(`INTEGRACIONES: ${x.categoryName} cita el control ${x.controlCode}, que no existe.`);
  }

  // ---- Causas y riesgos (IN-02 e IN-03 también en build.ts) ----
  for (const x of c.riskCauses) {
    if (!riskCodes.has(x.riskCode)) err(`Causa ${x.causeCode}: el riesgo ${x.riskCode} no existe.`);
    if (!causeCodes.has(x.causeCode)) err(`Riesgo ${x.riskCode}: la causa ${x.causeCode} no existe.`);
  }
  for (const x of c.causeControls) {
    if (!causeCodes.has(x.causeCode)) err(`cause_controls: la causa ${x.causeCode} no existe.`);
    if (!controlCodes.has(x.controlCode)) err(`Causa ${x.causeCode}: el control ${x.controlCode} no existe.`);
  }
  for (const k of causeCodes) {
    if (!c.riskCauses.some((x) => x.causeCode === k)) err(`La causa ${k} no tiene riesgo.`);
    if (!c.causeControls.some((x) => x.causeCode === k)) err(`La causa ${k} no tiene control.`);
  }
  for (const k of controlCodes) if (!c.causeControls.some((x) => x.controlCode === k)) err(`IN-02: el control ${k} no tiene causa.`);
  for (const k of riskCodes) if (!c.riskCauses.some((x) => x.riskCode === k)) err(`IN-03: el riesgo ${k} no tiene causa.`);
  for (const r of c.risks) {
    for (const p of r.potentialImpact) {
      if (LOSS_TYPES.includes(p)) continue;
      if (KNOWN_LOSS_TYPE_VARIANTS.includes(p)) warnings.push(`P9 · ${r.code}: el tipo de pérdida «${p}» está escrito distinto a la lista del comité; se carga literal.`);
      else err(`${r.code}: el tipo de pérdida «${p}» no es de la lista del comité.`);
    }
    if (r.likelihood < 1 || r.likelihood > 5 || r.impact < 1 || r.impact > 5) err(`${r.code}: probabilidad o impacto fuera de 1 a 5.`);
    if (r.inherentRiskValue !== r.likelihood * r.impact) err(`${r.code}: el valor inherente ${r.inherentRiskValue} no es probabilidad × impacto (${r.likelihood * r.impact}).`);
  }

  // ---- Vínculos prueba–check: IN-06 e IN-07 ----
  const checkKey = (t: CatalogV2['testChecks'][number]) => (t.checkId !== null ? `${t.platform}|${t.policyId}|${t.checkId}` : `módulo|${t.moduleRef}`);
  const directControlsOf = new Map<string, Set<string>>();
  for (const t of c.testChecks) {
    const test = testByCode.get(t.testCode);
    if (!test) {
      err(`TEST_CHECKS: la prueba ${t.testCode} no existe.`);
      continue;
    }
    if ((t.checkId === null) === (t.moduleRef === null)) err(`TEST_CHECKS · ${t.testCode}: debe traer un check o un módulo, no los dos ni ninguno.`);
    if (t.role === 'direct' && test.controlCode) directControlsOf.set(checkKey(t), (directControlsOf.get(checkKey(t)) ?? new Set()).add(test.controlCode));
  }
  for (const t of c.testChecks) {
    if (t.role !== 'dependency') continue;
    // IN-06: cada Dependencia es Directo en el control dueño.
    if (!t.ownerControlCode) {
      err(`IN-06: la dependencia de ${t.testCode} (${checkKey(t)}) no dice su control dueño.`);
      continue;
    }
    if (!controlCodes.has(t.ownerControlCode)) err(`IN-06: el control dueño ${t.ownerControlCode} de ${t.testCode} no existe.`);
    else if (!directControlsOf.get(checkKey(t))?.has(t.ownerControlCode)) err(`IN-06: ${t.testCode} depende de ${t.ownerControlCode} (${checkKey(t)}), pero ahí no es Directo.`);
  }
  for (const [key, ctrls] of directControlsOf) {
    if (ctrls.size < 2) continue;
    const list = [...ctrls].sort();
    const known = key === `módulo|${IN07_KNOWN.moduleRef}` && list.every((x) => IN07_KNOWN.controls.includes(x));
    (known ? warnings : errors).push(`IN-07${known ? ' (aviso conocido)' : ''}: ${key} es Directo en ${list.join(' y ')}.`);
  }

  // ---- Marca blanca (SEG-39) ----
  for (const t of c.tests) {
    if (namesProvider(t.displayName)) err(`[confidencialidad] ${t.code}: el nombre que ve el cliente nombra al proveedor.`);
    if (namesProvider(t.displayDescription)) err(`[confidencialidad] ${t.code}: la descripción que ve el cliente nombra al proveedor.`);
    if (!t.displayName) err(`${t.code}: sin nombre para el cliente.`);
    if (t.displayNameReviewed) err(`${t.code}: el nombre no puede nacer revisado.`);
  }

  for (const { where, text } of clientVisibleTexts(c)) {
    if (namesProvider(whiteLabel(text))) err(`[confidencialidad] ${where}: sigue nombrando al proveedor tras la tabla 9.`);
  }

  return { errors, warnings };
}
