import { AssetResult } from './engine/states';
import { compareOwnCode, dimensionOfAssetType, readControl, ReadoutAsset, ReadoutControl, ReadoutTest, readinessOf, resultKey, ResultsIndex } from './control-readout';

const test = (id: string, dimension: ReadoutTest['dimension'], patch: Partial<ReadoutTest> = {}): ReadoutTest => ({
  testId: id, code: `T-${id}`, displayName: null, displayDescription: null, dimension, mandatory: true, active: true, ...patch,
});
const asset = (id: string, type: string): ReadoutAsset => ({ id, name: `activo-${id}`, type });
const control = (tests: ReadoutTest[], patch: Partial<ReadoutControl> = {}): ReadoutControl => ({
  id: 'c1', serviceId: 's1', ownCode: 'C01', name: 'Control', origin: 'catalog', type: 'hybrid', interpretation: 'x', catalogDescription: 'x',
  dimensions: [], tests, trustCriteria: ['security'], assignee: null, assignedUserIds: [], approval: 'approved', hasPendingChange: false, catalogCode: 'IAC-1', requirementCodes: ['CC6.1'], pointsOfFocus: [], ...patch,
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

  it('un test documental está pendiente mientras no se guarde su veredicto (P25): nunca cumple por omisión', () => {
    const r = readControl(control([test('b', 'policy', { displayName: 'Revisión periódica de accesos' })]), [], NONE);
    expect(r.tests[0].state).toBe('pending');
    expect(r.failing).toEqual([]);
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
