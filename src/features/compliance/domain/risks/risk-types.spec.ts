import { LOSS_TYPES, lossTypesOf, nextCode, riskLevelAt, riskMatrix, storedLossTypes } from './risk-types';

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

const D134: Record<number, string[]> = {
  5: ['high', 'high', 'critical', 'critical', 'critical'],
  4: ['moderate', 'high', 'high', 'critical', 'critical'],
  3: ['low', 'moderate', 'high', 'critical', 'critical'],
  2: ['low', 'low', 'moderate', 'high', 'critical'],
  1: ['low', 'low', 'moderate', 'high', 'high'],
};
const ALL_CELLS = Object.entries(D134).flatMap(([l, row]) => row.map((level, i) => [Number(l), i + 1, level] as const));

describe('riskLevelAt: la matriz 5×5 por casilla (D134)', () => {
  it.each(ALL_CELLS)('probabilidad %i × impacto %i → %s', (likelihood, impact, level) => {
    expect(riskLevelAt(likelihood, impact)).toBe(level);
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

describe('riskMatrix', () => {
  const { min, max, cells } = riskMatrix();

  it('trae las 25 casillas de la escala, cada una con su valor (probabilidad × impacto)', () => {
    expect([min, max]).toEqual([1, 5]);
    expect(cells).toHaveLength(25);
    expect(new Set(cells.map((c) => c.likelihood + '-' + c.impact)).size).toBe(25);
    for (const c of cells) expect(c.value).toBe(c.likelihood * c.impact);
  });

  it('el nivel de cada una de las 25 casillas es el de la tabla D134', () => {
    for (const c of cells) expect(c.level).toBe(riskLevelAt(c.likelihood, c.impact));
  });
});
