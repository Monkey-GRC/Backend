import { DimensionName } from '../../../../common/catalogs/dimensions';
import type { ControlAccess } from './control-access';
import { ApprovalRecord, controlWindowStart, countsAsCompliant, deriveManagement, ManagementReadout, ManagementState } from './management-state';
import type { EvidenceState } from '../evidence/evidence';
import { AssetResult, ControlState, TestState } from '../engine/states';
import { evaluateControlLevel } from '../engine/v2/control-level';
import type { SolidConditions } from '../engine/v2/control-level';
import { evaluateManualTest, ManualEvidence, ManualResult } from '../engine/v2/manual-test';
import { EvaluationParameters } from '../../../../common/evaluation-parameters/parameters';
import { evaluateRequirement, requirementStatusInPeriod } from '../engine/v2/requirement';
import { AssetOutcomes, checkResultOf, CheckCounts, CheckOutcome, classifyModuleRef, evaluateTechnicalTest, ModuleFacts, moduleLinkResult, withException, worstStatus } from '../engine/v2/technical-test';
import { ControlLevel, Periodicity, RequirementStatus, TestStatus, TestType } from '../engine/v2/types';
import { alertDate, closedWindowsWithin, currentWindow, EvaluationWindow, hasPeriodWindows, isResultCurrent, rollingWindowsWithin, windowEndDate } from '../engine/v2/windows';

// De lo que dice la base a lo que se muestra de un control (MD-117, MD-498, modelo-datos.md §9 y contracts/cumplimiento/controles.md).
// Lógica pura, sin Prisma ni Nest: recibe una foto del servicio y devuelve el nivel y el estado de cada control con el motor v2 del comité.

// v2 (MD-491): 9 dimensiones. Las cuatro nuevas (network, endpoint, physical, process) aún no tienen fuente automática.
export type Dimension = DimensionName;
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
  /** MD-499 · Cada vínculo ratificado tal como está en el catálogo, con el título del check: de ahí sale `check_links[]` del detalle. */
  items: LinkItem[];
};
export type LinkItem = {
  role: 'direct' | 'complementary' | 'dependency';
  check: { id: string; titleEs: string | null; titleEn: string } | null;
  moduleRef: string | null;
  /** Solo en una Dependencia: el control del catálogo dueño (T-06) y su código, para mostrarlo aunque el servicio no lo tenga. */
  owner: { controlId: string; code: string } | null;
  /** `check:<id>` o `module:<ref>`: lo mismo que `directKeys`. */
  key: string;
};
export const NO_LINKS: TestLinks = { directCheckCount: 0, complementaryCheckIds: [], modules: [], dependencies: [], directKeys: [], items: [] };

export type ReadoutTest = {
  testId: string;
  code: string;
  displayName: string | null;
  displayNameEn: string | null;
  displayDescription: string | null;
  /** v2: documentary|population|operational|technical (`tests.type`). */
  testType?: string | null;
  dimension: Dimension;
  /** `tests.primary_source` (catálogo v2): con la dimensión decide si la prueba acepta evidencia subida (`acceptsEvidence`). */
  primarySource?: string | null;
  /** Nombre de la categoría de integración de la prueba (`tests.integration_category`); con `primarySource: integration` decide si hay una conectada. */
  integrationCategory?: string | null;
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
  /** La periodicidad del catálogo (MD-500): la «sugerida». `periodicity` es la vigente, que puede ser la que cambió el `admin_empresa`. */
  suggestedPeriodicity?: Periodicity | null;
};

/** Una entrega de evidencia del control: `testId` nulo = no dice a qué prueba sirve (D88). `history` son todas sus versiones, cada una con su propio estado (MD-500: de ahí sale la evidencia de cada ventana). */
export type ControlEvidenceItem = { testId: string | null; state: EvidenceState; submittedAt: Date | null; history?: ReadonlyArray<{ state: EvidenceState; submittedAt: Date | null }> };

/** El último cambio de periodicidad del control (D147). */
export type PeriodicityChange = { periodicity: Periodicity | null; justification: string; changedAt: Date };

