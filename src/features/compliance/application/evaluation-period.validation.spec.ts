import { ValidationException } from '../../../common/errors/validation.exception';
import { PeriodInput, validateEvaluationPeriod } from './evaluation-period.validation';

const NOW = new Date('2026-10-20T15:30:00.000Z');
const day = (x: Date | null) => x?.toISOString().slice(0, 10) ?? null;
const run = (input: PeriodInput) => validateEvaluationPeriod(input, NOW);
const errors = (input: PeriodInput): Array<[string, string]> => {
  try {
    run(input);
  } catch (e) {
    return (e as ValidationException).fields.map((f) => [f.field, f.code]);
  }
  return [];
};

describe('validateEvaluationPeriod (D87)', () => {
  it('acepta un período con inicio y fin, y sin fecha de corte (será «hoy»)', () => {
    const v = run({ period_start: '2026-01-01', period_end: '2026-12-31' });
    expect([day(v.periodStart), day(v.periodEnd), v.cutoffDate]).toEqual(['2026-01-01', '2026-12-31', null]);
  });

  it('un `null` explícito en la fecha de corte es lo mismo que no mandarla', () => {
    expect(run({ period_start: '2026-01-01', period_end: '2026-12-31', cutoff_date: null }).cutoffDate).toBeNull();
  });

  it('acepta un período de un solo día (SOC 2 Tipo I)', () => {
    const v = run({ period_start: '2026-10-15', period_end: '2026-10-15' });
    expect(day(v.periodStart)).toBe(day(v.periodEnd));
  });

  it('congela la fecha de corte si cae dentro del período y no es futura (hoy sí vale)', () => {
    expect(day(run({ period_start: '2026-01-01', period_end: '2026-12-31', cutoff_date: '2026-10-14' }).cutoffDate)).toBe('2026-10-14');
    expect(day(run({ period_start: '2026-01-01', period_end: '2026-12-31', cutoff_date: '2026-10-20' }).cutoffDate)).toBe('2026-10-20');
  });

  it('rechaza un fin anterior al inicio', () => {
    expect(errors({ period_start: '2026-12-31', period_end: '2026-01-01' })).toEqual([['period_end', 'period.invalid_range']]);
  });

  it('rechaza una fecha de corte fuera del período', () => {
    expect(errors({ period_start: '2026-01-01', period_end: '2026-06-30', cutoff_date: '2026-09-01' })).toEqual([['cutoff_date', 'cutoff.out_of_period']]);
    expect(errors({ period_start: '2026-03-01', period_end: '2026-06-30', cutoff_date: '2026-02-01' })).toEqual([['cutoff_date', 'cutoff.out_of_period']]);
  });

  it('rechaza una fecha de corte en el futuro, aunque esté dentro del período', () => {
    expect(errors({ period_start: '2026-01-01', period_end: '2026-12-31', cutoff_date: '2026-11-01' })).toEqual([['cutoff_date', 'cutoff.in_future']]);
  });

  it('una fecha mal escrita o que no existe es date.invalid, campo por campo', () => {
    expect(errors({ period_start: '2026-02-31', period_end: '15/12/2026' })).toEqual([['period_start', 'date.invalid'], ['period_end', 'date.invalid']]);
    expect(errors({ period_start: '2026-01-01', period_end: '2026-12-31', cutoff_date: 'ayer' })).toEqual([['cutoff_date', 'date.invalid']]);
  });

  it('devuelve todos los errores a la vez', () => {
    expect(errors({ period_start: '2026-12-31', period_end: '2026-01-01', cutoff_date: 'x' })).toEqual([['period_end', 'period.invalid_range'], ['cutoff_date', 'date.invalid']]);
  });
});
