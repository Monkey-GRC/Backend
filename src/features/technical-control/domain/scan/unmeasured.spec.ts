import { interpretTestResult } from './interpret-evaluations';
import { InterpretedResult } from './scan.types';
import { ORGANIZATION_WIDE_PLATFORMS, withUnmeasured } from './unmeasured';

const row = (checkId: string, result: InterpretedResult['result']): InterpretedResult => ({ checkId, resourceKey: 'org', resourceUid: 'org', resourceType: null, resourceName: null, regions: [], result, severity: null, detail: null });
const decide = (expected: string[], results: InterpretedResult[]) => interpretTestResult(new Set(expected), withUnmeasured(expected, results)).result;

describe('Verificaciones que no volvieron (D159)', () => {
  it('una prueba no se da por cumplida si falta una de sus verificaciones: queda pendiente', () => {
    expect(decide(['a', 'b'], [row('a', 'passed')])).toBe('pending');
  });

  it('si no volvió ninguna queda pendiente, nunca «no aplica»', () => {
    expect(decide(['a'], [])).toBe('pending');
    expect(decide(['a', 'b'], [row('otra', 'passed')])).toBe('pending');
  });

  it('lo que sí falló sigue mandando, y con todo medido y bien cumple', () => {
    expect(decide(['a', 'b'], [row('a', 'failed')])).toBe('non_compliant');
    expect(decide(['a', 'b'], [row('a', 'passed'), row('b', 'passed')])).toBe('compliant');
  });

  it('no duplica la que ya volvió, aunque venga sin decidir, ni cambia lo recibido', () => {
    const results = [row('a', 'not_run'), row('b', 'passed')];
    expect(withUnmeasured(['a', 'b', 'b'], results)).toEqual(results);
  });

  it('solo vale para las plataformas cuyas verificaciones son de la organización', () => {
    expect(ORGANIZATION_WIDE_PLATFORMS).toEqual(['microsoft_365']);
  });
});