/** El período auditado abierto (G-11): `end` inclusivo, todo en días UTC. */
export type AuditedPeriod = { start: Date; end: Date };

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
  /** MD-500 · Con valor, el `admin_empresa` cambió la periodicidad del control (`periodicity_source = client`). */
  periodicityChange?: PeriodicityChange | null;
  /** MD-504 · El último resultado registrado de cada prueba manual EN ESTE control (`manual_test_results`), por `testId` (D140 punto 2, D129). */
  manualResults?: ReadonlyMap<string, ManualResult>;
  /** MD-504 · Las aprobaciones y devoluciones del control (`control_approvals`) y cuándo se registró cada resultado manual: de ahí sale el estado de gestión (D132). */
  management?: { approvals: readonly ApprovalRecord[]; resultDates: readonly Date[] };
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
  /** MD-499 · `${testId}|${assetId}|${checkId}` de cada check Complementario en FAIL: el detalle de `complementaryFails`, por check. */
  complementaryFailChecks?: ReadonlySet<string>;
  /** Datos de los vínculos de módulo y puntaje, por activo. */
  moduleFacts: ReadonlyMap<string, ModuleFacts>;
  /** MD-500 · El período auditado abierto; `null` si no está definido (no hay ventanas que contar ni evidencia que descartar). */
  period?: AuditedPeriod | null;
  /** MD-500 · Los días (UTC, en ms) con un resultado automático decidido dentro del período, por `resultKey`: de ahí sale la cobertura de las ventanas ya cerradas. */
  resultDays?: ReadonlyMap<string, ReadonlySet<number>>;
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
  /** El día del aviso previo (PR-06); `null` sin ventana. */
  alertAt: string | null;
  /** MD-504 · La prueba se resuelve a mano (evidencia y, si no es documental, el resultado del responsable); `false` si la mide el motor de checks o una Dependencia. */
  manual: boolean;
};

