import { dimensionTypeOf } from './dimension-type';

describe('el tipo de una dimensión (MD-499)', () => {
  it('las cuatro nuevas salen de las fuentes de sus pruebas', () => {
    expect(dimensionTypeOf('process', 'automated', ['manual', 'document'])).toBe('manual');
    expect(dimensionTypeOf('endpoint', 'manual', ['probe', 'integration', 'probe_and_cloud_engine'])).toBe('automated');
    expect(dimensionTypeOf('network', 'manual', ['manual', 'integration'])).toBe('hybrid');
    expect(dimensionTypeOf('physical', 'manual', ['cloud_engine', 'manual'])).toBe('hybrid');
  });
  it('las cinco de siempre y una nueva sin pruebas conservan el tipo derivado del control', () => {
    expect(dimensionTypeOf('server', 'automated', ['manual'])).toBe('automated');
    expect(dimensionTypeOf('policy', 'it_dependent_manual', ['document'])).toBe('hybrid');
    expect(dimensionTypeOf('cloud', 'manual', ['cloud_engine'])).toBe('manual');
    expect(dimensionTypeOf('network', 'it_dependent_manual', [])).toBe('hybrid');
  });
});
