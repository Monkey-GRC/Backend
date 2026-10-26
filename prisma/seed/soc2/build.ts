import { createHash } from 'node:crypto';
import {
  ControlDimensionType,
  Counts,
  Dimension,
  FRAMEWORK,
  SOURCE_DIMENSION,
  SOURCE_FAILURE_CATEGORY,
  SOURCE_NAME_TO_CRITERION,
  SOURCE_RISK_CRITERION,
  Soc2Catalog,
  TEST_PREFIX_TO_DIMENSION,
  TestRow,
  TrustCriterion,
} from './types';

export type Row = Record<string, unknown>;

export interface SourceRows {
  // Hoja "Controles Monkey": una fila por relación punto de enfoque ↔ control (729).
  relations: Row[];
  // Hoja "Tabla controles SOC 2": los 119 controles (incluye CPL-1, que no tiene punto de enfoque) y
  // sus documentos vinculados.
  controls: Row[];
  // Hoja "Riesgos": ID_Riesgo, Riesgo, Descripcion, Criterio, Impacto_Potencial, Activo.
  risks: Row[];
  // Hoja "Causas", tabla izquierda: ID_Causa, Causa, Categoria_Falla, Descripcion, Activo, Controles_Aplicables.
  causes: Row[];
  // Hoja "Causas", tabla derecha: ID_Rel, ID_Riesgo, ID_Causa.
  riskCauses: Row[];
  // Hoja "Pruebas": los 61 TEST con sus 23 columnas.
  tests: Row[];
  // Hoja "Análisis TEST x Control" (matriz): solo se usa para contrastar y dejar constancia.
  matrix: Row[];
}

export interface SourceMeta {
  sourceFile: string;
  sourceSha256: string;
  sheets: Record<string, string>;
}

const str = (v: unknown): string => (v == null ? '' : String(v).normalize('NFC').trim());

const RELATION_COLUMNS = [
  'TSC Ref', 'Categoría TSC', 'Categoría (corto)', 'Criterio', 'POC #',
  'Punto de Enfoque (Completo)', 'ID', 'Control', 'Descripción', 'Dominio',
];
const CONTROL_COLUMNS = ['ID', 'Control', 'Descripción', 'Dominio'];

const codeOrder = (a: string, b: string): number => {
  const pa = /^([A-Z]+)-?(\d+)(?:\.(\d+))?$/.exec(a);
  const pb = /^([A-Z]+)-?(\d+)(?:\.(\d+))?$/.exec(b);
  if (!pa || !pb) return a.localeCompare(b);
  if (pa[1] !== pb[1]) return pa[1] < pb[1] ? -1 : 1;
  return Number(pa[2]) - Number(pb[2]) || Number(pa[3] ?? 0) - Number(pb[3] ?? 0);
};

/**
 * Convierte las filas crudas del Excel en el catálogo normalizado y comprueba la CONSISTENCIA DE LA
 * FUENTE (lo que solo se puede ver con las filas originales): que un mismo requisito, punto de
 * enfoque o control diga siempre lo mismo en todas sus filas, y que las dos hojas coincidan.
 * Las reglas del catálogo ya armado las revisa `validateCatalog`.
 */
