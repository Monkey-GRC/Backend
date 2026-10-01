import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceDetail, ServiceInput } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
import { assertServiceInput } from '../service-input.validation';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    private readonly services: ServiceRepository,
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(principal: Principal, input: ServiceInput, meta: RequestMeta): Promise<ServiceDetail> {
    await assertServiceInput(this.services, input);

    const created = await this.services.create(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      input,
    );

    // CC9.2 (gestión de cambios): quién declaró el servicio y con qué datos.
    await this.audit.write({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'service.create',
      resource: 'service',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: null,
      afterState: created.snapshot(),
    });
    return created;
  }
}
