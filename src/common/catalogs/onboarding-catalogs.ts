// Listas de opciones del Componente 1 (contracts/enums.md, transcritas de las hojas del Excel del
// comité: es la fuente de verdad). Por el cable viaja siempre el valor en snake_case; la etiqueta
// la resuelve i18n (i18n/<lang>/catalogs.json). El frontend nunca escribe estas listas a mano.
//
// Es dato de referencia compartido: lo validan los DTOs de onboarding y lo sirve la feature
// `catalogs`. Los valores coinciden con los enums de Postgres del schema (tenant.*).

import {
  ACTIVE_CLIENT_COUNT_VALUES,
  DATA_TYPE_VALUES,
  EXPECTED_AVAILABILITY_VALUES,
  PREVIOUS_CERTIFICATION_VALUES,
  SERVED_INDUSTRY_VALUES,
  SERVICE_COUNTRY_VALUES,
  SERVICE_TYPE_VALUES,
  SUBSERVICE_TYPE_VALUES,
  TRUST_CRITERION_VALUES,
} from './service-catalogs';

export const SIZE_VALUES = [
  'from_10_to_50',
  'from_51_to_200',
  'from_201_to_500',
  'from_501_to_1000',
  'from_1001_to_2000',
  'from_2001_to_5000',
  'more_than_5000',
] as const;

export const INDUSTRY_VALUES = [
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
] as const;

// El Excel lista 19 y dice "40+": el resto lo debe entregar el comité (P6). `other` cubre mientras tanto.
export const BUSINESS_MODEL_VALUES = [
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
] as const;

export const YEARS_IN_OPERATION_VALUES = [
  'less_than_1',
  'from_1_to_3',
  'from_3_to_5',
  'from_5_to_10',
  'more_than_10',
] as const;

export const INCORPORATION_COUNTRY_VALUES = [
  'co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'pa', 'cr', 'us', 'es', 'other',
] as const;

// Los de constitución más `eu`, que no es un país sino una región: el Excel la mezcla en la misma
// lista y se conserva porque la fuente manda (la pantalla la agrupa aparte).
export const CLIENT_COUNTRY_VALUES = [
  'co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'pa', 'cr', 'us', 'es', 'eu', 'other',
] as const;

export const COMPLIANCE_MATURITY_VALUES = [
  'none',
  'initial_ad_hoc',
  'implementing',
  'defined',
  'managed_certified',
] as const;

// catalog.regulations (tabla propia, no enum de columna). `none` y `other` son respuestas válidas
// del cliente: `none` ("ninguna me aplica") es excluyente y distinto de no haber contestado.
export const REGULATION_CODES = [
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
] as const;

export const REGULATION_NONE = 'none';

// Nombre y jurisdicción con que se siembra catalog.regulations. No se puntúan (D10).
export const REGULATION_SEED: { code: (typeof REGULATION_CODES)[number]; name: string; jurisdiction: string }[] = [
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

// Nombre de catálogo en la URL (GET /v1/catalogs/:name) → sus valores. Los de la empresa
// (Componente 1) van aquí; los del servicio (Componente 2) vienen de service-catalogs.ts.
export const ENUM_CATALOGS = {
  size: SIZE_VALUES,
  industry: INDUSTRY_VALUES,
  business_model: BUSINESS_MODEL_VALUES,
  years_in_operation: YEARS_IN_OPERATION_VALUES,
  incorporation_country: INCORPORATION_COUNTRY_VALUES,
  client_country: CLIENT_COUNTRY_VALUES,
  compliance_maturity: COMPLIANCE_MATURITY_VALUES,
  service_type: SERVICE_TYPE_VALUES,
  served_industry: SERVED_INDUSTRY_VALUES,
  active_client_count: ACTIVE_CLIENT_COUNT_VALUES,
  service_country: SERVICE_COUNTRY_VALUES,
  data_type: DATA_TYPE_VALUES,
  trust_criterion: TRUST_CRITERION_VALUES,
  subservice_type: SUBSERVICE_TYPE_VALUES,
  expected_availability: EXPECTED_AVAILABILITY_VALUES,
  previous_certification: PREVIOUS_CERTIFICATION_VALUES,
} as const;

export type EnumCatalogName = keyof typeof ENUM_CATALOGS;
export const ENUM_CATALOG_NAMES = Object.keys(ENUM_CATALOGS) as EnumCatalogName[];

export type Size = (typeof SIZE_VALUES)[number];
export type Industry = (typeof INDUSTRY_VALUES)[number];
export type BusinessModel = (typeof BUSINESS_MODEL_VALUES)[number];
export type YearsInOperation = (typeof YEARS_IN_OPERATION_VALUES)[number];
export type IncorporationCountry = (typeof INCORPORATION_COUNTRY_VALUES)[number];
export type ClientCountry = (typeof CLIENT_COUNTRY_VALUES)[number];
export type ComplianceMaturity = (typeof COMPLIANCE_MATURITY_VALUES)[number];
export type RegulationCode = (typeof REGULATION_CODES)[number];