/** La vista del período auditado (R6): cada ventana cerrada del período cuenta. */
export type PeriodReadout = {
  level: ControlLevel;
  complies: boolean;
  windows: { total: number; withEvidence: number };
  missing: Array<{ requirementCode: string; windowStart: string; windowEnd: string }>;
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
  tests: Array<{ test: ReadoutTest; state: TestState; status: TestStatus; manual: boolean }>;
  approval: 'approved' | 'pending' | 'rejected';
  /** MD-504 (D132) · El estado de gestión: lo que el motor dice más lo que las personas aprobaron, devolvieron o cargaron. */
  managementState: ManagementState;
  management: ManagementReadout;
  /** El estado del control para la categoría y el marco (D130 puntos 4 y 5): solo `approved` cuenta como cumplido; un control que cumple pero no está aprobado sigue «en evaluación». */
  rollupState: ControlState;
  level: ControlLevel;
  levelValue: number;
  complies: boolean;
  cPercent: number | null;
  /** Decidido para el marco y la categoría: nivel distinto de «No evaluado» y ningún requisito pendiente. */
  decided: boolean;
  requirements: RequirementReadout[];
  /** Los requisitos aplicables que impiden el 100 % (REQ-026). */
  blockingRequirements: RequirementReadout[];
  /** MD-500 (R6) · `null` si el período no está definido. */
  period: PeriodReadout | null;
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

const DAY_MS = 86_400_000;
const dayOf = (d: Date) => d.toISOString().slice(0, 10);

/** G-11 · Lo fechado fuera del período auditado no cuenta. Sin período, todo cuenta. */
const withinPeriod = (at: Date | null, period: AuditedPeriod | null | undefined): boolean =>
  !period || !at || (at.getTime() >= period.start.getTime() && at.getTime() < period.end.getTime() + DAY_MS);

/** El resultado manual vigente de la prueba en el control, dentro del período auditado (G-11). */
function manualResultOf(control: ReadoutControl, testId: string, period?: AuditedPeriod | null): ManualResult | null {
  const r = control.manualResults?.get(testId) ?? null;
  return r && withinPeriod(r.at, period) ? r : null;
}

function manualEvidenceOf(control: ReadoutControl, testId: string | null, period?: AuditedPeriod | null): ManualEvidence[] {
  return control.evidence.filter((e) => (testId === null || e.testId === testId) && withinPeriod(e.submittedAt, period)).map((e) => ({ state: e.state, submittedAt: e.submittedAt }));
}

/** El último resultado automático decidido del test (dentro del período) en cualquiera de sus activos; `null` si no hay. */
function lastResultAt(control: ReadoutControl, test: ReadoutTest, data: ReadoutData): Date | null {
  let last: Date | null = null;
  for (const asset of data.assets) {
    if (dimensionOfAssetType(asset.type) !== test.dimension) continue;
    const at = data.signals.resultDates.get(resultKey(control.id, test.testId, asset.id));
    if (at && withinPeriod(at, data.signals.period) && (!last || at > last)) last = at;
  }
  return last;
}

/** El resultado del check o los checks Directos de la prueba en un activo (el motor guarda uno por control, prueba y activo). */
function directResultOf(control: ReadoutControl, test: ReadoutTest, asset: ReadoutAsset, periodicity: Periodicity | null, data: ReadoutData): CheckOutcome {
  const { signals, results } = data;
  const key = resultKey(control.id, test.testId, asset.id);
  const raw = results.get(key);
  const at = signals.resultDates.get(key);
  const decided = raw === 'compliant' || raw === 'non_compliant';
  if (decided && at && !withinPeriod(at, signals.period)) return { role: 'direct', result: 'no_data' };
  if (decided && at && !isResultCurrent(periodicity, at, signals.now, signals.parameters)) return { role: 'direct', result: 'no_data', stale: true };
  const base = checkResultOf(raw === 'compliant' ? 'passed' : raw === 'non_compliant' ? 'failed' : raw === 'not_applicable' ? 'not_applicable' : null);
  return { role: 'direct', result: withException(base, signals.exceptions.has(testAssetKey(test.testId, asset.id))) };
}

const moduleFactsOf = (data: ReadoutData, asset: ReadoutAsset): ModuleFacts => data.signals.moduleFacts.get(asset.id) ?? { openCriticalHigh: null, scorePercent: null };

function outcomesOf(control: ReadoutControl, test: ReadoutTest, periodicity: Periodicity | null, data: ReadoutData): AssetOutcomes[] {
  const links = test.links ?? NO_LINKS;
  const { signals } = data;
  return data.assets
    .filter((a) => dimensionOfAssetType(a.type) === test.dimension)
    .map((asset) => {
      const outcomes: CheckOutcome[] = [];
      if (links.directCheckCount > 0) outcomes.push(directResultOf(control, test, asset, periodicity, data));
      const facts = moduleFactsOf(data, asset);
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
    // PR-07 `rolling`: la ventana arranca en el último resultado válido del test (o en el inicio del período) y dura una periodicidad.
    const lastResult = signals.parameters.validityWindows === 'rolling' ? lastResultAt(control, test, data) : null;
    const window = currentWindow({ periodicity, now: signals.now, lastValidAt: lastResult, mode: signals.parameters.validityWindows, periodStart: signals.period?.start });
    detail = {
      status,
      windowEnd: windowEndDate(window),
      checks: technical?.applicable ? technical.checks : null,
      assetCoverage: technical?.applicable ? technical.assetCoverage : null,
      failingAssetIds: technical?.failingAssetIds ?? [],
      alertAt: null,
      manual: false,
    };
  } else {
    // T-05: una prueba técnica sin ningún Directo aplicable no es «No aplica»: se prueba a mano, igual que las demás pruebas manuales.
    // MD-499/MD-497 · Una prueba de fuente `integration` sin la integración conectada (hoy, todas) se mide con su evidencia subida, igual que una manual. Cuando MD-497 conecte
    // integraciones, aquí elige la fuente: con la categoría conectada (`IntegrationConnections`) decide la integración y la evidencia subida queda de histórico en las ventanas cerradas.
    const documentary = test.testType === 'documentary';
    const manual = evaluateManualTest({
      evidence: manualEvidenceOf(control, test.testId, signals.period), result: documentary ? null : manualResultOf(control, test.testId, signals.period), requiresResult: !documentary, periodicity, now: signals.now,
      windowMode: signals.parameters.validityWindows, periodStart: signals.period?.start,
    });
    detail = { status: manual.status, windowEnd: manual.windowEnd, checks: null, assetCoverage: null, failingAssetIds: [], alertAt: null, manual: true };
  }
  detail = { ...detail, alertAt: alertDate(detail.windowEnd, periodicity, signals.parameters, signals.now) };
  memo.set(key, detail);
  return detail;
}

// --- Los vínculos de una prueba, para el detalle (MD-499) ------------------------------------------------------------------------------------------

export type CheckLinkReadout = {
  role: 'direct' | 'complementary' | 'dependency';
  kind: 'check' | 'module';
  check: { id: string; titleEs: string | null; titleEn: string } | null;
  module: 'vulnerabilities' | 'score' | 'other' | null;
  /** Solo en un Complementario con check: los activos cuyo resultado más reciente de ese check es FAIL. */
  failingAssets: number | null;
  owner: { controlId: string | null; controlCode: string; testStatus: TestStatus | null } | null;
};

const ROLE_ORDER = { direct: 0, complementary: 1, dependency: 2 } as const;
const MODULE_NAME = { vulnerabilities: 'vulnerabilities', score: 'score', other_module: 'other' } as const;

/** Los vínculos ratificados de una prueba técnica con su rol, el resultado de cada uno por activo y, en una Dependencia, el control dueño y el estado de su prueba. */
function checkLinksOf(entry: Entry, data: ReadoutData, ownerById: ReadonlyMap<string, ReadoutControl>): CheckLinkReadout[] {
  const { test } = entry;
  const items = (test.links ?? NO_LINKS).items;
  if (test.testType !== 'technical' || items.length === 0) return [];
  const assets = data.assets.filter((a) => dimensionOfAssetType(a.type) === test.dimension);
  const titleOf = (i: LinkItem) => i.check?.titleEs ?? i.check?.titleEn ?? i.moduleRef ?? '';
  return [...items]
    .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || titleOf(a).localeCompare(titleOf(b)) || a.key.localeCompare(b.key))
    .map((item): CheckLinkReadout => {
      const kind = item.check ? 'check' : 'module';
      const module = item.moduleRef ? MODULE_NAME[classifyModuleRef(item.moduleRef)] : null;
      if (item.role === 'dependency') {
        const owner = item.owner ? ownerById.get(item.owner.controlId) : undefined;
        const found = owner ? entriesOf(owner).find((e) => (e.test.links ?? NO_LINKS).directKeys.includes(item.key)) : undefined;
        return {
          role: item.role, kind, check: item.check, module, failingAssets: null,
          owner: { controlId: owner?.id ?? null, controlCode: owner ? (owner.catalogCode ?? owner.ownCode) : (item.owner?.code ?? ''), testStatus: owner && found ? evaluateTest(owner, found, data).status : null },
        };
      }
      const check = item.role === 'complementary' ? item.check : null;
      const failingAssets = check ? assets.filter((asset) => data.signals.complementaryFailChecks?.has(`${test.testId}|${asset.id}|${check.id}`)).length : null;
      return { role: item.role, kind, check: item.check, module, failingAssets, owner: null };
    });
}

/** MD-499 · `check_links[]` de cada prueba técnica del control, por `testId`. Solo el detalle lo pide: la lista no paga este cálculo. */
export function checkLinksByTest(control: ReadoutControl, data: ReadoutData): Map<string, CheckLinkReadout[]> {
  const out = new Map<string, CheckLinkReadout[]>();
  const ownerById = new Map((data.pool ?? data.controls).flatMap((c) => (c.catalogControlId ? [[c.catalogControlId, c] as const] : [])));
  for (const entry of entriesOf(control)) if (!out.has(entry.test.testId)) out.set(entry.test.testId, checkLinksOf(entry, data, ownerById));
  return out;
}

/** Un control propio no tiene requisitos del catálogo: se mide con su evidencia como un requisito documental único. */
function ownRequirement(control: ReadoutControl, data: ReadoutData): RequirementReadout {
  const requirement: ReadoutRequirement = { id: control.id, code: control.ownCode, text: control.name, type: 'documentary', periodicity: control.periodicity ?? null, isApplicable: true, tests: [] };
  const manual = evaluateManualTest({ evidence: manualEvidenceOf(control, null, data.signals.period), periodicity: requirement.periodicity, now: data.signals.now, windowMode: data.signals.parameters.validityWindows, periodStart: data.signals.period?.start });
  return { requirement, status: evaluateRequirement({ isApplicable: true, tests: [manual.status] }), tests: [] };
}

// --- Las ventanas ya cerradas del período (R6, G-11, D140) -----------------------------------------------------------------------------------------

type MissingWindow = { requirementCode: string; window: EvaluationWindow; technical: boolean };
type RequirementWindows = { total: number; missing: MissingWindow[] };

const inWindow = (at: Date, w: EvaluationWindow) => at.getTime() >= w.start.getTime() && at.getTime() < w.end.getTime();

/** ¿La evidencia manual de la prueba cubre la ventana? Una entrega que cuenta fechada dentro de ella, o un resultado registrado (no una excepción) de la prueba. */
function manualCovers(items: ReadonlyArray<ControlEvidenceItem>, result: { result: string; at: Date } | null, w: EvaluationWindow): boolean {
  if (result && result.result !== 'exception' && inWindow(result.at, w)) return true;
  return items.some((e) => (e.history ?? [{ state: e.state, submittedAt: e.submittedAt }]).some((h) => h.state === 'compliant' && h.submittedAt !== null && inWindow(h.submittedAt, w)));
}

/** ¿Cada activo en alcance tuvo un resultado dentro de la ventana, al menos PR-03 %? Se evalúa con la misma regla de la prueba técnica, con la ventana cerrada (D140). */
function technicalCovers(control: ReadoutControl, test: ReadoutTest, periodicity: Periodicity | null, w: EvaluationWindow, data: ReadoutData): boolean {
  const days = data.signals.resultDays;
  const assets = data.assets
    .filter((a) => dimensionOfAssetType(a.type) === test.dimension)
    .map((asset) => {
      const seen = days?.get(resultKey(control.id, test.testId, asset.id));
      const decided = !!seen && hasDayIn(seen, w);
      return { assetId: asset.id, name: asset.name, outcomes: [{ role: 'direct' as const, result: decided ? ('pass' as const) : ('no_data' as const) }] };
    });
  return evaluateTechnicalTest({ assets, periodicity, windowClosed: true }, data.signals.parameters).status === 'correct';
}

// Los días de cada activo, ordenados una sola vez, para preguntar «¿hay alguno en la ventana?» sin recorrerlos todos por cada ventana.
const sortedDays = new WeakMap<ReadonlySet<number>, number[]>();
function hasDayIn(days: ReadonlySet<number>, w: EvaluationWindow): boolean {
  let sorted = sortedDays.get(days);
  if (!sorted) {
    sorted = [...days].sort((a, b) => a - b);
    sortedDays.set(days, sorted);
  }
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < w.start.getTime()) lo = mid + 1;
    else hi = mid;
  }
  return lo < sorted.length && sorted[lo] < w.end.getTime();
}

