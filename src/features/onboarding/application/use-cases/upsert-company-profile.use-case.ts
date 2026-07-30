import { Injectable } from '@nestjs/common';
import { CompanyProfileRepository } from '../../domain/repositories/company-profile.repository';
import { UpsertCompanyProfileDto } from '../dtos/upsert-company-profile.dto';

@Injectable()
export class UpsertCompanyProfileUseCase {
  constructor(private readonly companyProfileRepository: CompanyProfileRepository) {}

  execute(dto: UpsertCompanyProfileDto) {
    return this.companyProfileRepository.upsert({
      business_type: dto.business_type,
      server_count: dto.server_count,
    });
  }
}
