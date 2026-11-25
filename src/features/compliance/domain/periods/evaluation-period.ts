// El período auditado y la fecha de corte de la evaluación de un servicio × marco (D87, REQ-004, MD-168). Funciones puras: sin Nest ni Prisma.
//
// · El período lo declara la empresa; en SOC 2 dura como mínimo PR-16 (6 meses: solo Tipo II, D145). Hay uno abierto por servicio × marco y los cerrados quedan de histórico (D148).
// · La fecha de corte sin valor guardado es «hoy» (sin salirse del período); con valor guardado está congelada. No reinicia nada: es la etiqueta de «hasta qué día se miró».

export type EvaluationPeriod = { periodStart: Date | null; periodEnd: Date | null; cutoffDate: Date | null };

export type EffectiveCutoff = { date: Date; frozen: boolean };

/** Hoy como día UTC (la base corre en UTC): las fechas de la evaluación son días, no instantes. */
export const utcDay = (now: Date = new Date()): Date => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

/** El motor ejecuta con inicio y fin; la fecha de corte ya no hace falta guardarla (D87). */
export const isPeriodDefined = (p: EvaluationPeriod): p is { periodStart: Date; periodEnd: Date; cutoffDate: Date | null } => p.periodStart !== null && p.periodEnd !== null;

/**
 * La fecha de corte con la que se evalúa: la congelada si la hay; si no, hoy, sin salirse del período (nunca antes del inicio ni después del fin).
 * `null` si el período no está definido.
 */
export function effectiveCutoff(p: EvaluationPeriod, today: Date = utcDay()): EffectiveCutoff | null {
  if (!isPeriodDefined(p)) return null;
  if (p.cutoffDate) return { date: p.cutoffDate, frozen: true };
  const t = today.getTime();
  const date = t < p.periodStart.getTime() ? p.periodStart : t > p.periodEnd.getTime() ? p.periodEnd : today;
  return { date, frozen: false };
}

const DAY_MS = 86_400_000;

/** Los marcos cuyo período auditado tiene una duración mínima (PR-16). */
export const FRAMEWORKS_WITH_MIN_PERIOD: readonly string[] = ['soc2'];

/** PR-16 · La duración mínima (meses) que exige el marco, o `null` si no exige ninguna. Una sola regla para la validación y para el resumen. */
export const minPeriodMonthsOf = (frameworkCode: string, prMinMonths: number): number | null => (FRAMEWORKS_WITH_MIN_PERIOD.includes(frameworkCode) ? prMinMonths : null);

/** `date` más `months` meses de calendario (si el día no existe en el mes de destino, el último de ese mes). */
export function addMonthsUtc(date: Date, months: number): Date {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

/** PR-16 · El período dura al menos `minMonths` meses: el fin no puede ser anterior a inicio + `minMonths` meses − 1 día. */
export function isPeriodTooShort(start: Date, end: Date, minMonths: number): boolean {
  return end.getTime() < addMonthsUtc(start, minMonths).getTime() - DAY_MS;
}

const isFirstOfMonth = (d: Date) => d.getUTCDate() === 1;
const isLastOfMonth = (d: Date) => new Date(d.getTime() + DAY_MS).getUTCDate() === 1;

/**
 * El período siguiente (D145): empieza el día después del fin y dura lo mismo, en meses de calendario si el anterior iba del primero al último día de un mes, y si no, en el mismo
 * número de días. La fecha de corte del nuevo queda sin valor («hoy»).
 */
export function nextPeriod(prev: { periodStart: Date; periodEnd: Date }): { periodStart: Date; periodEnd: Date } {
  const start = new Date(prev.periodEnd.getTime() + DAY_MS);
  if (isFirstOfMonth(prev.periodStart) && isLastOfMonth(prev.periodEnd)) {
    const months = (prev.periodEnd.getUTCFullYear() - prev.periodStart.getUTCFullYear()) * 12 + (prev.periodEnd.getUTCMonth() - prev.periodStart.getUTCMonth()) + 1;
    return { periodStart: start, periodEnd: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, 0)) };
  }
  const span = prev.periodEnd.getTime() - prev.periodStart.getTime();
  return { periodStart: start, periodEnd: new Date(start.getTime() + span) };
}

/** El período abierto ya terminó: su último día es anterior a hoy. */
export const hasEnded = (periodEnd: Date, today: Date = utcDay()): boolean => periodEnd.getTime() < today.getTime();
