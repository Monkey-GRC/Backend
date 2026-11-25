import { compareOwnCode, dimensionOfAssetType, legacyTestState, readControl, readinessOf } from './control-readout';
import { asset, control, data, readoutTest, requirement } from './readout.fixtures';

describe('dimensionOfAssetType (§2, D5)', () => {
  it('servidor, base de datos, servicio en nube y aplicación son dimensiones', () => {
    expect(['server', 'database', 'cloud_service', 'application'].map(dimensionOfAssetType)).toEqual(['server', 'database', 'cloud', 'app']);
  });
  it('endpoint, dispositivo de red y documentación se monitorean pero no son dimensión', () => {
    expect(['endpoint', 'network_device', 'documentation', 'otro'].map(dimensionOfAssetType)).toEqual([null, null, null, null]);
  });
});

describe('readControl · el control con el motor v2', () => {
  it('sin ningún resultado queda «Sin medir»: lo que no se midió no es cumplimiento ni fallo', () => {
    const c = control([requirement('r1', [readoutTest('a', 'technical', { dimension: 'cloud' })]), requirement('r2', [readoutTest('b', 'documentary')])]);
    const r = readControl(c, data([c], [asset('1', 'cloud_service')]));
    expect(r).toMatchObject({ readiness: 'not_measured', state: 'evaluating', level: 'not_evaluated', progress: { done: 0, total: 2 }, coverage: { measured: 0, applicable: 2 }, failing: [] });
  });
  it('los campos de siempre se derivan del nivel: progress es el C%, el semáforo sale del avance', () => {
    const c = control(
      Array.from({ length: 5 }, (_, i) => requirement(`r${i}`, [readoutTest(`d${i}`, 'operational')])),
      { evidence: [0, 1, 2, 3].map((i) => ({ testId: `d${i}`, state: 'compliant' as const, submittedAt: new Date('2026-11-10T00:00:00Z') })) },
    );
    const r = readControl(c, data([c], []));
    expect(r).toMatchObject({ progress: { done: 4, total: 5 }, coverage: { measured: 4, applicable: 5 }, cPercent: 80, level: 'partial', complies: false, readiness: 'almost_ready' });
    expect(r.blockingRequirements.map((b) => b.requirement.id)).toEqual(['r4']);
  });
  it('un requisito marcado No aplica sale del cálculo', () => {
    const c = control([requirement('r1', [readoutTest('a', 'operational')], { isApplicable: false }), requirement('r2', [readoutTest('b', 'operational')])]);
    expect(readControl(c, data([c], [])).progress).toEqual({ done: 0, total: 1 });
  });
  it('las pruebas salen con el estado de siempre derivado de test_status, sin repetirse', () => {
    const shared = readoutTest('shared', 'operational');
    const c = control([requirement('r1', [shared]), requirement('r2', [shared, readoutTest('x', 'operational')])], {
      evidence: [{ testId: 'shared', state: 'compliant', submittedAt: new Date('2026-11-10T00:00:00Z') }],
    });
    const r = readControl(c, data([c], []));
    expect(r.tests.map((t) => [t.test.testId, t.state, t.status])).toEqual([['shared', 'compliant', 'correct'], ['x', 'pending', 'pending']]);
  });
  it('MD-499 · la evidencia validada de una prueba de fuente integration en respaldo cuenta igual que la de una manual', () => {
    const evidence = [{ testId: 'a', state: 'compliant' as const, submittedAt: new Date('2026-11-10T00:00:00Z') }];
    const read = (primarySource: string) => {
      const c = control([requirement('r1', [readoutTest('a', 'operational', { primarySource, integrationCategory: 'Gestión de Identidades' })])], { evidence });
      const { test: _test, ...calc } = readControl(c, data([c], [])).requirements[0].tests[0];
      return calc;
    };
    expect(read('integration')).toEqual(read('manual'));
    expect(read('integration').status).toBe('correct');
  });
  it('el detalle de una prueba manual da window_end de su periodicidad', () => {
    const c = control([requirement('r1', [readoutTest('a', 'operational')], { periodicity: 'quarterly' })]);
    expect(readControl(c, data([c], [])).requirements[0].tests[0]).toMatchObject({ status: 'pending', windowEnd: '2026-12-31', checks: null, assetCoverage: null });
  });
  it('una prueba en Excepción o Vencida sin activo que señalar aparece en «en qué falla» con su prueba', () => {
    const c = control([requirement('r1', [readoutTest('a', 'operational', { dimension: 'process' })])], { evidence: [{ testId: 'a', state: 'non_compliant', submittedAt: null }] });
    const r = readControl(c, data([c], []));
    expect(r.failing).toEqual([{ dimension: 'process', affected: [{ kind: 'test', id: 'a', displayName: null, displayNameEn: null, testCode: 'T-a' }] }]);
  });
});

describe('legacyTestState · test_status → test_state', () => {
  it('correct y observation → compliant · exception → non_compliant · el resto igual', () => {
    expect((['correct', 'observation', 'exception', 'expired', 'not_applicable', 'pending'] as const).map(legacyTestState)).toEqual(['compliant', 'compliant', 'non_compliant', 'expired', 'not_applicable', 'pending']);
  });
});

describe('readinessOf · el semáforo (D62, P16)', () => {
  const base = { done: 0, total: 5, measured: 0, failingTests: 0 };
  it('sin nada medido, o sin requisitos, es «Sin medir»', () => {
    expect(readinessOf({ ...base, state: 'evaluating' })).toBe('not_measured');
    expect(readinessOf({ ...base, state: 'no_tests', measured: 3 })).toBe('not_measured');
  });
  it('Preparado solo si el control cumple', () => expect(readinessOf({ state: 'effective', done: 5, total: 5, measured: 5, failingTests: 0 })).toBe('ready'));
  it('Casi listo: nada falla, o el avance llega al 80 %; Requiere trabajo, menos', () => {
    expect(readinessOf({ state: 'evaluating', done: 2, total: 5, measured: 2, failingTests: 0 })).toBe('almost_ready');
    expect(readinessOf({ state: 'ineffective', done: 4, total: 5, measured: 5, failingTests: 1 })).toBe('almost_ready');
    expect(readinessOf({ state: 'ineffective', done: 3, total: 5, measured: 5, failingTests: 2 })).toBe('needs_work');
  });
});

describe('compareOwnCode', () => {
  it('ordena por prefijo y por número, no por texto: IAC-2 antes que IAC-10', () => {
    expect(['IAC-10', 'C02', 'IAC-2', 'C10'].sort(compareOwnCode)).toEqual(['C02', 'C10', 'IAC-2', 'IAC-10']);
  });
});
