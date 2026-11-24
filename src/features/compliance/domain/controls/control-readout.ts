import type { ControlAccess } from './control-access';
import type { EvidenceState } from '../evidence/evidence';
import { AssetResult, ControlState, TestState } from '../engine/states';
import { evaluateControlLevel } from '../engine/v2/control-level';
import { evaluateManualTest, ManualEvidence, ManualVerdict } from '../engine/v2/manual-test';
import { EvaluationParameters } from '../engine/v2/parameters';
import { evaluateRequirement } from '../engine/v2/requirement';
import { AssetOutcomes, checkResultOf, CheckCounts, CheckOutcome, classifyModuleRef, evaluateTechnicalTest, ModuleFacts, moduleLinkResult, withException, worstStatus } from '../engine/v2/technical-test';
import { ControlLevel, Periodicity, RequirementStatus, TestStatus, TestType } from '../engine/v2/types';
import { currentWindow, isResultCurrent, windowEndDate } from '../engine/v2/windows';

// De lo que dice la base a lo que se muestra de un control (MD-117, MD-498, modelo-datos.md §9 y contracts/cumplimiento/controles.md).
// Lógica pura, sin Prisma ni Nest: recibe una foto del servicio y devuelve el nivel y el estado de cada control con el motor v2 del comité.

// v2 (MD-491): 9 dimensiones. Las cuatro nuevas (network, endpoint, physical, process) aún no tienen fuente automática.
export type Dimension = 'policy' | 'server' | 'database' | 'app' | 'cloud' | 'network' | 'endpoint' | 'physical' | 'process';
export type ControlType = 'manual' | 'automated' | 'hybrid' | 'technical_manual';
export type Readiness = 'ready' | 'almost_ready' | 'needs_work' | 'not_measured';

// Cortes del semáforo (D62, P16): los mismos que usa el resto del producto.
export const READY_CUTOFF = 1;
export const ALMOST_READY_CUTOFF = 0.8;

/**
 * Sobre qué dimensión mide un activo (modelo-datos.md §2). `endpoint`, `network_device` y `documentation` se monitorean o se archivan pero no son
 * dimensión (D5): no entran al universo de ninguna prueba.
 */
const DIMENSION_OF_ASSET_TYPE: Record<string, Dimension | null> = {
  server: 'server',
  database: 'database',
  cloud_service: 'cloud',
  application: 'app',
  endpoint: null,
  network_device: null,
  documentation: null,
};
export const dimensionOfAssetType = (type: string): Dimension | null => DIMENSION_OF_ASSET_TYPE[type] ?? null;

/** Lo que une a una prueba con los checks y módulos que la prueban (`catalog.test_checks`, T-04 a T-06). */
export type TestLinks = {
  /** Vínculos Directos con un check: lo que la sonda o el motor de nube midió se lee de `evaluations`. */
  directCheckCount: number;
  /** Los checks Complementarios (id del catálogo): si fallan, observación. */
  complementaryCheckIds: string[];
  /** Vínculos «N/A» a un módulo o puntaje (D141, D146). */
  modules: Array<{ role: 'direct' | 'complementary'; ref: string }>;
  /** Dependencia (T-06): la prueba toma la conclusión de la prueba del control dueño que lleva el mismo check o módulo como Directo. */
  dependencies: Array<{ ownerControlId: string; key: string }>;
  /** Claves (`check:<id>` o `module:<ref>`) de los vínculos Directos: de ahí un control dependiente encuentra la prueba dueña. */
  directKeys: string[];
};
export const NO_LINKS: TestLinks = { directCheckCount: 0, complementaryCheckIds: [], modules: [], dependencies: [], directKeys: [] };

export type ReadoutTest = {
  testId: string;
  code: string;
  displayName: string | null;
  displayNameEn: string | null;
  displayDescription: string | null;
  /** v2: documentary|population|operational|technical (`tests.type`). */
  testType?: string | null;
  dimension: Dimension;
  mandatory: boolean;
  active: boolean;
  links?: TestLinks;
};
export type ReadoutAsset = { id: string; name: string; type: string };
export type ReadoutDimension = { dimension: Dimension; applies: boolean; type: ControlType; reasonNotApplicable: string | null };

