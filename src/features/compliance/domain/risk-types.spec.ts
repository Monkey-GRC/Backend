import { LOSS_TYPES, lossTypesOf, nextCode, riskLevelOf, storedLossTypes } from './risk-types';

describe('tipos de pérdida (impacto potencial)', () => {
  it('lee el texto del catálogo como valores de la API', () => {
    expect(lossTypesOf(['Reputacional', 'Sanción regulatoria', 'Pérdida de confianza de clientes'])).toEqual(['reputational', 'regulatory_sanction', 'customer_trust_loss']);
  });

  it('las dos variantes del Excel de la interrupción son un solo valor (P9)', () => {
    expect(lossTypesOf(['Interrupción de la operación', 'Interrupción o cierre de la operación'])).toEqual(['operation_interruption']);
  });

  it('un texto desconocido se omite en la respuesta, sin romper la lectura', () => {
    expect(lossTypesOf(['Reputacional', 'Algo nuevo'])).toEqual(['reputational']);
    expect(lossTypesOf(null)).toEqual([]);
    expect(lossTypesOf('Reputacional')).toEqual([]);
  });

  it('ida y vuelta: lo que se guarda vuelve a leerse igual', () => {
    expect(lossTypesOf(storedLossTypes(LOSS_TYPES))).toEqual([...LOSS_TYPES]);
    expect(storedLossTypes(['financial_loss', 'financial_loss'])).toEqual(['Pérdida financiera']);
  });
});

describe('riskLevelOf — la matriz 5×5 (MD-123)', () => {
  it.each([[1, 'low'], [4, 'low'], [5, 'moderate'], [9, 'moderate'], [10, 'high'], [16, 'high'], [17, 'critical'], [25, 'critical']])('%i → %s', (value, level) => {
    expect(riskLevelOf(value)).toBe(level);
  });
});

describe('nextCode', () => {
  it('continúa la serie con tres dígitos', () => {
    expect(nextCode('R', ['R001', 'R002', 'R010'])).toBe('R011');
    expect(nextCode('F', ['F056'])).toBe('F057');
    expect(nextCode('R', [])).toBe('R001');
  });
  it('ignora códigos de otra serie o con otro formato', () => {
    expect(nextCode('R', ['F099', 'RX', 'R7'])).toBe('R008');
  });
});
