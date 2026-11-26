import { checkTitleOf, evidenceTestsOf } from './control-response.mapper';

const test = (testId: string, primarySource: string, extra: object = {}) => ({ test: { testId, code: `C-${testId}`, dimension: 'process', primarySource, integrationCategory: 'Identidades', ...extra } as never, state: 'pending' as const, status: 'pending' as const, manual: true });

const ALL = new Set(['process']);

describe('evidence_tests del detalle (MD-499)', () => {
  const nameOf = () => 'Prueba';

  it('solo las pruebas que aceptan subida, con el lugar ya creado o null', () => {
    const out = evidenceTestsOf([test('a', 'manual'), test('b', 'probe'), test('c', 'integration')], [{ requirementId: 'r1', testId: 'a' }, { requirementId: 'r2', testId: null }], new Set(), ALL, nameOf);
    expect(out.map((t) => [t.test_id, t.evidence_fallback, t.requirement_id])).toEqual([['a', false, 'r1'], ['c', true, null]]);
  });

  it('un control con solo pruebas automáticas no ofrece ninguna', () => {
    expect(evidenceTestsOf([test('a', 'probe'), test('b', 'cloud_engine'), test('c', 'probe_and_cloud_engine')], [], new Set(), ALL, nameOf)).toEqual([]);
  });

  it('una prueba de una dimensión que no aplica en el control no se ofrece', () => {
    expect(evidenceTestsOf([test('a', 'manual')], [], new Set(), new Set(['policy']), nameOf)).toEqual([]);
  });

  it('una integración conectada deja de ofrecer la subida', () => {
    expect(evidenceTestsOf([test('c', 'integration')], [], new Set(['Identidades']), ALL, nameOf)).toEqual([]);
  });
});

describe('checkTitleOf · SEG-39', () => {
  const neutral = 'Comprobación automática';

  it('prefiere el título en español y cae al inglés', () => {
    expect(checkTitleOf({ titleEs: 'Cifrado activo', titleEn: 'Encryption on' }, false, neutral)).toBe('Cifrado activo');
    expect(checkTitleOf({ titleEs: 'Cifrado activo', titleEn: 'Encryption on' }, true, neutral)).toBe('Encryption on');
    expect(checkTitleOf({ titleEs: null, titleEn: 'Encryption on' }, false, neutral)).toBe('Encryption on');
  });

  it('un título que nombra al proveedor no sale: se usa el otro idioma o el neutro', () => {
    expect(checkTitleOf({ titleEs: 'Falla en Prowler', titleEn: 'Encryption on' }, false, neutral)).toBe('Encryption on');
    expect(checkTitleOf({ titleEs: 'Regla de Wazuh', titleEn: 'Wazuh rule' }, false, neutral)).toBe(neutral);
    expect(checkTitleOf({ titleEs: null, titleEn: 'PROWLER check' }, true, neutral)).toBe(neutral);
  });
});
