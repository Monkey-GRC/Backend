import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceDetail, SystemDescriptionInput } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';

@Injectable()
export class SetSystemDescriptionUseCase {
  constructor(
    private readonly services: ServiceRepository,
    private readonly audit: AuditLogWriter,
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
    );
    if (!change) throw new DomainError('NOT_FOUND');

    await this.audit.write({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'service.system_description',
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
