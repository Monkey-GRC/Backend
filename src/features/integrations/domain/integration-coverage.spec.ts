import { deriveCoverage } from './integration-coverage';

describe('cobertura de una integración', () => {
  it('sin checks cargados es null', () => {
    expect(deriveCoverage(null)).toBeNull();
  });

  it('cuenta los controles sin repetir, en total y por marco', () => {
    const out = deriveCoverage({
      tests: [{ code: 'T-CLD-002', displayName: 'B', displayNameEn: null }, { code: 'T-CLD-001', displayName: 'A', displayNameEn: null }],
      controlIds: ['c1', 'c2', 'c1'],
      frameworkLinks: [
        { controlId: 'c1', frameworkCode: 'soc2', frameworkName: 'SOC 2' },
        { controlId: 'c1', frameworkCode: 'soc2', frameworkName: 'SOC 2' },
        { controlId: 'c2', frameworkCode: 'soc2', frameworkName: 'SOC 2' },
        { controlId: 'c2', frameworkCode: 'iso', frameworkName: 'ISO' },
      ],
    });
    expect(out).toEqual({
      tests: [{ code: 'T-CLD-001', displayName: 'A', displayNameEn: null }, { code: 'T-CLD-002', displayName: 'B', displayNameEn: null }],
      controlsCount: 2,
      frameworks: [{ code: 'iso', name: 'ISO', controlsCount: 1 }, { code: 'soc2', name: 'SOC 2', controlsCount: 2 }],
    });
  });

  it('una prueba sin controles aporta cero controles', () => {
    expect(deriveCoverage({ tests: [{ code: 'T-1', displayName: 'x', displayNameEn: null }], controlIds: [], frameworkLinks: [] })).toEqual({ tests: [{ code: 'T-1', displayName: 'x', displayNameEn: null }], controlsCount: 0, frameworks: [] });
  });
});
