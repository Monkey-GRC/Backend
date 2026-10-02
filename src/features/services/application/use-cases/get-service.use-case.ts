import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ServiceDetail } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';

@Injectable()
export class GetServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(principal: Principal, id: string): Promise<ServiceDetail> {
    const service = await this.services.findById(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      id,
    );
    // Un servicio de otra empresa no se ve (RLS): para quien pregunta, simplemente no existe.
    if (!service) throw new DomainError('NOT_FOUND');
    return service;
  }
}
