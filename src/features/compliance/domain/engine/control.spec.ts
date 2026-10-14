import { ControlTestInput, evaluateControl } from './control';
import { TestState } from './states';

const t = (testId: string, state: TestState, patch: Partial<ControlTestInput> = {}): ControlTestInput => ({ testId, state, mandatory: true, active: true, ...patch });
const control = (tests: ControlTestInput[], missingDimensions = 0) => evaluateControl({ tests, missingDimensions });

describe('evaluateControl (RN-12 a RN-16)', () => {
  it('4 de 5 tests cumplen → avance 80% y NO EFECTIVO: el porcentaje informa, el estado decide', () => {
    const r = control([t('a', 'compliant'), t('b', 'compliant'), t('c', 'compliant'), t('d', 'compliant'), t('e', 'non_compliant')]);
    expect(r.state).toBe('ineffective');
    expect(r.progress).toBeCloseTo(0.8);
    expect(r.blockingTests).toEqual(['e']);
  });

  it('todos cumplen → EFECTIVO, avance 100% y nada que lo impida', () => {
    const r = control([t('a', 'compliant'), t('b', 'compliant')]);
    expect(r).toMatchObject({ state: 'effective', progress: 1, blockingTests: [] });
  });

  it('sin tests ni dimensiones que cubrir → SIN TESTS, sin inventar un avance', () => {
    expect(control([])).toMatchObject({ state: 'no_tests', progress: null });
  });

  it('un test no obligatorio, no vigente, NO APLICA o DESACTIVADO no cuenta', () => {
    const r = control([t('a', 'compliant'), t('b', 'non_compliant', { mandatory: false }), t('c', 'non_compliant', { active: false }), t('d', 'not_applicable'), t('e', 'deactivated')]);
    expect(r.state).toBe('effective');
    expect(r.countedTests).toBe(1);
  });

  it('una dimensión que el control exige y no tiene test → INCOMPLETO, nunca EFECTIVO', () => {
    const r = control([t('a', 'compliant')], 1);
    expect(r.state).toBe('incomplete');
    expect(r.progress).toBeCloseTo(0.5); // 1 cumple de (1 test + 1 dimensión)
  });

  it('solo dimensiones faltantes y ningún test → INCOMPLETO, no SIN TESTS', () => {
    expect(control([], 2).state).toBe('incomplete');
  });

  it('el orden de los estados: no efectivo > vencido > error > incompleto > en evaluación', () => {
    expect(control([t('a', 'error'), t('b', 'expired'), t('c', 'non_compliant')], 1).state).toBe('ineffective');
    expect(control([t('a', 'error'), t('b', 'expired')], 1).state).toBe('expired');
    expect(control([t('a', 'error'), t('b', 'pending')], 1).state).toBe('error');
    expect(control([t('a', 'pending')], 1).state).toBe('incomplete');
    expect(control([t('a', 'pending'), t('b', 'compliant')]).state).toBe('evaluating');
  });

  it.each<TestState>(['pending', 'evaluating', 'in_review', 'no_assets'])('un test en %s deja el control EN EVALUACIÓN, nunca efectivo', (state) => {
    expect(control([t('a', 'compliant'), t('b', state)]).state).toBe('evaluating');
  });

  it('un test obligatorio nuevo entra PENDIENTE y vuelve no efectivo a un control que era efectivo', () => {
    const before = [t('a', 'compliant'), t('b', 'compliant')];
    expect(control(before).state).toBe('effective');
    expect(control([...before, t('nuevo', 'pending')]).state).toBe('evaluating');
  });

  it('un valor inválido de dimensiones se rechaza', () => {
    expect(() => control([], -1)).toThrow(RangeError);
  });
});