/** Las fechas (ms) en que la evidencia manual de la prueba fue válida: entregas que cuentan y el resultado registrado. */
function manualDates(items: ReadonlyArray<ControlEvidenceItem>, result: { result: string; at: Date } | null): number[] {
  const dates = items.flatMap((e) => (e.history ?? [{ state: e.state, submittedAt: e.submittedAt }]).flatMap((h) => (h.state === 'compliant' && h.submittedAt ? [h.submittedAt.getTime()] : [])));
  if (result && result.result !== 'exception') dates.push(result.at.getTime());
  return dates;
}

/** Los días en que al menos PR-03 % de los activos en alcance tuvieron un resultado del test (la misma cobertura que pide la prueba técnica). */
function technicalDates(control: ReadoutControl, test: ReadoutTest, data: ReadoutData): number[] {
  const assets = data.assets.filter((a) => dimensionOfAssetType(a.type) === test.dimension);
  if (assets.length === 0) return [];
  const tally = new Map<number, number>();
  for (const asset of assets) for (const day of data.signals.resultDays?.get(resultKey(control.id, test.testId, asset.id)) ?? []) tally.set(day, (tally.get(day) ?? 0) + 1);
  return [...tally].filter(([, n]) => (n / assets.length) * 100 >= data.signals.parameters.assetCoverage).map(([day]) => day);
}

