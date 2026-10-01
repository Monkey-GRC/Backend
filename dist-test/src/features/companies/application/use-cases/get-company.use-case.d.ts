import type { Principal } from '../../../../common/auth/principal';
import { CompanyDetail } from '../../domain/entities/company-overview';
import { CompanyRepository } from '../../domain/repositories/company.repository';
export declare class GetCompanyUseCase {
    private readonly companies;
    constructor(companies: CompanyRepository);
    execute(principal: Principal, companyId: string): Promise<CompanyDetail>;
}
