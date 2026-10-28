import { FieldError, ValidationException } from '../../../common/errors/validation.exception';
import { ControlEdit, DimensionState } from '../domain/repositories/control-edit.repository';
import { EditClientControlDto } from './dtos/control.dto';

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

/** Valida y normaliza el cuerpo de `PATCH /controls/{id}`. Lo que devuelve es lo que se guarda. */
export function validateControlEdit(dto: EditClientControlDto, origin: 'catalog' | 'own'): ControlEdit {
  const fields: FieldError[] = [];
  const edit: ControlEdit = {};

  if (dto.interpretation === undefined && dto.dimensions === undefined) throw new ValidationException([{ field: 'interpretation', code: 'required' }]);

  if (dto.interpretation !== undefined) {
    const text = isObject(dto.interpretation) && typeof dto.interpretation.text === 'string' ? dto.interpretation.text.trim() : '';
    if (!text) fields.push({ field: 'interpretation.text', code: 'required' });
    else if (text.length > INTERPRETATION_MAX) fields.push({ field: 'interpretation.text', code: 'string.max' });
    else edit.interpretation = text;
  }

  if (dto.dimensions !== undefined) {
    if (!Array.isArray(dto.dimensions) || dto.dimensions.length === 0) fields.push({ field: 'dimensions', code: 'array.min' });
    else {
      const seen = new Set<string>();
      const list: DimensionState[] = [];
      dto.dimensions.forEach((item, i) => {
        const at = `dimensions[${i}]`;
        const d = isObject(item) ? item : {};
        if (typeof d.dimension !== 'string' || !DIMENSIONS.includes(d.dimension)) fields.push({ field: `${at}.dimension`, code: 'enum.invalid' });
        else if (seen.has(d.dimension)) fields.push({ field: `${at}.dimension`, code: 'array.unique' });
        else {
          seen.add(d.dimension);
          // Un control propio es solo documental (D65).
          if (origin === 'own' && d.dimension !== 'policy') fields.push({ field: `${at}.dimension`, code: 'dimension.policy_only' });
        }
        if (typeof d.applies !== 'boolean') fields.push({ field: `${at}.applies`, code: 'boolean.invalid' });
        // Una dimensión que no aplica se declara con su motivo; no se omite.
        const reason = typeof d.reason_not_applicable === 'string' ? d.reason_not_applicable.trim() : '';
        if (d.applies === false && !reason) fields.push({ field: `${at}.reason_not_applicable`, code: 'reason.required' });
        else if (reason.length > REASON_MAX) fields.push({ field: `${at}.reason_not_applicable`, code: 'string.max' });
        list.push({ dimension: String(d.dimension), applies: d.applies === true, reasonNotApplicable: d.applies === false ? reason : null });
      });
      edit.dimensions = list;
    }
  }

  if (fields.length) throw new ValidationException(fields);
  return edit;
}