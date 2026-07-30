import { Injectable } from '@nestjs/common';
import { CompanyProfileRepository } from '../../domain/repositories/company-profile.repository';

@Injectable()
export class GetCompanyProfileUseCase {
  constructor(private readonly companyProfileRepository: CompanyProfileRepository) {}

  execute() {
    return this.companyProfileRepository.get();
  }
}
