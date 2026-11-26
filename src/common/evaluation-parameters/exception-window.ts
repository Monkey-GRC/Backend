import type { EvaluationParameters } from './parameters';

const DAY_MS = 86_400_000;

/** D135 · Una excepción vigente dura como máximo PR-04 días desde su inicio. La usan el motor (qué FAIL deja pasar) y los avisos (qué FAIL no avisa): una sola regla. */
export function exceptionEndsOn(validFrom: Date, validUntil: Date, params: Pick<EvaluationParameters, 'checkExceptionMaxDays'>): Date {
  const cap = new Date(validFrom.getTime() + params.checkExceptionMaxDays * DAY_MS);
  return cap.getTime() < validUntil.getTime() ? cap : validUntil;
}
