import { AssetResult } from './engine/states';
import { compareOwnCode, dimensionOfAssetType, readControl, ReadoutAsset, ReadoutControl, ReadoutTest, readinessOf, resultKey, ResultsIndex } from './control-readout';

const test = (id: string, dimension: ReadoutTest['dimension'], patch: Partial<ReadoutTest> = {}): ReadoutTest => ({
  testId: id, code: `T-${id}`, displayName: null, displayDescription: null, dimension, mandatory: true, active: true, ...patch,
});
const asset = (id: string, type: string): ReadoutAsset => ({ id, name: `activo-${id}`, type });
const control = (tests: ReadoutTest[], patch: Partial<ReadoutControl> = {}): ReadoutControl => ({
  id: 'c1', serviceId: 's1', ownCode: 'C01', name: 'Control', origin: 'catalog', type: 'hybrid', interpretation: 'x', catalogDescription: 'x',
  dimensions: [], tests, trustCriteria: ['security'], assignee: null, assignedUserIds: [], responsibleByDimension: {}, approval: 'approved', catalogCode: 'IAC-1', requirementCodes: ['CC6.1'], pointsOfFocus: [], documentary: [], ...patch,
});
const results = (entries: Array<[string, string, AssetResult]>): ResultsIndex => new Map(entries.map(([t, a, r]) => [resultKey('c1', t, a), r]));
const NONE: ResultsIndex = new Map();

describe('dimensionOfAssetType (§2, D5)', () => {
  it('servidor, base de datos, servicio en nube y aplicación son dimensiones', () => {
    expect(['server', 'database', 'cloud_service', 'application'].map(dimensionOfAssetType)).toEqual(['server', 'database', 'cloud', 'app']);
  });
  it('endpoint, dispositivo de red y documentación se monitorean pero no son dimensión', () => {
    expect(['endpoint', 'network_device', 'documentation', 'otro'].map(dimensionOfAssetType)).toEqual([null, null, null, null]);
  });
});

describe('readControl — un servicio sin ningún resultado', () => {
  it('queda «Sin medir»: lo que no se midió no es cumplimiento ni fallo', () => {
    const r = readControl(control([test('a', 'cloud'), test('b', 'policy')]), [asset('1', 'cloud_service')], NONE);
    expect(r.readiness).toBe('not_measured');
    expect(r.state).toBe('evaluating');
    expect(r.progress).toEqual({ done: 0, total: 2 });
    expect(r.coverage).toEqual({ measured: 0, applicable: 2 });
    expect(r.failing).toEqual([]);
  });

  it('un test de nube sin ningún activo de nube no tiene sobre qué correr y tampoco cumple', () => {
    const r = readControl(control([test('a', 'cloud')]), [asset('1', 'server')], NONE);
    expect(r.tests[0].state).toBe('no_assets');
    expect(r.readiness).toBe('not_measured');
    expect(r.state).not.toBe('effective');
  });

  it('un control sin tests ni dimensiones queda «Sin tests» y «Sin medir»', () => {
    const r = readControl(control([]), [], NONE);
    expect(r.state).toBe('no_tests');
    expect(r.readiness).toBe('not_measured');
    expect(r.progress).toEqual({ done: 0, total: 0 });
  });
});

