// El período auditado y la fecha de corte de la evaluación de un servicio × marco (D87, REQ-004, MD-168). Funciones puras: sin Nest ni Prisma.
//
// · El período lo declara la empresa y puede ser de un solo día (SOC 2 Tipo I es una fecha puntual; el Tipo II, un período de 6 a 12 meses).
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