/** El requisito del control del cliente (`client_control_requirements`) con las pruebas del catálogo que lo prueban. */
export type ReadoutRequirement = {
  id: string;
  code: string;
  text: string;
  type: TestType;
  periodicity: Periodicity | null;
  isApplicable: boolean;
  tests: ReadoutTest[];
};

/** Una entrega de evidencia del control: `testId` nulo = no dice a qué prueba sirve (D88). */
export type ControlEvidenceItem = { testId: string | null; state: EvidenceState; submittedAt: Date | null };

export type ReadoutControl = {
  id: string;
  serviceId: string;
  ownCode: string;
  name: string;
  origin: 'catalog' | 'own';
  type: ControlType;
  interpretation: string;
  catalogDescription: string | null;
  dimensions: ReadoutDimension[];
  /** Todas las pruebas del control (las de sus requisitos), sin repetir. */
  tests: ReadoutTest[];
  trustCriteria: string[];
  /** Dueño y ejecutor activos del control (D102): de ahí sale lo que ven el `responsable` y el `delegado`. */
  access: ControlAccess;
  /** Estado de aprobación de un control propio (la propuesta `create`); un control del catálogo siempre está aprobado. */
  approval: 'approved' | 'pending' | 'rejected';
  catalogCode: string | null;
  requirementCodes: string[];
  pointsOfFocus: string[];
  /** Las evidencias requeridas del control con el estado de su última entrega: de ellas sale el estado de sus pruebas manuales (DT-114). */
  evidence: ControlEvidenceItem[];
  /** El control del catálogo del que viene (`null` en uno propio): de ahí se resuelve la Dependencia (T-06). */
  catalogControlId?: string | null;
  /** Periodicidad sugerida del control: la que usa un requisito que no trae la suya. */
  periodicity?: Periodicity | null;
  requirements?: ReadoutRequirement[];
};

/** Último resultado de cada activo en cada test de cada control: `${controlId}|${testId}|${assetId}`. */
export type ResultsIndex = ReadonlyMap<string, AssetResult>;
export const resultKey = (controlId: string, testId: string, assetId: string) => `${controlId}|${testId}|${assetId}`;
export const testAssetKey = (testId: string, assetId: string) => `${testId}|${assetId}`;

/** Lo que el motor lee además de los resultados: el reloj, los parámetros y los datos que la sonda y las personas dejaron. Todo llega ya cargado. */
export type ReadoutSignals = {
  now: Date;
  parameters: EvaluationParameters;
  /** Cuándo se produjo cada resultado de `results`. */
  resultDates: ReadonlyMap<string, Date>;
  /** `${testId}|${assetId}` con una excepción de check vigente (D135). */
  exceptions: ReadonlySet<string>;
  /** `${testId}|${assetId}` con algún check Complementario en FAIL. */
  complementaryFails: ReadonlySet<string>;
  /** Datos de los vínculos de módulo y puntaje, por activo. */
  moduleFacts: ReadonlyMap<string, ModuleFacts>;
  /** El último veredicto aprobado de cada prueba manual (D85, D121). */
  verdicts: ReadonlyMap<string, ManualVerdict>;
};

/** Lo que `readControl` necesita de la foto del servicio. `pool` son todos los controles del servicio, para resolver una Dependencia aunque se lea uno solo. */
export type ReadoutData = { controls: readonly ReadoutControl[]; pool?: readonly ReadoutControl[]; assets: readonly ReadoutAsset[]; results: ResultsIndex; signals: ReadoutSignals };

export type FailingItem = { dimension: Dimension; affected: Array<{ kind: 'asset'; id: string; name: string } | { kind: 'test'; id: string; displayName: string | null; displayNameEn: string | null; testCode: string }> };

