import { ConnectionCategory, DeploymentScenarioValue, ScheduleFrequencyValue, ScopeKey } from '../../../../common/catalogs/technical-catalogs';
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
    services: {
        id: string;
        name: string;
    }[];
    provisioning: AssetProvisioningView;
};
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
