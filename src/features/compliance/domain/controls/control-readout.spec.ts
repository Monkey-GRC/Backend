import { compareOwnCode, dimensionOfAssetType, legacyTestState, readControl, readinessOf } from './control-readout';
import { asset, control, correct, data, readoutTest, requirement } from './readout.fixtures';

describe('dimensionOfAssetType (§2, D5)', () => {
  it('servidor, base de datos, servicio en nube y aplicación son dimensiones', () => {
    expect(['server', 'database', 'cloud_service', 'application'].map(dimensionOfAssetType)).toEqual(['server', 'database', 'cloud', 'app']);
  });
  it('endpoint, dispositivo de red y documentación se monitorean pero no son dimensión', () => {
    expect(['endpoint', 'network_device', 'documentation', 'otro'].map(dimensionOfAssetType)).toEqual([null, null, null, null]);
  });
});

describe('D160 · los activos de una prueba: decide la plataforma conectada, no la dimensión', () => {
  const NOW_ISH = new Date('2026-11-23T11:00:00Z');
  const APP = readoutTest('mfa', 'technical', { dimension: 'app' });
  const read = (test: typeof APP, assets: ReturnType<typeof asset>[], results: Array<[string, 'compliant' | 'non_compliant' | 'pending' | 'not_applicable']>, patch: Parameters<typeof control>[1] = {}) => {
    const c = control([requirement('r1', [test])], patch);
    const keyed = results.map(([assetId, r]) => [`c1|${test.testId}|${assetId}`, r] as const);
    return readControl(c, data([c], assets, { results: new Map(keyed), signals: { resultDates: new Map(keyed.map(([k]) => [k, NOW_ISH])) } })).requirements[0].tests[0];
  };

  it('la organización conectada decide una prueba de aplicación: un Directo en FAIL es excepción y señala ese activo', () => {
    const t = read(APP, [asset('m365', 'cloud_service')], [['m365', 'non_compliant']]);
    expect(t).toMatchObject({ status: 'exception', manual: false, assetCoverage: { withResult: 1, inScope: 1 }, failingAssetIds: ['m365'] });
    expect(read(APP, [asset('m365', 'cloud_service')], [['m365', 'compliant']]).status).toBe('correct');
    expect(read(APP, [asset('m365', 'cloud_service')], [['m365', 'pending']]).status).toBe('pending');
  });
  it('una conexión que no mide esa prueba («no aplica») no entra: la prueba sigue a mano (T-05)', () => {
    expect(read(APP, [asset('aws', 'cloud_service')], [['aws', 'not_applicable']])).toMatchObject({ status: 'pending', manual: true, assetCoverage: null });
    expect(read(APP, [asset('aws', 'cloud_service')], [])).toMatchObject({ manual: true });
  });
  it('dos conexiones miden la misma prueba: cuentan las dos, y la que falla la deja en excepción', () => {
    const t = read(APP, [asset('aws', 'cloud_service'), asset('m365', 'cloud_service')], [['aws', 'compliant'], ['m365', 'non_compliant']]);
    expect(t).toMatchObject({ status: 'exception', assetCoverage: { withResult: 2, inScope: 2 }, failingAssetIds: ['m365'] });
  });
  it('un recurso descubierto sin resultado no deja la prueba pendiente para siempre; con resultado, cuenta como un activo más', () => {
    const SRV = readoutTest('ha', 'technical');
    const ec2 = { ...asset('ec2'), discovered: true };
    expect(read(SRV, [ec2], [])).toMatchObject({ manual: true, assetCoverage: null });
    expect(read(SRV, [ec2, asset('srv')], [['srv', 'compliant']])).toMatchObject({ status: 'correct', assetCoverage: { withResult: 1, inScope: 1 } });
    expect(read(SRV, [ec2, asset('srv')], [['srv', 'compliant'], ['ec2', 'non_compliant']])).toMatchObject({ status: 'exception', assetCoverage: { withResult: 2, inScope: 2 }, failingAssetIds: ['ec2'] });
  });
  it('un activo de su tipo con conexión propia se sigue esperando aunque no tenga resultado («Sin datos»)', () => {
    expect(read(readoutTest('ha', 'technical'), [asset('srv')], [])).toMatchObject({ status: 'pending', manual: false, assetCoverage: { withResult: 0, inScope: 1 } });
  });
  it('los módulos de la sonda no se le piden a la cuenta de nube que entra a la prueba por sus checks', () => {
    const withModule = readoutTest('hids', 'technical', { links: { directCheckCount: 1, complementaryCheckIds: [], modules: [{ role: 'direct', ref: 'Análisis de logs y detección de intrusiones (HIDS)' }], dependencies: [], directKeys: ['check:hids'], items: [] } });
    expect(read(withModule, [asset('aws', 'cloud_service')], [['aws', 'compliant']]).status).toBe('correct');
  });

  describe('parte manual de una prueba semiautomática', () => {
    const SEMI = readoutTest('audit', 'technical', { dimension: 'app', automation: 'semi_automated' });
    const tenant = [asset('m365', 'cloud_service')];
    it('con los checks en PASS sigue pendiente hasta que el responsable registra el resultado; nunca cumple sola', () => {
      expect(read(SEMI, tenant, [['m365', 'compliant']])).toMatchObject({ status: 'pending', manual: false, manualPart: true });
      expect(read(SEMI, tenant, [['m365', 'compliant']], { manualResults: correct('audit') })).toMatchObject({ status: 'correct', manualPart: true });
    });
    it('un Directo en FAIL es excepción aunque el resultado manual sea correcto, y un resultado manual en excepción gana a los checks en PASS', () => {
      expect(read(SEMI, tenant, [['m365', 'non_compliant']], { manualResults: correct('audit') }).status).toBe('exception');
      const failed = new Map([['audit', { result: 'exception' as const, at: new Date('2026-11-20T00:00:00Z') }]]);
      expect(read(SEMI, tenant, [['m365', 'compliant']], { manualResults: failed }).status).toBe('exception');
    });
    it('una automática se decide solo con sus checks; una semiautomática sin ningún check aplicable es manual, como siempre', () => {
      expect(read(APP, tenant, [['m365', 'compliant']])).toMatchObject({ status: 'correct', manualPart: false });
      expect(read(SEMI, [], [])).toMatchObject({ manual: true, status: 'pending' });
    });
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
      { manualResults: correct('d0', 'd1', 'd2', 'd3') },
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
      manualResults: correct('shared'),
    });
    const r = readControl(c, data([c], []));
    expect(r.tests.map((t) => [t.test.testId, t.state, t.status])).toEqual([['shared', 'compliant', 'correct'], ['x', 'pending', 'pending']]);
  });
  it('MD-499 · la evidencia de una prueba de fuente integration en respaldo cuenta igual que la de una manual', () => {
    const evidence = [{ testId: 'a', state: 'compliant' as const, submittedAt: new Date('2026-11-10T00:00:00Z') }];
    const read = (primarySource: string) => {
      const c = control([requirement('r1', [readoutTest('a', 'operational', { primarySource, integrationCategory: 'Gestión de Identidades' })])], { evidence, manualResults: correct('a') });
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
