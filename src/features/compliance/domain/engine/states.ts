// Estados que el motor calcula en cada nivel (modelo-datos.md §9, contracts/enums.md «Estados de evaluación», D68). Se derivan: nunca son una columna editable.

/** Resultado de un activo en un test. `not_applicable` queda fuera del universo, igual que `excluded`. */
export type AssetResult = 'compliant' | 'non_compliant' | 'pending' | 'error' | 'excluded' | 'not_applicable';

export type EvidenceState = 'compliant' | 'non_compliant' | 'pending' | 'in_review' | 'expired' | 'not_applicable';

export type TestState =
  | 'compliant'
  | 'non_compliant'
  | 'pending'
  | 'evaluating'
  | 'in_review'
  | 'expired'
  | 'error'
  | 'no_assets'
  | 'not_applicable'
  | 'deactivated';

export type ControlState = 'effective' | 'ineffective' | 'expired' | 'error' | 'incomplete' | 'evaluating' | 'no_tests';

/** Categoría y marco comparten estados (RN-17 a RN-19). */
export type RollupState = 'compliant' | 'non_compliant' | 'evaluating' | 'no_controls' | 'out_of_scope';