describe('readControl — con resultados', () => {
  const two = [asset('1', 'cloud_service'), asset('2', 'cloud_service')];

  it('todos los activos de la dimensión cumplen → el test cumple, pero la documental pendiente impide «Preparado»', () => {
    const r = readControl(control([test('a', 'cloud'), test('b', 'policy')]), two, results([['a', '1', 'compliant'], ['a', '2', 'compliant']]));
    expect(r.tests.find((t) => t.test.testId === 'a')?.state).toBe('compliant');
    expect(r.progress).toEqual({ done: 1, total: 2 });
    expect(r.readiness).toBe('almost_ready'); // todo lo medido cumple, algo sigue pendiente
  });

  it('un solo activo que falla hace que el test no cumpla y lo señala', () => {
    const r = readControl(control([test('a', 'cloud')]), two, results([['a', '1', 'compliant'], ['a', '2', 'non_compliant']]));
    expect(r.state).toBe('ineffective');
    expect(r.failing).toEqual([{ dimension: 'cloud', affected: [{ kind: 'asset', id: '2', name: 'activo-2' }] }]);
    expect(r.readiness).toBe('needs_work');
  });

  it('un activo que todavía no dijo su resultado deja el test «en evaluación»: 45 de 50 no cumple', () => {
    const r = readControl(control([test('a', 'cloud')]), two, results([['a', '1', 'compliant']]));
    expect(r.tests[0].state).toBe('evaluating');
    expect(r.state).toBe('evaluating');
    expect(r.coverage).toEqual({ measured: 0, applicable: 1 });
  });

  it('todo cumple y nada pendiente → Preparado', () => {
    const r = readControl(control([test('a', 'cloud')]), two, results([['a', '1', 'compliant'], ['a', '2', 'compliant']]));
    expect(r.state).toBe('effective');
    expect(r.readiness).toBe('ready');
    expect(r.progress).toEqual({ done: 1, total: 1 });
  });

  it('un activo excluido sale del universo del test (C5)', () => {
    const r = readControl(control([test('a', 'cloud')]), two, results([['a', '1', 'compliant'], ['a', '2', 'excluded']]));
    expect(r.tests[0].state).toBe('compliant');
  });

  it('los endpoints no son dimensión: no entran al universo de ningún test', () => {
    const r = readControl(control([test('a', 'server')]), [asset('9', 'endpoint')], NONE);
    expect(r.tests[0].state).toBe('no_assets');
  });

  it('un test documental sin evidencias está pendiente: la ausencia de evidencia nunca es cumplimiento', () => {
    const r = readControl(control([test('b', 'policy', { displayName: 'Revisión periódica de accesos' })]), [], NONE);
    expect(r.tests[0].state).toBe('pending');
    expect(r.failing).toEqual([]);
  });
});

