import { Prisma } from '../../../../../generated/prisma/client';

const DAY_MS = 86_400_000;

/** Hoy como día UTC (la base corre en UTC): las fechas de vigencia son días, no instantes. */
export const utcToday = (now: Date = new Date()): Date => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

/**
 * D135 · «Ya venció» sobre `effective_until = min(valid_until, valid_from + PR-04)`, dicho en columnas: `valid_until < hoy` o `valid_from + PR-04 < hoy`.
 * Es la misma regla de `exceptionEndsOn`, que el motor y los avisos aplican al leer.
 */
export const expiredWhere = (today: Date, maxDays: number): Prisma.ExclusionWhereInput => ({
  status: 'approved',
  OR: [{ validUntil: { lt: today } }, { validFrom: { lt: new Date(today.getTime() - maxDays * DAY_MS) } }],
});
