import { ControlState, RollupState } from './states';

export type ControlRef = { controlId: string; state: ControlState };

export type CategoryInput = {
  /** Una categoría que no está en el alcance no afecta el resultado (RN-17). */
  inScope: boolean;
  controls: readonly ControlRef[];
};

/**
 * Seguridad (Criterios Comunes) es obligatoria en SOC 2 aunque no se seleccione (V06); las demás solo si se eligieron. El dato `mandatory` sale de la
 * categoría del catálogo, no del código.
 */
export const isCategoryInScope = (category: { mandatory: boolean; selected: boolean }): boolean => category.mandatory || category.selected;

/** El criterio de la categoría y del marco es el mismo (RN-17, RN-19): se cumple solo cuando todos sus controles son efectivos. */
function rollupOf(controls: readonly ControlRef[]): Exclude<RollupState, 'out_of_scope'> {
  if (controls.length === 0) return 'no_controls';
  if (controls.some((c) => c.state === 'ineffective' || c.state === 'expired')) return 'non_compliant';
  if (controls.some((c) => c.state !== 'effective')) return 'evaluating';
  return 'compliant';
}

export type CategoryEvaluation = { state: RollupState; progress: number | null };

/** Estado de una categoría. Su avance es controles efectivos / controles (informa; el estado decide, REQ-003). */
export function evaluateCategory(category: CategoryInput): CategoryEvaluation {
  if (!category.inScope) return { state: 'out_of_scope', progress: null };
  const effective = category.controls.filter((c) => c.state === 'effective').length;
  return { state: rollupOf(category.controls), progress: category.controls.length > 0 ? effective / category.controls.length : null };
}

export type FrameworkEvaluation = {
  state: Exclude<RollupState, 'out_of_scope'>;
  /** Controles únicos de las categorías en alcance. */
  uniqueControls: number;
  /** efectivos / únicos. */
  progress: number | null;
  /** (efectivos + no efectivos + vencidos) / únicos: cuánto ya se pudo decidir. */
  coverage: number | null;
  /** Controles que no cumplen: no efectivos y vencidos. */
  failing: string[];
  /** Controles que todavía no se pueden decidir: error, incompleto, en evaluación, sin tests. */
  pending: string[];
};

/**
 * Estado de un marco: se evalúa sobre los controles ÚNICOS de las categorías en alcance, de modo que un control compartido cuenta una sola vez
 * (RN-19, V08). Un mismo control con dos estados distintos dentro de la misma evaluación es un error de quien llama, no un dato: se rechaza.
 */
export function evaluateFramework(categories: readonly CategoryInput[]): FrameworkEvaluation {
  const unique = new Map<string, ControlRef>();
  for (const category of categories.filter((c) => c.inScope)) {
    for (const control of category.controls) {
      const seen = unique.get(control.controlId);
      if (seen && seen.state !== control.state) {
        throw new Error(`El control ${control.controlId} llegó con dos estados (${seen.state} y ${control.state}) en la misma evaluación`);
      }
      unique.set(control.controlId, control);
    }
  }
  const controls = [...unique.values()];
  const count = (...states: ControlState[]) => controls.filter((c) => states.includes(c.state)).length;
  const ids = (predicate: (c: ControlRef) => boolean) => controls.filter(predicate).map((c) => c.controlId);

  return {
    state: rollupOf(controls),
    uniqueControls: controls.length,
    progress: controls.length > 0 ? count('effective') / controls.length : null,
    coverage: controls.length > 0 ? count('effective', 'ineffective', 'expired') / controls.length : null,
    failing: ids((c) => c.state === 'ineffective' || c.state === 'expired'),
    pending: ids((c) => c.state !== 'effective' && c.state !== 'ineffective' && c.state !== 'expired'),
  };
}
