import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceDetail, ServicePatch } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
import { assertServiceInput } from '../service-input.validation';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    private readonly services: ServiceRepository,
  ) {}

  async execute(
    principal: Principal,
    id: string,
    patch: ServicePatch,
    meta: RequestMeta,
  ): Promise<ServiceDetail> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    await assertServiceInput(this.services, scope, patch);

    const change = await this.services.update(scope, id, patch, (done) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'service.update',
      resource: 'service',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: done.before.snapshot(),
      afterState: done.after.snapshot(),
    }));
    if (!change) throw new DomainError('NOT_FOUND');
    return change.after;
  }
}
