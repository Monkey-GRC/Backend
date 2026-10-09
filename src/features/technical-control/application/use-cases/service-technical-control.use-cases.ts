import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DeploymentScenarioValue } from '../../../../common/catalogs/technical-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { TechnicalControlState } from '../../domain/entities/technical-control.entities';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';

const scopeOf = (p: Principal): TenantScope => ({ companyId: p.companyId, userId: p.userId, role: p.role });

// Lo que el cliente ve del Componente 3 de un servicio: escenario, conexiones que le aplican y scope.
@Injectable()
export class GetTechnicalControlUseCase {
  constructor(private readonly repo: TechnicalControlRepository) {}

  async execute(principal: Principal, serviceId: string): Promise<TechnicalControlState> {
    const state = await this.repo.getState(scopeOf(principal), serviceId);
    if (!state) throw new DomainError('NOT_FOUND');
    return state;
  }
}

@Injectable()
export class SetDeploymentScenarioUseCase {
  constructor(
    private readonly repo: TechnicalControlRepository,
  ) {}

  async execute(
    principal: Principal,
    serviceId: string,
    scenario: DeploymentScenarioValue,
    meta: RequestMeta,
  ): Promise<TechnicalControlState> {
    const result = await this.repo.setDeploymentScenario(scopeOf(principal), serviceId, scenario, (change) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'service.deployment_scenario',
      resource: 'service',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: { service_id: serviceId, deployment_scenario: change.before },
      afterState: { service_id: serviceId, deployment_scenario: scenario },
    }));
    if (!result) throw new DomainError('NOT_FOUND');
    return result.state;
  }
}
