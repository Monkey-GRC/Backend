import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { CompanyDetail } from '../../domain/entities/company-overview';
import { CompanyRepository } from '../../domain/repositories/company.repository';

@Injectable()
export class GetCompanyUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(principal: Principal, companyId: string): Promise<CompanyDetail> {
    const detail = await this.companies.findById(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      companyId,
      principal.companyId,
    );
    if (!detail) throw new DomainError('NOT_FOUND');
    return detail;
  }
}