/** PR-07 `rolling` · Los vencimientos ya ocurridos del requisito: cada prueba lleva su propia cadena (la evidencia de una no renueva a la otra); un vencimiento falta si falta en alguna. */
function rollingWindowsOf(control: ReadoutControl, r: RequirementReadout, data: ReadoutData, period: AuditedPeriod): RequirementWindows {
  const periodicity = r.requirement.periodicity;
  const now = data.signals.now;
  const own = control.origin === 'own';
  if (!own && r.tests.length === 0) return { total: 0, missing: [] };
  const chains = own
    ? [{ dates: manualDates(control.evidence, null), technical: false }]
    : r.tests.flatMap((t) => {
        const links = t.test.links ?? NO_LINKS;
        if (t.assetCoverage !== null) return [{ dates: technicalDates(control, t.test, data), technical: true }];
        if (t.test.testType === 'technical' && links.dependencies.length > 0) return [];
        const result = t.test.testType === 'documentary' ? null : (control.manualResults?.get(t.test.testId) ?? null);
        return [{ dates: manualDates(control.evidence.filter((e) => e.testId === t.test.testId), result), technical: false }];
      });
  let total = 0;
  const missing = new Map<number, MissingWindow>();
  for (const chain of chains) {
    const { closed, missing: gaps } = rollingWindowsWithin(periodicity, period, chain.dates, now);
    total = Math.max(total, closed.length);
    for (const w of gaps) if (!missing.has(w.start.getTime())) missing.set(w.start.getTime(), { requirementCode: r.requirement.code, window: w, technical: chain.technical });
  }
  return { total, missing: [...missing.values()].sort((a, b) => a.window.start.getTime() - b.window.start.getTime()) };
}

