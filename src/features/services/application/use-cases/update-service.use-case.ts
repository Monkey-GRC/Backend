import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
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
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(
    principal: Principal,
    id: string,
    patch: ServicePatch,
    meta: RequestMeta,
  ): Promise<ServiceDetail> {
    await assertServiceInput(this.services, patch);

    const change = await this.services.update(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      id,
      patch,
    );
    if (!change) throw new DomainError('NOT_FOUND');

    await this.audit.write({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'service.update',
      resource: 'service',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: change.before.snapshot(),
      afterState: change.after.snapshot(),
    });
    return change.after;
  }
}
