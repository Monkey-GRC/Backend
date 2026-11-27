import { AssetResult } from '../engine/states';
import { readControl, ReadoutControl } from './control-readout';
import { control, data, links, NOW, readoutTest, requirement, servers } from './readout.fixtures';

// MD-501 · D163 · Un ciclo de Dependencias: las pruebas comparten estado (el peor entre los PROPIOS de todas las alcanzables), sin importar el orden en que se evalúen ni por dónde se entre.
const assets = servers(2);
const dependsOn = (own: string, owner: string, key: string) => readoutTest(own, 'technical', { links: links({ directCheckCount: 1, directKeys: [`check:${own}`], dependencies: [{ ownerControlId: owner, key }] }) });
const ctl = (id: string, test: ReturnType<typeof readoutTest>) => control([requirement(`r${id}`, [test])], { id, catalogControlId: `cat-${id}` });
const feed = (own: Record<string, AssetResult | null>) => {
  const results = new Map<string, AssetResult>();
  const dates = new Map<string, Date>();
  for (const [controlId, result] of Object.entries(own)) {
    if (!result) continue;
    for (const a of assets) {
      results.set(`${controlId}|t${controlId}|${a.id}`, result);
      dates.set(`${controlId}|t${controlId}|${a.id}`, new Date(NOW.getTime() - 60_000));
    }
  }
  return { results, signals: { resultDates: dates } };
};
const statusOf = (c: ReadoutControl, controls: ReadoutControl[], own: Record<string, AssetResult | null>, pool?: ReadoutControl[]) =>
  readControl(c, { ...data(controls, assets, feed(own)), ...(pool ? { pool } : {}) }).requirements[0].tests[0].status;

const permutations = <T,>(xs: T[]): T[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((rest) => [x, ...rest])));

describe('ciclo A <-> B (T-06)', () => {
  const A = () => ctl('a', dependsOn('ta', 'cat-b', 'check:tb'));
  const B = () => ctl('b', dependsOn('tb', 'cat-a', 'check:ta'));

  it('el estado no depende del orden de los controles ni de cuál se lee primero (una misma foto)', () => {
    for (const own of [{ a: 'compliant', b: 'compliant' }, { a: 'compliant', b: 'non_compliant' }, { a: null, b: 'compliant' }] as Array<Record<string, AssetResult | null>>) {
      const [a0, b0] = [A(), B()];
      const baseline = { a: statusOf(a0, [a0, b0], own), b: statusOf(b0, [a0, b0], own) };
      for (const order of permutations([A(), B()])) {
        const foto = data(order, assets, feed(own));
        // se lee en el orden de la foto y en el inverso, siempre sobre la MISMA foto (con su memoria)
        const read = (cs: ReadoutControl[]) => Object.fromEntries(cs.map((c) => [c.id, readControl(c, foto).requirements[0].tests[0].status]));
        expect(read(order)).toEqual(baseline);
        expect(read([...order].reverse())).toEqual(baseline);
      }
    }
  });

  it('todos los propios en Correcto: ambos Correcto (la arista de vuelta no aporta Pendiente)', () => {
    const [a, b] = [A(), B()];
    expect(statusOf(a, [a, b], { a: 'compliant', b: 'compliant' })).toBe('correct');
    expect(statusOf(b, [a, b], { a: 'compliant', b: 'compliant' })).toBe('correct');
  });

  it('un FAIL propio en uno: ambos en Excepción', () => {
    const [a, b] = [A(), B()];
    expect(statusOf(a, [a, b], { a: 'compliant', b: 'non_compliant' })).toBe('exception');
    expect(statusOf(b, [a, b], { a: 'compliant', b: 'non_compliant' })).toBe('exception');
  });

  it('la lectura de un solo control (con el pool) da lo mismo que la de la lista', () => {
    const [a, b] = [A(), B()];
    for (const own of [{ a: 'compliant', b: 'compliant' }, { a: 'compliant', b: 'non_compliant' }] as Array<Record<string, AssetResult | null>>) {
      expect(statusOf(a, [a], own, [a, b])).toBe(statusOf(a, [a, b], own));
      expect(statusOf(b, [b], own, [a, b])).toBe(statusOf(b, [a, b], own));
    }
  });

  it('un ciclo con un dueño fuera del alcance queda Pendiente', () => {
    const a = ctl('a', dependsOn('ta', 'cat-b', 'check:tb'));
    const b = ctl('b', readoutTest('tb', 'technical', { links: links({ directCheckCount: 1, directKeys: ['check:tb'], dependencies: [{ ownerControlId: 'cat-a', key: 'check:ta' }, { ownerControlId: 'cat-missing', key: 'check:z' }] }) }));
    expect(statusOf(a, [a, b], { a: 'compliant', b: 'compliant' })).toBe('pending');
    expect(statusOf(b, [a, b], { a: 'compliant', b: 'compliant' })).toBe('pending');
  });
});

