import { Asset, Capability, TechnicalControlState } from '../domain/entities/technical-control.entities';
export declare function toCapabilityResponse(c: Capability): {
    catalog_code: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
    category: string;
    method: string;
    required_permissions: string[];
    base_frequency: string;
    supported_platforms: string[];
    generated_evidence: string;
};
export declare function toScopeResponse(scope: NonNullable<TechnicalControlState['scope']>): {
    declared_total: number;
    connected_total: number;
    connected: import("../domain/entities/technical-control.entities").ScopeCounts;
    server_count: number;
    cloud_count: number;
    app_count: number;
    database_count: number;
    endpoint_count: number;
    id: string;
};
export declare function toDeploymentScenarioResponse(state: TechnicalControlState): {
    deployment_scenario: "cloud_managed_only" | "cloud_with_servers" | "on_premise" | "hybrid" | null;
    applicable_capabilities: {
        catalog_code: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
        category: string;
        method: string;
        required_permissions: string[];
        base_frequency: string;
        supported_platforms: string[];
        generated_evidence: string;
    }[];
};
export declare function toTechnicalControlResponse(state: TechnicalControlState, probeMode: string): {
    scope: {
        declared_total: number;
        connected_total: number;
        connected: import("../domain/entities/technical-control.entities").ScopeCounts;
        server_count: number;
        cloud_count: number;
        app_count: number;
        database_count: number;
        endpoint_count: number;
        id: string;
    } | null;
    is_complete: boolean;
    probe_mode: string;
    deployment_scenario: "cloud_managed_only" | "cloud_with_servers" | "on_premise" | "hybrid" | null;
    applicable_capabilities: {
        catalog_code: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
        category: string;
        method: string;
        required_permissions: string[];
        base_frequency: string;
        supported_platforms: string[];
        generated_evidence: string;
    }[];
};
export declare function toAssetResponse(a: Asset): {
    id: string;
    code: string;
    name: string;
    connection_category: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
    type: string;
    platform: string;
    ip_address: string | null;
    location: string | null;
    criticality: string;
    tags: string[];
    origin: string;
    status: string;
    operational_status: string;
    technical_coverage: string;
    services: {
        id: string;
        name: string;
    }[];
    provisioning: {
        id: string;
        automated_capability_code: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
        connection_status: string;
        last_validated_at: string | null;
        is_active: boolean;
        schedule_frequency: "continuous" | "every_6h" | "every_24h" | null;
    };
};
export declare function toAssetListItem(a: Asset): {
    id: string;
    code: string;
    name: string;
    connection_category: "ac_01" | "ac_02" | "ac_03" | "ac_04" | "ac_05" | "ac_06";
    type: string;
    operational_status: string;
    technical_coverage: string;
    services: {
        id: string;
        name: string;
    }[];
    provisioning: {
        connection_status: string;
        is_active: boolean;
        schedule_frequency: "continuous" | "every_6h" | "every_24h" | null;
    };
};
