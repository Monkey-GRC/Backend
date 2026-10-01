import { PageRequest, Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ServiceDetail, ServiceInput, ServicePatch, SystemDescriptionInput } from '../entities/service.entity';
export type Change = {
    before: ServiceDetail;
    after: ServiceDetail;
};
export declare abstract class ServiceRepository {
    abstract existingFrameworkCodes(codes: string[]): Promise<string[]>;
    abstract existingRegulationCodes(codes: string[]): Promise<string[]>;
    abstract create(scope: TenantScope, input: ServiceInput): Promise<ServiceDetail>;
    abstract list(scope: TenantScope, request: PageRequest): Promise<Page<ServiceDetail>>;
    abstract findById(scope: TenantScope, id: string): Promise<ServiceDetail | null>;
    abstract update(scope: TenantScope, id: string, patch: ServicePatch): Promise<Change | null>;
    abstract setSystemDescription(scope: TenantScope, id: string, input: SystemDescriptionInput): Promise<Change | null>;
    abstract remove(scope: TenantScope, id: string): Promise<ServiceDetail | null>;
}