export type TestEvaluationDetail = {
  status: TestStatus;
  windowEnd: string | null;
  checks: CheckCounts | null;
  assetCoverage: { withResult: number; inScope: number } | null;
  failingAssetIds: string[];
};

export type RequirementReadout = {
  requirement: ReadoutRequirement;
  status: RequirementStatus;
  tests: Array<{ test: ReadoutTest } & TestEvaluationDetail>;
};

export type ControlReadout = {
  control: ReadoutControl;
  readiness: Readiness;
  state: ControlState;
  progress: { done: number; total: number };
  coverage: { measured: number; applicable: number };
  failing: FailingItem[];
  /** Las pruebas del control con su estado derivado de `test_status` (`compliant` y `observation` → `compliant`, `exception` → `non_compliant`). */
  tests: Array<{ test: ReadoutTest; state: TestState; status: TestStatus }>;
  approval: 'approved' | 'pending' | 'rejected';
  level: ControlLevel;
  levelValue: number;
  complies: boolean;
  cPercent: number | null;
  /** Decidido para el marco y la categoría: nivel distinto de «No evaluado» y ningún requisito pendiente. */
  decided: boolean;
  requirements: RequirementReadout[];
  /** Los requisitos aplicables que impiden el 100 % (REQ-026). */
  blockingRequirements: RequirementReadout[];
};

/** `test_status` → `test_state` (contracts/cumplimiento/controles.md «Motor v2»). */
export function legacyTestState(status: TestStatus): TestState {
  switch (status) {
    case 'correct':
    case 'observation': return 'compliant';
    case 'exception': return 'non_compliant';
    default: return status;
  }
}

/**
 * El semáforo de un control (§9 «Qué ve cada rol»): sobre el estado y el avance.
 *  · Sin Medir: nada con resultado todavía; es un hueco de cobertura, no un fallo.
 *  · Preparado: el control cumple (Adecuado o Sólido) y nada queda pendiente.
 *  · Casi listo: avance de 80% a menos de 100%, o todo lo medido cumple pero algo sigue pendiente.
 *  · Requiere trabajo: avance menor de 80%.
 */
export function readinessOf(input: { state: ControlState; done: number; total: number; measured: number; failingTests: number }): Readiness {
  if (input.state === 'no_tests' || input.measured === 0) return 'not_measured';
  if (input.state === 'effective') return 'ready';
  if (input.failingTests === 0) return 'almost_ready';
  return input.total > 0 && input.done / input.total >= ALMOST_READY_CUTOFF ? 'almost_ready' : 'needs_work';
}

// --- La evaluación de una prueba -------------------------------------------------------------------------------------------------------------------

type Entry = { requirement: ReadoutRequirement; test: ReadoutTest };
const cache = new WeakMap<object, Map<string, TestEvaluationDetail>>();

const entriesOf = (control: ReadoutControl): Entry[] => (control.requirements ?? []).flatMap((requirement) => requirement.tests.map((test) => ({ requirement, test })));

function manualEvidenceOf(control: ReadoutControl, testId: string): ManualEvidence[] {
  return control.evidence.filter((e) => e.testId === testId).map((e) => ({ state: e.state, submittedAt: e.submittedAt }));
}

