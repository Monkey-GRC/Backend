import {
  ConnectionCategory,
  ScheduleFrequencyValue,
  ConnectionMethodValue,
  ResourceKindValue,
} from '../../../../common/catalogs/technical-catalogs';

// Una conexión que el cliente puede usar (catalog.automated_capabilities). OJO: este tipo NO tiene
// `provider`, a propósito. Es la única columna que nunca sale (confidencialidad): al no existir
// aquí, ningún mapper ni response puede filtrarla por descuido.
// Lo que el cliente elige al conectar (D67): un proveedor de nube, un sistema operativo o un motor de base de datos. Solo se elige la que está
// `available`; el resto se muestra bloqueada. `logoKey` es el nombre del SVG en la plataforma (la base nunca guarda el SVG).
export type PlatformView = {
  code: string;
  name: string;
  logoKey: string;
  availability: 'available' | 'coming_soon';
  // Canales de la plataforma; el primero es el recomendado. Vacío si aún no tiene canal.
  connectionMethods: ConnectionMethodValue[];
};

// Una plataforma con las reglas que el alta necesita validar (catálogo, D67).
export type PlatformRule = PlatformView & {
  id: string;
  capabilityCode: ConnectionCategory;
  // Regiones que el cliente puede declarar para ella.
  regionCodes: string[];
};

// Una versión de un sistema operativo que el catálogo ofrece y la sonda entrega (D112). `id` es la política del catálogo; `code` es el código de la API.
export type OsVersionRule = {
  id: string;
  osCode: string;
  code: string;
  distribution: string;
  distributionName: string;
  versionLabel: string;
};

export type Capability = {
  catalogCode: ConnectionCategory;
  category: string;
  platforms: PlatformView[];
  method: string;
  requiredPermissions: string[];
  baseFrequency: string;
  generatedEvidence: string;
};

export type TechnicalControlState = {
  applicableCapabilities: Capability[];
};

export type AssetProvisioningView = {
  id: string;
  // Cómo se conectó (D53) y lo que el cliente configura en su cuenta. Nada de esto es secreto; las llaves, si las hay, nunca salen.
  connectionMethod: ConnectionMethodValue | null;
  regions: string[];
  externalId: string | null;
  roleArn: string | null;
  automatedCapabilityCode: ConnectionCategory;
  connectionStatus: string;
  lastValidatedAt: Date | null;
  isActive: boolean;
  scheduleFrequency: ScheduleFrequencyValue | null;
};

// El agente de la sonda de un servidor (D112). Hasta que Monkey lo crea, `status` es `pending`. No lleva la clave ni el nombre/grupo del agente en la sonda
// (son derivados del activo y de la empresa): esto es solo lo que la pantalla necesita.
export type AssetAgentView = {
  status: 'pending' | 'connected' | 'disconnected' | 'removed';
  // La versión que el cliente declaró; de `os` sale el comando de instalación.
  os: string;
  osVersion: Pick<OsVersionRule, 'code' | 'distribution' | 'distributionName' | 'versionLabel'>;
  // La última vez que Monkey leyó este servidor con éxito: la «última revisión» que ve el cliente.
  lastSyncAt: Date | null;
};

// Las credenciales no forman parte de este tipo: se cifran al crear y no se leen de vuelta.
export type Asset = {
  id: string;
  code: string;
  name: string;
  connectionCategory: ConnectionCategory;
  type: string;
  platform: string;
  // La plataforma elegida al conectar (D67). Nula en un activo descubierto y en los registrados antes de D67 con el formulario provisional.
  platformId: string | null;
  ipAddress: string | null;
  location: string | null;
  criticality: string;
  tags: string[];
  origin: string;
  status: string;
  operationalStatus: string;
  technicalCoverage: string;
  // Cuenta de AWS (o suscripción o proyecto) a la que apunta la conexión. Solo activos de nube.
  externalAccountId: string | null;
  services: { id: string; name: string }[];
  provisioning: AssetProvisioningView;
  // Solo un servidor o equipo con agente (D112); null en los demás.
  agent: AssetAgentView | null;
};

// Lo que hace falta para registrar un activo. `encryptedCredentials` ya viene cifrado.
export type NewAsset = {
  name: string;
  connectionCategory: ConnectionCategory;
  // El `code` de la plataforma elegida (etiqueta del activo) y su id en el catálogo (D67).
  platform: string;
  platformId: string;
  ipAddress: string | null;
  location: string | null;
  criticality: string;
  tags: string[];
  serviceIds: string[];
  responsibleId: string | null;
  encryptedCredentials: string | null;
  // Canal de la conexión (D53, D58). La cuenta y las regiones solo aplican a la nube.
  connectionMethod: ConnectionMethodValue;
  externalAccountId: string | null;
  regions: string[];
  externalId: string | null;
  // La versión del sistema que el cliente declaró (D112): la política del catálogo. Con ella nace la fila de agente del activo, en la misma transacción.
  agentScaPolicyId: string | null;
};

// Lo que la sonda necesita para validar una conexión. Las credenciales llegan descifradas y solo
// viven en memoria durante la llamada.
export type ProbeTarget = {
  assetId: string;
  category: ConnectionCategory;
  platform: string;
  ipAddress: string | null;
  connectionStatus: string;
  encryptedCredentials: string | null;
};

export type AssetFilters = {
  serviceId?: string;
  connectionCategory?: ConnectionCategory;
  operationalStatus?: string;
};

// Cambios a un activo ya registrado. `resetsConnection`: algo de lo que se evalúa cambió, así que la conexión vuelve a «pendiente» y hay que comprobarla de nuevo.
export type AssetEdit = {
  name?: string;
  criticality?: string;
  tags?: string[];
  externalAccountId?: string;
  regions?: string[];
  roleArn?: string | null;
  encryptedCredentials?: string;
  // Una cuenta nueva exige un ExternalId nuevo: el anterior se entregó para otra cuenta.
  externalId?: string;
  resetsConnection: boolean;
};

// Lo que el descubrimiento encontró en la cuenta del cliente (D59). Los atributos son solo lo que se pudo leer: lo que no, no está.
export type ResourceAttributes = Record<string, string | number | boolean | null>;
export type DiscoveredResource = {
  uid: string;
  type: string;
  kind: ResourceKindValue;
  name: string | null;
  region: string | null;
  attributes: ResourceAttributes;
  tags: string[];
};
export type Inventory = { resources: DiscoveredResource[]; warnings: string[] };

// Un activo descubierto dentro de una conexión, tal como lo ve el cliente (D61): con lo que lo distingue de otro igual.
export type DiscoveredAssetView = {
  id: string; // el id del activo (no del recurso técnico)
  code: string;
  kind: ResourceKindValue;
  type: string;
  name: string | null;
  region: string | null;
  platform: string;
  ipAddress: string | null;
  location: string | null;
  criticality: string;
  tags: string[];
  attributes: ResourceAttributes;
  // Si pertenece al servicio por el que se pregunta. Nulo cuando no se preguntó por ninguno.
  inService: boolean | null;
};
export type ResourceListing = {
  // Nulo si la cuenta aún no se ha descubierto (conexión sin comprobar, o comprobada sin descubrimiento).
  discoveredAt: Date | null;
  regions: string[];
  // Servicios que no se pudieron leer en el último descubrimiento (permiso denegado, tiempo agotado).
  incompleteServices: string[];
  summary: { kind: ResourceKindValue; count: number }[];
  items: DiscoveredAssetView[];
  total: number;
  // Cuántos de los activos de la conexión pertenecen al servicio por el que se preguntó.
  includedCount: number | null;
};
