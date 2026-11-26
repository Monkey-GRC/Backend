import { failureParams, GROUPED_FAILURES, newDirectFailures, type DirectTestLink } from './direct-check-failures';

const link = (over: Partial<DirectTestLink> = {}): DirectTestLink => ({ serviceId: 's1', controlId: 'c1', testId: 't1', checkIds: ['k1', 'k2'], ...over });
const sets = (o: Record<string, string[]>) => new Map(Object.entries(o).map(([k, v]) => [k, new Set(v)]));

describe('newDirectFailures (D153)', () => {
  it('avisa los checks que pasan a FAIL desde pass o sin dato', () => {
    const out = newDirectFailures({ links: [link()], current: sets({ s1: ['k1', 'k2'] }), previous: sets({ s1: [] }), exceptedTestIds: new Set() });
    expect(out.get('c1')).toEqual(['k1', 'k2']);
  });

  it('no avisa lo que ya fallaba en la recolección anterior (avisa el cambio, no el estado)', () => {
    const out = newDirectFailures({ links: [link()], current: sets({ s1: ['k1', 'k2'] }), previous: sets({ s1: ['k1'] }), exceptedTestIds: new Set() });
    expect(out.get('c1')).toEqual(['k2']);
    const none = newDirectFailures({ links: [link()], current: sets({ s1: ['k1'] }), previous: sets({ s1: ['k1'] }), exceptedTestIds: new Set() });
    expect(none.size).toBe(0);
  });

  it('un FAIL con excepción vigente en esa prueba no avisa', () => {
    const out = newDirectFailures({ links: [link()], current: sets({ s1: ['k1'] }), previous: sets({}), exceptedTestIds: new Set(['t1']) });
    expect(out.size).toBe(0);
  });

  it('una excepción de una prueba no calla a otra prueba del mismo control con el mismo check', () => {
    const out = newDirectFailures({ links: [link(), link({ testId: 't2', checkIds: ['k1'] })], current: sets({ s1: ['k1'] }), previous: sets({}), exceptedTestIds: new Set(['t1']) });
    expect(out.get('c1')).toEqual(['k1']);
  });

  it('un check que no es Directo de ninguna prueba del control no avisa (los Complementarios no llegan en los vínculos)', () => {
    const out = newDirectFailures({ links: [link({ checkIds: ['k1'] })], current: sets({ s1: ['kc'] }), previous: sets({}), exceptedTestIds: new Set() });
    expect(out.size).toBe(0);
  });

  it('lee el servicio de cada vínculo: un FAIL de otro servicio no cuenta', () => {
    const out = newDirectFailures({ links: [link()], current: sets({ s2: ['k1'] }), previous: sets({}), exceptedTestIds: new Set() });
    expect(out.size).toBe(0);
  });

  it('un control con dos pruebas que comparten el check lo lista una vez', () => {
    const out = newDirectFailures({ links: [link({ checkIds: ['k1'] }), link({ testId: 't2', checkIds: ['k1'] })], current: sets({ s1: ['k1'] }), previous: sets({}), exceptedTestIds: new Set() });
    expect(out.get('c1')).toEqual(['k1']);
  });
});

describe('failureParams', () => {
  it('agrupa hasta 5 y cuenta el total', () => {
    const ids = Array.from({ length: 8 }, (_, i) => `k${i}`);
    const titles = new Map(ids.map((id, i) => [id, { en: `Check ${i}`, es: `Verificación ${i}` }]));
    const out = failureParams('Cuenta AWS', ids, titles);
    expect(out.failures).toHaveLength(GROUPED_FAILURES);
    expect(out.failureCount).toBe(8);
    expect(out.failures[0]).toEqual({ asset_name: 'Cuenta AWS', check_title_en: 'Check 0', check_title_es: 'Verificación 0' });
  });

  it('un título ausente (nombraba al proveedor) llega nulo', () => {
    const out = failureParams('Servidor', ['k1'], new Map());
    expect(out.failures[0]).toMatchObject({ check_title_en: null, check_title_es: null });
  });
});
