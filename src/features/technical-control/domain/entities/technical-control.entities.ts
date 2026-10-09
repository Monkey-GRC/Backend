import {
  ConnectionCategory,
  DeploymentScenarioValue,
  ScheduleFrequencyValue,
  ConnectionMethodValue,
  ResourceKindValue,
} from '../../../../common/catalogs/technical-catalogs';

// Una conexión que el cliente puede usar (catalog.automated_capabilities). OJO: este tipo NO tiene
// `provider`, a propósito. Es la única columna que nunca sale (confidencialidad): al no existir
// aquí, ningún mapper ni response puede filtrarla por descuido.
export type Capability = {
  catalogCode: ConnectionCategory;
  category: string;
  supportedPlatforms: string[];
  method: string;
  requiredPermissions: string[];
  baseFrequency: string;
  generatedEvidence: string;
};

export type TechnicalControlState = {
  deploymentScenario: DeploymentScenarioValue | null;
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

// Las credenciales no forman parte de este tipo: se cifran al crear y no se leen de vuelta.
export type Asset = {
  id: string;
  code: string;
  name: string;
  connectionCategory: ConnectionCategory;
  type: string;
  platform: string;
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
};

// Lo que hace falta para registrar un activo. `encryptedCredentials` ya viene cifrado.
export type NewAsset = {
  name: string;
  connectionCategory: ConnectionCategory;
  platform: string;
  ipAddress: string | null;
  location: string | null;
  criticality: string;
  tags: string[];
  serviceIds: string[];
  responsibleId: string | null;
  encryptedCredentials: string | null;
  // Conexión de nube (D53, D58). Nulos en el formulario provisional y en los activos de agente.
  connectionMethod: ConnectionMethodValue | null;
  externalAccountId: string | null;
  regions: string[];
  externalId: string | null;
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
