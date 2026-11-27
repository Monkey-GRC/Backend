import { gapPriority, normalizeSeverity, worstSeverity, type GapPriority } from './gap-priority';

// D162 · Tabla completa: severidad (5 niveles + sin severidad) × criticidad del activo (4).
describe('gapPriority (D162)', () => {
  const CRITICALITIES = ['low', 'medium', 'high', 'critical'] as const;
  const TABLE: Record<string, GapPriority[]> = {
    // criticidad:   low       medium    high      critical
    critical: ['high', 'high', 'critical', 'critical'],
    high: ['medium', 'high', 'high', 'critical'],
    medium: ['medium', 'medium', 'high', 'high'],
    low: ['low', 'medium', 'medium', 'high'],
    informational: ['low', 'medium', 'medium', 'high'],
    // La sonda no califica sus checks: la prioridad es la criticidad del activo.
    none: ['low', 'medium', 'high', 'critical'],
  };

  for (const [severity, expected] of Object.entries(TABLE)) {
    CRITICALITIES.forEach((criticality, i) => {
      it(`severidad ${severity} en un activo ${criticality} → ${expected[i]}`, () => {
        expect(gapPriority({ severity: severity === 'none' ? null : severity, assetCriticality: criticality })).toBe(expected[i]);
      });
    });
  }

  it('el ejemplo del contrato: un check crítico en un activo de criticidad baja es alta (2,5 → 3)', () => {
    expect(gapPriority({ severity: 'critical', assetCriticality: 'low' })).toBe('high');
  });

  it('un valor fuera de la escala cuenta como medio', () => {
    expect(gapPriority({ severity: 'weird', assetCriticality: 'weird' })).toBe('medium');
  });
});

describe('severidad', () => {
  it('normaliza: sin dato es nula y lo desconocido es media', () => {
    expect(normalizeSeverity(null)).toBeNull();
    expect(normalizeSeverity('  ')).toBeNull();
    expect(normalizeSeverity('HIGH')).toBe('high');
    expect(normalizeSeverity('catastrophic')).toBe('medium');
  });

  it('la más grave gana y una calificada gana a una sin calificar', () => {
    expect(worstSeverity('low', 'critical')).toBe('critical');
    expect(worstSeverity(null, 'low')).toBe('low');
    expect(worstSeverity('high', null)).toBe('high');
    expect(worstSeverity(null, null)).toBeNull();
  });
});
