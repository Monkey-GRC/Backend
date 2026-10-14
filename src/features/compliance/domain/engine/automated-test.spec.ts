import { AssetResult } from './states';
import { evaluateAutomatedTest, evaluateAutomatedTestFromAssets } from './automated-test';

// Los 8 casos del comité (hoja MODELO EVALUACIÓN MONKEY, regla B3), con 50 activos.
const run = (compliant: number, nonCompliant: number, errors: number, excluded = 0, total = 50) => evaluateAutomatedTest({ total, excluded, compliant, nonCompliant, errors });

describe('evaluateAutomatedTest — los 8 casos del comité', () => {
  it('C1: 45 conformes y 5 no conformes → NO CUMPLE, conformidad 90%', () => {
    const r = run(45, 5, 0);
    expect(r.state).toBe('non_compliant');
    expect(r.conformity).toBeCloseTo(0.9);
  });

  it('C2: 45 conformes y 5 sin evaluar → EN EVALUACIÓN, cobertura 90%: no cumple', () => {
    const r = run(45, 0, 0);
    expect(r.state).toBe('evaluating');
    expect(r.coverage).toBeCloseTo(0.9);
    expect(r.pending).toBe(5);
  });

  it('C3: 50 de 50 conformes → CUMPLE', () => {
    expect(run(50, 0, 0).state).toBe('compliant');
  });

  it('C4: 48 conformes y 2 con error técnico → ERROR', () => {
    expect(run(48, 0, 2).state).toBe('error');
  });

  it('C5: 3 excluidos autorizados y 47 conformes → CUMPLE', () => {
    const r = run(47, 0, 0, 3);
    expect(r.state).toBe('compliant');
    expect(r.applicable).toBe(47);
  });

  it('C6: sin activos aplicables → SIN ACTIVOS', () => {
    expect(run(0, 0, 0, 0, 0).state).toBe('no_assets');
    expect(run(0, 0, 0, 50, 50).state).toBe('no_assets');
  });

  it('C7: ninguno evaluado → PENDIENTE', () => {
    const r = run(0, 0, 0);
    expect(r.state).toBe('pending');
    expect(r.coverage).toBe(0);
    expect(r.conformity).toBeNull();
  });

  it('C8: 45 conformes, 3 no conformes y 2 con error → NO CUMPLE (prevalece el incumplimiento)', () => {
    expect(run(45, 3, 2).state).toBe('non_compliant');
  });
});

describe('evaluateAutomatedTest — reglas de borde', () => {
  it('unas cuentas que no cierran son un ERROR de inconsistencia, no un resultado', () => {
    expect(run(40, 10, 5).state).toBe('error'); // 55 resultados sobre 50 aplicables
  });

  it('un valor negativo o fraccionario es un error de programación y se rechaza', () => {
    expect(() => run(-1, 0, 0)).toThrow(RangeError);
    expect(() => run(1.5, 0, 0)).toThrow(RangeError);
  });

  it('no inventa un número cuando no hay base: sin aplicables no hay cobertura', () => {
    expect(run(0, 0, 0, 0, 0).coverage).toBeNull();
  });
});

describe('evaluateAutomatedTestFromAssets', () => {
  const many = (value: AssetResult, n: number): AssetResult[] => Array.from({ length: n }, () => value);

  it('cuenta lo que dijo cada activo; los excluidos salen del universo aplicable', () => {
    const r = evaluateAutomatedTestFromAssets([...many('compliant', 47), ...many('excluded', 3)]);
    expect(r.state).toBe('compliant');
    expect(r.applicable).toBe(47);
  });

  it('un activo que no aplica al test no entra al universo', () => {
    expect(evaluateAutomatedTestFromAssets([...many('compliant', 3), ...many('not_applicable', 2)]).applicable).toBe(3);
    expect(evaluateAutomatedTestFromAssets(many('not_applicable', 2)).state).toBe('no_assets');
  });

  it('un activo sin ejecutar (pending) impide el cumplimiento', () => {
    expect(evaluateAutomatedTestFromAssets([...many('compliant', 4), 'pending']).state).toBe('evaluating');
  });

  it('sin activos no hay cumplimiento', () => {
    expect(evaluateAutomatedTestFromAssets([]).state).toBe('no_assets');
  });
});
