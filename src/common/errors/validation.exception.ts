import { UnprocessableEntityException, ValidationError } from '@nestjs/common';

export type FieldError = { field: string; code: string };

// class-validator → código corto del contrato (conventions.md: enum.invalid, required…).
const CONSTRAINT_CODES: Record<string, string> = {
  isEmail: 'email.invalid',
  isNotEmpty: 'required',
  isDefined: 'required',
  isString: 'string.invalid',
  maxLength: 'string.max',
  minLength: 'string.min',
  isEnum: 'enum.invalid',
  isIn: 'enum.invalid',
  isInt: 'number.invalid',
  min: 'number.min',
  max: 'number.max',
  isBoolean: 'boolean.invalid',
  isUuid: 'uuid.invalid',
  arrayMinSize: 'array.min',
  isStrongPassword: 'password.weak',
  isArray: 'array.invalid',
  arrayUnique: 'array.unique',
  isUrl: 'url.invalid',
  isIso8601: 'date.invalid',
  isDateString: 'date.invalid',
  isIp: 'ip.invalid',
  isObject: 'object.invalid',
  arrayMaxSize: 'array.max',
  isEmpty: 'field.not_editable',
  whitelistValidation: 'field.not_allowed',
};

// Un 422 con errores por campo normalmente es VALIDATION_FAILED; algunos casos del contrato usan
// su propio código (p. ej. CONNECTION_FAILED) con el mismo formato de `error.fields`.
export type ValidationOverride = { code: string; messageKey: string };

export class ValidationException extends UnprocessableEntityException {
  constructor(
    public readonly fields: FieldError[],
    public readonly override?: ValidationOverride,
  ) {
    super(override?.code ?? 'VALIDATION_FAILED');
  }

  // Devuelve TODOS los errores a la vez, con notación de punto/corchete para lo anidado.
  static fromValidationErrors(errors: ValidationError[]): ValidationException {
    const fields: FieldError[] = [];
    const walk = (list: ValidationError[], parent: string) => {
      for (const error of list) {
        const isIndex = /^\d+$/.test(error.property);
        const field = parent
          ? isIndex
            ? `${parent}[${error.property}]`
            : `${parent}.${error.property}`
          : error.property;
        for (const constraint of Object.keys(error.constraints ?? {})) {
          fields.push({ field, code: CONSTRAINT_CODES[constraint] ?? 'invalid' });
        }
        if (error.children?.length) walk(error.children, field);
      }
    };
    walk(errors, '');
    return new ValidationException(fields);
  }
}
