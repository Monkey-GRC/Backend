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
export function currentWindow(input: { periodicity: Periodicity | null; now: Date; lastValidAt?: Date | null }): EvaluationWindow | null {
  const { periodicity, now } = input;
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
export function isEvidenceCurrent(periodicity: Periodicity | null, at: Date, now: Date): boolean {
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
  if (periodicity === 'annual') return isEvidenceCurrent('annual', evaluatedAt, now);
  const window = currentWindow({ periodicity, now });
  return !window || evaluatedAt.getTime() >= window.start.getTime();
}
