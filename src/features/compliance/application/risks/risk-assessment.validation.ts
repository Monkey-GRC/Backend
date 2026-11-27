import { FieldError, ValidationException } from '../../../../common/errors/validation.exception';
import { RISK_SCALE } from '../../domain/risks/risk-types';

// Las validaciones de la evaluación y del tratamiento que dependen del contenido (contracts/modules/compliance-risks.md). Devuelven TODOS los errores a la vez.
export function validateEvaluation(likelihood: number, impact: number): void {
  const fields: FieldError[] = [];
  for (const [field, value] of [['likelihood', likelihood], ['impact', impact]] as const) {
    if (value < RISK_SCALE.min || value > RISK_SCALE.max) fields.push({ field, code: 'number.range' });
  }
  if (fields.length) throw new ValidationException(fields);
}

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** La fecha límite del tratamiento (`YYYY-MM-DD`) como día UTC. Una fecha mal escrita es `date.invalid`; una pasada, `date.past` (hoy sí vale). */
export function parseDay(raw: string, field: string): Date {
  const m = DATE.exec(raw);
  const date = m ? new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))) : null;
  // `Date.UTC` corrige un 31 de febrero en vez de rechazarlo: se compara contra lo que escribió el cliente.
  if (!m || !date || date.toISOString().slice(0, 10) !== raw) throw new ValidationException([{ field, code: 'date.invalid' }]);
  return date;
}

export function parseDueDate(raw: string, now: Date = new Date()): Date {
  const date = parseDay(raw, 'due_date');
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (date < today) throw new ValidationException([{ field: 'due_date', code: 'date.past' }]);
  return date;
}
