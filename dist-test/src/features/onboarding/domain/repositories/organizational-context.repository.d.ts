import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { OrganizationalContext, OrganizationalContextInput } from '../entities/organizational-context.entity';
export declare abstract class OrganizationalContextRepository {
    abstract find(scope: TenantScope): Promise<OrganizationalContext>;
    abstract existingRegulationCodes(codes: string[]): Promise<string[]>;
    abstract save(scope: TenantScope, input: OrganizationalContextInput): Promise<{
        before: OrganizationalContext;
        after: OrganizationalContext;
    }>;
}