function outcomesOf(control: ReadoutControl, test: ReadoutTest, periodicity: Periodicity | null, data: ReadoutData): AssetOutcomes[] {
  const links = test.links ?? NO_LINKS;
  const { signals, results } = data;
  return data.assets
    .filter((a) => dimensionOfAssetType(a.type) === test.dimension)
    .map((asset) => {
      const outcomes: CheckOutcome[] = [];
      if (links.directCheckCount > 0) {
        const key = resultKey(control.id, test.testId, asset.id);
        const raw = results.get(key);
        const at = signals.resultDates.get(key);
        const decided = raw === 'compliant' || raw === 'non_compliant';
        if (decided && at && !isResultCurrent(periodicity, at, signals.now, signals.parameters)) outcomes.push({ role: 'direct', result: 'no_data', stale: true });
        else {
          const base = checkResultOf(raw === 'compliant' ? 'passed' : raw === 'non_compliant' ? 'failed' : raw === 'not_applicable' ? 'not_applicable' : null);
          outcomes.push({ role: 'direct', result: withException(base, signals.exceptions.has(testAssetKey(test.testId, asset.id))) });
        }
      }
      const facts = signals.moduleFacts.get(asset.id) ?? { openCriticalHigh: null, scorePercent: null };
      for (const m of links.modules) outcomes.push({ role: m.role, result: moduleLinkResult(classifyModuleRef(m.ref), facts, signals.parameters) });
      if (signals.complementaryFails.has(testAssetKey(test.testId, asset.id))) outcomes.push({ role: 'complementary', result: 'fail' });
      return { assetId: asset.id, name: asset.name, outcomes };
    });
}

function evaluateTest(control: ReadoutControl, entry: Entry, data: ReadoutData, visiting: ReadonlySet<string> = new Set()): TestEvaluationDetail {
  const periodicity = entry.requirement.periodicity ?? control.periodicity ?? null;
  const key = `${control.id}|${entry.test.testId}|${periodicity}`;
  const memo = cache.get(data) ?? new Map<string, TestEvaluationDetail>();
  cache.set(data, memo);
  const cached = memo.get(key);
  if (cached) return cached;

  const { test } = entry;
  const { signals } = data;
  const links = test.links ?? NO_LINKS;
  let detail: TestEvaluationDetail;

  const technical = test.testType === 'technical' ? evaluateTechnicalTest({ assets: outcomesOf(control, test, periodicity, data), periodicity }, signals.parameters) : null;
  const dependencies = test.testType === 'technical' ? links.dependencies : [];
  if (technical?.applicable || dependencies.length > 0) {
    const pool = data.pool ?? data.controls;
    const next = new Set(visiting).add(key);
    const owners = dependencies.map((dep): TestStatus => {
      const owner = pool.find((c) => c.catalogControlId === dep.ownerControlId);
      const found = owner ? entriesOf(owner).find((e) => (e.test.links ?? NO_LINKS).directKeys.includes(dep.key)) : undefined;
      if (!owner || !found) return 'pending';
      const ownerKey = `${owner.id}|${found.test.testId}|${found.requirement.periodicity ?? owner.periodicity ?? null}`;
      return next.has(ownerKey) ? 'pending' : evaluateTest(owner, found, data, next).status;
    });
    const status = worstStatus([...(technical?.applicable ? [technical.status] : []), ...owners]) ?? 'pending';
    const window = currentWindow({ periodicity, now: signals.now });
    detail = {
      status,
      windowEnd: windowEndDate(window),
      checks: technical?.applicable ? technical.checks : null,
      assetCoverage: technical?.applicable ? technical.assetCoverage : null,
      failingAssetIds: technical?.failingAssetIds ?? [],
    };
  } else {
    // T-05: una prueba técnica sin ningún Directo aplicable no es «No aplica»: se prueba a mano, igual que las demás pruebas manuales.
    const manual = evaluateManualTest({ evidence: manualEvidenceOf(control, test.testId), verdict: test.testType === 'documentary' ? null : (signals.verdicts.get(test.testId) ?? null), periodicity, now: signals.now });
    detail = { status: manual.status, windowEnd: manual.windowEnd, checks: null, assetCoverage: null, failingAssetIds: [] };
  }
  memo.set(key, detail);
  return detail;
}

/** Un control propio no tiene requisitos del catálogo: se mide con su evidencia como un requisito documental único. */
function ownRequirement(control: ReadoutControl, data: ReadoutData): RequirementReadout {
  const requirement: ReadoutRequirement = { id: control.id, code: control.ownCode, text: control.name, type: 'documentary', periodicity: control.periodicity ?? null, isApplicable: true, tests: [] };
  const manual = evaluateManualTest({ evidence: control.evidence.map((e) => ({ state: e.state, submittedAt: e.submittedAt })), periodicity: requirement.periodicity, now: data.signals.now });
  return { requirement, status: evaluateRequirement({ isApplicable: true, tests: [manual.status] }), tests: [] };
}

