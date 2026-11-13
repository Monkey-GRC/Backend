// Listas cerradas del Componente 3 (Control Técnico): sus valores coinciden con los enums de Postgres del schema (tenant.*).
// Las REGLAS (con qué frecuencia corre cada conexión, qué tipo de activo produce, qué canales y regiones admite cada plataforma)
// ya no viven aquí: son datos del catálogo en la base (D67, modelo-datos.md §6.3).
//
// CONFIDENCIALIDAD: nada de este archivo nombra al proveedor del motor de monitoreo, y no debe
// hacerlo nunca (contracts/modules/onboarding-technical-control.md).

export const CONNECTION_CATEGORY_VALUES = ['ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06'] as const;
export type ConnectionCategory = (typeof CONNECTION_CATEGORY_VALUES)[number];

export const ASSET_CRITICALITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;
export const DEFAULT_CRITICALITY = 'medium';

export const SCHEDULE_FREQUENCY_VALUES = ['continuous', 'every_6h', 'every_24h'] as const;
export type ScheduleFrequencyValue = (typeof SCHEDULE_FREQUENCY_VALUES)[number];

// El tipo del activo se deduce de la conexión que se usa para registrarlo: el cliente elige
// «qué quiere conectar» y no tiene que clasificarlo dos veces (D46).
export type AssetTypeValue =
  | 'server'
  | 'database'
  | 'cloud_service'
  | 'application'
  | 'endpoint'
  | 'network_device'
  | 'documentation';
// «n/18»: las 18 capacidades técnicas que la sonda cubre en un activo. Mientras no esté definida
// cuáles son (deuda-tecnica.md), el total es la constante del contrato.
export const TECHNICAL_COVERAGE_TOTAL = 18;
export const NO_COVERAGE = `0/${TECHNICAL_COVERAGE_TOTAL}`;

// `runner`: la validación la hace el trabajador que ejecuta el motor de nube (D58); el backend nunca toca la nube del cliente ni guarda llaves de AWS.
export type ProbeMode = 'simulated' | 'unavailable' | 'runner';
export const PROBE_MODES: readonly ProbeMode[] = ['simulated', 'unavailable', 'runner'];

// Cómo se conecta un activo (D53). El cliente elige entre los canales de su plataforma (`platform_connection_methods`, D67).
// Qué clase de activo es lo que se encontró en la cuenta del cliente (D59). Es lo que el cliente reconoce, no el tipo de recurso del proveedor.
export const RESOURCE_KIND_VALUES = ['server', 'database', 'storage', 'function', 'other'] as const;
export type ResourceKindValue = (typeof RESOURCE_KIND_VALUES)[number];

export const CONNECTION_METHOD_VALUES = ['readonly_role', 'access_keys', 'agent', 'identity_federation'] as const;
export type ConnectionMethodValue = (typeof CONNECTION_METHOD_VALUES)[number];
// Los catálogos que se sirven desde `catalog.connection_options` con `description`, `availability` y `tags` (D114).
export const CONNECTION_OPTION_CATALOGS: string[] = ['connection_method', 'gcp_connection_scope', 'gcp_setup_method'];
export const CLOUD_PLATFORM_AWS = 'aws';
export const CLOUD_PLATFORM_GCP = 'gcp';
// Las nubes que el trabajador sabe evaluar (D56: un catálogo de checks por plataforma).
export const CLOUD_PLATFORMS = [CLOUD_PLATFORM_AWS, CLOUD_PLATFORM_GCP] as const;
export type CloudPlatform = (typeof CLOUD_PLATFORMS)[number];
// GCP (D112): el activo es el proyecto. El ID lo declara el cliente; el número lo imprime el script de alta.
export const GCP_PROJECT_ID = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;
export const GCP_PROJECT_NUMBER = /^\d{6,19}$/;
export const AWS_ACCOUNT_ID = /^\d{12}$/;
export const AWS_ROLE_ARN = /^arn:aws:iam::(\d{12}):role\/[\w+=,.@/-]{1,512}$/;
// Mismas reglas que el trabajador: nada llega a la línea de comandos del motor sin revisar.
export const AWS_REGION = /^[a-z]{2,4}(-[a-z]+){1,2}-\d$/;
// Las regiones que se ofrecen y las únicas que el alta acepta son datos del catálogo (`platform_regions`, D67); aquí solo el tope.
export const MAX_REGIONS = 20;
