import { acceptsEvidence, evidenceAcceptanceOf, evidenceBlockOf, NO_INTEGRATIONS } from './test-evidence-source';

describe('fuente de la evidencia de una prueba (MD-499)', () => {
  it.each([
    ['document', true], ['manual', true], [null, true], [undefined, true],
    ['probe', false], ['cloud_engine', false], ['probe_and_cloud_engine', false],
  ])('fuente %s → acepta subida %s, sin respaldo', (primarySource, accepts) => {
    expect(evidenceAcceptanceOf({ primarySource })).toEqual({ accepts, fallback: false });
    expect(acceptsEvidence({ primarySource }, new Set(['Cualquiera']))).toBe(accepts);
  });

  it('integration sin la integración conectada: acepta subida de respaldo', () => {
    expect(evidenceAcceptanceOf({ primarySource: 'integration', integrationCategory: 'Gestión de Identidades' })).toEqual({ accepts: true, fallback: true });
    expect(evidenceAcceptanceOf({ primarySource: 'integration', integrationCategory: 'Gestión de Identidades' }, new Set(['Otra categoría']))).toEqual({ accepts: true, fallback: true });
    expect(evidenceAcceptanceOf({ primarySource: 'integration', integrationCategory: null })).toEqual({ accepts: true, fallback: true });
  });

  it('integration con la integración de su categoría conectada: no acepta; al desconectarla, vuelve a aceptar', () => {
    const test = { primarySource: 'integration', integrationCategory: 'Gestión de Identidades' };
    expect(evidenceAcceptanceOf(test, new Set(['Gestión de Identidades']))).toEqual({ accepts: false, fallback: false });
    expect(evidenceAcceptanceOf(test, new Set())).toEqual({ accepts: true, fallback: true });
  });
});

describe('la dimensión aplicable y el orden de los motivos (MD-499)', () => {
  const identity = { primarySource: 'integration', integrationCategory: 'Gestión de Identidades' };

  it('una dimensión que no aplica en el control no acepta subida, sea cual sea la fuente', () => {
    for (const primarySource of ['document', 'manual', 'integration', null]) {
      expect(evidenceAcceptanceOf({ primarySource }, NO_INTEGRATIONS, false)).toEqual({ accepts: false, fallback: false });
      expect(acceptsEvidence({ primarySource }, NO_INTEGRATIONS, false)).toBe(false);
    }
  });

  it.each([
    ['aplica y la fuente acepta', { primarySource: 'document' }, NO_INTEGRATIONS, true, null],
    ['aplica y es de respaldo', identity, NO_INTEGRATIONS, true, null],
    ['no aplica, aunque la fuente acepte', { primarySource: 'manual' }, NO_INTEGRATIONS, false, 'dimension.not_in_control'],
    ['no aplica y además no acepta: gana la dimensión', { primarySource: 'probe' }, NO_INTEGRATIONS, false, 'dimension.not_in_control'],
    ['aplica pero la mide la sonda', { primarySource: 'probe' }, NO_INTEGRATIONS, true, 'test.not_manual'],
    ['aplica pero su integración está conectada', identity, new Set(['Gestión de Identidades']), true, 'test.not_manual'],
  ] as const)('evidenceBlockOf · %s', (_caso, test, connected, applies, expected) => {
    expect(evidenceBlockOf(test, connected, applies)).toBe(expected);
  });
});
