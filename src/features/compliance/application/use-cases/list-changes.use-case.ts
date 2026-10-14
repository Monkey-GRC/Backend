import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { ChangeStatus, ControlChange, ControlChangeRepository } from '../../domain/repositories/control-change.repository';

@Injectable()
export class ListChangesUseCase {
  constructor(private readonly changes: ControlChangeRepository) {}

  async execute(principal: Principal, controlId: string, filters: { status?: ChangeStatus; page: number; pageSize: number }): Promise<Page<ControlChange>> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const access = await this.changes.findAccess(scope, controlId);
    if (!access) throw new DomainError('NOT_FOUND');
    if (principal.role === 'funcional' && !access.assignedUserIds.includes(principal.userId)) throw new DomainError('FORBIDDEN');
    return this.changes.listChanges(scope, controlId, filters);
  }
}