export function buildCatalog(rows: SourceRows, meta: SourceMeta): { catalog: Soc2Catalog; errors: string[] } {
  const errors: string[] = [];
  const err = (msg: string) => errors.push(`[fuente] ${msg}`);

  rows.relations.forEach((r, i) => {
    for (const c of RELATION_COLUMNS) if (!(c in r)) err(`hoja de relaciones, fila ${i + 1}: falta la columna "${c}"`);
  });
  rows.controls.forEach((r, i) => {
    for (const c of CONTROL_COLUMNS) if (!(c in r)) err(`hoja de controles, fila ${i + 1}: falta la columna "${c}"`);
  });
  if (errors.length) return { catalog: emptyCatalog(meta), errors: errors.slice(0, 20) };

  // Requisitos: mismo tscCategory / criterio / categoría corta en todas sus filas.
  const reqs = new Map<string, { tscCategory: string; criterion: string; shortName: string }>();
  // Puntos de enfoque: misma descripción en todas sus filas.
  const pofs = new Map<string, { requirementCode: string; number: number; description: string }>();
  // Controles vistos en la hoja de relaciones.
  const relControls = new Map<string, { name: string; description: string; domain: string }>();
  const relations = new Set<string>();

  for (const [i, r] of rows.relations.entries()) {
    const at = `hoja de relaciones, fila ${i + 1}`;
    const code = str(r['TSC Ref']);
    const num = Number(str(r['POC #']));
    if (!Number.isInteger(num)) err(`${at}: "POC #" no es un entero (${str(r['POC #'])})`);

    const rq = { tscCategory: str(r['Categoría TSC']), criterion: str(r['Criterio']), shortName: str(r['Categoría (corto)']) };
    const prev = reqs.get(code);
    if (!prev) reqs.set(code, rq);
    else if (prev.tscCategory !== rq.tscCategory || prev.criterion !== rq.criterion || prev.shortName !== rq.shortName) {
      err(`${at}: el requisito ${code} cambia de categoría/criterio entre filas`);
    }

    const pk = `${code}#${num}`;
    const desc = str(r['Punto de Enfoque (Completo)']);
    const pp = pofs.get(pk);
    if (!pp) pofs.set(pk, { requirementCode: code, number: num, description: desc });
    else if (pp.description !== desc) err(`${at}: el punto de enfoque ${pk} cambia de descripción entre filas`);

    const cid = str(r['ID']);
    const ck = { name: str(r['Control']), description: str(r['Descripción']), domain: str(r['Dominio']) };
    const pc = relControls.get(cid);
    if (!pc) relControls.set(cid, ck);
    else if (pc.name !== ck.name || pc.description !== ck.description || pc.domain !== ck.domain) {
      err(`${at}: el control ${cid} cambia de nombre/descripción/dominio entre filas`);
    }
    relations.add(`${pk}#${cid}`);
  }
  if (relations.size !== rows.relations.length) {
    err(`hoja de relaciones: ${rows.relations.length - relations.size} filas repiten una relación punto de enfoque ↔ control`);
  }

  // Controles: hoja de 119 filas; deben coincidir con lo que dicen las relaciones.
  const controls = new Map<string, { name: string; description: string; domain: string }>();
  for (const [i, r] of rows.controls.entries()) {
    const id = str(r['ID']);
    if (controls.has(id)) err(`hoja de controles, fila ${i + 1}: control repetido ${id}`);
    controls.set(id, { name: str(r['Control']), description: str(r['Descripción']), domain: str(r['Dominio']) });
  }
  for (const [id, rc] of relControls) {
    const sc = controls.get(id);
    if (!sc) err(`el control ${id} está en las relaciones pero no en la hoja de controles`);
    else if (sc.name !== rc.name || sc.description !== rc.description || sc.domain !== rc.domain) {
      err(`el control ${id} difiere entre la hoja de relaciones y la de controles`);
    }
  }

  // Criterio de confianza de cada requisito, a partir de "Categoría (corto)".
  const trustBySource = new Map<string, TrustCriterion>();
  for (const [code, rq] of reqs) {
    const tc = SOURCE_NAME_TO_CRITERION[rq.shortName];
    if (!tc) err(`requisito ${code}: "Categoría (corto)" desconocida (${rq.shortName})`);
    else trustBySource.set(rq.shortName, tc);
  }

  const criteriaOrder: TrustCriterion[] = ['security', 'availability', 'confidentiality', 'integrity', 'privacy'];
  const sourceNameOf = new Map<TrustCriterion, string>();
  for (const [name, tc] of trustBySource) sourceNameOf.set(tc, name);

  const catalog: Soc2Catalog = {
    meta: { ...meta, counts: zeroCounts(), sourceNotes: [] },
    framework: { ...FRAMEWORK },
    trustCriteria: criteriaOrder
      .filter((c) => sourceNameOf.has(c))
      .map((c) => ({ criterion: c, isMandatory: c === 'security', sourceName: sourceNameOf.get(c) as string })),
    requirements: [...reqs.entries()]
      .sort(([a], [b]) => codeOrder(a, b))
      .map(([code, rq]) => ({
        code,
        tscCategory: rq.tscCategory,
        criterion: rq.criterion,
        trustCriterion: SOURCE_NAME_TO_CRITERION[rq.shortName],
      })),
    pointsOfFocus: [...pofs.values()].sort((a, b) => codeOrder(a.requirementCode, b.requirementCode) || a.number - b.number),
    controls: [...controls.entries()]
      .sort(([a], [b]) => codeOrder(a, b))
      .map(([code, k]) => ({ code, name: k.name, description: k.description, domain: k.domain, sourceRef: `comite:${code}` })),
    pointOfFocusControls: [...relations]
      .map((k) => {
        const [requirementCode, n, controlCode] = k.split('#');
        return { requirementCode, pointNumber: Number(n), controlCode };
      })
      .sort((a, b) => codeOrder(a.requirementCode, b.requirementCode) || a.pointNumber - b.pointNumber || codeOrder(a.controlCode, b.controlCode)),
    risks: [],
    causes: [],
    riskCauses: [],
    causeControls: [],
    tests: [],
    controlTests: [],
    evidenceTemplates: [],
    controlEvidenceTemplates: [],
    policies: [],
    controlPolicies: [],
    controlDimensions: [],
  };
  buildExtras(rows, catalog, err);
  catalog.meta.counts = countsOf(catalog);
  return { catalog, errors };
}

