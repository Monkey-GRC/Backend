import { AssetResult, TestState } from './states';

export type AutomatedTestCounts = {
  /** Activos del universo del test, con los excluidos incluidos. */
  total: number;
  excluded: number;
  compliant: number;
  nonCompliant: number;
  errors: number;
};

export type AutomatedTestEvaluation = {
  state: TestState;
  applicable: number;
  evaluated: number;
  pending: number;
  /** evaluados / aplicables. `null` si no hay aplicables: no se inventa un número. */
  coverage: number | null;
  /** conformes / evaluados. `null` si no se evaluó nada. */
  conformity: number | null;
};

/**
 * Estado de un test automatizado a partir de lo que dijo cada activo (RN-05 a RN-11).
 *
 * Solo es `compliant` con el 100% de los activos aplicables evaluados y conformes: 45 de 50 conformes y 5 sin evaluar es `evaluating`, no cumple. Un
 * resultado de `non_compliant` prevalece sobre `error` y sobre lo pendiente. La ausencia de activos o de ejecución nunca produce cumplimiento.
 */
export function evaluateAutomatedTest(counts: AutomatedTestCounts): AutomatedTestEvaluation {
  for (const [key, value] of Object.entries(counts)) {
    if (!Number.isInteger(value) || value < 0) throw new RangeError(`${key} debe ser un entero no negativo (llegó ${value})`);
  }
  const applicable = counts.total - counts.excluded;
  const evaluated = counts.compliant + counts.nonCompliant;
  const pending = applicable - counts.compliant - counts.nonCompliant - counts.errors;
  const coverage = applicable > 0 ? evaluated / applicable : null;
  const conformity = evaluated > 0 ? counts.compliant / evaluated : null;

  let state: TestState;
  if (applicable <= 0) state = 'no_assets';
  else if (pending < 0) state = 'error'; // las cuentas no cierran: es una inconsistencia, no un resultado
  else if (counts.nonCompliant > 0) state = 'non_compliant';
  else if (counts.errors > 0) state = 'error';
  else if (evaluated === 0) state = 'pending';
  else if (pending > 0) state = 'evaluating';
  else state = 'compliant';

  return { state, applicable, evaluated, pending, coverage, conformity };
}

/**
 * Cuenta los resultados por activo y evalúa el test. `not_applicable` no entra al universo; `excluded` entra al total y sale de los aplicables.
 * Un activo sin resultado todavía debe llegar como `pending`: lo que no se ejecutó no cuenta como cumplido.
 */
export function evaluateAutomatedTestFromAssets(results: readonly AssetResult[]): AutomatedTestEvaluation {
  const universe = results.filter((r) => r !== 'not_applicable');
  const count = (value: AssetResult) => universe.filter((r) => r === value).length;
  return evaluateAutomatedTest({
    total: universe.length,
    excluded: count('excluded'),
    compliant: count('compliant'),
    nonCompliant: count('non_compliant'),
    errors: count('error'),
  });
}
