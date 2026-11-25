import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { Responsible, ResponsibleChange, ResponsibleRepository, ResponsibleType } from '../../domain/responsibles/responsible.repository';

const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const snapshot = (r: Responsible) => ({ id: r.id, type: r.type, person_name: r.personName });
const entry = (p: Principal, meta: RequestMeta, action: string, before: Responsible | null, after: Responsible | null): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'organization_responsible', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: before ? snapshot(before) : null, afterState: after ? snapshot(after) : null,
});

// Los ve cualquier rol de la empresa; los gestiona solo `admin_empresa` (lo impone @Can en la ruta).
@Injectable()
export class ListResponsiblesUseCase {
  constructor(private readonly responsibles: ResponsibleRepository) {}
  execute(principal: Principal, filters: { type?: ResponsibleType; page: number; pageSize: number }): Promise<Page<Responsible>> {
    return this.responsibles.list(scopeOf(principal), filters);
  }
}

@Injectable()
export class CreateResponsibleUseCase {
  constructor(private readonly responsibles: ResponsibleRepository) {}
  execute(principal: Principal, input: { type: ResponsibleType; personName: string }, meta: RequestMeta): Promise<Responsible> {
    return this.responsibles.create(scopeOf(principal), { type: input.type, personName: input.personName.trim() }, (done) => entry(principal, meta, 'responsible.create', null, done));
  }
}

@Injectable()
export class UpdateResponsibleUseCase {
  constructor(private readonly responsibles: ResponsibleRepository) {}
  async execute(principal: Principal, id: string, personName: string, meta: RequestMeta): Promise<Responsible> {
    const change: ResponsibleChange | null = await this.responsibles.rename(scopeOf(principal), id, personName.trim(), (done) => entry(principal, meta, 'responsible.update', done.before, done.after));
    if (!change) throw new DomainError('NOT_FOUND');
    return change.after;
  }
}

@Injectable()
export class DeleteResponsibleUseCase {
  constructor(private readonly responsibles: ResponsibleRepository) {}
  async execute(principal: Principal, id: string, meta: RequestMeta): Promise<void> {
    const removed = await this.responsibles.remove(scopeOf(principal), id, (done) => entry(principal, meta, 'responsible.delete', done, null));
    if (!removed) throw new DomainError('NOT_FOUND');
  }
}
