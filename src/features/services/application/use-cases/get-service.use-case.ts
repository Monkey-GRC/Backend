import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { TransactionRunner } from '../../../../common/tenancy/transaction-runner';
import { ServiceDetail } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
import { isScopedRole } from '../../../../common/enums/user-role.enum';

@Injectable()
export class GetServiceUseCase {
  constructor(private readonly services: ServiceRepository, private readonly tx: TransactionRunner) {}

  async execute(principal: Principal, id: string): Promise<ServiceDetail> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    return this.tx.run(scope, async () => {
      const service = await this.services.findById(scope, id);
      // Un servicio de otra empresa no se ve (RLS): para quien pregunta, simplemente no existe.
      if (!service) throw new DomainError('NOT_FOUND');
      // D102 · Existe y es de su empresa, pero un `responsable` o `delegado` solo lo lee si tiene algún control suyo en él: no le toca (403).
      if (isScopedRole(principal.role) && !(await this.services.isResponsible(scope, id))) throw new DomainError('FORBIDDEN');
      return service;
    });
  }
}