describe('sin ciclos (como siempre)', () => {
  const owner = ctl('o', readoutTest('to', 'technical', { links: links({ directCheckCount: 1, directKeys: ['check:k'] }) }));
  const dependent = ctl('d', readoutTest('td', 'technical', { links: links({ directCheckCount: 0, dependencies: [{ ownerControlId: 'cat-o', key: 'check:k' }] }) }));
  it('el dependiente toma el estado del dueño, en cualquier orden', () => {
    for (const order of permutations([owner, dependent])) {
      expect(statusOf(dependent, order, { o: 'compliant' })).toBe('correct');
      expect(statusOf(dependent, order, { o: 'non_compliant' })).toBe('exception');
      expect(statusOf(dependent, order, { o: null })).toBe('pending');
    }
  });
});

describe('una clave Directa en varias pruebas del dueño', () => {
  it('toma todas (el peor), no la primera', () => {
    const two = control(
      [requirement('r1', [readoutTest('t1', 'technical', { links: links({ directCheckCount: 1, directKeys: ['check:k'] }) })]), requirement('r2', [readoutTest('t2', 'technical', { links: links({ directCheckCount: 1, directKeys: ['check:k'] }) })])],
      { id: 'o', catalogControlId: 'cat-o' },
    );
    const dependent = ctl('d', readoutTest('td', 'technical', { links: links({ directCheckCount: 0, dependencies: [{ ownerControlId: 'cat-o', key: 'check:k' }] }) }));
    const results = new Map<string, AssetResult>();
    const dates = new Map<string, Date>();
    for (const [t, r] of [['t1', 'compliant'], ['t2', 'non_compliant']] as const) for (const a of assets) { results.set(`o|${t}|${a.id}`, r); dates.set(`o|${t}|${a.id}`, new Date(NOW.getTime() - 60_000)); }
    for (const order of permutations([two, dependent])) {
      expect(readControl(dependent, data(order, assets, { results, signals: { resultDates: dates } })).requirements[0].tests[0].status).toBe('exception');
    }
  });
});

describe('ciclo de tres nodos A -> B -> C -> A', () => {
  const trio = () => [ctl('a', dependsOn('ta', 'cat-b', 'check:tb')), ctl('b', dependsOn('tb', 'cat-c', 'check:tc')), ctl('c', dependsOn('tc', 'cat-a', 'check:ta'))];
  it('todas las permutaciones, en cualquier orden de lectura, dan lo mismo; un FAIL propio los pone a todos en Excepción', () => {
    for (const own of [{ a: 'compliant', b: 'compliant', c: 'compliant' }, { a: 'compliant', b: 'compliant', c: 'non_compliant' }, { a: null, b: 'compliant', c: 'compliant' }] as Array<Record<string, AssetResult | null>>) {
      const [a0, b0, c0] = trio();
      const baseline = Object.fromEntries([a0, b0, c0].map((c) => [c.id, statusOf(c, [a0, b0, c0], own)]));
      for (const order of permutations(trio())) {
        const foto = data(order, assets, feed(own));
        const read = (cs: ReadoutControl[]) => Object.fromEntries(cs.map((c) => [c.id, readControl(c, foto).requirements[0].tests[0].status]));
        expect(read(order)).toEqual(baseline);
        expect(read([...order].reverse())).toEqual(baseline);
      }
      if (own.c === 'non_compliant') expect(Object.values(baseline)).toEqual(['exception', 'exception', 'exception']);
      if (own.a === 'compliant' && own.c === 'compliant') expect(Object.values(baseline)).toEqual(['correct', 'correct', 'correct']);
    }
  });
});

describe('autociclo: una prueba que depende de sí misma', () => {
  it('da su estado propio, sin bucle', () => {
    const self = ctl('a', dependsOn('ta', 'cat-a', 'check:ta'));
    expect(statusOf(self, [self], { a: 'compliant' })).toBe('correct');
    expect(statusOf(self, [self], { a: 'non_compliant' })).toBe('exception');
  });
});

describe('cadena sin ciclo de tres niveles', () => {
  it('leída con el pool (un solo control) da lo mismo que en la lista', () => {
    const leaf = ctl('l', readoutTest('tl', 'technical', { links: links({ directCheckCount: 1, directKeys: ['check:tl'] }) }));
    const mid = ctl('m', readoutTest('tm', 'technical', { links: links({ directCheckCount: 0, directKeys: ['check:tm'], dependencies: [{ ownerControlId: 'cat-l', key: 'check:tl' }] }) }));
    const top = ctl('t', readoutTest('tt', 'technical', { links: links({ directCheckCount: 0, dependencies: [{ ownerControlId: 'cat-m', key: 'check:tm' }] }) }));
    for (const own of [{ l: 'compliant' }, { l: 'non_compliant' }, { l: null }] as Array<Record<string, AssetResult | null>>) {
      const list = statusOf(top, [leaf, mid, top], own);
      expect(statusOf(top, [top], own, [leaf, mid, top])).toBe(list);
      expect(list).toBe(own.l === 'compliant' ? 'correct' : own.l === 'non_compliant' ? 'exception' : 'pending');
    }
  });
});
