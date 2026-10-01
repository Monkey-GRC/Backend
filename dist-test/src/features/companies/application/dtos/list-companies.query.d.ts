import type { CompanySort } from '../../domain/repositories/company.repository';
import type { CompanyStatus } from '../../domain/entities/company.entity';
export declare class ListCompaniesQuery {
    page: number;
    page_size: number;
    sort: CompanySort;
    status?: CompanyStatus;
}
