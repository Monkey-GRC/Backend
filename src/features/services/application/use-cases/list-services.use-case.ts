import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { ServiceDetail } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';

@Injectable()
export class ListServicesUseCase {
  constructor(private readonly services: ServiceRepository) {}

  execute(principal: Principal, request: PageRequest): Promise<Page<ServiceDetail>> {
    return this.services.list(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      request,
    );
  }
}
