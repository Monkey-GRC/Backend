// Estados del motor de evaluación v2 (modelo-datos.md §9, D130; contracts/enums/cumplimiento.md «Modelo de evaluación v2»). Se derivan: nunca son una columna editable.

export type CheckResult = 'pass' | 'fail' | 'fail_with_exception' | 'not_applicable' | 'no_data';
export type TestStatus = 'pending' | 'correct' | 'observation' | 'exception' | 'not_applicable' | 'expired';
export type RequirementStatus = 'compliant' | 'non_compliant' | 'pending' | 'expired' | 'not_applicable';
export type ControlLevel = 'not_evaluated' | 'ineffective' | 'weak' | 'partial' | 'adequate' | 'solid';

export type { Periodicity } from '../../../../../common/evaluation-parameters/parameters';
export type TestType = 'documentary' | 'population' | 'operational' | 'technical';

export const LEVEL_VALUE: Record<ControlLevel, number> = { not_evaluated: 0, ineffective: 1, weak: 2, partial: 3, adequate: 4, solid: 5 };
