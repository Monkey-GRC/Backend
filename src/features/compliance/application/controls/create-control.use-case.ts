import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ControlEditRepository } from '../../domain/controls/control-edit.repository';
import { validateOwnControl } from './control-edit.validation';
import { CreateControlDto } from './control.dto';
import { ControlDetail, GetControlUseCase } from './get-control.use-case';

// MD-150, D96 · Solo `admin_empresa` (lo impone @Can en la ruta). El control nace aprobado y cuenta desde que se crea (D65, D96): nadie lo aprueba aparte.
@Injectable()
export class CreateControlUseCase {
  constructor(
    private readonly controls: ControlEditRepository,
    private readonly getControl: GetControlUseCase,
  ) {}

  async execute(principal: Principal, serviceId: string, dto: CreateControlDto, meta: RequestMeta): Promise<ControlDetail> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const contracted = await this.controls.contractedCriteria(scope, serviceId);
    if (!contracted) throw new DomainError('NOT_FOUND');
    validateOwnControl(dto.dimensions, dto.trust_criterion, contracted);

    const created = await this.controls.createOwnControl(
      scope,
      { serviceId, name: dto.name.trim(), interpretation: dto.interpretation.trim(), trustCriterion: dto.trust_criterion, createdBy: principal.userId, meta },
      (done) => ({
        tenantId: principal.companyId,
        userId: principal.userId,
        action: 'client_control.create',
        resource: 'client_control',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        beforeState: null,
        afterState: { id: done.controlId, service_id: serviceId, own_code: done.ownCode, name: dto.name.trim(), trust_criterion: dto.trust_criterion, type: 'manual' },
      }),
    );
    return this.getControl.execute(principal, created.controlId, undefined);
  }
}