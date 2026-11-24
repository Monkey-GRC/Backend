import { PARAMS } from '../../controls/readout.fixtures';
import { evaluateControlLevel, RequirementForLevel } from './control-level';
import { evaluateRequirement } from './requirement';
import { RequirementStatus, TestStatus } from './types';

const req = (status: RequirementStatus, ...tests: Array<TestStatus | { status: TestStatus; documentary: true }>): RequirementForLevel => ({
  status,
  tests: tests.map((t) => (typeof t === 'string' ? { status: t, documentary: false } : t)),
});
const run = (reqs: RequirementForLevel[]) => evaluateControlLevel(reqs, PARAMS);
const five = (compliant: number, rest: RequirementStatus = 'non_compliant') => Array.from({ length: 5 }, (_, i) => req(i < compliant ? 'compliant' : rest, i < compliant ? 'correct' : 'exception'));

describe('estado del requisito (§9)', () => {
  const status = (tests: TestStatus[], isApplicable = true) => evaluateRequirement({ isApplicable, tests });
  it('Cumple: todas sus pruebas en Correcto u Observación', () => {
    expect(status(['correct', 'observation'])).toBe('compliant');
    expect(status(['correct'])).toBe('compliant');
  });
  it('No cumple: al menos una en Excepción', () => expect(status(['correct', 'exception', 'pending'])).toBe('non_compliant'));
  it('Pendiente: al menos una Pendiente y ninguna en Excepción', () => expect(status(['correct', 'pending'])).toBe('pending'));
  it('Vencido: al menos una Vencida', () => expect(status(['correct', 'expired'])).toBe('expired'));
  it('No aplica: todas sus pruebas en No aplica, o el requisito marcado así; una prueba No aplica sale del cálculo', () => {
    expect(status(['not_applicable', 'not_applicable'])).toBe('not_applicable');
    expect(status(['correct'], false)).toBe('not_applicable');
    expect(status(['correct', 'not_applicable'])).toBe('compliant');
  });
  it('un requisito sin pruebas no cumple por ausencia: Pendiente', () => expect(status([])).toBe('pending'));
});

describe('nivel del control (§5 del libro, R1 a R6)', () => {
  it('No evaluado: ningún requisito tiene evidencia todavía', () => {
    const r = run(Array.from({ length: 5 }, () => req('pending', 'pending')));
    expect(r).toMatchObject({ level: 'not_evaluated', levelValue: 0, complies: false, cPercent: 0, decided: false });
  });
  it('4 de 5 requisitos = 80 % y Parcial: no cumple', () => {
    const r = run(five(4));
    expect(r).toMatchObject({ cPercent: 80, level: 'partial', levelValue: 3, complies: false, state: 'ineffective' });
    expect(r.blocking).toEqual([4]);
  });
  it('lo mismo con el documento base sin aprobar: Débil (tope R2)', () => {
    const reqs = [...five(4).slice(0, 3), req('compliant', 'correct'), req('non_compliant', { status: 'pending', documentary: true })];
    const r = run(reqs);
    expect(r.cPercent).toBe(80);
    expect(r.level).toBe('weak');
  });
  it('documento base vencido también topa en Débil, aunque el C% sea 100 menos uno', () => {
    expect(run([req('compliant', 'correct'), req('compliant', 'correct'), req('compliant', 'correct'), req('compliant', 'correct'), req('expired', { status: 'expired', documentary: true })]).level).toBe('weak');
  });
  it('Débil: 40 % ≤ C% < 75 %; Ineficaz: C% < 40 % (PR-01, PR-02)', () => {
    expect(run(five(3))).toMatchObject({ cPercent: 60, level: 'weak', levelValue: 2 });
    expect(run(five(2))).toMatchObject({ cPercent: 40, level: 'weak' });
    expect(run(five(1))).toMatchObject({ cPercent: 20, level: 'ineffective', levelValue: 1 });
    expect(run([req('compliant', 'correct'), req('non_compliant', 'exception'), req('non_compliant', 'exception'), req('non_compliant', 'exception')]).level).toBe('ineffective');
  });
  it('el límite de Parcial es 75 %: 3 de 4 es Parcial', () => {
    expect(run([...five(3).slice(0, 3), req('non_compliant', 'exception')]).level).toBe('partial');
  });
  it('Adecuado: todos cumplen y hay observaciones; Sólido: todos cumplen y no hay observaciones', () => {
    expect(run([req('compliant', 'correct'), req('compliant', 'observation')])).toMatchObject({ level: 'adequate', levelValue: 4, complies: true, state: 'effective' });
    expect(run([req('compliant', 'correct'), req('compliant', 'correct')])).toMatchObject({ level: 'solid', levelValue: 5, complies: true, cPercent: 100 });
  });
  it('un requisito Pendiente, Vencido o No cumple impide el 100 % y por tanto cumplir (R4)', () => {
    for (const status of ['pending', 'expired', 'non_compliant'] as const) expect(run([req('compliant', 'correct'), req(status, 'correct')]).complies).toBe(false);
  });
  it('los requisitos «No aplica» salen del denominador', () => {
    const r = run([req('compliant', 'correct'), req('compliant', 'correct'), req('not_applicable', 'not_applicable')]);
    expect(r).toMatchObject({ cPercent: 100, applicable: 2, level: 'solid' });
    expect(r.blocking).toEqual([]);
  });
  it('sin requisitos aplicables: No evaluado, sin C% y sin pruebas', () => {
    expect(run([])).toMatchObject({ level: 'not_evaluated', cPercent: null, state: 'no_tests', applicable: 0 });
    expect(run([req('not_applicable', 'not_applicable')])).toMatchObject({ cPercent: null, state: 'no_tests' });
  });
  it('los umbrales son parámetros: con otros valores cambia el nivel', () => {
    expect(evaluateControlLevel(five(4), { ...PARAMS, partialThreshold: 90 }).level).toBe('weak');
  });
  it('el estado de siempre se deriva: vencido si algún requisito vence y ninguno falla; evaluando si solo hay pendientes', () => {
    expect(run([req('compliant', 'correct'), req('expired', 'expired')]).state).toBe('expired');
    expect(run([req('compliant', 'correct'), req('pending', 'pending')]).state).toBe('evaluating');
  });
  it('decidido: nivel distinto de No evaluado y ningún requisito pendiente', () => {
    expect(run([req('compliant', 'correct'), req('non_compliant', 'exception')]).decided).toBe(true);
    expect(run([req('compliant', 'correct'), req('pending', 'pending')]).decided).toBe(false);
  });
});

describe('Sólido exige además el período completo y la cobertura total (R5, R6, MD-500)', () => {
  const all = [req('compliant', 'correct'), req('compliant', 'correct')];
  it('Adecuado sin observaciones, con todas las ventanas del período y 100 % de cobertura: Sólido', () => {
    expect(evaluateControlLevel(all, PARAMS, { periodComplete: true, coverageFull: true }).level).toBe('solid');
  });
  it('con una ventana cerrada sin evidencia: Adecuado, y sigue cumpliendo', () => {
    const r = evaluateControlLevel(all, PARAMS, { periodComplete: false, coverageFull: true });
    expect([r.level, r.complies]).toEqual(['adequate', true]);
  });
  it('sin cobertura total de activos: Adecuado', () => {
    expect(evaluateControlLevel(all, PARAMS, { periodComplete: true, coverageFull: false }).level).toBe('adequate');
  });
});
