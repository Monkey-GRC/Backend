import { DeploymentScenarioValue, ScheduleFrequencyValue } from '../../../../common/catalogs/technical-catalogs';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { Asset, AssetFilters, NewAsset, ProbeTarget, ScopeCounts, TechnicalControlState } from '../../domain/entities/technical-control.entities';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';
export declare class TechnicalControlPrismaRepository extends TechnicalControlRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    setDeploymentScenario(scope: TenantScope, serviceId: string, scenario: DeploymentScenarioValue): Promise<{
        before: DeploymentScenarioValue | null;
        state: TechnicalControlState;
    } | null>;
    setScope(scope: TenantScope, serviceId: string, counts: ScopeCounts): Promise<{
        before: {
            server_count: number;
            cloud_count: number;
            app_count: number;
            database_count: number;
            endpoint_count: number;
        } | null;
        state: TechnicalControlState;
    } | null>;
    getState(scope: TenantScope, serviceId: string): Promise<TechnicalControlState | null>;
    createAsset(scope: TenantScope, input: NewAsset): Promise<Asset>;
    listAssets(scope: TenantScope, filters: AssetFilters, page: PageRequest): Promise<Page<Asset>>;
    findAsset(scope: TenantScope, id: string): Promise<Asset | null>;
    findProbeTarget(scope: TenantScope, id: string): Promise<ProbeTarget | null>;
    recordValidation(scope: TenantScope, id: string, result: {
        ok: boolean;
        technicalCoverage?: string;
    }): Promise<{
        before: Asset;
        after: Asset;
    }>;
    activateAsset(scope: TenantScope, id: string, operationalStatus: 'operational' | 'warning'): Promise<{
        before: Asset;
        after: Asset;
    }>;
    scheduleAsset(scope: TenantScope, id: string, frequency: ScheduleFrequencyValue): Promise<{
        before: Asset;
        after: Asset;
    }>;
    private readAsset;
    private toAsset;
    private state;
    private connectedCounts;
}
