"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PREVIOUS_CERTIFICATION_VALUES = exports.EXPECTED_AVAILABILITY_VALUES = exports.SUBSERVICE_TYPE_VALUES = exports.TRUST_CRITERION_MANDATORY = exports.TRUST_CRITERION_VALUES = exports.DATA_TYPE_VALUES = exports.SERVICE_COUNTRY_REGIONS = exports.SERVICE_COUNTRY_VALUES = exports.ACTIVE_CLIENT_COUNT_VALUES = exports.SERVED_INDUSTRY_VALUES = exports.SERVICE_TYPE_VALUES = void 0;
exports.SERVICE_TYPE_VALUES = [
    'saas',
    'bpo',
    'call_center',
    'data_center',
    'ai_services',
    'specialized_with_data_intervention',
    'service_desk',
    'managed_services',
    'consulting',
    'development',
    'other',
];
exports.SERVED_INDUSTRY_VALUES = [
    'financial',
    'healthcare',
    'retail',
    'technology',
    'government',
    'education',
    'manufacturing',
    'telecommunications',
    'energy',
    'logistics',
    'other',
];
exports.ACTIVE_CLIENT_COUNT_VALUES = [
    'from_1_to_10',
    'from_11_to_50',
    'from_51_to_200',
    'from_201_to_1000',
    'more_than_1000',
];
exports.SERVICE_COUNTRY_VALUES = [
    'co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'uy', 'py', 'bo', 've', 'cr',
    'pa', 'gt', 'us', 'ca', 'es', 'pt', 'gb', 'de', 'fr', 'eu', 'latam', 'global',
];
exports.SERVICE_COUNTRY_REGIONS = ['eu', 'latam', 'global'];
exports.DATA_TYPE_VALUES = [
    'pii',
    'payment',
    'phi',
    'business',
    'files',
    'logs',
    'credentials',
    'biometric',
];
exports.TRUST_CRITERION_VALUES = [
    'security',
    'availability',
    'confidentiality',
    'integrity',
    'privacy',
];
exports.TRUST_CRITERION_MANDATORY = 'security';
exports.SUBSERVICE_TYPE_VALUES = [
    'aws',
    'azure',
    'gcp',
    'on_premise',
    'hybrid',
    'mobile',
    'other',
];
exports.EXPECTED_AVAILABILITY_VALUES = [
    '24x7',
    'business_hours',
    'on_demand',
    'not_applicable',
];
exports.PREVIOUS_CERTIFICATION_VALUES = ['soc2', 'soc1', 'iso27001', 'none'];
//# sourceMappingURL=service-catalogs.js.map