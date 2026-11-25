// Listas de opciones del Componente 1 (contracts/enums.md, transcritas de las hojas del Excel del
// comité: es la fuente de verdad). Por el cable viaja siempre el valor en snake_case; la etiqueta
// la resuelve i18n (i18n/<lang>/catalogs.json). El frontend nunca escribe estas listas a mano.
//
// Es dato de referencia compartido: lo validan los DTOs de onboarding y lo sirve la feature
// `catalogs`. Los valores coinciden con los enums de Postgres del schema (tenant.*).

import { COMPLIANCE_ENUM_CATALOGS } from './compliance-catalogs';
import { DOCUMENT_ENUM_CATALOGS } from './document-catalogs';
import { INTEGRATION_ENUM_CATALOGS } from './integration-catalogs';
import { NOTIFICATION_ENUM_CATALOGS } from './notification-catalogs';
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
import {
  ASSET_CRITICALITY_VALUES,
  SCHEDULE_FREQUENCY_VALUES,
  RESOURCE_KIND_VALUES,
} from './technical-catalogs';

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
// Solo normas de protección de datos personales (D51): PCI DSS salió, es un estándar y ya es un marco.
export const REGULATION_CODES = [
  'ley_1581_co',
  'lfpdppp_mx',
  'ley_29733_pe',
  'ley_19628_cl',
  'ley_21719_cl',
  'ley_25326_ar',
  'ley_18331_uy',
  'lopdp_ec',
  'ley_81_pa',
  'ley_8968_cr',
  'lgpd_br',
  'gdpr_eu',
  'lopdgdd_es',
  'hipaa_us',
  'ccpa_cpra_us',
  'glba_us',
  'none',
  'other',
] as const;

// Orden en que se ofrecen los marcos (D50): el que Monkey ya tiene y luego por demanda. Fuente: Drata
// (ISO 27001 es la expansión más común sobre SOC 2, 32 %; HIPAA 20 %; GDPR 19 %) y ACC 2025.
export const FRAMEWORK_DISPLAY_ORDER = ['soc2', 'iso27001', 'hipaa', 'gdpr', 'pci_dss', 'nist_csf', 'soc1'] as const;

export const REGULATION_NONE = 'none';

// El catálogo de regulaciones (nombre y jurisdicción) se siembra desde prisma/seed/reference/data.ts
// (npm run reference:load); aquí solo viven los códigos que valida la API. No se puntúan (D10).

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
  // Componente 3 — el control técnico
  asset_criticality: ASSET_CRITICALITY_VALUES,
  schedule_frequency: SCHEDULE_FREQUENCY_VALUES,
  // Conexión de nube (D53, D58). Las regiones (`aws_region`) salen de la base (D67); las opciones del asistente (`connection_method`, `gcp_*`, D114), también.
  resource_kind: RESOURCE_KIND_VALUES,
  // Cumplimiento: criterios, categorías, niveles, decisiones, cargos, dimensiones… leídos de los enums de Postgres (compliance-catalogs.ts).
  ...COMPLIANCE_ENUM_CATALOGS,
  // Integraciones (D110).
  ...INTEGRATION_ENUM_CATALOGS,
  // Documentos (D152).
  ...DOCUMENT_ENUM_CATALOGS,
  // Notificaciones (D151).
  ...NOTIFICATION_ENUM_CATALOGS,
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