export function zeroCounts(): Counts {
  return {
    trustCriteria: 0, requirements: 0, pointsOfFocus: 0, controls: 0, assignedControls: 0, pointOfFocusControls: 0,
    risks: 0, causes: 0, riskCauses: 0, causeControls: 0, tests: 0, controlTests: 0, evidenceTemplates: 0,
    controlEvidenceTemplates: 0, policies: 0, controlPolicies: 0, controlDimensions: 0,
  };
}

export function countsOf(c: Soc2Catalog): Counts {
  return {
    trustCriteria: c.trustCriteria.length,
    requirements: c.requirements.length,
    pointsOfFocus: c.pointsOfFocus.length,
    controls: c.controls.length,
    assignedControls: new Set(c.pointOfFocusControls.map((r) => r.controlCode)).size,
    pointOfFocusControls: c.pointOfFocusControls.length,
    risks: c.risks.length,
    causes: c.causes.length,
    riskCauses: c.riskCauses.length,
    causeControls: c.causeControls.length,
    tests: c.tests.length,
    controlTests: c.controlTests.length,
    evidenceTemplates: c.evidenceTemplates.length,
    controlEvidenceTemplates: c.controlEvidenceTemplates.length,
    policies: c.policies.length,
    controlPolicies: c.controlPolicies.length,
    controlDimensions: c.controlDimensions.length,
  };
}

function emptyCatalog(meta: SourceMeta): Soc2Catalog {
  return {
    meta: { ...meta, counts: zeroCounts(), sourceNotes: [] },
    framework: { ...FRAMEWORK },
    trustCriteria: [], requirements: [], pointsOfFocus: [], controls: [], pointOfFocusControls: [],
    risks: [], causes: [], riskCauses: [], causeControls: [], tests: [], controlTests: [],
    evidenceTemplates: [], controlEvidenceTemplates: [], policies: [], controlPolicies: [], controlDimensions: [],
  };
}

// ---------------------------------------------------------------------------------------------
// Riesgos, causas, pruebas y plantillas de evidencia
// ---------------------------------------------------------------------------------------------

const CONTROL_CODE = /[A-Z]{3}-\d+/g;
const norm = (s: string) => s.normalize('NFC').trim();

/** "1. a\r\n2. b" → [{n:1,text:'a'},{n:2,text:'b'}]. Las líneas sin número continúan la anterior. */
export function numberedLines(cell: unknown): { n: number; text: string }[] {
  const out: { n: number; text: string }[] = [];
  for (const line of str(cell).split(/\r?\n/)) {
    const m = /^\s*(\d+)\.\s*(.*)$/.exec(line);
    if (m) out.push({ n: Number(m[1]), text: norm(m[2]) });
    else if (line.trim() && out.length) out[out.length - 1].text = norm(`${out[out.length - 1].text} ${line}`);
  }
  return out.filter((x) => x.text);
}

