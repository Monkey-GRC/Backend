import { hasDirectFailure } from './control-readout';
import { asset, control, data, links, NOW, readoutTest, requirement } from './readout.fixtures';

// MD-501 (D135) · Solo se exceptúa un FAIL que existe hoy: la misma lectura del motor.
describe('hasDirectFailure', () => {
  const DIRECT = readoutTest('mfa', 'technical', { links: links({ directCheckCount: 1 }) });
  const read = (result: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable' | null, opts: { test?: typeof DIRECT; at?: Date; exception?: boolean; assets?: ReturnType<typeof asset>[]; periodicity?: 'daily' | null; assetId?: string } = {}) => {
    const test = opts.test ?? DIRECT;
    const c = control([requirement('r1', [test], { periodicity: opts.periodicity ?? null })]);
    const key = `c1|${test.testId}|a1`;
    const d = data([c], opts.assets ?? [asset('a1')], {
      results: new Map(result ? [[key, result]] : []),
      signals: { resultDates: new Map([[key, opts.at ?? NOW]]), exceptions: new Set(opts.exception ? [`${test.testId}|a1`] : []) },
    });
    return hasDirectFailure(d, test.testId, opts.assetId ?? 'a1');
  };

  it('un FAIL vigente de un check Directo en el activo', () => {
    expect(read('non_compliant')).toBe(true);
  });
  it('pasa, no aplica o no hay resultado: no hay FAIL', () => {
    expect(read('compliant')).toBe(false);
    expect(read('not_applicable')).toBe(false);
    expect(read(null)).toBe(false);
  });
  it('un FAIL que ya venció su ventana (resultado viejo) es sin datos, no FAIL', () => {
    expect(read('non_compliant', { at: new Date('2020-01-01T00:00:00Z'), periodicity: 'daily' })).toBe(false);
  });
  it('una prueba sin check Directo (no técnica) no se exceptúa', () => {
    expect(read('non_compliant', { test: readoutTest('doc', 'documentary') })).toBe(false);
  });
  it('un activo que no es del servicio no tiene FAIL', () => {
    expect(read('non_compliant', { assetId: 'otro' })).toBe(false);
  });
  it('si ya tiene una excepción vigente el resultado es fail_with_exception: ya no es un FAIL pendiente', () => {
    expect(read('non_compliant', { exception: true })).toBe(false);
  });
});
