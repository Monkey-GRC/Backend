// Reglas del Componente 3 (Control Técnico) que el contrato fija o que D42 cierra: qué conexiones
// ofrece cada escenario, de qué tipo es el activo según la conexión, con qué frecuencia corre cada
// una y qué credenciales pide. Es dato de referencia compartido por la aplicación; los valores
// coinciden con los enums de Postgres del schema (tenant.*).
//
// CONFIDENCIALIDAD: nada de este archivo nombra al proveedor del motor de monitoreo, y no debe
// hacerlo nunca (contracts/modules/onboarding-technical-control.md).

export const DEPLOYMENT_SCENARIO_VALUES = [
  'cloud_managed_only',
  'cloud_with_servers',
  'on_premise',
  'hybrid',
] as const;
export type DeploymentScenarioValue = (typeof DEPLOYMENT_SCENARIO_VALUES)[number];

export const CONNECTION_CATEGORY_VALUES = ['ac_01', 'ac_02', 'ac_03', 'ac_04', 'ac_05', 'ac_06'] as const;
export type ConnectionCategory = (typeof CONNECTION_CATEGORY_VALUES)[number];

// Qué conexiones se le ofrecen al cliente según el escenario de su servicio. «Híbrido» ofrece las
// seis y el cliente usa las que le sirvan (D42): así no se le pide clasificarse.
export const SCENARIO_CAPABILITIES: Record<DeploymentScenarioValue, readonly ConnectionCategory[]> = {
  cloud_managed_only: ['ac_01'],
  cloud_with_servers: ['ac_01', 'ac_02', 'ac_03'],
  on_premise: ['ac_04', 'ac_05', 'ac_06'],
  hybrid: CONNECTION_CATEGORY_VALUES,
};

export const ASSET_CRITICALITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;
export const DEFAULT_CRITICALITY = 'medium';

export const SCHEDULE_FREQUENCY_VALUES = ['continuous', 'every_6h', 'every_24h'] as const;
export type ScheduleFrequencyValue = (typeof SCHEDULE_FREQUENCY_VALUES)[number];

// ac_01 corre cada 6-24 h; ac_02 a ac_06 son continuos (modelo-datos.md §6.3).
export const FREQUENCIES_BY_CATEGORY: Record<ConnectionCategory, readonly ScheduleFrequencyValue[]> = {
  ac_01: ['every_6h', 'every_24h'],
  ac_02: ['continuous'],
  ac_03: ['continuous'],
  ac_04: ['continuous'],
  ac_05: ['continuous'],
  ac_06: ['continuous'],
};

// El tipo del activo se deduce de la conexión que se usa para registrarlo: el cliente elige
// «qué quiere conectar» y no tiene que clasificarlo dos veces (D42).
export type AssetTypeValue =
  | 'server'
  | 'database'
  | 'cloud_service'
  | 'application'
  | 'endpoint'
  | 'network_device'
  | 'documentation';
export const ASSET_TYPE_BY_CATEGORY: Record<ConnectionCategory, AssetTypeValue> = {
  ac_01: 'cloud_service',
  ac_02: 'server',
  ac_03: 'database',
  ac_04: 'server',
  ac_05: 'database',
  ac_06: 'endpoint',
};

// Los cinco contadores del scope declarado y el tipo de activo que los llena al conectar.
// `network_device` y `documentation` no se cuentan: no son lo que el cliente declara (D42).
export const SCOPE_KEYS = ['server_count', 'cloud_count', 'app_count', 'database_count', 'endpoint_count'] as const;
export type ScopeKey = (typeof SCOPE_KEYS)[number];
export const SCOPE_KEY_BY_ASSET_TYPE: Partial<Record<AssetTypeValue, ScopeKey>> = {
  server: 'server_count',
  cloud_service: 'cloud_count',
  application: 'app_count',
  database: 'database_count',
  endpoint: 'endpoint_count',
};
export const SCOPE_MAX = 1_000_000;

// Credenciales por conexión. Solo viajan al crear el activo y se guardan cifradas; nunca se
// devuelven. Los agentes ligeros no guardan credenciales (modelo-datos.md §6.3): para ellos basta
// con `connection_method = agent`, que es el valor por defecto.
export type CredentialSpec = {
  // Si la conexión admite agente o SSH, el cliente elige; si no, el método es fijo.
  methods: readonly ('agent' | 'ssh')[] | null;
  required: readonly string[];
  optional: readonly string[];
  // Campos que se piden solo con el método SSH.
  sshRequired: readonly string[];
};

export const CREDENTIAL_SPECS: Record<ConnectionCategory, CredentialSpec> = {
  ac_01: { methods: null, required: ['account_id', 'read_only_role'], optional: ['external_id'], sshRequired: [] },
  ac_02: { methods: ['agent', 'ssh'], required: [], optional: [], sshRequired: ['ssh_user', 'ssh_private_key'] },
  ac_03: { methods: null, required: ['db_user', 'db_password'], optional: ['db_port'], sshRequired: [] },
  ac_04: { methods: ['agent', 'ssh'], required: [], optional: [], sshRequired: ['ssh_user', 'ssh_private_key'] },
  ac_05: { methods: null, required: ['db_user', 'db_password'], optional: ['db_port'], sshRequired: [] },
  ac_06: { methods: ['agent'], required: [], optional: [], sshRequired: [] },
};

export const CREDENTIAL_MAX_LENGTH = 8000;

// «n/18»: las 18 capacidades técnicas que la sonda cubre en un activo. Mientras no esté definida
// cuáles son (deuda-tecnica.md), el total es la constante del contrato.
export const TECHNICAL_COVERAGE_TOTAL = 18;
export const NO_COVERAGE = `0/${TECHNICAL_COVERAGE_TOTAL}`;

export type ProbeMode = 'simulated' | 'unavailable';
export const PROBE_MODES: readonly ProbeMode[] = ['simulated', 'unavailable'];
