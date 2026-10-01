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
  isEmpty: 'field.not_editable',
  whitelistValidation: 'field.not_allowed',
};

export class ValidationException extends UnprocessableEntityException {
  constructor(public readonly fields: FieldError[]) {
    super('VALIDATION_FAILED');
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
