import { PARAMS } from '../../controls/readout.fixtures';
import { AssetOutcomes, CheckOutcome, checkResultOf, classifyModuleRef, evaluateTechnicalTest, exceptionEndsOn, moduleLinkResult, withException, worstStatus } from './technical-test';
import { CheckResult } from './types';

const direct = (result: CheckResult, stale = false): CheckOutcome => ({ role: 'direct', result, ...(stale ? { stale } : {}) });
const asset = (i: number, ...outcomes: CheckOutcome[]): AssetOutcomes => ({ assetId: `a${i}`, name: `srv-${i}`, outcomes });
/** 50 servidores en alcance, cada uno con un Directo: `groups` dice cuántos tienen cada resultado. */
const fifty = (groups: Array<[number, CheckResult]>, extra: CheckOutcome[] = []): AssetOutcomes[] => {
  let i = 0;
  return groups.flatMap(([n, result]) => Array.from({ length: n }, () => asset(++i, direct(result), ...(i === 1 ? extra : []))));
};
const run = (assets: AssetOutcomes[], patch: Partial<Parameters<typeof evaluateTechnicalTest>[0]> = {}) => evaluateTechnicalTest({ assets, periodicity: 'monthly', ...patch }, PARAMS);

describe('prueba técnica (T-04): el ejemplo de 50 servidores, casos C1 a C9', () => {
  it('C1 · 45 PASS y 5 FAIL → Excepción', () => {
    const r = run(fifty([[45, 'pass'], [5, 'fail']]));
    expect(r.status).toBe('exception');
    expect(r.failingAssetIds).toHaveLength(5);
    expect(r.checks).toMatchObject({ directPass: 45, directFail: 5 });
  });
  it('C2 · 45 PASS y 5 sin resultado → Pendiente con la ventana abierta; Excepción por cobertura al cerrarla (D140)', () => {
    const assets = fifty([[45, 'pass'], [5, 'no_data']]);
    expect(run(assets).status).toBe('pending');
    expect(run(assets, { windowClosed: true }).status).toBe('exception');
    expect(run(assets).assetCoverage).toEqual({ withResult: 45, inScope: 50 });
  });
  it('C3 · 50 de 50 en PASS → Correcto', () => {
    const r = run(fifty([[50, 'pass']]));
    expect(r.status).toBe('correct');
    expect(r.assetCoverage).toEqual({ withResult: 50, inScope: 50 });
  });
  it('C4 · 48 PASS y 2 con error técnico (sin datos tras los reintentos) → igual que C2', () => {
    const assets = fifty([[48, 'pass'], [2, 'no_data']]);
    expect(run(assets).status).toBe('pending');
    expect(run(assets, { windowClosed: true }).status).toBe('exception');
  });
  it('C5 · 47 PASS y 3 FAIL con excepción aprobada vigente → Correcto, los 3 marcados', () => {
    const r = run(fifty([[47, 'pass'], [3, 'fail_with_exception']]));
    expect(r.status).toBe('correct');
    expect(r.checks).toMatchObject({ directPass: 47, directException: 3, directFail: 0 });
  });
  it('C6 · ningún Directo aplica a su infraestructura → no es «No aplica»: se prueba a mano (T-05)', () => {
    const r = run(fifty([[10, 'not_applicable']]));
    expect(r.applicable).toBe(false);
    expect(r.status).not.toBe('not_applicable');
    expect(run([]).applicable).toBe(false);
  });
  it('C7 · ningún resultado todavía → Pendiente', () => {
    expect(run(fifty([[50, 'no_data']])).status).toBe('pending');
  });
  it('C8 · 45 PASS, 3 FAIL y 2 sin resultado → Excepción: prevalece la falla', () => {
    expect(run(fifty([[45, 'pass'], [3, 'fail'], [2, 'no_data']])).status).toBe('exception');
  });
  it('C9 · 50 PASS y falla un check Complementario → Observación', () => {
    const r = run(fifty([[50, 'pass']], [{ role: 'complementary', result: 'fail' }]));
    expect(r.status).toBe('observation');
    expect(r.checks.complementaryFail).toBe(1);
  });
});

