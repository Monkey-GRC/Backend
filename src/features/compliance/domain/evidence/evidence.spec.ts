import { evidenceStateOf } from './evidence';

describe('evidenceStateOf (D132 punto 3)', () => {
  it('una entrega cargada cuenta: la aprobación es del control, no de la evidencia', () => {
    expect(evidenceStateOf({ returned: false })).toBe('compliant');
  });

  it('una entrega devuelta deja de contar y se muestra como rechazada', () => {
    expect(evidenceStateOf({ returned: true })).toBe('non_compliant');
  });
});
