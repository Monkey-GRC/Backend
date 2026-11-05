import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { GroupFilters, GroupRenamed, NewGroup, TeamGroupRepository } from '../../domain/repositories/team-group.repository';
import { TeamGroup } from '../../domain/team.types';
import { isGroupNameTaken, isTeamAlreadyExists } from './unique-violation';

const SELECT = {
  id: true, name: true, kind: true,
  leader: { select: { id: true, name: true, lastName: true, role: true } },
  _count: { select: { members: true } },
} as const;
type Row = Prisma.UserGroupGetPayload<{ select: typeof SELECT }>;

const toGroup = (r: Row): TeamGroup => ({ id: r.id, name: r.name, kind: r.kind, leader: r.leader, membersCount: r._count.members });
const LIVE_STATUSES = ['active', 'pending'] as const;

@Injectable()
export class TeamGroupPrismaRepository extends TeamGroupRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  list(scope: TenantScope, f: GroupFilters): Promise<Page<TeamGroup>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where: Prisma.UserGroupWhereInput = { companyId: scope.companyId, ...(f.leaderId ? { leaderId: f.leaderId } : {}) };
      const total = await tx.userGroup.count({ where });
      const rows = await tx.userGroup.findMany({
        where,
        orderBy: [{ name: f.sort === '-name' ? 'desc' : 'asc' }, { id: 'asc' }],
        skip: (f.page - 1) * f.pageSize,
        take: f.pageSize,
        select: SELECT,
      });
      return { items: rows.map(toGroup), total, page: f.page, pageSize: f.pageSize };
    });
  }

  async create(scope: TenantScope, input: NewGroup, audit: Parameters<TeamGroupRepository['create']>[2]): Promise<TeamGroup> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        if (input.kind === 'team') {
          const leader = await tx.user.findFirst({ where: { id: input.leaderId, companyId: scope.companyId, role: 'responsable', status: { in: [...LIVE_STATUSES] } }, select: { id: true } });
          if (!leader) throw new DomainError('NOT_FOUND');
          // El aviso claro del caso normal; el índice único parcial es el que lo garantiza cuando dos peticiones llegan a la vez.
          if (await tx.userGroup.findFirst({ where: { leaderId: leader.id, kind: 'team' }, select: { id: true } })) throw new DomainError('TEAM_ALREADY_EXISTS');
        }
        const created = await tx.userGroup.create({ data: { companyId: scope.companyId, name: input.name, kind: input.kind, leaderId: input.leaderId }, select: SELECT });
        const group = toGroup(created);
        await insertAuditLog(tx, audit(group));
        return group;
      });
    } catch (e) {
      throw this.translate(e);
    }
  }

  async rename(scope: TenantScope, id: string, name: string, check: (current: TeamGroup) => void, audit: Parameters<TeamGroupRepository['rename']>[4]): Promise<TeamGroup | null> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        const found = await tx.userGroup.findFirst({ where: { id, companyId: scope.companyId }, select: SELECT });
        if (!found) return null;
        const before = toGroup(found);
        check(before);
        const after = toGroup(await tx.userGroup.update({ where: { id }, data: { name }, select: SELECT }));
        await insertAuditLog(tx, audit({ before, after } satisfies GroupRenamed));
        return after;
      });
    } catch (e) {
      throw this.translate(e);
    }
  }

  // Cada restricción única es un error de negocio distinto; cualquier otra violación no se disfraza de ninguno de los dos.
  private translate(e: unknown): unknown {
    if (isGroupNameTaken(e)) return new DomainError('GROUP_NAME_TAKEN');
    if (isTeamAlreadyExists(e)) return new DomainError('TEAM_ALREADY_EXISTS');
    return e;
  }
}