/** "1. a 2. b" o "1) a 2) b" → ['a','b']. Si la numeración no es 1,2,3… devuelve null (no se adivina). */
export function splitSteps(text: string): string[] | null {
  const s = norm(text);
  const out: string[] = [];
  let pos = 0;
  let k = 1;
  const marker = (n: number, from: number) => new RegExp(`(?:^|(?<=[\\s.;:]))${n}[.)]\\s+`).exec(s.slice(from));
  const cur = marker(1, 0);
  if (!cur || cur.index !== 0) return null;
  pos = cur[0].length;
  for (;;) {
    const next = marker(k + 1, pos);
    if (!next) {
      out.push(norm(s.slice(pos)));
      break;
    }
    out.push(norm(s.slice(pos, pos + next.index)));
    pos = pos + next.index + next[0].length;
    k++;
  }
  return out.every(Boolean) ? out : null;
}

/** Atributos: una viñeta por línea ("- x") o frases separadas por ";". */
export function splitAttributes(text: string): string[] {
  const s = norm(text);
  const parts = /\r?\n/.test(s) ? s.split(/\r?\n/) : s.split(';');
  return parts.map((p) => norm(p.replace(/^[-•]\s*/, '')).replace(/\.$/, '')).filter(Boolean);
}


/**
 * Tipo de una prueba según el texto de su columna "TIPO DE PRUEBA" (D39). Falla en vez de adivinar si
 * aparece un texto que no reconoce. Las documentales son manuales (modelo-datos.md §2: revisión
 * documental, sin automatización posible).
 */
export function testKind(t: Pick<TestRow, 'code' | 'dimension' | 'type'>): ControlDimensionType {
  if (t.dimension === 'policy') return 'manual';
  const s = t.type.normalize('NFC').trim();
  if (/^Técnica$/i.test(s)) return 'technical_manual'; // "pruebas técnicas-manuales (SQL/consola)", D4
  if (/^Manual$/i.test(s)) return 'manual';
  if (/^Mixta$/i.test(s)) return 'hybrid';
  if (/automatizado/i.test(s)) return /manual/i.test(s) ? 'hybrid' : 'automated';
  throw new Error(`la prueba ${t.code} tiene un tipo que no se puede clasificar: "${s.slice(0, 80)}"`);
}

const DIMENSION_ORDER: Dimension[] = ['policy', 'server', 'database', 'app', 'cloud'];

/**
 * Dimensiones de cada control (D39, P10): una dimensión APLICA a un control si tiene al menos una prueba de
 * esa dimensión. El tipo sale de los tipos de sus pruebas (si no coinciden, `hybrid`) y las banderas de
 * ahí y de la dimensión:
 *  - requires_probe: la dimensión no es documental y su tipo es automático o mixto.
 *  - requires_ai: solo la documental (revisión documental con IA, §2).
 *  - requires_compliance_confirmation: todo menos lo puramente automático (R-03: en lo manual el
 *    consultor evalúa; la IA no certifica).
 */
export function deriveControlDimensions(
  tests: Pick<TestRow, 'code' | 'dimension' | 'type'>[],
  controlTests: { controlCode: string; testCode: string }[],
): Soc2Catalog['controlDimensions'] {
  const byCode = new Map(tests.map((t) => [t.code, t]));
  const kinds = new Map<string, Set<ControlDimensionType>>();
  for (const r of controlTests) {
    const t = byCode.get(r.testCode);
    if (!t) continue;
    const k = `${r.controlCode}|${t.dimension}`;
    kinds.set(k, (kinds.get(k) ?? new Set()).add(testKind(t)));
  }
  return [...kinds.entries()]
    .map(([k, set]) => {
      const [controlCode, dimension] = k.split('|') as [string, Dimension];
      const type: ControlDimensionType = set.size === 1 ? [...set][0] : 'hybrid';
      return {
        controlCode,
        dimension,
        type,
        requiresProbe: dimension !== 'policy' && (type === 'automated' || type === 'hybrid'),
        requiresAi: dimension === 'policy',
        requiresComplianceConfirmation: type !== 'automated',
      };
    })
    .sort((a, b) => codeOrder(a.controlCode, b.controlCode) || DIMENSION_ORDER.indexOf(a.dimension) - DIMENSION_ORDER.indexOf(b.dimension));
}

/** "Política de X — El control depende de la aprobación de la política [y la aceptación del empleado]". */
export function parsePolicyLine(text: string): { name: string; requiresEmployeeAcceptance: boolean } | null {
  const m = /^(.+?)\s+—\s+El control depende de la aprobación de la política( y la aceptación del empleado)?\.?$/.exec(norm(text));
  return m ? { name: norm(m[1]), requiresEmployeeAcceptance: Boolean(m[2]) } : null;
}

