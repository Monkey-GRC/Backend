import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { DeploymentScenarioValue, ScheduleFrequencyValue } from '../../../../common/catalogs/technical-catalogs';
import { Asset, AssetFilters, NewAsset, ProbeTarget, ScopeCounts, TechnicalControlState } from '../entities/technical-control.entities';
export declare abstract class TechnicalControlRepository {
    abstract setDeploymentScenario(scope: TenantScope, serviceId: string, scenario: DeploymentScenarioValue): Promise<{
        before: DeploymentScenarioValue | null;
        state: TechnicalControlState;
    } | null>;
    abstract setScope(scope: TenantScope, serviceId: string, counts: ScopeCounts): Promise<{
        before: ScopeCounts | null;
        state: TechnicalControlState;
    } | null>;
    abstract getState(scope: TenantScope, serviceId: string): Promise<TechnicalControlState | null>;
    abstract createAsset(scope: TenantScope, input: NewAsset): Promise<Asset>;
    abstract listAssets(scope: TenantScope, filters: AssetFilters, page: PageRequest): Promise<Page<Asset>>;
    abstract findAsset(scope: TenantScope, id: string): Promise<Asset | null>;
    abstract findProbeTarget(scope: TenantScope, id: string): Promise<ProbeTarget | null>;
    abstract recordValidation(scope: TenantScope, id: string, result: {
        ok: boolean;
        technicalCoverage?: string;
    }): Promise<{
        before: Asset;
        after: Asset;
    }>;
    abstract activateAsset(scope: TenantScope, id: string, operationalStatus: 'operational' | 'warning'): Promise<{
        before: Asset;
        after: Asset;
    }>;
    abstract scheduleAsset(scope: TenantScope, id: string, frequency: ScheduleFrequencyValue): Promise<{
        before: Asset;
        after: Asset;
    }>;
}
