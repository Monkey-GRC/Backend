import type { Request } from 'express';
import type { Principal } from '../../../common/auth/principal';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { DeploymentScenarioDto, ScopeDto } from '../application/dtos/technical-control.dtos';
import { GetTechnicalControlUseCase, SetDeploymentScenarioUseCase, SetScopeUseCase } from '../application/use-cases/service-technical-control.use-cases';
import { ConnectionProbe } from '../domain/ports/connection-probe';
export declare class TechnicalControlController {
    private readonly getState;
    private readonly setScenario;
    private readonly setScope;
    private readonly probe;
    constructor(getState: GetTechnicalControlUseCase, setScenario: SetDeploymentScenarioUseCase, setScope: SetScopeUseCase, probe: ConnectionProbe);
    state(principal: Principal, id: string): Promise<ResponseDto<{
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
    }>>;
    deploymentScenario(principal: Principal, id: string, dto: DeploymentScenarioDto, req: Request): Promise<ResponseDto<{
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
    }>>;
    scope(principal: Principal, id: string, dto: ScopeDto, req: Request): Promise<ResponseDto<{
        declared_total: number;
        connected_total: number;
        connected: import("../domain/entities/technical-control.entities").ScopeCounts;
        server_count: number;
        cloud_count: number;
        app_count: number;
        database_count: number;
        endpoint_count: number;
        id: string;
    }>>;
}
