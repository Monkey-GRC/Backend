// Listas de opciones del Componente 2 — Contexto del Servicio (contracts/enums.md, hojas del Excel
// del comité). Por el cable viaja el valor en snake_case; la etiqueta la resuelve i18n
// (i18n/<lang>/catalogs.json). Coinciden con los enums de Postgres del schema (tenant.*).

export const SERVICE_TYPE_VALUES = [
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
] as const;

export const SERVED_INDUSTRY_VALUES = [
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
] as const;

export const ACTIVE_CLIENT_COUNT_VALUES = [
  'from_1_to_10',
  'from_11_to_50',
  'from_51_to_200',
  'from_201_to_1000',
  'more_than_1000',
] as const;

export const SERVICE_COUNTRY_VALUES = [
  'co', 'mx', 'pe', 'cl', 'ar', 'br', 'ec', 'uy', 'py', 'bo', 've', 'cr',
  'pa', 'gt', 'us', 'ca', 'es', 'pt', 'gb', 'de', 'fr', 'eu', 'latam', 'global',
] as const;

// Países sueltos vs. agrupaciones geográficas: la pantalla las muestra por separado.
export const SERVICE_COUNTRY_REGIONS: readonly string[] = ['eu', 'latam', 'global'];

export const DATA_TYPE_VALUES = [
  'pii',
  'payment',
  'phi',
  'business',
  'files',
  'logs',
  'credentials',
  'biometric',
] as const;

// Los 5 criterios de confianza de SOC 2. `security` es obligatorio siempre (§6.2).
export const TRUST_CRITERION_VALUES = [
  'security',
  'availability',
  'confidentiality',
  'integrity',
  'privacy',
] as const;

export const TRUST_CRITERION_MANDATORY = 'security';

export const SUBSERVICE_TYPE_VALUES = [
  'aws',
  'azure',
  'gcp',
  'on_premise',
  'hybrid',
  'mobile',
  'other',
] as const;

// Por el cable y en la base el valor es "24x7". Prisma no permite identificadores que empiecen con
// dígito: en sus consultas el miembro se llama `h24x7` (ver toDbAvailability en la feature services).
export const EXPECTED_AVAILABILITY_VALUES = [
  '24x7',
  'business_hours',
  'on_demand',
  'not_applicable',
] as const;

// Marcos que Monkey Admin contrata al registrar una empresa si no se indica otro: hoy solo SOC 2 (D37, D43).
export const DEFAULT_CONTRACTED_FRAMEWORKS: readonly string[] = ['soc2'];

export const PREVIOUS_CERTIFICATION_VALUES = ['soc2', 'soc1', 'iso27001', 'none'] as const;

export type ServiceType = (typeof SERVICE_TYPE_VALUES)[number];
export type ServedIndustry = (typeof SERVED_INDUSTRY_VALUES)[number];
export type ActiveClientCount = (typeof ACTIVE_CLIENT_COUNT_VALUES)[number];
export type ServiceCountry = (typeof SERVICE_COUNTRY_VALUES)[number];
export type DataType = (typeof DATA_TYPE_VALUES)[number];
export type TrustCriterionValue = (typeof TRUST_CRITERION_VALUES)[number];
export type SubserviceType = (typeof SUBSERVICE_TYPE_VALUES)[number];
export type ExpectedAvailability = (typeof EXPECTED_AVAILABILITY_VALUES)[number];
export type PreviousCertification = (typeof PREVIOUS_CERTIFICATION_VALUES)[number];
