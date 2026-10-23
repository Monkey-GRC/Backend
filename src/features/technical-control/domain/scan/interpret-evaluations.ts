import { InterpretedResult } from './scan.types';

// Lo que Monkey guarda de un test sobre un activo tras una corrida de la sonda (`evaluations`, DT-50).
export type TestEvaluationResult = 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
export type TestEvaluation = {
  result: TestEvaluationResult;
  /** `ok` / `fail` si la sonda pudo decidir; `null` si el test quedó pendiente o no aplica. */
  rawProbeResult: 'ok' | 'fail' | null;
  /** Porcentaje de las evaluaciones decididas que pasaron; `null` si ninguna se decidió. */
  diagnosticPercentage: number | null;
};

/**
 * Resultado de UN test sobre UN activo, a partir de lo que devolvió la sonda para los checks que lo alimentan (§9, R-04, D68).
 *
 * «Todo o nada»: un solo `failed` aplicable ⇒ no cumple. Lo que no se pudo decidir (`not_run`, `invalid`) es pendiente y **nunca cuenta como cumplido**.
 * `not_applicable` no se guarda como resultado (D56): si ningún check del test devolvió filas, el activo no tiene nada que medir y el test no le aplica.
 */
export function interpretTestResult(checkIds: ReadonlySet<string>, results: readonly InterpretedResult[]): TestEvaluation {
  const evaluable = results.filter((r) => checkIds.has(r.checkId) && r.result !== 'not_applicable');
  if (evaluable.length === 0) return { result: 'not_applicable', rawProbeResult: null, diagnosticPercentage: null };

  // Una evaluación (check + recurso) cuenta una vez aunque el test la reciba por varios caminos.
  const unique = new Map(evaluable.map((r) => [`${r.checkId}|${r.resourceKey}`, r.result]));
  const outcomes = [...unique.values()];
  const passed = outcomes.filter((r) => r === 'passed').length;
  const failed = outcomes.filter((r) => r === 'failed').length;
  const decided = passed + failed;
  const diagnosticPercentage = decided > 0 ? Math.round((passed / decided) * 10000) / 100 : null;

  if (failed > 0) return { result: 'non_compliant', rawProbeResult: 'fail', diagnosticPercentage };
  if (passed < outcomes.length) return { result: 'pending', rawProbeResult: null, diagnosticPercentage };
  return { result: 'compliant', rawProbeResult: 'ok', diagnosticPercentage };
}
