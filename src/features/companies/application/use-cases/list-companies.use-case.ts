import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { Page } from '../../../../common/pagination/page';
import { CompanyOverview } from '../../domain/entities/company-overview';
import { CompanyStatus } from '../../domain/entities/company.entity';
import { CompanyRepository, CompanySort } from '../../domain/repositories/company.repository';

export type ListCompaniesInput = {
  page: number;
  pageSize: number;
  sort: CompanySort;
  status?: CompanyStatus;
};

@Injectable()
export class ListCompaniesUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  execute(principal: Principal, input: ListCompaniesInput): Promise<Page<CompanyOverview>> {
    return this.companies.list(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      { ...input, excludeCompanyId: principal.companyId },
    );
  }
}
