"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = void 0;
const common_1 = require("@nestjs/common");
const CONSTRAINT_CODES = {
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
    isIp: 'ip.invalid',
    isObject: 'object.invalid',
    arrayMaxSize: 'array.max',
    isEmpty: 'field.not_editable',
    whitelistValidation: 'field.not_allowed',
};
class ValidationException extends common_1.UnprocessableEntityException {
    fields;
    override;
    constructor(fields, override) {
        super(override?.code ?? 'VALIDATION_FAILED');
        this.fields = fields;
        this.override = override;
    }
    static fromValidationErrors(errors) {
        const fields = [];
        const walk = (list, parent) => {
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
                if (error.children?.length)
                    walk(error.children, field);
            }
        };
        walk(errors, '');
        return new ValidationException(fields);
    }
}
exports.ValidationException = ValidationException;
//# sourceMappingURL=validation.exception.js.map