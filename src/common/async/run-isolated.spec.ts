import { runIsolated } from './run-isolated';

describe('runIsolated', () => {
  it('si un paso falla, el siguiente corre igual, se avisa del error y no se propaga', async () => {
    const order: string[] = [];
    const errors: string[] = [];
    await expect(
      runIsolated(
        [
          ['a', async () => { order.push('a'); throw new Error('base caída'); }],
          ['b', async () => { order.push('b'); }],
        ],
        (label, e) => errors.push(`${label}: ${e.message}`),
      ),
    ).resolves.toBeUndefined();
    expect(order).toEqual(['a', 'b']);
    expect(errors).toEqual(['a: base caída']);
  });

  it('si falla el último, los anteriores ya corrieron; sin fallos no avisa de nada', async () => {
    const order: string[] = [];
    const errors: string[] = [];
    await runIsolated([['a', async () => { order.push('a'); }], ['b', async () => { throw new Error('x'); }]], (l) => errors.push(l));
    await runIsolated([['c', async () => { order.push('c'); }]], (l) => errors.push(l));
    expect(order).toEqual(['a', 'c']);
    expect(errors).toEqual(['b']);
  });

  it('un valor lanzado que no es Error también se registra', async () => {
    const errors: string[] = [];
    await runIsolated([['a', () => Promise.reject('texto')]], (_l, e) => errors.push(e.message));
    expect(errors).toEqual(['texto']);
  });
});
