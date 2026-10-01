import { ASSET_CRITICALITY_VALUES, CONNECTION_CATEGORY_VALUES, DEPLOYMENT_SCENARIO_VALUES, SCHEDULE_FREQUENCY_VALUES } from '../../../../common/catalogs/technical-catalogs';
export declare class DeploymentScenarioDto {
    deployment_scenario: (typeof DEPLOYMENT_SCENARIO_VALUES)[number];
}
export declare class ScopeDto {
    server_count: number;
    cloud_count: number;
    app_count: number;
    database_count: number;
    endpoint_count: number;
}
export declare class CreateAssetDto {
    name: string;
    connection_category: (typeof CONNECTION_CATEGORY_VALUES)[number];
    platform: string;
    ip_address?: string | null;
    location?: string | null;
    criticality?: (typeof ASSET_CRITICALITY_VALUES)[number];
    tags?: string[];
    service_ids: string[];
    responsible_id?: string | null;
    credentials?: Record<string, unknown>;
}
export declare class ScheduleDto {
    frequency: (typeof SCHEDULE_FREQUENCY_VALUES)[number];
}
export declare class ListAssetsQuery {
    page: number;
    page_size: number;
    service_id?: string;
    connection_category?: (typeof CONNECTION_CATEGORY_VALUES)[number];
    operational_status?: string;
}
