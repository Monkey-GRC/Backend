import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ControlChange, ControlChangeRepository } from '../../domain/repositories/control-change.repository';
import { validateProposal } from '../control-change.validation';
import { ProposeChangeDto } from '../dtos/control-change.dto';

// MD-118 · Proponen `admin_empresa` (cualquier acción) y `funcional` (solo una asignada). Hasta que el consultor aprueba, la acción sigue como estaba y
// sigue contando: esta escritura no toca el control, solo deja la propuesta.
@Injectable()
export class ProposeChangeUseCase {
  constructor(private readonly changes: ControlChangeRepository) {}

  async execute(principal: Principal, controlId: string, dto: ProposeChangeDto, meta: RequestMeta): Promise<ControlChange> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const access = await this.changes.findAccess(scope, controlId);
    if (!access) throw new DomainError('NOT_FOUND');
    if (principal.role === 'funcional' && !access.assignedUserIds.includes(principal.userId)) throw new DomainError('FORBIDDEN');
    if (!access.isActive) throw new DomainError('CONTROL_RETIRED');

    const proposedValues = validateProposal(dto.change_type, dto.proposed_values);
    return this.changes.propose(scope, { controlId, changeType: dto.change_type, proposedValues, requestedBy: principal.userId }, (done) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'client_control_change.request',
      resource: 'client_control_change',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: null,
      afterState: { id: done.id, control_id: controlId, change_type: done.changeType, status: done.status, proposed_values: done.proposedValues },
    }));
  }
}