function windowsOf(control: ReadoutControl, r: RequirementReadout, data: ReadoutData): RequirementWindows {
  const { period } = data.signals;
  const periodicity = r.requirement.periodicity;
  if (!period || r.status === 'not_applicable') return { total: 0, missing: [] };
  if (data.signals.parameters.validityWindows === 'rolling') return hasPeriodWindows(periodicity, 'rolling') ? rollingWindowsOf(control, r, data, period) : { total: 0, missing: [] };
  const windows = closedWindowsWithin(periodicity, period, data.signals.now);
  const own = control.origin === 'own';
  if (windows.length === 0 || (!own && r.tests.length === 0)) return { total: 0, missing: [] };
  const missing: MissingWindow[] = [];
  for (const w of windows) {
    const uncovered = own
      ? !manualCovers(control.evidence, null, w)
      : r.tests.some((t) => {
          const links = t.test.links ?? NO_LINKS;
          if (t.assetCoverage !== null) return !technicalCovers(control, t.test, periodicity, w, data);
          if (t.test.testType === 'technical' && links.dependencies.length > 0) return false;
          const result = t.test.testType === 'documentary' ? null : (control.manualResults?.get(t.test.testId) ?? null);
          return !manualCovers(control.evidence.filter((e) => e.testId === t.test.testId), result, w);
        });
    if (uncovered) missing.push({ requirementCode: r.requirement.code, window: w, technical: !own && r.tests.some((t) => t.assetCoverage !== null) });
  }
  return { total: windows.length, missing };
}

