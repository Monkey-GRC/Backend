"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENUM_CATALOG_NAMES = exports.ENUM_CATALOGS = exports.REGULATION_SEED = exports.REGULATION_NONE = exports.REGULATION_CODES = exports.COMPLIANCE_MATURITY_VALUES = exports.CLIENT_COUNTRY_VALUES = exports.INCORPORATION_COUNTRY_VALUES = exports.YEARS_IN_OPERATION_VALUES = exports.BUSINESS_MODEL_VALUES = exports.INDUSTRY_VALUES = exports.SIZE_VALUES = void 0;
const service_catalogs_1 = require("./service-catalogs");
const technical_catalogs_1 = require("./technical-catalogs");
exports.SIZE_VALUES = [
    'from_10_to_50',
    'from_51_to_200',
    'from_201_to_500',
    'from_501_to_1000',
    'from_1001_to_2000',
    'from_2001_to_5000',
    'more_than_5000',
];
exports.INDUSTRY_VALUES = [
    'financial_banking',
    'fintech',
    'healthcare',
    'technology_saas',
    'bpo_outsourcing',
    'telecommunications',
    'retail_ecommerce',
    'manufacturing',
    'government',
    'education',
    'insurance',
    'logistics',
    'energy_utilities',
    'other',
];
exports.BUSINESS_MODEL_VALUES = [
    'bpo_kpo_ito',
    'call_contact_center',
    'data_center',
    'ai_ml',
    'service_desk',
    'saas_paas_iaas',
    'fintech_payments',
    'banking',
    'insurance',
    'marketplace_ecommerce',
    'software_factory',
    'consulting',
    'telecommunications',
    'logistics',
    'healthcare',
    'edtech',
    'manufacturing',
    'government',
    'other',
];
exports.YEARS_IN_OPERATION_VALUES = [
    'less_than_1',
    'from_1_to_3',
    'from_3_to_5',
    'from_5_to_10',
    'more_than_10',
];
exports.INCORPORATION_COUNTRY_VALUES = [
    'co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'pa', 'cr', 'us', 'es', 'other',
];
exports.CLIENT_COUNTRY_VALUES = [
    'co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'pa', 'cr', 'us', 'es', 'eu', 'other',
];
exports.COMPLIANCE_MATURITY_VALUES = [
    'none',
    'initial_ad_hoc',
    'implementing',
    'defined',
    'managed_certified',
];
exports.REGULATION_CODES = [
    'ley_1581_co',
    'lfpdppp_mx',
    'ley_29733_pe',
    'ley_19628_cl',
    'ley_25326_ar',
    'lgpd_br',
    'gdpr_eu',
    'lopdgdd_es',
    'hipaa_us',
    'ccpa_cpra_us',
    'glba_us',
    'pci_dss',
    'none',
    'other',
];
exports.REGULATION_NONE = 'none';
exports.REGULATION_SEED = [
    { code: 'ley_1581_co', name: 'Ley 1581', jurisdiction: 'CO' },
    { code: 'lfpdppp_mx', name: 'LFPDPPP', jurisdiction: 'MX' },
    { code: 'ley_29733_pe', name: 'Ley 29733', jurisdiction: 'PE' },
    { code: 'ley_19628_cl', name: 'Ley 19628', jurisdiction: 'CL' },
    { code: 'ley_25326_ar', name: 'Ley 25326', jurisdiction: 'AR' },
    { code: 'lgpd_br', name: 'LGPD', jurisdiction: 'BR' },
    { code: 'gdpr_eu', name: 'GDPR', jurisdiction: 'EU' },
    { code: 'lopdgdd_es', name: 'LOPDGDD', jurisdiction: 'ES' },
    { code: 'hipaa_us', name: 'HIPAA', jurisdiction: 'US' },
    { code: 'ccpa_cpra_us', name: 'CCPA/CPRA', jurisdiction: 'US' },
    { code: 'glba_us', name: 'GLBA', jurisdiction: 'US' },
    { code: 'pci_dss', name: 'PCI DSS', jurisdiction: 'global' },
    { code: 'none', name: 'Ninguna', jurisdiction: 'n/a' },
    { code: 'other', name: 'Otra', jurisdiction: 'n/a' },
];
exports.ENUM_CATALOGS = {
    size: exports.SIZE_VALUES,
    industry: exports.INDUSTRY_VALUES,
    business_model: exports.BUSINESS_MODEL_VALUES,
    years_in_operation: exports.YEARS_IN_OPERATION_VALUES,
    incorporation_country: exports.INCORPORATION_COUNTRY_VALUES,
    client_country: exports.CLIENT_COUNTRY_VALUES,
    compliance_maturity: exports.COMPLIANCE_MATURITY_VALUES,
    service_type: service_catalogs_1.SERVICE_TYPE_VALUES,
    served_industry: service_catalogs_1.SERVED_INDUSTRY_VALUES,
    active_client_count: service_catalogs_1.ACTIVE_CLIENT_COUNT_VALUES,
    service_country: service_catalogs_1.SERVICE_COUNTRY_VALUES,
    data_type: service_catalogs_1.DATA_TYPE_VALUES,
    trust_criterion: service_catalogs_1.TRUST_CRITERION_VALUES,
    subservice_type: service_catalogs_1.SUBSERVICE_TYPE_VALUES,
    expected_availability: service_catalogs_1.EXPECTED_AVAILABILITY_VALUES,
    previous_certification: service_catalogs_1.PREVIOUS_CERTIFICATION_VALUES,
    deployment_scenario: technical_catalogs_1.DEPLOYMENT_SCENARIO_VALUES,
    asset_criticality: technical_catalogs_1.ASSET_CRITICALITY_VALUES,
    schedule_frequency: technical_catalogs_1.SCHEDULE_FREQUENCY_VALUES,
};
exports.ENUM_CATALOG_NAMES = Object.keys(exports.ENUM_CATALOGS);
//# sourceMappingURL=onboarding-catalogs.js.map