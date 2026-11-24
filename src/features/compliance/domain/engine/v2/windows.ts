import type { WindowMode } from '../../../../../common/evaluation-parameters/parameter-definitions';
import { EvaluationParameters } from './parameters';
import { Periodicity } from './types';

// Ventanas de calendario (D131, D140). Todo en UTC. `end` es exclusivo: la ventana de enero termina el 1 de febrero a las 00:00.
export type EvaluationWindow = { start: Date; end: Date };

const utc = (y: number, m: number, d = 1) => new Date(Date.UTC(y, m, d));

function addMonths(date: Date, months: number): Date {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

/**
 * La ventana vigente de una periodicidad en el instante `now` (D131): día, semana (de lunes a domingo), mes, bimestre, trimestre y semestre calendario. La anual son 12 meses
 * desde la última evidencia válida (D140): sin evidencia no hay ventana. La permanente y «cuando sea requerido» no tienen ventana.
 */
export function currentWindow(input: { periodicity: Periodicity | null; now: Date; lastValidAt?: Date | null; mode?: WindowMode; periodStart?: Date | null }): EvaluationWindow | null {
  const { periodicity, now } = input;
  // PR-07 `rolling`: la ventana arranca en la última evidencia válida (o, sin ella, en el inicio del período auditado) y dura una periodicidad.
  if (input.mode === 'rolling' && isRollingPeriodicity(periodicity)) {
    const anchor = input.lastValidAt ?? input.periodStart ?? null;
    return anchor ? { start: anchor, end: addPeriod(anchor, periodicity) } : null;
  }
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  switch (periodicity) {
    case 'daily': return { start: utc(y, m, now.getUTCDate()), end: utc(y, m, now.getUTCDate() + 1) };
    case 'weekly': {
      const sinceMonday = (now.getUTCDay() + 6) % 7;
      return { start: utc(y, m, now.getUTCDate() - sinceMonday), end: utc(y, m, now.getUTCDate() - sinceMonday + 7) };
    }
    case 'monthly': return { start: utc(y, m), end: utc(y, m + 1) };
    case 'bimonthly': return { start: utc(y, m - (m % 2)), end: utc(y, m - (m % 2) + 2) };
    case 'quarterly': return { start: utc(y, m - (m % 3)), end: utc(y, m - (m % 3) + 3) };
    case 'semiannual': return { start: utc(y, m - (m % 6)), end: utc(y, m - (m % 6) + 6) };
    case 'annual': return input.lastValidAt ? { start: input.lastValidAt, end: addMonths(input.lastValidAt, 12) } : null;
    default: return null;
  }
}

/** El último día de la ventana (inclusive) como `YYYY-MM-DD`: lo que la API llama `window_end`. */
export const windowEndDate = (w: EvaluationWindow | null): string | null => (w ? new Date(w.end.getTime() - 86_400_000).toISOString().slice(0, 10) : null);

/**
 * ¿Una evidencia fechada en `at` sigue valiendo hoy? En calendario, si cayó dentro de la ventana vigente; en la anual, si no pasaron 12 meses; la permanente y la de evento no
 * se vencen por fecha (la frescura de lo automático es `isFresh`).
 */
export function isEvidenceCurrent(periodicity: Periodicity | null, at: Date, now: Date, mode: WindowMode = 'calendar'): boolean {
  if (mode === 'rolling' && isRollingPeriodicity(periodicity)) return now.getTime() < addPeriod(at, periodicity).getTime();
  if (periodicity === 'annual') return now.getTime() < addMonths(at, 12).getTime();
  const window = currentWindow({ periodicity, now });
  return !window || at.getTime() >= window.start.getTime();
}

/** PR-05 · Un resultado automático solo vale si es más reciente que la frescura máxima. */
export const isFresh = (evaluatedAt: Date, now: Date, params: EvaluationParameters): boolean => now.getTime() - evaluatedAt.getTime() <= params.freshnessHours * 3_600_000;

/**
 * ¿Un resultado automático fechado en `evaluatedAt` sirve para la ventana vigente? Lo permanente, por frescura (PR-05); lo de calendario, si se produjo dentro de la ventana; sin
 * periodicidad no hay ventana y siempre sirve.
 */
export function isResultCurrent(periodicity: Periodicity | null, evaluatedAt: Date, now: Date, params: EvaluationParameters): boolean {
  if (periodicity === 'permanent') return isFresh(evaluatedAt, now, params);
  if (params.validityWindows === 'rolling' && isRollingPeriodicity(periodicity)) return isEvidenceCurrent(periodicity, evaluatedAt, now, 'rolling');
  if (periodicity === 'annual') return isEvidenceCurrent('annual', evaluatedAt, now);
  const window = currentWindow({ periodicity, now });
  return !window || evaluatedAt.getTime() >= window.start.getTime();
}

const DAY = 86_400_000;
const CALENDAR: readonly Periodicity[] = ['daily', 'weekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual'];
export const isCalendarPeriodicity = (p: Periodicity | null): boolean => p !== null && CALENDAR.includes(p);

// PR-07 `rolling`: todas las periodicidades con ventana (la anual también). `permanent` y «cuando sea requerido» no cambian.
const ROLLING: readonly Periodicity[] = [...CALENDAR, 'annual'];
export const isRollingPeriodicity = (p: Periodicity | null): p is Periodicity => p !== null && ROLLING.includes(p);
/** ¿Esta periodicidad tiene ventanas que se enumeran en el período auditado, según el modo de PR-07? */
export const hasPeriodWindows = (p: Periodicity | null, mode: WindowMode): boolean => (mode === 'rolling' ? isRollingPeriodicity(p) : isCalendarPeriodicity(p));

/** `date` más una periodicidad (meses de calendario donde corresponde). */
export function addPeriod(date: Date, periodicity: Periodicity): Date {
  switch (periodicity) {
    case 'daily': return new Date(date.getTime() + DAY);
    case 'weekly': return new Date(date.getTime() + 7 * DAY);
    case 'monthly': return addMonths(date, 1);
    case 'bimonthly': return addMonths(date, 2);
    case 'quarterly': return addMonths(date, 3);
    case 'semiannual': return addMonths(date, 6);
    default: return addMonths(date, 12);
  }
}

/**
 * PR-07 `rolling` · Los vencimientos que ya ocurrieron dentro del período auditado (G-11) y cuáles pasaron sin evidencia. El primero vence una periodicidad después del inicio del período;
 * cada evidencia válida (`dates`, ms) hace que el siguiente venza una periodicidad después de SU fecha (la última antes del vencimiento). Un vencimiento sin evidencia nueva es una
 * ventana perdida (como el cierre sin evidencia de una ventana de calendario) y el siguiente cuenta desde ese vencimiento. Solo cuentan los vencimientos hasta hoy y hasta el fin del período.
 */
export function rollingWindowsWithin(periodicity: Periodicity | null, period: { start: Date; end: Date }, dates: readonly number[], now: Date): { closed: EvaluationWindow[]; missing: EvaluationWindow[] } {
  const closed: EvaluationWindow[] = [];
  const missing: EvaluationWindow[] = [];
  if (!isRollingPeriodicity(periodicity)) return { closed, missing };
  const limit = Math.min(now.getTime(), period.end.getTime() + DAY);
  const inPeriod = dates.filter((d) => d >= period.start.getTime() && d < period.end.getTime() + DAY).sort((a, b) => a - b);
  let from = period.start;
  let due = addPeriod(from, periodicity);
  let i = 0;
  while (due.getTime() <= limit) {
    let latest: number | null = null;
    while (i < inPeriod.length && inPeriod[i] < due.getTime()) latest = inPeriod[i++];
    const w = { start: from, end: due };
    closed.push(w);
    if (latest !== null) from = new Date(latest);
    else {
      missing.push(w);
      from = due;
    }
    due = addPeriod(from, periodicity);
  }
  return { closed, missing };
}

/**
 * Las ventanas de calendario YA CERRADAS que caen por completo dentro del período auditado (G-11, R6). `periodEnd` es inclusivo. Las que solo lo tocan por un borde no cuentan.
 * Solo las periodicidades de calendario tienen ventanas fijas: la anual (desde la última evidencia), la permanente y la de evento no se enumeran.
 */
export function closedWindowsWithin(periodicity: Periodicity | null, period: { start: Date; end: Date }, now: Date): EvaluationWindow[] {
  if (!isCalendarPeriodicity(periodicity)) return [];
  const limit = Math.min(now.getTime(), period.end.getTime() + DAY);
  const out: EvaluationWindow[] = [];
  let w = currentWindow({ periodicity, now: period.start });
  while (w && w.end.getTime() <= limit) {
    if (w.start.getTime() >= period.start.getTime()) out.push(w);
    w = currentWindow({ periodicity, now: w.end });
  }
  return out;
}

/** El día del aviso previo (PR-06): el cierre de la ventana (`windowEnd`, `YYYY-MM-DD`) menos los días de la periodicidad. `null` si no hay ventana o la periodicidad no avisa. */
export function alertDate(windowEnd: string | null, periodicity: Periodicity | null, params: EvaluationParameters, now: Date): string | null {
  const day = (d: Date) => d.toISOString().slice(0, 10);
  if (periodicity === 'on_demand') {
    const end = windowEndDate(currentWindow({ periodicity: 'quarterly', now }));
    return end ? day(new Date(Date.parse(end) - params.onDemandAlertDays * DAY)) : null;
  }
  const days = periodicity ? params.alertDaysBefore[periodicity] : undefined;
  if (!windowEnd || days === undefined) return null;
  return day(new Date(Date.parse(windowEnd) - days * DAY));
}
