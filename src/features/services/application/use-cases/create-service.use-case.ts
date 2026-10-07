import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ServiceDetail, ServiceInput } from '../../domain/entities/service.entity';
import { ServiceRepository } from '../../domain/repositories/service.repository';
import { assertServiceInput } from '../service-input.validation';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    private readonly services: ServiceRepository,
  ) {}

  async execute(principal: Principal, input: ServiceInput, meta: RequestMeta): Promise<ServiceDetail> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    await assertServiceInput(this.services, scope, input);

    // CC9.2 (gestión de cambios): quién declaró el servicio y con qué datos. El rastro se escribe en la misma
    // transacción que el servicio y su clonado (SEG-36).
    return this.services.create(scope, input, (created) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'service.create',
      resource: 'service',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: null,
      afterState: created.snapshot(),
    }));
  }
}
