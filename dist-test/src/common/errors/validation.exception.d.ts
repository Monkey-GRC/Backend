import { UnprocessableEntityException, ValidationError } from '@nestjs/common';
export type FieldError = {
    field: string;
    code: string;
};
export type ValidationOverride = {
    code: string;
    messageKey: string;
};
export declare class ValidationException extends UnprocessableEntityException {
    readonly fields: FieldError[];
    readonly override?: ValidationOverride | undefined;
    constructor(fields: FieldError[], override?: ValidationOverride | undefined);
    static fromValidationErrors(errors: ValidationError[]): ValidationException;
}
