import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { OrganizationalContext, OrganizationalContextInput } from '../../domain/entities/organizational-context.entity';
import { OrganizationalContextRepository } from '../../domain/repositories/organizational-context.repository';
export declare class OrganizationalContextPrismaRepository extends OrganizationalContextRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    find(scope: TenantScope): Promise<OrganizationalContext>;
    existingRegulationCodes(codes: string[]): Promise<string[]>;
    save(scope: TenantScope, input: OrganizationalContextInput): Promise<{
        before: OrganizationalContext;
        after: OrganizationalContext;
    }>;
    private read;
}
