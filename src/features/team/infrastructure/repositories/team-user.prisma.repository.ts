import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { MemberChange, MemberFilters, MemberUpdated, NewMember, TeamUserRepository } from '../../domain/repositories/team-user.repository';
import { TEAM_ROLES, TeamMember } from '../../domain/team.types';

const SELECT = {
  id: true, email: true, name: true, lastName: true, role: true, status: true, isMfaEnabled: true, lastLoginAt: true, createdAt: true,
} as const;
type Row = Prisma.UserGetPayload<{ select: typeof SELECT }>;

const toMember = (r: Row): TeamMember => ({
  id: r.id, email: r.email, name: r.name, lastName: r.lastName, role: r.role, status: r.status, isMfaEnabled: r.isMfaEnabled, lastLoginAt: r.lastLoginAt, createdAt: r.createdAt,
});
const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === 'P2002';
const isTeamRole = (role: string) => (TEAM_ROLES as readonly string[]).includes(role);

@Injectable()
export class TeamUserPrismaRepository extends TeamUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(scope: TenantScope, input: NewMember, audit: Parameters<TeamUserRepository['create']>[2]): Promise<TeamMember> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        const user = await tx.user.create({
          data: { companyId: scope.companyId, email: input.email, name: input.name, lastName: input.lastName, passwordHash: input.passwordHash, role: input.role, status: 'pending',
            // DT-86: provisional hasta MD-188 (is_internal obligatorio y grupo en el alta del delegado)
            ...(input.role === 'delegado' ? { isInternal: true } : {}),
          },
          select: { id: true },
        });
        await tx.userActivationCode.create({
          data: { companyId: scope.companyId, userId: user.id, createdBy: input.createdBy, codeHash: input.codeHash, expiresAt: input.codeExpiresAt },
        });
        const created = toMember(await tx.user.findUniqueOrThrow({ where: { id: user.id }, select: SELECT }));
        await insertAuditLog(tx, audit(created));
        return created;
      });
    } catch (e) {
      // El correo es único en toda la plataforma: otra empresa también lo cuenta, y con RLS no se ve de antemano. La restricción única lo detecta.
      if (isUniqueViolation(e)) throw new DomainError('EMAIL_TAKEN');
      throw e;
    }
  }

  list(scope: TenantScope, f: MemberFilters): Promise<Page<TeamMember>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where: Prisma.UserWhereInput = { companyId: scope.companyId, ...(f.role ? { role: f.role as never } : {}), ...(f.status ? { status: f.status as never } : {}) };
      const desc = f.sort.startsWith('-');
      const orderBy: Prisma.UserOrderByWithRelationInput[] = [f.sort.endsWith('email') ? { email: desc ? 'desc' : 'asc' } : { createdAt: desc ? 'desc' : 'asc' }, { id: 'asc' }];
      const total = await tx.user.count({ where });
      const rows = await tx.user.findMany({ where, orderBy, skip: (f.page - 1) * f.pageSize, take: f.pageSize, select: SELECT });
      return { items: rows.map(toMember), total, page: f.page, pageSize: f.pageSize };
    });
  }

  update(scope: TenantScope, id: string, change: MemberChange, at: Date, audit: Parameters<TeamUserRepository['update']>[4]): Promise<TeamMember | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.user.findFirst({ where: { id }, select: SELECT });
      if (!found) return null;
      // Nadie se desactiva a sí mismo: la empresa se quedaría sin quien la administre. El nombre sí se puede corregir.
      if (found.id === scope.userId && change.status) throw new DomainError('LAST_ADMIN');
      // admin_monkey no se toca desde aquí: para quien llama, no existe. Otro administrador de la empresa sí (D98).
      if (!isTeamRole(found.role)) return null;
      const before = toMember(found);

      if (change.status && found.status === 'pending') throw new DomainError('USER_NOT_ACTIVATED');

      let sessionsClosed = 0;
      if (change.name !== undefined || change.lastName !== undefined) await tx.user.update({ where: { id }, data: { ...(change.name !== undefined ? { name: change.name } : {}), ...(change.lastName !== undefined ? { lastName: change.lastName } : {}) } });
      if (change.status && change.status !== found.status) {
        await tx.user.update({ where: { id }, data: { status: change.status } });
        // Desactivar es el deprovisioning de CC6.3: la sesión abierta no sobrevive.
        if (change.status === 'inactive') sessionsClosed = (await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: at } })).count;
      }
      const after = toMember(await tx.user.findUniqueOrThrow({ where: { id }, select: SELECT }));
      await insertAuditLog(tx, audit({ before, after, sessionsClosed } satisfies MemberUpdated));
      return after;
    });
  }

  reissueCode(scope: TenantScope, id: string, input: { codeHash: string; codeExpiresAt: Date; createdBy: string }, audit: Parameters<TeamUserRepository['reissueCode']>[3]): Promise<TeamMember | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.user.findFirst({ where: { id }, select: SELECT });
      if (!found || !isTeamRole(found.role)) return null;
      if (found.status !== 'pending') throw new DomainError('USER_ALREADY_ACTIVE');
      await tx.userActivationCode.updateMany({ where: { userId: id, status: 'pending' }, data: { status: 'revoked' } });
      await tx.userActivationCode.create({ data: { companyId: scope.companyId, userId: id, createdBy: input.createdBy, codeHash: input.codeHash, expiresAt: input.codeExpiresAt } });
      const member = toMember(found);
      await insertAuditLog(tx, audit(member));
      return member;
    });
  }
}
