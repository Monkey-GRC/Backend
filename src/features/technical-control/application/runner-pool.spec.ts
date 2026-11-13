import { DEFAULT_RUNNER_POOL, readRunnerPool } from './runner-pool';

describe('readRunnerPool', () => {
  it('sin valor queda en el grupo por defecto', () => {
    expect(readRunnerPool(undefined)).toBe(DEFAULT_RUNNER_POOL);
    expect(readRunnerPool('  ')).toBe('default');
  });
  it('acepta un grupo válido', () => {
    expect(readRunnerPool(' local-rod ')).toBe('local-rod');
    expect(readRunnerPool('a'.repeat(40))).toHaveLength(40);
  });
  it.each(['Local', '-rod', 'local_rod', 'a b', 'a'.repeat(41)])('rechaza "%s": el backend no arranca', (v) => {
    expect(() => readRunnerPool(v)).toThrow(/RUNNER_POOL/);
  });
});
