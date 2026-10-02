import {
  ConnectionCategory,
  DeploymentScenarioValue,
  ScheduleFrequencyValue,
  ScopeKey,
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

export type ScopeCounts = Record<ScopeKey, number>;

// Lo que el cliente DICE que tiene, frente a lo que ya se conectó.
export type Scope = {
  id: string;
  counts: ScopeCounts;
  declaredTotal: number;
  connectedTotal: number;
  connected: ScopeCounts;
};

export type TechnicalControlState = {
  deploymentScenario: DeploymentScenarioValue | null;
  applicableCapabilities: Capability[];
  scope: Scope | null;
};

export type AssetProvisioningView = {
  id: string;
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
