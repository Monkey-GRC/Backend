// Construye el catálogo v2 a partir de las filas del libro VF18 (tabla 7 de 01_DESARROLLO). Dominio puro: sin Excel, sin archivos y sin base de datos.
// Los totales y las reglas IN-04…IN-10 sobre el resultado las valida `validate.ts`; aquí se comprueban las reglas que necesitan las filas de origen
// (IN-02, IN-03, IN-08) y todo lo que impide leer una celda (una etiqueta que no existe, un código repetido).
import { crossTestChecks, ChecksIndex } from './checks-cross';
import { displayDescriptionOf, displayNameOf } from './display-names';
import {
  CAUSE_ORIGIN, CAUSE_TYPE, CONTROL_TYPE, DIMENSION, DIMENSION_COLUMNS, DOCUMENT_ACCEPTANCE, DOCUMENT_ORIGIN, DOCUMENT_TYPE, ITEM_TYPE, LabelMap, lookup, PERIODICITY,
  PREFIX_TO_CRITERION, PRIMARY_SOURCE, RISK_CRITERION, RISK_LEVEL, TEST_AUTOMATION, TEST_LEVEL, TRUST_CRITERION, TRUST_CRITERION_NAMES,
} from './labels';
import { COMMA, leadingNumber, parseRequirementRef, pointOfL, Row, SEMICOLON, splitList, text, textOrNull, tscPrefix } from './parse';
import { CatalogV2, Counts, FRAMEWORK, TestRow, TrustCriterion } from './types';

export type Sheets = {
  matrix: Row[]; // 8_MATRIZ_MAESTRA
  controlRows: Row[]; // Controles Monkey (encabezado en la fila 2)
  requirements: Row[]; // REQUISITOS
  tests: Row[]; // TEST
  testChecks: Row[]; // TEST_CHECKS
  procedures: Row[]; // PROCEDIMIENTOS
  integrations: Row[]; // INTEGRACIONES (sin la fila «N/A»: no es una categoría)
  documents: Row[]; // Documentos
  mappings: Row[]; // MAPEO_MARCOS
  risks: Row[]; // Riesgos (solo filas R\d+)
  causes: Row[]; // Causas
};

export type SourceMeta = { sourceFile: string; sourceSha256: string; sondaVersion: string; cloudEngineVersion: string };

class Errors {
  readonly list: string[] = [];
  add(m: string) {
    this.list.push(m);
  }
  pick<T extends string>(map: LabelMap<T>, raw: unknown, ctx: string): T | null {
    const v = lookup(map, raw);
    if (v === null) this.add(`${ctx}: el valor «${text(raw)}» no es una opción conocida.`);
    return v;
  }
  /** Un código repetido en una hoja donde debe ser único. */
  unique(codes: string[], ctx: string) {
    const seen = new Set<string>();
    for (const c of codes) {
      if (seen.has(c)) this.add(`${ctx}: el código ${c} está repetido.`);
      seen.add(c);
    }
  }
}

const need = (e: Errors, v: unknown, ctx: string): string => {
  const t = text(v);
  if (!t) e.add(`${ctx}: está vacío.`);
  return t;
};

const groupBy = <T>(rows: readonly T[], key: (r: T) => string): Map<string, T[]> => {
  const m = new Map<string, T[]>();
  for (const r of rows) m.set(key(r), [...(m.get(key(r)) ?? []), r]);
  return m;
};

const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && [...a].sort().join('\u0000') === [...b].sort().join('\u0000');

// IN-08: lo que debe coincidir en todas las filas de un mismo control (columnas I, J, L, M, W, X, Y y AA; el dominio D es de la fila).
const IN08_COLUMNS = [
  'Control', 'Descripción', 'DOCUMENTOS / EVIDENCIAS DOCUMENTALES REQUERIDAS', 'Documentos', 'TIPO CONTROL', 'Periodicidad del Control', 'ROL RESPONSABLE SUGERIDO', 'ID_Causa',
] as const;

