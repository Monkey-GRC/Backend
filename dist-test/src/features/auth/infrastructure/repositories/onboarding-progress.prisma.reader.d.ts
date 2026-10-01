import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { OnboardingProgressReader } from '../../domain/ports/onboarding-progress.reader';
export declare class OnboardingProgressPrismaReader extends OnboardingProgressReader {
    private readonly prisma;
    constructor(prisma: PrismaService);
    hasOrganizationalContext(scope: TenantScope): Promise<boolean>;
    hasDeclaredService(scope: TenantScope): Promise<boolean>;
    hasTechnicalControl(scope: TenantScope): Promise<boolean>;
}
