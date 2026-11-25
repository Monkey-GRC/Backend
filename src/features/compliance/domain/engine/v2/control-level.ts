import type { ControlState } from '../states';
import { EvaluationParameters } from '../../../../../common/evaluation-parameters/parameters';
import { ControlLevel, LEVEL_VALUE, RequirementStatus, TestStatus } from './types';

// El control: C% y nivel (§5 del libro, R1 a R6, §9).

export type RequirementForLevel = { status: RequirementStatus; tests: readonly { status: TestStatus; documentary: boolean }[] };

/** Lo que Sólido exige además de Adecuado sin observaciones (R5, R6, MD-500): evidencia en todas las ventanas cerradas del período y cobertura total de activos. */
export type SolidConditions = { periodComplete: boolean; coverageFull: boolean };

export type ControlLevelEvaluation = {
  level: ControlLevel;
  levelValue: number;
  /** R4: un control cumple solo en Adecuado o Sólido. */
  complies: boolean;
  /** Requisitos en Cumple ÷ requisitos aplicables × 100, con dos decimales; `null` si no hay aplicables. */
  cPercent: number | null;
  applicable: number;
  compliant: number;
  /** Requisitos ya decididos: Cumple, No cumple o Vencido. */
  measured: number;
  /** Decidido para el marco y la categoría: su nivel no es «No evaluado» y ningún requisito sigue Pendiente. */
  decided: boolean;
  /** Los requisitos aplicables que impiden el 100 % (REQ-026). */
  blocking: number[];
  /** El estado que el resto del producto ya entiende (`control_state`), derivado del nivel y de los requisitos. */
  state: ControlState;
};

/**
 * Nivel de un control. Se comprueba primero «No evaluado» (ningún requisito aplicable tiene todavía evidencia); si no, el primer nivel cuya regla se cumpla:
 * Sólido (Adecuado sin observaciones, con evidencia en todas las ventanas cerradas del período y cobertura total de activos), Adecuado (C% = 100), Parcial (PR-01 ≤ C% < 100), Débil (PR-02 ≤ C% < PR-01) e Ineficaz (C% < PR-02).
 *
 * R2: si el documento base falta, está vencido o no está aprobado, el nivel máximo es Débil. Mientras el módulo Documentos no exista (DT-114) el documento base son las pruebas
 * documentales del control.
 *
 * Parcial exige además un plan de remediación por cada excepción (D140); ese plan todavía no existe (MD-504, DT-114): hoy Parcial se asigna por C%.
 */
export function evaluateControlLevel(requirements: readonly RequirementForLevel[], params: EvaluationParameters, solid: SolidConditions = { periodComplete: true, coverageFull: true }): ControlLevelEvaluation {
  const indexed = requirements.map((r, index) => ({ ...r, index })).filter((r) => r.status !== 'not_applicable');
  const compliant = indexed.filter((r) => r.status === 'compliant').length;
  const measured = indexed.filter((r) => r.status === 'compliant' || r.status === 'non_compliant' || r.status === 'expired').length;
  const blocking = indexed.filter((r) => r.status !== 'compliant').map((r) => r.index);
  const cPercent = indexed.length > 0 ? Math.round((compliant / indexed.length) * 10000) / 100 : null;

  const documentary = indexed.flatMap((r) => r.tests.filter((t) => t.documentary));
  const baseDocumentOk = documentary.every((t) => t.status === 'correct' || t.status === 'observation' || t.status === 'not_applicable');
  const observations = indexed.some((r) => r.tests.some((t) => t.status === 'observation'));

  let level: ControlLevel;
  if (indexed.length === 0 || indexed.every((r) => r.status === 'pending')) level = 'not_evaluated';
  else {
    const c = cPercent as number;
    if (c >= 100) level = observations || !solid.periodComplete || !solid.coverageFull ? 'adequate' : 'solid';
    else if (c >= params.partialThreshold) level = 'partial';
    else if (c >= params.weakThreshold) level = 'weak';
    else level = 'ineffective';
    if (!baseDocumentOk && LEVEL_VALUE[level] > LEVEL_VALUE.weak) level = 'weak';
  }

  const complies = level === 'adequate' || level === 'solid';
  let state: ControlState;
  if (indexed.length === 0) state = 'no_tests';
  else if (complies) state = 'effective';
  else if (indexed.some((r) => r.status === 'non_compliant')) state = 'ineffective';
  else if (indexed.some((r) => r.status === 'expired')) state = 'expired';
  else state = 'evaluating';

  return {
    level,
    levelValue: LEVEL_VALUE[level],
    complies,
    cPercent,
    applicable: indexed.length,
    compliant,
    measured,
    decided: level !== 'not_evaluated' && !indexed.some((r) => r.status === 'pending'),
    blocking,
    state,
  };
}
