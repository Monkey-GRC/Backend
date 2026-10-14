import { FieldError, ValidationException } from '../../../common/errors/validation.exception';
import { ChangeType } from '../domain/repositories/control-change.repository';

// Las validaciones que dependen del contenido (contracts/modules/compliance-controls.md). Devuelven TODOS los errores a la vez, con el nombre del campo del
// request y el código corto del contrato.
const DIMENSIONS = ['policy', 'server', 'database', 'app', 'cloud'];
const REASON_MAX = 500;
const INTERPRETATION_MAX = 4000;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function validateOwnControl(dimensions: unknown[] | undefined, trustCriterion: string, contracted: string[]): void {
  const fields: FieldError[] = [];
  // Un control propio es solo documental (D65): si manda dimensiones, solo puede ser `policy`.
  (dimensions ?? []).forEach((d, i) => {
    if (d !== 'policy') fields.push({ field: `dimensions[${i}]`, code: 'dimension.policy_only' });
  });
  // La categoría debe ser una de las que el servicio contrató (Seguridad siempre lo está).
  if (!contracted.includes(trustCriterion)) fields.push({ field: 'trust_criterion', code: 'category.not_in_scope' });
  if (fields.length) throw new ValidationException(fields);
}

/** Valida y normaliza `proposed_values` según el tipo de cambio. Lo que devuelve es lo que se guarda. */
export function validateProposal(changeType: Exclude<ChangeType, 'create'>, raw: Record<string, unknown> | undefined): Record<string, unknown> {
  const fields: FieldError[] = [];
  const values = raw ?? {};

  if (changeType === 'retire') return {};

  if (changeType === 'edit_interpretation') {
    const text = typeof values.interpretation === 'string' ? values.interpretation.trim() : '';
    if (!text) fields.push({ field: 'proposed_values.interpretation', code: 'required' });
    else if (text.length > INTERPRETATION_MAX) fields.push({ field: 'proposed_values.interpretation', code: 'string.max' });
    if (fields.length) throw new ValidationException(fields);
    return { interpretation: text };
  }

  // edit_dimensions
  const list = values.dimensions;
  if (!Array.isArray(list) || list.length === 0) throw new ValidationException([{ field: 'proposed_values.dimensions', code: 'array.min' }]);
  const seen = new Set<string>();
  const normalized = list.map((item, i) => {
    const at = `proposed_values.dimensions[${i}]`;
    const d = isObject(item) ? item : {};
    if (typeof d.dimension !== 'string' || !DIMENSIONS.includes(d.dimension)) fields.push({ field: `${at}.dimension`, code: 'enum.invalid' });
    else if (seen.has(d.dimension)) fields.push({ field: `${at}.dimension`, code: 'array.unique' });
    else seen.add(d.dimension);
    if (typeof d.applies !== 'boolean') fields.push({ field: `${at}.applies`, code: 'boolean.invalid' });
    // Una dimensión que no aplica se declara con su motivo; no se omite.
    const reason = typeof d.reason_not_applicable === 'string' ? d.reason_not_applicable.trim() : '';
    if (d.applies === false && !reason) fields.push({ field: `${at}.reason_not_applicable`, code: 'reason.required' });
    else if (reason.length > REASON_MAX) fields.push({ field: `${at}.reason_not_applicable`, code: 'string.max' });
    return { dimension: d.dimension, applies: d.applies, reason_not_applicable: d.applies === false ? reason : null };
  });
  if (fields.length) throw new ValidationException(fields);
  return { dimensions: normalized };
}
