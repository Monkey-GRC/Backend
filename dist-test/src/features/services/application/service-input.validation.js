"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertServiceInput = assertServiceInput;
const onboarding_catalogs_1 = require("../../../common/catalogs/onboarding-catalogs");
const validation_exception_1 = require("../../../common/errors/validation.exception");
async function assertServiceInput(services, input) {
    const errors = [];
    if (input.regulationCodes) {
        if (input.regulationCodes.includes(onboarding_catalogs_1.REGULATION_NONE) && input.regulationCodes.length > 1) {
            errors.push({ field: 'regulation_codes', code: 'regulation.none_exclusive' });
        }
        else {
            const existing = new Set(await services.existingRegulationCodes(input.regulationCodes));
            if (input.regulationCodes.some((code) => !existing.has(code))) {
                errors.push({ field: 'regulation_codes', code: 'enum.invalid' });
            }
        }
    }
    if (input.frameworkCodes) {
        const existing = new Set(await services.existingFrameworkCodes(input.frameworkCodes));
        if (input.frameworkCodes.some((code) => !existing.has(code))) {
            errors.push({ field: 'framework_codes', code: 'enum.invalid' });
        }
    }
    if (errors.length > 0)
        throw new validation_exception_1.ValidationException(errors);
}
//# sourceMappingURL=service-input.validation.js.map