export function readControl(control: ReadoutControl, data: ReadoutData): ControlReadout {
  const requirements: RequirementReadout[] =
    control.origin === 'own'
      ? [ownRequirement(control, data)]
      : (control.requirements ?? []).map((requirement) => {
          const tests = requirement.tests.map((test) => ({ test, ...evaluateTest(control, { requirement, test }, data) }));
          return { requirement, status: evaluateRequirement({ isApplicable: requirement.isApplicable, tests: tests.map((t) => t.status) }), tests };
        });

  const level = evaluateControlLevel(
    requirements.map((r) => ({ status: r.status, tests: r.tests.map((t) => ({ status: t.status, documentary: (t.test.testType ?? r.requirement.type) === 'documentary' })) })),
    data.signals.parameters,
  );
  const applicable = requirements.filter((r) => r.status !== 'not_applicable');
  const unique = new Map<string, { test: ReadoutTest; status: TestStatus; detail: TestEvaluationDetail }>();
  for (const r of requirements) for (const t of r.tests) if (!unique.has(t.test.testId)) unique.set(t.test.testId, { test: t.test, status: t.status, detail: t });

  // En qué falla: por dimensión, los activos de los Directos en FAIL; y la prueba (con su nombre neutro, nunca el texto del comité) si está en Excepción o Vencida sin un activo que señalar.
  const assetsById = new Map(data.assets.map((a) => [a.id, a]));
  const byDimension = new Map<Dimension, FailingItem['affected']>();
  for (const { test, status, detail } of unique.values()) {
    if (status !== 'exception' && status !== 'expired') continue;
    const list = byDimension.get(test.dimension) ?? [];
    const failed = detail.failingAssetIds.flatMap((id) => (assetsById.has(id) ? [assetsById.get(id) as ReadoutAsset] : []));
    if (failed.length === 0) list.push({ kind: 'test', id: test.testId, displayName: test.displayName, displayNameEn: test.displayNameEn, testCode: test.code });
    else for (const a of failed) if (!list.some((x) => x.kind === 'asset' && x.id === a.id)) list.push({ kind: 'asset', id: a.id, name: a.name });
    byDimension.set(test.dimension, list);
  }

  return {
    control,
    readiness: readinessOf({
      state: level.state,
      done: level.compliant,
      total: level.applicable,
      measured: level.measured,
      failingTests: applicable.filter((r) => r.status === 'non_compliant' || r.status === 'expired').length,
    }),
    state: level.state,
    progress: { done: level.compliant, total: level.applicable },
    coverage: { measured: level.measured, applicable: level.applicable },
    failing: [...byDimension.entries()].map(([dimension, affected]) => ({ dimension, affected })),
    tests: [...unique.values()].map((u) => ({ test: u.test, state: legacyTestState(u.status), status: u.status })),
    approval: control.approval,
    level: level.level,
    levelValue: level.levelValue,
    complies: level.complies,
    cPercent: level.cPercent,
    decided: level.decided,
    requirements,
    blockingRequirements: level.blocking.map((i) => requirements[i]),
  };
}

/** El código interno de un control (`IAC-2`, `C10`) se ordena por su prefijo y luego por su número: `IAC-2` antes que `IAC-10`. */
export function compareOwnCode(a: string, b: string): number {
  const split = (c: string) => ({ prefix: c.replace(/\d.*$/, ''), n: Number(/\d+/.exec(c)?.[0] ?? 0) });
  const x = split(a);
  const y = split(b);
  return x.prefix !== y.prefix ? x.prefix.localeCompare(y.prefix) : x.n - y.n || a.localeCompare(b);
}
