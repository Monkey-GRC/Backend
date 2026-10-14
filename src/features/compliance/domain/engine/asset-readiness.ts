import { AssetResult } from './states';

export type AssetReadinessState = 'ready' | 'almost_ready' | 'needs_work' | 'not_measured';

// Los cortes del semáforo (D62, P16). El comité no define el semáforo del activo, solo su resultado en cada test (RN-05): estos cortes son los
// mismos que usa el resto del producto, para que nada se lea de dos maneras (DT-66).
export const READY_CUTOFF = 1;
export const ALMOST_READY_CUTOFF = 0.8;

export type AssetReadinessEvaluation = {
  state: AssetReadinessState;
  /** Tests con resultado que cumplen / tests con resultado. `null` si no hay ninguno: no se inventa un número. */
  percent: number | null;
  /** Tests con resultado / tests aplicables al activo. Va siempre aparte del porcentaje. `null` si no hay aplicables. */
  coverage: number | null;
  compliant: number;
  nonCompliant: number;
  /** Aplicables sin resultado todavía: pendientes y con error técnico. */
  withoutResult: number;
};

/**
 * Semáforo de UN activo a partir de su resultado en cada test (D62, MD-139).
 *
 * Porcentaje = tests con resultado que cumplen / tests con resultado. 100% sin nada pendiente → Preparado; 80% o más, o 100% de lo medido con algo
 * pendiente → Casi listo; menos de 80% → Requiere trabajo; sin nada con resultado → Sin medir.
 *
 * Un test `excluded` o `not_applicable` sale del universo. Un test `pending` o `error` NO tiene resultado: no cuenta como cumplido ni como
 * incumplido, pero tampoco deja al activo en Preparado (lo que no se midió no es cumplimiento). Un fallo de la sonda es `error`, no un
 * incumplimiento, y por eso no baja el porcentaje.
 *
 * La gravedad de un hallazgo se muestra como dato aparte y ya no decide el estado.
 */
export function evaluateAssetReadiness(results: readonly AssetResult[]): AssetReadinessEvaluation {
  const applicable = results.filter((r) => r !== 'excluded' && r !== 'not_applicable');
  const compliant = applicable.filter((r) => r === 'compliant').length;
  const nonCompliant = applicable.filter((r) => r === 'non_compliant').length;
  const evaluated = compliant + nonCompliant;
  const withoutResult = applicable.length - evaluated;
  const percent = evaluated > 0 ? compliant / evaluated : null;
  const coverage = applicable.length > 0 ? evaluated / applicable.length : null;

  let state: AssetReadinessState;
  if (percent === null) state = 'not_measured';
  else if (percent >= READY_CUTOFF && withoutResult === 0) state = 'ready';
  else if (percent >= ALMOST_READY_CUTOFF) state = 'almost_ready';
  else state = 'needs_work';

  return { state, percent, coverage, compliant, nonCompliant, withoutResult };
}