// D88 · una prueba documental se calcula por control, con la evidencia que la persona entregó PARA ESA PRUEBA en ese control.
describe('readControl — pruebas documentales por control (D88)', () => {
  const policies = [test('d1', 'policy'), test('d2', 'policy')];
  const stateOf = (r: ReturnType<typeof readControl>, id: string) => r.tests.find((t) => t.test.testId === id)?.state;

  it('la evidencia de una prueba solo mueve esa prueba: la otra sigue pendiente', () => {
    const r = readControl(control(policies, { documentary: [{ testId: 'd1', state: 'compliant' }] }), [], NONE);
    expect(stateOf(r, 'd1')).toBe('compliant');
    expect(stateOf(r, 'd2')).toBe('pending');
    expect(r.state).toBe('evaluating');
    expect(r.progress).toEqual({ done: 1, total: 2 });
  });

  it('cuando cada prueba tiene su evidencia validada, el control es efectivo', () => {
    const r = readControl(control(policies, { documentary: [{ testId: 'd1', state: 'compliant' }, { testId: 'd2', state: 'compliant' }] }), [], NONE);
    expect(r.state).toBe('effective');
  });

  it('con varias evidencias de la misma prueba manda la peor (RN-04): una que no cumple, o una pendiente, impide cumplir', () => {
    const noCumple = readControl(control(policies, { documentary: [{ testId: 'd1', state: 'compliant' }, { testId: 'd1', state: 'non_compliant' }] }), [], NONE);
    expect(stateOf(noCumple, 'd1')).toBe('non_compliant');
    expect(noCumple.state).toBe('ineffective');
    expect(noCumple.failing).toEqual([{ dimension: 'policy', affected: expect.arrayContaining([{ kind: 'test', id: 'd1', displayName: null, testCode: 'T-d1' }]) }]);

    const pendiente = readControl(control(policies, { documentary: [{ testId: 'd1', state: 'compliant' }, { testId: 'd1', state: 'pending' }] }), [], NONE);
    expect(stateOf(pendiente, 'd1')).toBe('pending');
  });

  it('una evidencia vencida o en revisión se refleja en la prueba, y ninguna cumple por omisión', () => {
    expect(stateOf(readControl(control(policies, { documentary: [{ testId: 'd1', state: 'expired' }] }), [], NONE), 'd1')).toBe('expired');
    expect(stateOf(readControl(control(policies, { documentary: [{ testId: 'd1', state: 'in_review' }] }), [], NONE), 'd1')).toBe('in_review');
  });

  it('el control A no se entera de las evidencias del control B (cada control trae las suyas)', () => {
    const a = readControl(control(policies, { documentary: [{ testId: 'd1', state: 'compliant' }] }), [], NONE);
    const b = readControl(control(policies, { documentary: [] }), [], NONE);
    expect(stateOf(a, 'd1')).toBe('compliant');
    expect(stateOf(b, 'd1')).toBe('pending');
  });

  it('la evidencia de otra prueba no cuenta para esta', () => {
    const r = readControl(control(policies, { documentary: [{ testId: 'otra-prueba', state: 'compliant' }] }), [], NONE);
    expect(policies.map((p) => stateOf(r, p.testId))).toEqual(['pending', 'pending']);
  });

  it('una evidencia «no aplica» no cuenta; si todas no aplican, la prueba no aplica', () => {
    const r = readControl(control(policies, { documentary: [{ testId: 'd1', state: 'not_applicable' }] }), [], NONE);
    expect(stateOf(r, 'd1')).toBe('not_applicable');
  });
});
describe('readControl — dimensiones y vigencia de los tests', () => {
  const dims = (...d: Array<[ReadoutTest['dimension'], boolean]>) => d.map(([dimension, applies]) => ({ dimension, applies, type: 'manual' as const, reasonNotApplicable: applies ? null : 'No aplica.' }));

  it('una dimensión exigida sin ningún test vigente deja el control INCOMPLETO y suma al total (RN-14)', () => {
    const r = readControl(control([test('a', 'cloud')], { dimensions: dims(['cloud', true], ['database', true]) }), [asset('1', 'cloud_service')], results([['a', '1', 'compliant']]));
    expect(r.state).toBe('incomplete');
    expect(r.progress).toEqual({ done: 1, total: 2 });
    expect(r.readiness).toBe('almost_ready');
  });

  it('una dimensión que no aplica no exige nada', () => {
    const r = readControl(control([test('a', 'cloud')], { dimensions: dims(['cloud', true], ['database', false]) }), [asset('1', 'cloud_service')], results([['a', '1', 'compliant']]));
    expect(r.state).toBe('effective');
  });

  it('un test no obligatorio o no vigente no cuenta', () => {
    const r = readControl(control([test('a', 'cloud'), test('b', 'cloud', { mandatory: false }), test('c', 'cloud', { active: false })]), [asset('1', 'cloud_service')], results([['a', '1', 'compliant']]));
    expect(r.progress).toEqual({ done: 1, total: 1 });
    expect(r.state).toBe('effective');
  });
});

describe('readinessOf — el semáforo (§9)', () => {
  const base = { state: 'ineffective' as const, measured: 5, failingTests: 1 };
  it.each([
    [{ ...base, state: 'effective' as const, done: 5, total: 5, failingTests: 0 }, 'ready'],
    [{ ...base, done: 4, total: 5 }, 'almost_ready'],
    [{ ...base, done: 3, total: 5 }, 'needs_work'],
    [{ ...base, done: 79, total: 100 }, 'needs_work'],
    [{ ...base, done: 80, total: 100 }, 'almost_ready'],
    [{ ...base, state: 'evaluating' as const, done: 1, total: 10, failingTests: 0 }, 'almost_ready'],
    [{ ...base, done: 0, total: 5, measured: 0, failingTests: 0 }, 'not_measured'],
    [{ ...base, state: 'no_tests' as const, done: 0, total: 0, measured: 0, failingTests: 0 }, 'not_measured'],
  ])('%j → %s', (input, expected) => {
    expect(readinessOf(input)).toBe(expected);
  });
});

describe('compareOwnCode', () => {
  it('ordena por el número, no como texto: C2 antes que C10', () => {
    expect(['C10', 'C2', 'C1', 'C100', 'C20'].sort(compareOwnCode)).toEqual(['C1', 'C2', 'C10', 'C20', 'C100']);
  });
  it('un código del catálogo se ordena por su prefijo y luego por su número', () => {
    expect(['IAC-10', 'IAC-2', 'AST-1', 'C2', 'C10', 'AST-12'].sort(compareOwnCode)).toEqual(['AST-1', 'AST-12', 'C2', 'C10', 'IAC-2', 'IAC-10']);
  });
});
