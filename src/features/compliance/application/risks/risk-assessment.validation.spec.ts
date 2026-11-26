import { ValidationException } from '../../../../common/errors/validation.exception';
import { riskLevelAt, riskValueOf } from '../../domain/risks/risk-types';
import { parseDueDate, validateEvaluation } from './risk-assessment.validation';

describe('el nivel de un riesgo sale de su casilla (D134)', () => {
  const TABLE: Record<number, string[]> = {
    5: ['high', 'high', 'critical', 'critical', 'critical'],
    4: ['moderate', 'high', 'high', 'critical', 'critical'],
    3: ['low', 'moderate', 'high', 'critical', 'critical'],
    2: ['low', 'low', 'moderate', 'high', 'critical'],
    1: ['low', 'low', 'moderate', 'high', 'high'],
  };
  const cells = Object.entries(TABLE).flatMap(([l, row]) => row.map((level, i) => [Number(l), i + 1, level] as const));
  it.each(cells)('probabilidad %i × impacto %i → %s', (likelihood, impact, level) => {
    expect(riskValueOf(likelihood, impact)).toBe(likelihood * impact);
    expect(riskLevelAt(likelihood, impact)).toBe(level);
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
