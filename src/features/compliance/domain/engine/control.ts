import { ControlState, TestState } from './states';

export type ControlTestInput = {
  /** Identificador del test; sirve para decir cuáles impiden la efectividad. */
  testId: string;
  state: TestState;
  mandatory: boolean;
  /** Vigente: un test dado de baja no cuenta (RN-12). */
  active: boolean;
};

export type ControlInput = {
  tests: readonly ControlTestInput[];
  /** Dimensiones que el control exige y se quedan sin ningún test vigente (RN-14). */
  missingDimensions: number;
};

export type ControlEvaluation = {
  state: ControlState;
  /** Tests que cumplen / (tests que cuentan + dimensiones faltantes). `null` si el control no tiene nada que medir. */
  progress: number | null;
  /** Los tests que cuentan para el control. */
  countedTests: number;
  /** Los tests que impiden que sea efectivo (REQ-026). */
  blockingTests: string[];
  missingDimensions: number;
};

/**
 * Estado de un control (RN-12 a RN-16).
 *
 * Cuentan los tests obligatorios, vigentes y que no estén `not_applicable` ni `deactivated`. El estado, en este orden: sin tests · no efectivo ·
 * vencido · error · incompleto · en evaluación · efectivo. **Solo es efectivo si cada test que cuenta cumple**: un test `no_assets` tampoco
 * produce cumplimiento, aunque el Excel solo nombre pendiente, en evaluación y en revisión (principio 1 de §9).
 */
export function evaluateControl(c: ControlInput): ControlEvaluation {
  if (!Number.isInteger(c.missingDimensions) || c.missingDimensions < 0) throw new RangeError('missingDimensions debe ser un entero no negativo');
  const counted = c.tests.filter((t) => t.mandatory && t.active && t.state !== 'not_applicable' && t.state !== 'deactivated');
  const denominator = counted.length + c.missingDimensions;
  const has = (state: TestState) => counted.some((t) => t.state === state);

  let state: ControlState;
  if (denominator === 0) state = 'no_tests';
  else if (has('non_compliant')) state = 'ineffective';
  else if (has('expired')) state = 'expired';
  else if (has('error')) state = 'error';
  else if (c.missingDimensions > 0) state = 'incomplete';
  else if (counted.some((t) => t.state !== 'compliant')) state = 'evaluating';
  else state = 'effective';

  const compliant = counted.filter((t) => t.state === 'compliant').length;
  return {
    state,
    progress: denominator > 0 ? compliant / denominator : null,
    countedTests: counted.length,
    blockingTests: counted.filter((t) => t.state !== 'compliant').map((t) => t.testId),
    missingDimensions: c.missingDimensions,
  };
}
