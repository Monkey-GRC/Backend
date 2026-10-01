import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AccessKey } from '../../domain/entities/access-key.entity';
import { CompanyDetail, CompanyOverview } from '../../domain/entities/company-overview';
import { Company } from '../../domain/entities/company.entity';
import { CompanyListQuery, CompanyRepository, NewAccessKey, NewCompany } from '../../domain/repositories/company.repository';
export declare class CompanyPrismaRepository extends CompanyRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    existsActiveWithName(scope: TenantScope, name: string): Promise<boolean>;
    existsWithAdminEmail(scope: TenantScope, adminEmail: string): Promise<boolean>;
    createWithAccessKey(scope: TenantScope, data: NewCompany, key: NewAccessKey): Promise<{
        company: Company;
        accessKey: AccessKey;
    }>;
    list(scope: TenantScope, query: CompanyListQuery): Promise<Page<CompanyOverview>>;
    findById(scope: TenantScope, companyId: string, excludeCompanyId: string): Promise<CompanyDetail | null>;
    private onboardedCompanyIds;
}
