import { TenantScope } from '../../../../common/tenancy/tenant-scope';
export declare abstract class OnboardingProgressReader {
    abstract hasOrganizationalContext(scope: TenantScope): Promise<boolean>;
    abstract hasDeclaredService(scope: TenantScope): Promise<boolean>;
    abstract hasTechnicalControl(scope: TenantScope): Promise<boolean>;
}