function buildExtras(rows: SourceRows, c: Soc2Catalog, err: (m: string) => void) {
  const controlCodes = new Set(c.controls.map((k) => k.code));

  // ---- Riesgos ----------------------------------------------------------------------------
  for (const [i, r] of rows.risks.entries()) {
    const at = `hoja Riesgos, fila ${i + 1}`;
    const crit = SOURCE_RISK_CRITERION[str(r['Criterio'])];
    if (!crit) err(`${at}: criterio desconocido "${str(r['Criterio'])}"`);
    const activo = str(r['Activo']);
    if (!['Sí', 'Si', 'No'].includes(activo)) err(`${at}: "Activo" inesperado (${activo})`);
    c.risks.push({
      code: str(r['ID_Riesgo']),
      name: str(r['Riesgo']),
      description: str(r['Descripcion']),
      trustCriterion: crit,
      potentialImpact: str(r['Impacto_Potencial']).split(';').map(norm).filter(Boolean),
      isActive: activo !== 'No',
    });
  }

  // ---- Causas y aristas causa → control --------------------------------------------------
  for (const [i, r] of rows.causes.entries()) {
    const at = `hoja Causas, fila ${i + 1}`;
    const cat = SOURCE_FAILURE_CATEGORY[str(r['Categoria_Falla'])];
    if (!cat) err(`${at}: categoría de falla desconocida "${str(r['Categoria_Falla'])}"`);
    const code = str(r['ID_Causa']);
    c.causes.push({ code, name: str(r['Causa']), failureCategory: cat, description: str(r['Descripcion']) });
    const seen = new Set<string>();
    for (const cc of str(r['Controles_Aplicables']).match(CONTROL_CODE) ?? []) {
      if (!controlCodes.has(cc)) err(`${at}: la causa ${code} cita el control ${cc}, que no existe en el catálogo`);
      if (!seen.has(cc)) {
        seen.add(cc);
        c.causeControls.push({ causeCode: code, controlCode: cc });
      }
    }
  }
  for (const r of rows.riskCauses) {
    c.riskCauses.push({ code: str(r['ID_Rel']), riskCode: str(r['ID_Riesgo']), causeCode: str(r['ID_Causa']) });
  }

  // ---- Pruebas ----------------------------------------------------------------------------
  const pairs = new Set<string>();
  for (const [i, r] of rows.tests.entries()) {
    const at = `hoja Pruebas, fila ${i + 1}`;
    const code = str(r['ID TEST']);
    const dim = SOURCE_DIMENSION[str(r['DIMENSIÓN'])];
    if (!dim) err(`${at}: dimensión desconocida "${str(r['DIMENSIÓN'])}"`);
    const prefix = /^T-([A-Z]+)-\d+$/.exec(code)?.[1];
    if (!prefix || TEST_PREFIX_TO_DIMENSION[prefix] !== dim) err(`${at}: el código ${code} no corresponde a la dimensión ${str(r['DIMENSIÓN'])}`);
    const steps = splitSteps(str(r['PASO A PASO DEL TEST']));
    if (!steps) err(`${at}: ${code}: el paso a paso no está numerado 1, 2, 3… y no se puede separar sin adivinar`);
    const attrs = splitAttributes(str(r['ATRIBUTOS A VALIDAR']));
    const t: TestRow = {
      code,
      dimension: dim,
      name: str(r['NOMBRE DEL TEST']),
      objective: str(r['OBJETIVO DEL TEST']),
      type: str(r['TIPO DE PRUEBA']),
      tool: str(r['HERRAMIENTA / FUENTE TÉCNICA']),
      population: str(r['POBLACIÓN / UNIVERSO']),
      period: str(r['PERÍODO DE PRUEBA']),
      populationSize: str(r['TAMAÑO DE POBLACIÓN']),
      suggestedSampleSize: str(r['MUESTRA SUGERIDA']),
      selectionMethod: str(r['MÉTODO DE SELECCIÓN']),
      evidenceToRequest: str(r['EVIDENCIA / INFORMACIÓN A SOLICITAR']),
      prerequisites: str(r['PRERREQUISITOS']),
      stepByStep: steps ?? [],
      attributesToValidate: attrs,
      complianceCriterion: str(r['CRITERIO DE CUMPLIMIENTO / RESULTADO ESPERADO']),
      exceptions: str(r['EXCEPCIONES / DESVIACIONES']),
      exceptionsHandling: str(r['TRATAMIENTO DE EXCEPCIONES']),
      evidenceToRetain: str(r['EVIDENCIA A CONSERVAR']),
      automatedCoverage: str(r['COBERTURA AUTOMATIZADA']),
      complementaryManualValidation: str(r['VALIDACIÓN MANUAL COMPLEMENTARIA']),
      limitations: str(r['OBSERVACIONES / LIMITACIONES']),
    };
    c.tests.push(t);
    for (const cc of str(r['CONTROL(ES) RELACIONADO(S)']).match(CONTROL_CODE) ?? []) {
      if (!controlCodes.has(cc)) err(`${at}: ${code} cita el control ${cc}, que no existe en el catálogo`);
      const k = `${cc}|${code}`;
      if (!pairs.has(k)) {
        pairs.add(k);
        c.controlTests.push({ controlCode: cc, testCode: code });
      }
    }
  }
  c.tests.sort((a, b) => codeOrder(a.code.replace(/^T-/, '').replace('-', ''), b.code.replace(/^T-/, '').replace('-', '')) || a.code.localeCompare(b.code));
  c.controlTests.sort((a, b) => codeOrder(a.controlCode, b.controlCode) || a.testCode.localeCompare(b.testCode));

  // ---- Plantillas de evidencia (documentos vinculados a cada control) --------------------
  const tpl = new Map<string, { code: string; description: string }>();
  for (const r of rows.controls) {
    const controlCode = str(r['ID']);
    const items = numberedLines(r['Documentos vinculados (todos)']);
    const seqs = new Set<string>();
    for (const it of items) {
      if (seqs.has(it.text)) err(`el control ${controlCode} lista dos veces el documento "${it.text}"`);
      seqs.add(it.text);
      const code = 'DOC-' + createHash('sha1').update(it.text.toLowerCase()).digest('hex').slice(0, 8);
      const prev = tpl.get(code);
      if (prev && prev.description !== it.text) err(`colisión de código ${code} entre "${prev.description}" y "${it.text}"`);
      tpl.set(code, { code, description: it.text });
      c.controlEvidenceTemplates.push({ controlCode, templateCode: code, sequence: it.n });
    }
    const declared = Number(str(r['N.º de documentos']) || 0);
    if (declared !== items.length) err(`el control ${controlCode} declara ${declared} documentos y se leyeron ${items.length}`);
  }
  // El comité no trae dimensión de los documentos: son documentos, así que `policy` (documental).
  c.evidenceTemplates = [...tpl.values()]
    .sort((a, b) => a.description.localeCompare(b.description, 'es'))
    .map((t) => ({ ...t, dimension: 'policy' as const }));
  c.controlEvidenceTemplates.sort((a, b) => codeOrder(a.controlCode, b.controlCode) || a.sequence - b.sequence);


  // ---- Políticas (plantillas) y su vínculo con los controles --------------------------------
  const policyNames = new Set<string>();
  for (const r of rows.controls) {
    const controlCode = str(r['ID']);
    const items = numberedLines(r['Políticas vinculadas (todas)']);
    const declared = Number(str(r['N.º de políticas']) || 0);
    if (declared !== items.length) err(`el control ${controlCode} declara ${declared} políticas y se leyeron ${items.length}`);
    for (const it of items) {
      const parsed = parsePolicyLine(it.text);
      if (!parsed) {
        err(`el control ${controlCode}: la política "${it.text}" no sigue el formato "Nombre — El control depende de la aprobación de la política…"`);
        continue;
      }
      policyNames.add(parsed.name);
      c.controlPolicies.push({ controlCode, policyName: parsed.name, requiresEmployeeAcceptance: parsed.requiresEmployeeAcceptance });
    }
  }
  c.policies = [...policyNames].sort((a, b) => a.localeCompare(b, 'es')).map((name) => ({ name }));
  c.controlPolicies.sort((a, b) => codeOrder(a.controlCode, b.controlCode) || a.policyName.localeCompare(b.policyName, 'es'));

  // ---- Dimensiones de cada control (derivadas de las pruebas, D39) -------------------------
  try {
    c.controlDimensions = deriveControlDimensions(c.tests, c.controlTests);
  } catch (e) {
    err((e as Error).message);
  }

  // ---- Constancia de lo que el Excel dice y los datos no confirman ----------------------
  const defined = new Set(c.tests.map((t) => t.code));
  const matrixPairs = new Set<string>();
  for (const r of rows.matrix) {
    for (const col of ['TEST Documental', 'TEST Aplicación', 'TEST Servidores', 'TEST BD', 'TEST Nube']) {
      for (const tid of str(r[col]).match(/T-[A-Z]+-\d+/g) ?? []) matrixPairs.add(`${str(r['ID Control'])}|${tid}`);
    }
  }
  const missing = [...new Set([...matrixPairs].map((p) => p.split('|')[1]).filter((t) => !defined.has(t)))].sort();
  const resolvable = [...matrixPairs].filter((p) => defined.has(p.split('|')[1]));
  const notInPruebas = resolvable.filter((p) => !pairs.has(p));
  c.meta.sourceNotes.push(
    `Asignaciones control ↔ prueba: la matriz "Análisis TEST x Control" trae ${matrixPairs.size}; ${matrixPairs.size - resolvable.length} citan pruebas que no existen (${missing.join(', ')}) y la propia hoja marca "FALTAN ${missing.length}". ` +
      `Se usa la hoja "Pruebas" (CONTROL(ES) RELACIONADO(S)): ${c.controlTests.length} asignaciones, ${new Set(c.controlTests.map((p) => p.testCode)).size} de ${c.tests.length} pruebas y ${new Set(c.controlTests.map((p) => p.controlCode)).size} controles cubiertos; ` +
      `${notInPruebas.length === 0 ? 'incluye las' : `NO incluye ${notInPruebas.length} de las`} ${resolvable.length} asignaciones resolubles de la matriz. ` +
      'No se asume ninguna equivalencia entre los códigos T-APP-00x y las pruebas definidas.',
  );
  const declaredDocs = rows.controls.reduce((n, r) => n + Number(str(r['N.º de documentos']) || 0), 0);
  const withRisk = new Set(c.riskCauses.map((r) => r.causeCode));
  const orphanCauses = c.causes.map((k) => k.code).filter((k) => !withRisk.has(k));
  c.meta.sourceNotes.push(
    `Riesgos y causas: ${c.riskCauses.length} relaciones riesgo↔causa cubren ${withRisk.size} de ${c.causes.length} causas; ${orphanCauses.length} (${orphanCauses.join(', ')}) no están asociadas a ningún riesgo y se cargan tal cual, sin asociar. ` +
      `${c.causeControls.length} aristas causa→control (${new Set(c.causeControls.map((x) => x.controlCode)).size} controles distintos).`,
  );
  c.meta.sourceNotes.push(
    `Plantillas de evidencia: ${declaredDocs} vínculos documento ↔ control entre ${new Set(c.controlEvidenceTemplates.map((x) => x.controlCode)).size} controles y ${c.evidenceTemplates.length} documentos distintos.`,
  );
  c.meta.sourceNotes.push(
    `Políticas: ${c.controlPolicies.length} vínculos control ↔ política entre ${new Set(c.controlPolicies.map((x) => x.controlCode)).size} controles y ${c.policies.length} políticas distintas; ` +
      'se siembran como plantillas (solo el nombre, D39) y la aprobación es del cliente.',
  );
  const dimCount = (d: Dimension) => c.controlDimensions.filter((x) => x.dimension === d).length;
  c.meta.sourceNotes.push(
    `Dimensiones por control: el Excel no trae el tipo ni las banderas (P10). Se derivan de las pruebas (D39): ${c.controlDimensions.length} filas ` +
      `(documental ${dimCount('policy')}, servidores ${dimCount('server')}, BD ${dimCount('database')}, nube ${dimCount('cloud')}, aplicación ${dimCount('app')}). ` +
      'Regla pendiente de ratificar con el comité.',
  );
  c.meta.sourceNotes.push(
    'La hoja "Resumen" declara 658 relaciones punto de enfoque ↔ control y está desactualizada: los datos crudos traen ' +
      `${c.pointOfFocusControls.length}.`,
  );
}
