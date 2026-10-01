import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceRepository } from '../../domain/repositories/service.repository';

@Injectable()
export class DeleteServiceUseCase {
  constructor(
    private readonly services: ServiceRepository,
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(principal: Principal, id: string, meta: RequestMeta): Promise<void> {
    const removed = await this.services.remove(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      id,
    );
    if (!removed) throw new DomainError('NOT_FOUND');

    await this.audit.write({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'service.delete',
      resource: 'service',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: removed.snapshot(),
      afterState: null,
    });
  }
}