export function buildCatalog(s: Sheets, source: SourceMeta, checks: ChecksIndex): { catalog: CatalogV2; errors: string[]; warnings: string[] } {
  const e = new Errors();
  const warnings: string[] = [];

  // ---- Criterios de confianza, requisitos del marco y puntos de enfoque (8_MATRIZ_MAESTRA + Controles Monkey) ----
  const rowsByControl = groupBy(s.controlRows, (r) => text(r['ID']));
  // La categoría de un criterio es la más frecuente entre sus filas: 4 filas de CC8.1 (POC 14, «Protege la información confidencial») traen la categoría de
  // confidencialidad en vez de «Gestión de cambios». Es ruido del libro, no otro criterio: se avisa y no se carga como dato (el criterio sale de 8_MATRIZ_MAESTRA).
  const categoryVotes = new Map<string, Map<string, number>>();
  const shortByRef = new Map<string, string>();
  for (const r of s.controlRows) {
    const ref = text(r['TSC Ref']);
    const cat = text(r['Categoría TSC']);
    categoryVotes.set(ref, (categoryVotes.get(ref) ?? new Map()).set(cat, (categoryVotes.get(ref)?.get(cat) ?? 0) + 1));
    const short = text(r['Categoría (corto)']);
    if (shortByRef.has(ref) && shortByRef.get(ref) !== short) e.add(`Controles Monkey: ${ref} trae dos categorías cortas distintas.`);
    shortByRef.set(ref, short);
  }
  const categoryByRef = new Map<string, { tscCategory: string; short: string }>();
  for (const [ref, votes] of categoryVotes) {
    const ranked = [...votes].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (ranked.length > 1) warnings.push(`Controles Monkey: ${ref} trae ${ranked.length} categorías TSC (${ranked.map(([c, n]) => `«${c}» ${n}`).join(', ')}); se carga la más frecuente.`);
    categoryByRef.set(ref, { tscCategory: ranked[0][0], short: shortByRef.get(ref) ?? '' });
  }

  const requirements: CatalogV2['requirements'] = [];
  const pointsOfFocus: CatalogV2['pointsOfFocus'] = [];
  const seenRef = new Set<string>();
  const seenPoint = new Set<string>();
  for (const r of s.matrix) {
    const code = text(r['TSC Ref']);
    const number = Number(r['POC #']);
    if (!code || !Number.isInteger(number)) {
      e.add(`8_MATRIZ_MAESTRA: fila sin TSC Ref o POC # válido (${code} ${text(r['POC #'])}).`);
      continue;
    }
    const prefix = tscPrefix(code);
    const crit = prefix ? PREFIX_TO_CRITERION[prefix] : undefined;
    if (!crit) {
      e.add(`8_MATRIZ_MAESTRA: el prefijo de ${code} no es de ningún criterio de confianza.`);
      continue;
    }
    if (!seenRef.has(code)) {
      seenRef.add(code);
      const cat = categoryByRef.get(code);
      if (!cat) e.add(`8_MATRIZ_MAESTRA: ${code} no aparece en Controles Monkey.`);
      else if (lookup(TRUST_CRITERION, cat.short) !== crit) e.add(`${code}: la categoría «${cat.short}» no corresponde al prefijo ${prefix}.`);
      requirements.push({ code, tscCategory: cat?.tscCategory ?? '', criterion: text(r['Criterio']), trustCriterion: crit });
    }
    if (seenPoint.has(`${code}|${number}`)) e.add(`8_MATRIZ_MAESTRA: el punto de enfoque ${code} POC ${number} está repetido.`);
    seenPoint.add(`${code}|${number}`);
    pointsOfFocus.push({ requirementCode: code, number, description: need(e, r['Punto de Enfoque (Completo)'], `${code} POC ${number}`) });
  }

  const trustCriteria: CatalogV2['trustCriteria'] = (['security', 'availability', 'confidentiality', 'integrity', 'privacy'] as TrustCriterion[]).map((criterion) => ({
    criterion,
    isMandatory: criterion === 'security',
    sourceName: TRUST_CRITERION_NAMES[criterion],
  }));

  // ---- Controles (IN-08) y sus filas ----
  const controls: CatalogV2['controls'] = [];
  const pointOfFocusControls: CatalogV2['pointOfFocusControls'] = [];
  const controlDimensions: CatalogV2['controlDimensions'] = [];
  const controlDocuments: CatalogV2['controlDocuments'] = [];
  const controlTests: CatalogV2['controlTests'] = [];
  const causesOfControl = new Map<string, string[]>();

  for (const [code, rows] of rowsByControl) {
    if (!code) {
      e.add('Controles Monkey: hay filas sin ID de control.');
      continue;
    }
    const first = rows[0];
    for (const col of IN08_COLUMNS) {
      if (new Set(rows.map((r) => text(r[col]))).size > 1) e.add(`IN-08 · ${code}: la columna «${col}» no coincide en todas sus filas.`);
    }
    const type = e.pick(CONTROL_TYPE, first['TIPO CONTROL'], `${code} · TIPO CONTROL`);
    const periodicity = e.pick(PERIODICITY, first['Periodicidad del Control'], `${code} · Periodicidad del Control`);
    controls.push({
      code,
      name: need(e, first['Control'], `${code} · Control`),
      description: need(e, first['Descripción'], `${code} · Descripción`),
      type: type ?? 'manual',
      periodicity: periodicity ?? 'on_demand',
      suggestedOwnerRole: need(e, first['ROL RESPONSABLE SUGERIDO'], `${code} · ROL RESPONSABLE SUGERIDO (IN-09)`),
    });

    for (const r of rows) {
      const requirementCode = text(r['TSC Ref']);
      const pointNumber = Number(r['POC #']);
      if (!seenPoint.has(`${requirementCode}|${pointNumber}`)) e.add(`${code}: apunta a ${requirementCode} POC ${pointNumber}, que no está en 8_MATRIZ_MAESTRA.`);
      pointOfFocusControls.push({ requirementCode, pointNumber, controlCode: code, domain: need(e, r['Dominio'], `${code} ${requirementCode} POC ${pointNumber} · Dominio`) });
    }

    // Las dimensiones: las columnas «TEST …» que dicen «Definido» en cualquiera de sus filas.
    const dims = new Set<string>();
    for (const r of rows) for (const [col, dim] of Object.entries(DIMENSION_COLUMNS)) if (norm(r[col]) === 'definido') dims.add(dim);
    for (const dim of dims) controlDimensions.push({ controlCode: code, dimension: dim as CatalogV2['controlDimensions'][number]['dimension'] });

    for (const d of splitList(first['Documentos'], SEMICOLON)) controlDocuments.push({ controlCode: code, documentCode: d });
    for (const t of splitList(first['Test'], SEMICOLON)) controlTests.push({ controlCode: code, testCode: t });
    causesOfControl.set(code, splitList(first['ID_Causa'], COMMA));
  }
  e.unique(controls.map((c) => c.code), 'Controles Monkey');
  e.unique(pointOfFocusControls.map((p) => `${p.requirementCode} POC ${p.pointNumber} ${p.controlCode}`), 'Controles Monkey (control + criterio + punto)');

  // ---- Documentos ----
  const documents: CatalogV2['documents'] = [];
  const documentControls = new Map<string, string[]>();
  for (const r of s.documents) {
    const code = text(r['Código']);
    const ctx = `Documentos · ${code}`;
    const origin = e.pick(DOCUMENT_ORIGIN, r['Origen'], `${ctx} · Origen`);
    const type = e.pick(DOCUMENT_TYPE, r['Tipo'], `${ctx} · Tipo`);
    documents.push({
      code,
      type: type ?? 'document',
      name: need(e, r['Documento relacionado'], `${ctx} · Documento relacionado`),
      description: need(e, r['Descripción'], `${ctx} · Descripción`),
      minimumContent: need(e, r['Contenido mínimo exigido'], `${ctx} · Contenido mínimo exigido`),
      reviewPeriodicity: e.pick(PERIODICITY, r['Periodicidad de revisión'], `${ctx} · Periodicidad de revisión`) ?? 'annual',
      suggestedApproverRole: textOrNull(r['Rol aprobador sugerido']),
      suggestedOwnerRole: text(r['Rol responsable sugerido del documento']),
      origin: origin ?? 'internal',
      suggestedAcceptance: e.pick(DOCUMENT_ACCEPTANCE, r['Aceptación del personal (sugerida)'], `${ctx} · Aceptación del personal`) ?? 'not_required',
      testCode: need(e, r['ID_Test documental'], `${ctx} · ID_Test documental`),
    });
    documentControls.set(code, splitList(r['Códigos de control relacionados'], COMMA));
  }
  e.unique(documents.map((d) => d.code), 'Documentos');
  // Los vínculos control–documento están en dos hojas: Controles Monkey («Documentos») y Documentos («Códigos de control relacionados»). Deben coincidir.
  for (const d of documents) {
    const fromControls = controlDocuments.filter((c) => c.documentCode === d.code).map((c) => c.controlCode);
    if (!sameSet(fromControls, documentControls.get(d.code) ?? [])) e.add(`Documentos · ${d.code}: los controles de Controles Monkey no coinciden con «Códigos de control relacionados».`);
  }

  // ---- Procedimientos estándar y categorías de integración ----
  const standardProcedures: CatalogV2['standardProcedures'] = s.procedures.map((r) => ({
    code: text(r['Código']),
    name: need(e, r['Nombre'], `PROCEDIMIENTOS · ${text(r['Código'])} · Nombre`),
    whenUsed: need(e, r['Cuándo se usa'], `PROCEDIMIENTOS · ${text(r['Código'])} · Cuándo se usa`),
    genericSteps: need(e, r['Pasos genéricos'], `PROCEDIMIENTOS · ${text(r['Código'])} · Pasos genéricos`),
    typicalEvidence: need(e, r['Evidencia típica'], `PROCEDIMIENTOS · ${text(r['Código'])} · Evidencia típica`),
  }));
  e.unique(standardProcedures.map((p) => p.code), 'PROCEDIMIENTOS');
  const procedureCodes = new Set(standardProcedures.map((p) => p.code));

  const integrationCategories: CatalogV2['integrationCategories'] = [];
  const integrationCategoryControls: CatalogV2['integrationCategoryControls'] = [];
  for (const r of s.integrations) {
    const name = text(r['Categoría']);
    const citedProcedures = splitList(need(e, r['Procedimiento'], `INTEGRACIONES · ${name} · Procedimiento`), SEMICOLON);
    for (const p of citedProcedures) if (!procedureCodes.has(p)) e.add(`INTEGRACIONES · ${name}: el procedimiento ${p} no existe en PROCEDIMIENTOS.`);
    integrationCategories.push({
      name,
      exampleTools: need(e, r['Herramientas tales como…'], `INTEGRACIONES · ${name} · Herramientas`),
      evidenceProvided: need(e, r['Qué evidencia aporta'], `INTEGRACIONES · ${name} · Qué evidencia aporta`),
      procedureCodes: citedProcedures,
    });
    for (const c of splitList(r['Controles que alimenta'], SEMICOLON)) integrationCategoryControls.push({ categoryName: name, controlCode: c });
  }
  e.unique(integrationCategories.map((c) => c.name), 'INTEGRACIONES');
  const categoryNames = new Set(integrationCategories.map((c) => c.name));

  // ---- Requisitos del control (REQUISITOS) ----
  const controlRequirements: CatalogV2['controlRequirements'] = [];
  const controlRequirementTests: CatalogV2['controlRequirementTests'] = [];
  const controlRequirementDocuments: CatalogV2['controlRequirementDocuments'] = [];
  const firstRequirementTextOfTest = new Map<string, string>();
  for (const r of s.requirements) {
    const code = text(r['ID_Requisito']);
    const point = pointOfL(r['Punto L']);
    if (point === null) e.add(`REQUISITOS · ${code}: «Punto L» no es de la forma L<n> (${text(r['Punto L'])}).`);
    const required = norm(r['Obligatorio']);
    if (required !== 'sí' && required !== 'no') e.add(`REQUISITOS · ${code}: «Obligatorio» debe ser Sí o No (${text(r['Obligatorio'])}).`);
    const type = e.pick(ITEM_TYPE, r['Tipo de requisito'], `REQUISITOS · ${code} · Tipo de requisito`);
    const requirementText = need(e, r['Texto del requisito'], `REQUISITOS · ${code} · Texto del requisito`);
    controlRequirements.push({
      code,
      controlCode: text(r['ID_Control']),
      pointNumber: point ?? 0,
      text: requirementText,
      type: type ?? 'documentary',
      periodicity: e.pick(PERIODICITY, r['Periodicidad'], `REQUISITOS · ${code} · Periodicidad`) ?? 'on_demand',
      isMandatory: required === 'sí',
      assemblyNote: textOrNull(r['Observación de armado']),
    });
    for (const t of splitList(r['ID_Test'], SEMICOLON)) {
      controlRequirementTests.push({ requirementCode: code, testCode: t });
      if (!firstRequirementTextOfTest.has(t)) firstRequirementTextOfTest.set(t, requirementText);
    }
    for (const d of splitList(r['ID_Documento'], SEMICOLON)) controlRequirementDocuments.push({ requirementCode: code, documentCode: d });
  }
  e.unique(controlRequirements.map((r) => r.code), 'REQUISITOS');

  // ---- Pruebas (TEST) ----
  const documentOfTest = new Map(documents.map((d) => [d.testCode, d]));
  const tests: TestRow[] = [];
  for (const r of s.tests) {
    const code = text(r['ID_Test']);
    const ctx = `TEST · ${code}`;
    const procedure = text(r['Procedimiento estándar']);
    if (!procedureCodes.has(procedure)) e.add(`${ctx}: el procedimiento estándar «${procedure}» no existe.`);
    const integration = text(r['Integración sugerida']);
    const integrationCategoryName = integration === '' || norm(integration) === 'n/a' ? null : integration;
    if (integrationCategoryName && !categoryNames.has(integrationCategoryName)) e.add(`${ctx}: la integración sugerida «${integrationCategoryName}» no es una categoría de INTEGRACIONES.`);
    const objective = need(e, r['¿Qué se asegura?'], `${ctx} · ¿Qué se asegura?`);
    tests.push({
      code,
      controlCode: textOrNull(r['ID_Control']),
      type: e.pick(ITEM_TYPE, r['Tipo de test'], `${ctx} · Tipo de test`) ?? 'documentary',
      dimension: e.pick(DIMENSION, r['Dimensión'], `${ctx} · Dimensión`) ?? 'policy',
      objective,
      whyItMatters: need(e, r['¿Por qué importa?'], `${ctx} · ¿Por qué importa?`),
      primarySource: e.pick(PRIMARY_SOURCE, r['Fuente principal'], `${ctx} · Fuente principal`) ?? 'manual',
      standardProcedureCode: procedure,
      stepByStep: need(e, r['Paso a paso'], `${ctx} · Paso a paso`),
      correctIf: need(e, r['Correcto si'], `${ctx} · Correcto si`),
      exceptionIf: need(e, r['Excepción si'], `${ctx} · Excepción si`),
      observationIf: need(e, r['Observación si'], `${ctx} · Observación si`),
      evidenceToRetain: need(e, r['Evidencia a guardar'], `${ctx} · Evidencia a guardar`),
      level: e.pick(TEST_LEVEL, r['Nivel'], `${ctx} · Nivel`) ?? 'design',
      frequencySample: need(e, r['Frecuencia / muestra'], `${ctx} · Frecuencia / muestra`),
      integrationCategoryName,
      automation: e.pick(TEST_AUTOMATION, r['Automatización'], `${ctx} · Automatización`) ?? 'manual',
      displayName: displayNameOf({ code, documentName: documentOfTest.get(code)?.name ?? null, requirementText: firstRequirementTextOfTest.get(code) ?? null, objective }),
      displayNameReviewed: false,
      displayDescription: displayDescriptionOf(objective),
      displayNameEn: null,
    });
  }
  e.unique(tests.map((t) => t.code), 'TEST');

  // ---- Riesgos y causas ----
  const risks: CatalogV2['risks'] = [];
  const causesOfRisk = new Map<string, string[]>();
  for (const r of s.risks) {
    const code = text(r['ID_Riesgo']);
    const ctx = `Riesgos · ${code}`;
    const likelihood = leadingNumber(r['Probabilidad inherente [CATEGORÍA]']);
    const impact = leadingNumber(r['Impacto inherente [CATEGORÍA]']);
    if (likelihood === null || impact === null) e.add(`${ctx}: probabilidad o impacto sin número inicial («4 - Probable»).`);
    const value = Number(r['Valor riesgo inherente (1-25)']);
    if (!Number.isInteger(value)) e.add(`${ctx}: el valor del riesgo inherente no es un número.`);
    risks.push({
      code,
      name: need(e, r['Riesgo'], `${ctx} · Riesgo`),
      description: need(e, r['Descripción'], `${ctx} · Descripción`),
      trustCriterion: e.pick(RISK_CRITERION, r['Criterio'], `${ctx} · Criterio`) ?? 'confidentiality',
      potentialImpact: splitList(r['Impacto_Potencial'], SEMICOLON),
      likelihood: likelihood ?? 0,
      impact: impact ?? 0,
      inherentRiskValue: value,
      inherentRiskLevel: e.pick(RISK_LEVEL, r['Nivel riesgo inherente'], `${ctx} · Nivel riesgo inherente`) ?? 'low',
    });
    causesOfRisk.set(code, splitList(r['ID_Causa'], COMMA));
  }
  e.unique(risks.map((r) => r.code), 'Riesgos');

  const causes: CatalogV2['causes'] = [];
  const riskCauses: CatalogV2['riskCauses'] = [];
  const causeControls: CatalogV2['causeControls'] = [];
  for (const r of s.causes) {
    const code = text(r['ID_Causa']);
    const ctx = `Causas · ${code}`;
    causes.push({
      code,
      causeOrigin: e.pick(CAUSE_ORIGIN, r['Origen'], `${ctx} · Origen`) ?? 'internal',
      causeType: e.pick(CAUSE_TYPE, r['Tipo_Causa'], `${ctx} · Tipo_Causa`) ?? 'human',
      description: need(e, r['Descripción_Causa'], `${ctx} · Descripción_Causa`),
    });
    for (const rc of splitList(r['ID_Riesgo'], COMMA)) riskCauses.push({ riskCode: rc, causeCode: code });
    for (const cc of splitList(r['ID_Control'], COMMA)) causeControls.push({ causeCode: code, controlCode: cc });
  }
  e.unique(causes.map((c) => c.code), 'Causas');
  e.unique(riskCauses.map((x) => `${x.riskCode}|${x.causeCode}`), 'Causas (riesgo–causa)');
  e.unique(causeControls.map((x) => `${x.causeCode}|${x.controlCode}`), 'Causas (causa–control)');

  // IN-02 e IN-03: las relaciones coinciden en ambos sentidos con la hoja Causas.
  for (const control of controls) {
    const fromCauses = causeControls.filter((x) => x.controlCode === control.code).map((x) => x.causeCode);
    if (fromCauses.length === 0) e.add(`IN-02 · ${control.code}: no tiene ninguna causa.`);
    if (!sameSet(fromCauses, causesOfControl.get(control.code) ?? [])) e.add(`IN-02 · ${control.code}: la columna ID_Causa de Controles Monkey no coincide con la hoja Causas.`);
  }
  for (const risk of risks) {
    const fromCauses = riskCauses.filter((x) => x.riskCode === risk.code).map((x) => x.causeCode);
    if (fromCauses.length === 0) e.add(`IN-03 · ${risk.code}: no tiene ninguna causa.`);
    if (!sameSet(fromCauses, causesOfRisk.get(risk.code) ?? [])) e.add(`IN-03 · ${risk.code}: la columna ID_Causa de Riesgos no coincide con la hoja Causas.`);
  }

  // ---- Mapeo a marcos (MAPEO_MARCOS) ----
  const controlFrameworkMappings: CatalogV2['controlFrameworkMappings'] = s.mappings.map((r) => {
    const ctx = `MAPEO_MARCOS · ${text(r['ID_Control'])}`;
    if (norm(r['Marco']) !== 'soc 2 tsc 2017 (rev. 2022)') e.add(`${ctx}: el marco «${text(r['Marco'])}» no es SOC 2.`);
    if (norm(r['Tipo de relación']) !== 'directa') e.add(`${ctx}: el tipo de relación «${text(r['Tipo de relación'])}» no es Directa.`);
    if (!parseRequirementRef(r['Requisito del marco'])) e.add(`${ctx}: el requisito «${text(r['Requisito del marco'])}» no es de la forma «A1.1 POC 1».`);
    return {
      controlCode: text(r['ID_Control']),
      frameworkCode: FRAMEWORK.code,
      requirementRef: text(r['Requisito del marco']),
      relationType: 'direct' as const,
      justification: text(r['Justificación']),
    };
  });

  // ---- Vínculos prueba–check (TEST_CHECKS) ----
  const testChecks = crossTestChecks(s.testChecks, checks, e.list);

  const catalog: CatalogV2 = {
    meta: {
      sourceFile: source.sourceFile,
      sourceSha256: source.sourceSha256,
      catalogVersion: 2,
      sondaVersion: source.sondaVersion,
      cloudEngineVersion: source.cloudEngineVersion,
      counts: {} as Counts,
      warnings: [],
    },
    framework: { ...FRAMEWORK },
    trustCriteria,
    requirements,
    pointsOfFocus,
    controls,
    pointOfFocusControls,
    controlDimensions,
    controlRequirements,
    controlRequirementTests,
    controlRequirementDocuments,
    controlTests,
    controlDocuments,
    documents,
    standardProcedures,
    integrationCategories,
    integrationCategoryControls,
    tests,
    testChecks,
    controlFrameworkMappings,
    risks,
    causes,
    riskCauses,
    causeControls,
  };
  catalog.meta.counts = countsOf(catalog);
  return { catalog, errors: e.list, warnings };
}

const norm = (v: unknown): string => text(v).toLowerCase();

export function countsOf(c: CatalogV2): Counts {
  return {
    controls: c.controls.length,
    pointOfFocusControls: c.pointOfFocusControls.length,
    trustCriteria: c.trustCriteria.length,
    requirements: c.requirements.length,
    pointsOfFocus: c.pointsOfFocus.length,
    controlRequirements: c.controlRequirements.length,
    controlRequirementTests: c.controlRequirementTests.length,
    controlRequirementDocuments: c.controlRequirementDocuments.length,
    controlTests: c.controlTests.length,
    controlDimensions: c.controlDimensions.length,
    tests: c.tests.length,
    testChecks: c.testChecks.length,
    documents: c.documents.length,
    controlDocuments: c.controlDocuments.length,
    causes: c.causes.length,
    risks: c.risks.length,
    riskCauses: c.riskCauses.length,
    causeControls: c.causeControls.length,
    standardProcedures: c.standardProcedures.length,
    integrationCategories: c.integrationCategories.length,
    integrationCategoryControls: c.integrationCategoryControls.length,
    controlFrameworkMappings: c.controlFrameworkMappings.length,
  };
}
