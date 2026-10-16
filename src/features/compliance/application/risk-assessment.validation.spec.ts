import { ValidationException } from '../../../common/errors/validation.exception';
import { riskLevelOf, riskValueOf } from '../domain/risk-types';
import { parseDueDate, validateEvaluation } from './risk-assessment.validation';

describe('el nivel de un riesgo (MD-123, D33)', () => {
  it.each([
    [2, 2, 4, 'low'],
    [3, 3, 9, 'moderate'],
    [2, 5, 10, 'high'],
    [4, 4, 16, 'high'],
    [5, 4, 20, 'critical'],
    [1, 1, 1, 'low'],
    [1, 5, 5, 'moderate'],
    [5, 5, 25, 'critical'],
  ])('probabilidad %i × impacto %i = %i → %s', (likelihood, impact, value, level) => {
    expect(riskValueOf(likelihood, impact)).toBe(value);
    expect(riskLevelOf(value)).toBe(level);
  });

  it('los cortes están en 4/5, 9/10 y 16/17', () => {
    expect([4, 5, 9, 10, 16, 17].map(riskLevelOf)).toEqual(['low', 'moderate', 'moderate', 'high', 'high', 'critical']);
  });
});

describe('validateEvaluation', () => {
  const codes = (fn: () => void) => {
    try {
      fn();
    } catch (e) {
      return (e as ValidationException).fields;
    }
    return [];
  };
  it('acepta de 1 a 5', () => {
    expect(codes(() => validateEvaluation(1, 5))).toEqual([]);
  });
  it('rechaza lo que sale del rango y dice todos los campos a la vez', () => {
    expect(codes(() => validateEvaluation(0, 6))).toEqual([{ field: 'likelihood', code: 'number.range' }, { field: 'impact', code: 'number.range' }]);
  });
});

describe('parseDueDate', () => {
  const now = new Date('2026-10-16T22:30:00Z');
  const code = (raw: string) => {
    try {
      parseDueDate(raw, now);
    } catch (e) {
      return (e as ValidationException).fields[0].code;
    }
    return 'ok';
  };
  it('hoy y el futuro valen; ayer no', () => {
    expect(code('2026-10-16')).toBe('ok');
    expect(code('2026-12-15')).toBe('ok');
    expect(code('2026-10-15')).toBe('date.past');
  });
  it('una fecha que no existe o mal escrita es date.invalid', () => {
    expect(code('2026-02-31')).toBe('date.invalid');
    expect(code('15/12/2026')).toBe('date.invalid');
    expect(code('mañana')).toBe('date.invalid');
  });
});