const levelInput = (requirements: RequirementReadout[]) =>
  requirements.map((r) => ({ status: r.status, tests: r.tests.map((t) => ({ status: t.status, documentary: (t.test.testType ?? r.requirement.type) === 'documentary' })) }));

export function readControl(control: ReadoutControl, data: ReadoutData): ControlReadout {
  const requirements: RequirementReadout[] =
    control.origin === 'own'
      ? [ownRequirement(control, data)]
      : (control.requirements ?? []).map((requirement) => {
          const tests = requirement.tests.map((test) => ({ test, ...evaluateTest(control, { requirement, test }, data) }));
          return { requirement, status: evaluateRequirement({ isApplicable: requirement.isApplicable, tests: tests.map((t) => t.status) }), tests };
        });

  const windows = requirements.map((r) => windowsOf(control, r, data));
  const missing = windows.flatMap((w) => w.missing);
  const solid: SolidConditions = {
    periodComplete: missing.length === 0,
    coverageFull: requirements.every((r) => r.tests.every((t) => t.assetCoverage === null || t.assetCoverage.inScope === 0 || (t.assetCoverage.withResult / t.assetCoverage.inScope) * 100 >= data.signals.parameters.solidAssetCoverage)),
  };
  const level = evaluateControlLevel(levelInput(requirements), data.signals.parameters, solid);

  let period: PeriodReadout | null = null;
  if (data.signals.period) {
    const adjusted = requirements.map((r, i) => ({ ...r, status: requirementStatusInPeriod(r.status, windows[i].missing) }));
    const view = evaluateControlLevel(levelInput(adjusted), data.signals.parameters, solid);
    const total = windows.reduce((n, w) => n + w.total, 0);
    period = {
      level: view.level,
      complies: view.complies,
      windows: { total, withEvidence: total - missing.length },
      missing: missing.map((m) => ({ requirementCode: m.requirementCode, windowStart: dayOf(m.window.start), windowEnd: windowEndDate(m.window) as string })),
    };
  }
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

  // MD-504 · D132: el estado de gestión sale del nivel del motor y de lo que las personas hicieron. El inicio de la ventana es el del control (la más reciente de sus requisitos).
  const periodicities = requirements.filter((r) => r.status !== 'not_applicable').map((r) => r.requirement.periodicity);
  const loads = [
    ...control.evidence.flatMap((e) => (e.history ?? [{ submittedAt: e.submittedAt }]).flatMap((h) => (h.submittedAt ? [h.submittedAt] : []))),
    ...(control.management?.resultDates ?? []),
  ];
  const management = deriveManagement({
    complies: level.complies,
    directFail: requirements.some((r) => r.tests.some((t) => t.failingAssetIds.length > 0)),
    windowStart: controlWindowStart(periodicities, data.signals.now, data.signals.parameters.validityWindows),
    approvals: control.management?.approvals ?? [],
    loads,
  });

  return {
    control,
    managementState: management.state,
    management,
    rollupState: level.state === 'effective' && !countsAsCompliant(management.state) ? 'evaluating' : level.state,
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
    tests: [...unique.values()].map((u) => ({ test: u.test, state: legacyTestState(u.status), status: u.status, manual: u.detail.manual })),
    approval: control.approval,
    level: level.level,
    levelValue: level.levelValue,
    complies: level.complies,
    cPercent: level.cPercent,
    decided: level.decided,
    requirements,
    blockingRequirements: level.blocking.map((i) => requirements[i]),
    period,
  };
}

/** El código interno de un control (`IAC-2`, `C10`) se ordena por su prefijo y luego por su número: `IAC-2` antes que `IAC-10`. */
export function compareOwnCode(a: string, b: string): number {
  const split = (c: string) => ({ prefix: c.replace(/\d.*$/, ''), n: Number(/\d+/.exec(c)?.[0] ?? 0) });
  const x = split(a);
  const y = split(b);
  return x.prefix !== y.prefix ? x.prefix.localeCompare(y.prefix) : x.n - y.n || a.localeCompare(b);
}
