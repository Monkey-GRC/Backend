export type RegulationItem = {
    code: string;
    name: string;
    jurisdiction: string;
};
export type FrameworkItem = {
    code: string;
    name: string;
    description: string;
};
export type CapabilityItem = {
    catalogCode: string;
    category: string;
    supportedPlatforms: string[];
    method: string;
    requiredPermissions: string[];
    baseFrequency: string;
    generatedEvidence: string;
};
export type Catalog = {
    kind: 'capabilities';
    items: CapabilityItem[];
} | {
    kind: 'enum';
    name: string;
    values: readonly string[];
} | {
    kind: 'regulations';
    items: RegulationItem[];
} | {
    kind: 'frameworks';
    items: FrameworkItem[];
};
