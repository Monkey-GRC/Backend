import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ResponsibilityRepository } from '../../domain/repositories/responsibility.repository';
import { ControlResponsibleRow, Dimension, DimensionOwnerRow } from '../../domain/team.types';

// contracts/modules/users-team.md · Reparten el trabajo `admin_empresa`; las lecturas también las hace el `auditor` (lo impone @Roles en la ruta).
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const entry = (p: Principal, meta: RequestMeta, action: string, resource: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource, result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: before as Record<string, unknown>, afterState: after as Record<string, unknown>,
});
const ownerState = (r: DimensionOwnerRow | ControlResponsibleRow) => ({ dimension: r.dimension, user_id: r.owner?.id ?? null });

@Injectable()
export class ListDimensionOwnersUseCase {
  constructor(private readonly repo: ResponsibilityRepository) {}

  async execute(p: Principal, serviceId: string): Promise<DimensionOwnerRow[]> {
    const rows = await this.repo.listDimensionOwners(scopeOf(p), serviceId);
    if (!rows) throw new DomainError('NOT_FOUND');
    return rows;
  }
}

@Injectable()
export class SetDimensionOwnerUseCase {
  constructor(private readonly repo: ResponsibilityRepository) {}

  async execute(p: Principal, serviceId: string, dimension: Dimension, userId: string | null, meta: RequestMeta): Promise<DimensionOwnerRow> {
    const row = await this.repo.setDimensionOwner(scopeOf(p), { serviceId, dimension, userId, assignedBy: p.userId }, ({ before, after }) =>
      entry(p, meta, 'dimension_owner.set', 'service_dimension_owner', { service_id: serviceId, ...ownerState(before) }, { service_id: serviceId, ...ownerState(after) }),
    );
    if (!row) throw new DomainError('NOT_FOUND');
    return row;
  }
}

@Injectable()
export class ListControlResponsiblesUseCase {
  constructor(private readonly repo: ResponsibilityRepository) {}

  async execute(p: Principal, controlId: string): Promise<ControlResponsibleRow[]> {
    const rows = await this.repo.listControlResponsibles(scopeOf(p), controlId);
    if (!rows) throw new DomainError('NOT_FOUND');
    return rows;
  }
}

@Injectable()
export class SetControlResponsibleUseCase {
  constructor(private readonly repo: ResponsibilityRepository) {}

  async execute(p: Principal, controlId: string, dimension: Dimension, userId: string | null, meta: RequestMeta): Promise<ControlResponsibleRow> {
    const row = await this.repo.setControlResponsible(scopeOf(p), { controlId, dimension, userId, assignedBy: p.userId }, ({ before, after }) =>
      entry(p, meta, 'control_responsible.set', 'control_responsible', { control_id: controlId, ...ownerState(before), source: before.source }, { control_id: controlId, ...ownerState(after), source: after.source }),
    );
    if (!row) throw new DomainError('NOT_FOUND');
    return row;
  }
}
