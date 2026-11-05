import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { GroupFilters, TeamGroupRepository } from '../../domain/repositories/team-group.repository';
import { TeamGroup } from '../../domain/team.types';
import { CreateGroupDto, RenameGroupDto } from '../dtos/team.dto';
import { cleanGroupName, isDefaultResponsiblesGroup, isReservedGroupName, planGroupCreation } from './team-group-placement';

// contracts/gestion-usuarios.md · Grupos. Listar y crear los abren `admin_empresa` y `responsable` (@Roles en la ruta y la regla de cada rol aquí); renombrar, solo `admin_empresa`.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });
const entry = (p: Principal, meta: RequestMeta, action: string, before: unknown, after: unknown): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action, resource: 'group', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: (before as Record<string, unknown>) ?? null, afterState: (after as Record<string, unknown>) ?? null,
});
const snapshot = (g: TeamGroup) => ({ id: g.id, name: g.name, kind: g.kind, leader_id: g.leader.id });

@Injectable()
export class ListGroupsUseCase {
  constructor(private readonly repo: TeamGroupRepository) {}

  // El administrador ve todos; el responsable, solo el que lidera (lista vacía si aún no lo creó): el servidor impone el filtro.
  execute(p: Principal, filters: GroupFilters): Promise<Page<TeamGroup>> {
    if (p.role === 'admin_empresa') return this.repo.list(scopeOf(p), filters);
    if (p.role === 'responsable') return this.repo.list(scopeOf(p), { ...filters, leaderId: p.userId });
    throw new DomainError('FORBIDDEN');
  }
}

@Injectable()
export class CreateGroupUseCase {
  constructor(private readonly repo: TeamGroupRepository) {}

  async execute(p: Principal, dto: CreateGroupDto, meta: RequestMeta): Promise<TeamGroup> {
    const plan = planGroupCreation(p, dto.leader_id ?? null);
    if (isReservedGroupName(dto.name)) throw new DomainError('GROUP_NAME_TAKEN');
    return this.repo.create(scopeOf(p), { name: cleanGroupName(dto.name), kind: plan.kind, leaderId: plan.leaderId }, (done) => entry(p, meta, 'group.create', null, snapshot(done)));
  }
}

@Injectable()
export class RenameGroupUseCase {
  constructor(private readonly repo: TeamGroupRepository) {}

  async execute(p: Principal, id: string, dto: RenameGroupDto, meta: RequestMeta): Promise<TeamGroup> {
    // La lectura, la regla y la escritura corren en la misma transacción: nadie cambia el grupo entre la comprobación y el renombrado.
    const guard = (current: TeamGroup): void => {
      // El grupo por omisión no se renombra; y ningún otro puede quedarse con su nombre.
      if (isDefaultResponsiblesGroup(current)) throw new DomainError('GROUP_RESERVED');
      if (isReservedGroupName(dto.name)) throw new DomainError('GROUP_NAME_TAKEN');
    };
    const done = await this.repo.rename(scopeOf(p), id, cleanGroupName(dto.name), guard, ({ before, after }) => entry(p, meta, 'group.update', snapshot(before), snapshot(after)));
    if (!done) throw new DomainError('NOT_FOUND');
    return done;
  }
}
