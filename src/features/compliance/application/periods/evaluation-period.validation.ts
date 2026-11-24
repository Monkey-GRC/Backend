import { FieldError, ValidationException } from '../../../../common/errors/validation.exception';
import { isPeriodTooShort, utcDay } from '../../domain/periods/evaluation-period';

// Las validaciones del período y la fecha de corte (contracts/modules/compliance-overview.md, D87). Devuelven TODOS los errores a la vez.
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** `YYYY-MM-DD` como día UTC, o `null` si no es una fecha real (`Date.UTC` corrige un 31 de febrero: se compara contra lo que escribió el cliente). */
const parseDay = (raw: string): Date | null => {
  const m = DATE.exec(raw);
  if (!m) return null;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return date.toISOString().slice(0, 10) === raw ? date : null;
};

export type PeriodInput = { period_start: string; period_end: string; cutoff_date?: string | null };
export type ValidPeriod = { periodStart: Date; periodEnd: Date; cutoffDate: Date | null };

/** `minMonths` es PR-16 (6 meses en SOC 2); `null` si el marco no exige un mínimo. */
export function validateEvaluationPeriod(input: PeriodInput, now: Date = new Date(), minMonths: number | null = null): ValidPeriod {
  const fields: FieldError[] = [];
  const start = parseDay(input.period_start);
  const end = parseDay(input.period_end);
  if (!start) fields.push({ field: 'period_start', code: 'date.invalid' });
  if (!end) fields.push({ field: 'period_end', code: 'date.invalid' });
  // El inicio es anterior al fin (D145: ya no hay períodos de un día) y, si el marco lo exige, dura al menos PR-16.
  if (start && end && start >= end) fields.push({ field: 'period_end', code: 'period.invalid_range' });
  else if (start && end && minMonths !== null && isPeriodTooShort(start, end, minMonths)) fields.push({ field: 'period_end', code: 'period.too_short' });

  let cutoff: Date | null = null;
  if (input.cutoff_date !== undefined && input.cutoff_date !== null) {
    cutoff = parseDay(input.cutoff_date);
    if (!cutoff) fields.push({ field: 'cutoff_date', code: 'date.invalid' });
    else if (start && end && start < end && (cutoff < start || cutoff > end)) fields.push({ field: 'cutoff_date', code: 'cutoff.out_of_period' });
    else if (cutoff > utcDay(now)) fields.push({ field: 'cutoff_date', code: 'cutoff.in_future' });
  }

  if (fields.length) throw new ValidationException(fields);
  return { periodStart: start!, periodEnd: end!, cutoffDate: cutoff };
}
