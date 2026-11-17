import { scaResultToCheckResult } from './sca-result';

describe('scaResultToCheckResult', () => {
  it.each([
    ['passed', 'passed'],
    ['failed', 'failed'],
    ['invalid', 'invalid'],
    ['not applicable', 'not_applicable'],
    ['not run', 'not_run'],
  ])('«%s» → %s', (raw, expected) => {
    expect(scaResultToCheckResult(raw)).toBe(expected);
  });

  it('`not applicable` llega como esas palabras (API 4.14.6) o como vacío (lo que dice el cerebro): las dos son «no aplica», no «pasó»', () => {
    for (const raw of ['not applicable', '', '   ', null, undefined, 'not_applicable']) expect(scaResultToCheckResult(raw)).toBe('not_applicable');
  });

  it('ignora mayúsculas, espacios sobrantes y saltos', () => {
    expect(scaResultToCheckResult('  FAILED ')).toBe('failed');
    expect(scaResultToCheckResult('Not   Applicable')).toBe('not_applicable');
  });

  it('un resultado que no conocemos NUNCA se toma por «pasó»: queda `invalid` (regla 3: la IA y el código no certifican sin base)', () => {
    for (const raw of ['ok', 'success', 'compliant', 'true', '1', 'passed!', 'PASS']) expect(scaResultToCheckResult(raw)).toBe('invalid');
  });
});
