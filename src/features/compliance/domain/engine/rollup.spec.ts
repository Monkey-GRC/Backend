import { CategoryInput, ControlRef, evaluateCategory, evaluateFramework, isCategoryInScope } from './rollup';
import { ControlState } from './states';

const c = (controlId: string, state: ControlState): ControlRef => ({ controlId, state });
const many = (state: ControlState, n: number, prefix: string = state): ControlRef[] => Array.from({ length: n }, (_, i) => c(`${prefix}-${i}`, state));
const category = (controls: ControlRef[], inScope = true): CategoryInput => ({ inScope, controls });

describe('evaluateCategory (RN-17, RN-18)', () => {
  it('19 de 20 controles efectivos → 95% y NO CUMPLE', () => {
    const r = evaluateCategory(category([...many('effective', 19), c('x', 'ineffective')]));
    expect(r.state).toBe('non_compliant');
    expect(r.progress).toBeCloseTo(0.95);
  });

  it('todos efectivos → CUMPLE', () => {
    expect(evaluateCategory(category(many('effective', 3))).state).toBe('compliant');
  });

  it('un control vencido → NO CUMPLE (parámetro de D74)', () => {
    expect(evaluateCategory(category([c('a', 'effective'), c('b', 'expired')])).state).toBe('non_compliant');
  });

  it('un control sin decidir (error, incompleto, en evaluación, sin tests) → EN EVALUACIÓN', () => {
    for (const state of ['error', 'incomplete', 'evaluating', 'no_tests'] as ControlState[]) {
      expect(evaluateCategory(category([c('a', 'effective'), c('b', state)])).state).toBe('evaluating');
    }
  });

  it('sin controles → SIN CONTROLES, sin avance', () => {
    expect(evaluateCategory(category([]))).toEqual({ state: 'no_controls', progress: null });
  });

  it('fuera de alcance no afecta nada', () => {
    expect(evaluateCategory(category(many('ineffective', 5), false))).toEqual({ state: 'out_of_scope', progress: null });
  });
});

describe('isCategoryInScope (V06)', () => {
  it('Seguridad es obligatoria aunque no se seleccione; las demás solo si se eligieron', () => {
    expect(isCategoryInScope({ mandatory: true, selected: false })).toBe(true);
    expect(isCategoryInScope({ mandatory: false, selected: false })).toBe(false);
    expect(isCategoryInScope({ mandatory: false, selected: true })).toBe(true);
  });
});

describe('evaluateFramework (RN-19)', () => {
  it('una categoría que no cumple → el marco NO CUMPLE', () => {
    const r = evaluateFramework([category(many('effective', 3, 'a')), category([...many('effective', 2, 'b'), c('b-x', 'ineffective')])]);
    expect(r.state).toBe('non_compliant');
    expect(r.failing).toEqual(['b-x']);
  });

  it('todas las categorías en alcance cumplen → CUMPLE (V07)', () => {
    expect(evaluateFramework([category(many('effective', 2, 'a')), category(many('effective', 2, 'b'))]).state).toBe('compliant');
  });

  it('un control compartido entre categorías cuenta una sola vez (V08)', () => {
    const shared = c('shared', 'effective');
    const r = evaluateFramework([category([shared, c('a', 'effective')]), category([shared, c('b', 'ineffective')])]);
    expect(r.uniqueControls).toBe(3); // y no 4
    expect(r.progress).toBeCloseTo(2 / 3);
  });

  it('avance y cobertura son dos números distintos', () => {
    const r = evaluateFramework([category([...many('effective', 2, 'e'), c('n', 'ineffective'), c('p', 'evaluating'), c('t', 'no_tests')])]);
    expect(r.progress).toBeCloseTo(2 / 5);
    expect(r.coverage).toBeCloseTo(3 / 5); // efectivos + no efectivos + vencidos
    expect(r.failing).toEqual(['n']);
    expect(r.pending).toEqual(['p', 't']);
  });

  it('las categorías fuera de alcance no entran a la cuenta', () => {
    const r = evaluateFramework([category(many('effective', 2, 'a')), category(many('ineffective', 9, 'z'), false)]);
    expect(r.state).toBe('compliant');
    expect(r.uniqueControls).toBe(2);
  });

  it('sin controles en alcance → SIN CONTROLES', () => {
    expect(evaluateFramework([category([], true)]).state).toBe('no_controls');
    expect(evaluateFramework([])).toMatchObject({ state: 'no_controls', progress: null, coverage: null });
  });

  it('el mismo control con dos estados en una evaluación es un error de quien llama', () => {
    expect(() => evaluateFramework([category([c('a', 'effective')]), category([c('a', 'ineffective')])])).toThrow(/dos estados/);
  });
});