describe('prueba técnica: otras reglas', () => {
  it('un Complementario solo no decide: si falta un Directo la prueba sigue pendiente', () => {
    expect(run(fifty([[49, 'pass'], [1, 'no_data']], [{ role: 'complementary', result: 'fail' }])).status).toBe('pending');
  });
  it('un Complementario que pasa es evidencia de apoyo: no cambia el estado', () => {
    expect(run(fifty([[5, 'pass']], [{ role: 'complementary', result: 'pass' }])).status).toBe('correct');
  });
  it('un activo con todos sus Directos «no aplica» sale del alcance', () => {
    const r = run([asset(1, direct('pass')), asset(2, direct('not_applicable'))]);
    expect(r.assetCoverage).toEqual({ withResult: 1, inScope: 1 });
    expect(r.status).toBe('correct');
  });
  it('un resultado de una ventana anterior deja la prueba vencida; en lo permanente solo pendiente', () => {
    const assets = [asset(1, direct('pass')), asset(2, direct('no_data', true))];
    expect(run(assets).status).toBe('expired');
    expect(run(assets, { periodicity: 'permanent' }).status).toBe('pending');
  });
  it('la cobertura exigida es un parámetro (PR-03), no un número de la lógica', () => {
    const assets = fifty([[45, 'pass'], [5, 'no_data']]);
    expect(evaluateTechnicalTest({ assets, periodicity: 'monthly' }, { ...PARAMS, assetCoverage: 90 }).status).toBe('correct');
  });
  it('varios Directos en un activo: uno en FAIL basta para fallar el activo', () => {
    const r = run([asset(1, direct('pass'), direct('fail'))]);
    expect(r.status).toBe('exception');
    expect(r.failingAssetIds).toEqual(['a1']);
  });
});

describe('Dependencia (T-06) y combinación de estados', () => {
  it('el peor estado decide: excepción > vencido > pendiente > observación > correcto', () => {
    expect(worstStatus(['correct', 'observation', 'pending'])).toBe('pending');
    expect(worstStatus(['correct', 'exception', 'expired'])).toBe('exception');
    expect(worstStatus(['correct', 'correct'])).toBe('correct');
    expect(worstStatus(['not_applicable', 'correct'])).toBe('correct');
    expect(worstStatus(['not_applicable'])).toBe('not_applicable');
    expect(worstStatus([])).toBeNull();
  });
});

describe('vínculos «N/A» de módulo y de puntaje (D141, D146)', () => {
  it('un módulo pasa sin hallazgos críticos ni altos abiertos y falla con alguno', () => {
    expect(moduleLinkResult('vulnerabilities', { openCriticalHigh: 0, scorePercent: null }, PARAMS)).toBe('pass');
    expect(moduleLinkResult('vulnerabilities', { openCriticalHigh: 2, scorePercent: null }, PARAMS)).toBe('fail');
  });
  it('sin dato nunca es PASS: sin datos', () => {
    expect(moduleLinkResult('vulnerabilities', { openCriticalHigh: null, scorePercent: null }, PARAMS)).toBe('no_data');
    expect(moduleLinkResult('other_module', { openCriticalHigh: 0, scorePercent: null }, PARAMS)).toBe('no_data');
    expect(moduleLinkResult('score', { openCriticalHigh: 0, scorePercent: null }, PARAMS)).toBe('no_data');
  });
  it('un puntaje global pasa con 80 % o más (parámetro configurable)', () => {
    expect(moduleLinkResult('score', { openCriticalHigh: null, scorePercent: 80 }, PARAMS)).toBe('pass');
    expect(moduleLinkResult('score', { openCriticalHigh: null, scorePercent: 79.9 }, PARAMS)).toBe('fail');
    expect(moduleLinkResult('score', { openCriticalHigh: null, scorePercent: 79.9 }, { ...PARAMS, scoreThreshold: 70 })).toBe('pass');
  });
  it('se distingue un puntaje de un módulo por su referencia', () => {
    expect(classifyModuleRef('Detección de vulnerabilidades')).toBe('vulnerabilities');
    expect(classifyModuleRef('Monitoreo de integridad de archivos')).toBe('other_module');
    expect(classifyModuleRef('Evaluación de configuración (puntaje global)')).toBe('score');
    expect(classifyModuleRef('Marco CIS')).toBe('score');
  });
  it('un módulo que falla hace fallar la prueba como cualquier Directo', () => {
    const r = run([asset(1, direct('pass'), direct(moduleLinkResult('vulnerabilities', { openCriticalHigh: 1, scorePercent: null }, PARAMS)))]);
    expect(r.status).toBe('exception');
  });
});

describe('lecturas de los motores y excepciones (D135)', () => {
  it('passed→pass, failed→fail, not_applicable→no aplica, not_run e invalid→sin datos', () => {
    expect(['passed', 'failed', 'not_applicable', 'not_run', 'invalid', null].map((r) => checkResultOf(r as never))).toEqual(['pass', 'fail', 'not_applicable', 'no_data', 'no_data', 'no_data']);
  });
  it('una excepción solo cambia un FAIL', () => {
    expect(withException('fail', true)).toBe('fail_with_exception');
    expect(withException('fail', false)).toBe('fail');
    expect(withException('pass', true)).toBe('pass');
    expect(withException('no_data', true)).toBe('no_data');
  });
  it('dura como máximo PR-04 días desde su inicio', () => {
    const from = new Date('2026-01-01');
    expect(exceptionEndsOn(from, new Date('2026-12-31'), PARAMS).toISOString().slice(0, 10)).toBe('2026-04-01');
    expect(exceptionEndsOn(from, new Date('2026-02-01'), PARAMS).toISOString().slice(0, 10)).toBe('2026-02-01');
  });
});
