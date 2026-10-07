import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceDetail, SystemDescriptionInput } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';

@Injectable()
export class SetSystemDescriptionUseCase {
  constructor(
    private readonly services: ServiceRepository,
  ) {}

  async execute(
    principal: Principal,
    id: string,
    input: SystemDescriptionInput,
    meta: RequestMeta,
  ): Promise<ServiceDetail> {
    const change = await this.services.setSystemDescription(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      id,
      input,
      (done) => ({
        tenantId: principal.companyId,
        userId: principal.userId,
        action: 'service.system_description',
        resource: 'service',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        beforeState: done.before.snapshot(),
        afterState: done.after.snapshot(),
      }),
    );
    if (!change) throw new DomainError('NOT_FOUND');
    return change.after;
  }
}
