"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_ERROR_CATALOG = void 0;
const common_1 = require("@nestjs/common");
exports.DOMAIN_ERROR_CATALOG = {
    UNAUTHENTICATED: { status: common_1.HttpStatus.UNAUTHORIZED, messageKey: 'common.unauthenticated' },
    FORBIDDEN: { status: common_1.HttpStatus.FORBIDDEN, messageKey: 'common.forbidden' },
    NOT_FOUND: { status: common_1.HttpStatus.NOT_FOUND, messageKey: 'common.not_found' },
    INVALID_CREDENTIALS: { status: common_1.HttpStatus.UNAUTHORIZED, messageKey: 'auth.invalid_credentials' },
    SESSION_EXPIRED: { status: common_1.HttpStatus.UNAUTHORIZED, messageKey: 'auth.session_expired' },
    ACCOUNT_LOCKED: { status: common_1.HttpStatus.FORBIDDEN, messageKey: 'auth.account_locked' },
    ACCOUNT_INACTIVE: { status: common_1.HttpStatus.FORBIDDEN, messageKey: 'auth.account_inactive' },
    ACCESS_KEY_INVALID: { status: common_1.HttpStatus.NOT_FOUND, messageKey: 'auth.access_key_invalid' },
    ACCESS_KEY_ALREADY_USED: { status: common_1.HttpStatus.CONFLICT, messageKey: 'auth.access_key_already_used' },
    ACCESS_KEY_EXPIRED: { status: common_1.HttpStatus.CONFLICT, messageKey: 'auth.access_key_expired' },
    ACCESS_KEY_EMAIL_MISMATCH: {
        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        messageKey: 'auth.access_key_email_mismatch',
    },
    EMAIL_TAKEN: { status: common_1.HttpStatus.CONFLICT, messageKey: 'auth.email_taken' },
    COMPANY_NAME_TAKEN: { status: common_1.HttpStatus.CONFLICT, messageKey: 'company.name_taken' },
    ADMIN_EMAIL_TAKEN: { status: common_1.HttpStatus.CONFLICT, messageKey: 'company.admin_email_taken' },
    DEDICATED_DATABASE_NOT_AVAILABLE: {
        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        messageKey: 'company.dedicated_not_available',
    },
    ORGANIZATION_NOT_DECLARED: { status: common_1.HttpStatus.CONFLICT, messageKey: 'organization.not_declared' },
    SERVICE_NAME_TAKEN: { status: common_1.HttpStatus.CONFLICT, messageKey: 'service.name_taken' },
    SERVICE_HAS_EVALUATIONS: { status: common_1.HttpStatus.CONFLICT, messageKey: 'service.has_evaluations' },
    DEPLOYMENT_SCENARIO_NOT_SET: { status: common_1.HttpStatus.CONFLICT, messageKey: 'deployment_scenario.not_set' },
    CAPABILITY_NOT_APPLICABLE: { status: common_1.HttpStatus.CONFLICT, messageKey: 'capability.not_applicable' },
    ASSET_NOT_VALIDATED: { status: common_1.HttpStatus.CONFLICT, messageKey: 'asset.not_validated' },
    ASSET_ALREADY_ACTIVE: { status: common_1.HttpStatus.CONFLICT, messageKey: 'asset.already_active' },
    ASSET_NOT_ACTIVE: { status: common_1.HttpStatus.CONFLICT, messageKey: 'asset.not_active' },
    FREQUENCY_NOT_SUPPORTED: {
        status: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
        messageKey: 'frequency.not_supported',
    },
    CONNECTION_UNAVAILABLE: { status: common_1.HttpStatus.SERVICE_UNAVAILABLE, messageKey: 'connection.unavailable' },
};
//# sourceMappingURL=domain-error.catalog.js.map