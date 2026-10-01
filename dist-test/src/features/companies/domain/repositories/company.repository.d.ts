import { Page, PageRequest } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AccessKey } from '../entities/access-key.entity';
import { CompanyDetail, CompanyOverview } from '../entities/company-overview';
import { Company, CompanyStatus, IsolationStrategy } from '../entities/company.entity';
export type NewCompany = {
    name: string;
    adminEmail: string;
    isolationStrategy: IsolationStrategy;
};
export type NewAccessKey = {
    codeHash: string;
    expiresAt: Date;
    createdBy: string;
};
export type CompanySort = 'created_at' | '-created_at' | 'name' | '-name';
export type CompanyListQuery = PageRequest & {
    sort: CompanySort;
    status?: CompanyStatus;
    excludeCompanyId: string;
};
export declare abstract class CompanyRepository {
    abstract existsActiveWithName(scope: TenantScope, name: string): Promise<boolean>;
    abstract existsWithAdminEmail(scope: TenantScope, adminEmail: string): Promise<boolean>;
    abstract createWithAccessKey(scope: TenantScope, company: NewCompany, accessKey: NewAccessKey): Promise<{
        company: Company;
        accessKey: AccessKey;
    }>;
    abstract list(scope: TenantScope, query: CompanyListQuery): Promise<Page<CompanyOverview>>;
    abstract findById(scope: TenantScope, companyId: string, excludeCompanyId: string): Promise<CompanyDetail | null>;
}
