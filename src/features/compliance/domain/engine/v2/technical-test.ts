import { EvaluationParameters } from '../../../../../common/evaluation-parameters/parameters';
import { CheckResult, Periodicity, TestStatus } from './types';

// Prueba técnica (T-04, T-05, T-06, §9 del libro). Lógica pura: recibe lo que dijo cada check en cada activo y devuelve el estado de la prueba.

export type CheckRole = 'direct' | 'complementary';
export type CheckOutcome = {
  role: CheckRole;
  result: CheckResult;
  /** El activo tuvo un resultado, pero de una ventana anterior (o más viejo que la frescura): no sirve para la ventana vigente y se trata como «sin datos». */
  stale?: boolean;
};
export type AssetOutcomes = { assetId: string; name: string; outcomes: readonly CheckOutcome[] };

export type TechnicalTestInput = {
  /** Los activos del alcance del cliente para esta prueba, cada uno con lo que dijeron sus checks. */
  assets: readonly AssetOutcomes[];
  periodicity: Periodicity | null;
  /** La ventana ya cerró: un activo sin resultado es excepción por cobertura (D140). Con la ventana abierta, pendiente. */
  windowClosed?: boolean;
};

export type CheckCounts = { directPass: number; directFail: number; directException: number; noData: number; complementaryFail: number };

export type TechnicalEvaluation = {
  /** `false` si ningún check Directo aplica a la infraestructura del cliente: la prueba no es «No aplica», se prueba a mano (T-05). */
  applicable: boolean;
  status: TestStatus;
  checks: CheckCounts;
  /** Activos en alcance con resultado ÷ activos en alcance (T-04 b). */
  assetCoverage: { withResult: number; inScope: number };
  /** Los activos con un Directo en FAIL sin excepción vigente. */
  failingAssetIds: string[];
};

const NONE: TechnicalEvaluation = {
  applicable: false,
  status: 'pending',
  checks: { directPass: 0, directFail: 0, directException: 0, noData: 0, complementaryFail: 0 },
  assetCoverage: { withResult: 0, inScope: 0 },
  failingAssetIds: [],
};

// De lo más grave a lo más leve: lo que decide cuando varias fuentes opinan sobre la misma prueba (FAIL prevalece, C8).
const SEVERITY: readonly TestStatus[] = ['exception', 'expired', 'pending', 'observation', 'correct'];

/** El peor de varios estados: una Dependencia y los Directos de la misma prueba, o las pruebas de un requisito. `not_applicable` no opina. Sin ninguno, `null`. */
export function worstStatus(statuses: readonly TestStatus[]): TestStatus | null {
  const counted = statuses.filter((s) => s !== 'not_applicable');
  if (counted.length === 0) return statuses.length > 0 ? 'not_applicable' : null;
  return SEVERITY.find((s) => (counted as TestStatus[]).includes(s)) ?? null;
}

/**
 * Estado de una prueba técnica (T-04):
 *  · Solo deciden los checks Directos aplicables; un Complementario en FAIL es observación (S-04).
 *  · Un Directo en FAIL sin excepción es excepción de la prueba, y prevalece sobre todo lo demás (C1, C8).
 *  · La cobertura de activos debe llegar a PR-03: un activo en alcance sin resultado deja la prueba pendiente mientras la ventana está abierta (C2, C4, C7) y la pasa a excepción al
 *    cerrarla (D140). Si lo que falta es un resultado de una ventana anterior, la prueba está vencida (salvo en lo permanente, donde solo queda pendiente).
 *  · Un FAIL con excepción vigente cuenta como PASS (C5), marcado en el conteo.
 */
export function evaluateTechnicalTest(input: TechnicalTestInput, params: EvaluationParameters): TechnicalEvaluation {
  const inScope = input.assets.filter((a) => a.outcomes.some((o) => o.role === 'direct' && o.result !== 'not_applicable'));
  if (inScope.length === 0) return NONE;

  const count = { directPass: 0, directFail: 0, directException: 0, noData: 0, complementaryFail: 0 };
  const failing: string[] = [];
  let withResult = 0;
  let staleGap = false;
  for (const asset of inScope) {
    let decided = true;
    for (const o of asset.outcomes) {
      if (o.role === 'complementary') {
        if (o.result === 'fail') count.complementaryFail++;
        continue;
      }
      if (o.result === 'not_applicable') continue;
      if (o.result === 'pass') count.directPass++;
      else if (o.result === 'fail_with_exception') count.directException++;
      else if (o.result === 'fail') {
        count.directFail++;
        if (!failing.includes(asset.assetId)) failing.push(asset.assetId);
      } else {
        count.noData++;
        decided = false;
        if (o.stale) staleGap = true;
      }
    }
    if (decided) withResult++;
  }

  const coverage = (withResult / inScope.length) * 100;
  let status: TestStatus;
  if (count.directFail > 0) status = 'exception';
  else if (coverage < params.assetCoverage) status = input.windowClosed ? 'exception' : staleGap && input.periodicity !== 'permanent' ? 'expired' : 'pending';
  else status = count.complementaryFail > 0 ? 'observation' : 'correct';

  return { applicable: true, status, checks: count, assetCoverage: { withResult, inScope: inScope.length }, failingAssetIds: failing };
}

/** Un FAIL con una excepción vigente cuenta como PASS y se muestra marcado (D135); sin excepción, es FAIL. */
export const withException = (result: CheckResult, hasException: boolean): CheckResult => (result === 'fail' && hasException ? 'fail_with_exception' : result);

/** De la lectura de los motores a `check_result` (§9): `passed`→pass, `failed`→fail, `not_applicable`→no aplica, `not_run` o `invalid` (tras los reintentos)→sin datos. */
export function checkResultOf(engine: 'passed' | 'failed' | 'invalid' | 'not_applicable' | 'not_run' | null | undefined): CheckResult {
  switch (engine) {
    case 'passed': return 'pass';
    case 'failed': return 'fail';
    case 'not_applicable': return 'not_applicable';
    default: return 'no_data';
  }
}

// --- Vínculos «N/A» (módulos y puntajes de la sonda, D141, D146) ---

export type ModuleKind = 'vulnerabilities' | 'other_module' | 'score';

/** Un vínculo sin check guarda en `module_ref` el nombre del módulo o del puntaje. Los puntajes globales son los de evaluación de configuración (sonda, bases de datos) y el marco CIS del motor de nube. */
export function classifyModuleRef(ref: string): ModuleKind {
  const text = ref.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (/(puntaje|score|evaluacion de configuracion|\bsca\b|\bcis\b)/.test(text)) return 'score';
  if (/vulnerab/.test(text)) return 'vulnerabilities';
  return 'other_module';
}

export type ModuleFacts = {
  /** Hallazgos críticos y altos abiertos del activo; `null` si no hay dato para decirlo (nunca se asume cero). */
  openCriticalHigh: number | null;
  /** Puntaje global del activo, en %; `null` si no existe. */
  scorePercent: number | null;
};

/** D141: un módulo pasa si no hay hallazgos críticos ni altos abiertos y falla si hay alguno; D146: un puntaje pasa con el umbral o más. Sin dato, «sin datos». */
export function moduleLinkResult(kind: ModuleKind, facts: ModuleFacts, params: EvaluationParameters): CheckResult {
  if (kind === 'score') return facts.scorePercent === null ? 'no_data' : facts.scorePercent >= params.scoreThreshold ? 'pass' : 'fail';
  if (kind === 'other_module' || facts.openCriticalHigh === null) return 'no_data';
  return facts.openCriticalHigh === 0 ? 'pass' : 'fail';
}
