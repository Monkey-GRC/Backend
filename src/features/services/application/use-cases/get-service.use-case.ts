import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ServiceDetail } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';

@Injectable()
export class GetServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(principal: Principal, id: string): Promise<ServiceDetail> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const service = await this.services.findById(scope, id);
    // Un servicio de otra empresa no se ve (RLS): para quien pregunta, simplemente no existe.
    if (!service) throw new DomainError('NOT_FOUND');
    // D96 · Existe y es de su empresa, pero un `funcional` solo lo lee si es responsable de algo en él: no le toca (403).
    if (principal.role === 'funcional' && !(await this.services.isResponsible(scope, id))) throw new DomainError('FORBIDDEN');
    return service;
  }
}
