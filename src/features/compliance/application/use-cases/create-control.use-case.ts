import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ControlChangeRepository } from '../../domain/repositories/control-change.repository';
import { validateOwnControl } from '../control-change.validation';
import { CreateControlDto } from '../dtos/control-change.dto';
import { ControlDetail, GetControlUseCase } from './get-control.use-case';

// MD-150 · Solo `admin_empresa` (lo impone @Roles en la ruta). El control nace pendiente de aprobación y cuenta desde que se crea (D65).
@Injectable()
export class CreateControlUseCase {
  constructor(
    private readonly changes: ControlChangeRepository,
    private readonly getControl: GetControlUseCase,
  ) {}

  async execute(principal: Principal, serviceId: string, dto: CreateControlDto, meta: RequestMeta): Promise<ControlDetail> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const contracted = await this.changes.contractedCriteria(scope, serviceId);
    if (!contracted) throw new DomainError('NOT_FOUND');
    validateOwnControl(dto.dimensions, dto.trust_criterion, contracted);

    const created = await this.changes.createOwnControl(
      scope,
      { serviceId, name: dto.name.trim(), interpretation: dto.interpretation.trim(), trustCriterion: dto.trust_criterion, requestedBy: principal.userId, meta },
      (done) => ({
        tenantId: principal.companyId,
        userId: principal.userId,
        action: 'client_control.create',
        resource: 'client_control',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        beforeState: null,
        afterState: { id: done.controlId, service_id: serviceId, own_code: done.ownCode, name: dto.name.trim(), trust_criterion: dto.trust_criterion, type: 'manual', approval: 'pending' },
      }),
    );
    return this.getControl.execute(principal, created.controlId, undefined);
  }
}
