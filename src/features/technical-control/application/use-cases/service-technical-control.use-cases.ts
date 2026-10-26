import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { TechnicalControlState } from '../../domain/entities/technical-control.entities';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';

const scopeOf = (p: Principal): TenantScope => ({ companyId: p.companyId, userId: p.userId, role: p.role });

// Lo que el cliente ve del Componente 3 de un servicio: las conexiones que puede registrar.
@Injectable()
export class GetTechnicalControlUseCase {
  constructor(private readonly repo: TechnicalControlRepository) {}

  async execute(principal: Principal, serviceId: string): Promise<TechnicalControlState> {
    const state = await this.repo.getState(scopeOf(principal), serviceId);
    if (!state) throw new DomainError('NOT_FOUND');
    return state;
  }
}
