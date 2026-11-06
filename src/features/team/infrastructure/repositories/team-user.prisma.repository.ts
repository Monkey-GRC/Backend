import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { assertRoomIn, assertUserRoom, lockUserQuota } from '../../../../common/quota/user-quota';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { isEmailTaken } from './unique-violation';
import { MemberChange, MemberFilters, MemberUpdated, NewMember, Placement, TeamUserRepository } from '../../domain/repositories/team-user.repository';
import { InvitationContext, RESPONSIBLES_GROUP_NAME, TEAM_ROLES, TeamMember } from '../../domain/team.types';

const SELECT = {
  id: true, email: true, name: true, lastName: true, role: true, status: true, isMfaEnabled: true, isInternal: true, lastLoginAt: true, createdAt: true,
  group: { select: { id: true, name: true, leader: { select: { id: true, name: true, lastName: true } } } },
} as const;
type Row = Prisma.UserGetPayload<{ select: typeof SELECT }>;

const toMember = (r: Row): TeamMember => ({
  id: r.id, email: r.email, name: r.name, lastName: r.lastName, role: r.role, status: r.status, isMfaEnabled: r.isMfaEnabled, isInternal: r.isInternal,
  group: r.group ? { id: r.group.id, name: r.group.name } : null,
  responsible: r.role === 'delegado' && r.group ? r.group.leader : null,
  lastLoginAt: r.lastLoginAt, createdAt: r.createdAt,
});
const LIVE_STATUSES = ['active', 'pending'] as const;
const isTeamRole = (role: string) => (TEAM_ROLES as readonly string[]).includes(role);

@Injectable()
export class TeamUserPrismaRepository extends TeamUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(scope: TenantScope, input: NewMember, audit: Parameters<TeamUserRepository['create']>[2]): Promise<TeamMember> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        await assertUserRoom(tx, scope.companyId);
        const groupId = await this.resolveGroup(tx, scope, input.placement, input.createdBy);
        const user = await tx.user.create({
          data: { companyId: scope.companyId, email: input.email, name: input.name, lastName: input.lastName, passwordHash: input.passwordHash, role: input.role, status: 'pending', groupId, isInternal: input.isInternal },
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
      if (isEmailTaken(e)) throw new DomainError('EMAIL_TAKEN');
      throw e;
    }
  }

  invitationContext(scope: TenantScope, inviterId: string): Promise<InvitationContext> {
    return this.prisma.withScope(scope, async (tx) => {
      const inviter = await tx.user.findFirst({ where: { id: inviterId }, select: { name: true, lastName: true, email: true } });
      const company = await tx.company.findFirst({ where: { id: scope.companyId }, select: { name: true } });
      const fullName = inviter ? [inviter.name, inviter.lastName].filter(Boolean).join(' ') : '';
      return { inviterName: inviter ? fullName || inviter.email : null, companyName: company?.name ?? null };
    });
  }

  // El grupo donde queda la cuenta nueva, según `placement`. Corre en la transacción del alta, que ya tiene bloqueada la fila de la empresa: dos altas no crean dos veces el grupo por omisión.
  private async resolveGroup(tx: TransactionClient, scope: TenantScope, placement: Placement, createdBy: string): Promise<string | null> {
    switch (placement.kind) {
      case 'none':
        return null;
      // Un equipo de delegados es un grupo que lidera un responsable (D104).
      case 'team-of': {
        const team = await tx.userGroup.findFirst({ where: { id: placement.groupId, kind: 'team', leader: { is: { role: 'responsable', status: { in: [...LIVE_STATUSES] } } } }, select: { id: true } });
        if (!team) throw new DomainError('NOT_FOUND');
        return team.id;
      }
      case 'own-team': {
        const own = await tx.userGroup.findFirst({ where: { leaderId: placement.leaderId, kind: 'team' }, select: { id: true } });
        if (placement.groupId && placement.groupId !== own?.id) throw new DomainError('FORBIDDEN');
        // D104 · El equipo de delegados no nace con el responsable: lo crea él cuando quiere (POST /v1/groups).
        if (!own) throw new DomainError('RESPONSIBLE_HAS_NO_TEAM');
        return own.id;
      }
      case 'responsibles-group': {
        const leader = { is: { role: 'admin_empresa' as const, status: { in: [...LIVE_STATUSES] } } };
        if (placement.groupId) {
          const chosen = await tx.userGroup.findFirst({ where: { id: placement.groupId, kind: 'responsables', leader }, select: { id: true } });
          if (!chosen) throw new DomainError('NOT_FOUND');
          return chosen.id;
        }
        // El nombre es único por empresa (user_groups_company_id_name_key): «Responsables» es uno solo, y solo vale si lo lidera un admin_empresa. Si el nombre lo tiene
        // otro grupo (p. ej. el equipo de un responsable), no se reutiliza —mezclaría a los responsables con un equipo de delegados— ni se crea otro con nombre distinto: se avisa.
        const existing = await tx.userGroup.findFirst({ where: { name: RESPONSIBLES_GROUP_NAME }, select: { id: true, kind: true, leader: { select: { role: true } } } });
        if (existing) {
          if (existing.kind !== 'responsables' || existing.leader.role !== 'admin_empresa') throw new DomainError('RESPONSIBLES_GROUP_INVALID');
          return existing.id;
        }
        // Si otra petición lo crea justo ahora, el INSERT no falla (un error abortaría la transacción): ON CONFLICT no hace nada y se relee el que ganó.
        await tx.$executeRaw`
          INSERT INTO platform.user_groups (id, company_id, name, kind, leader_id)
          VALUES (gen_random_uuid(), ${scope.companyId}::uuid, ${RESPONSIBLES_GROUP_NAME}, 'responsables'::platform.group_kind, ${createdBy}::uuid)
          ON CONFLICT (company_id, name) DO NOTHING`;
        const created = await tx.userGroup.findFirst({ where: { name: RESPONSIBLES_GROUP_NAME }, select: { id: true, kind: true, leader: { select: { role: true } } } });
        if (!created || created.kind !== 'responsables' || created.leader.role !== 'admin_empresa') throw new DomainError('RESPONSIBLES_GROUP_INVALID');
        return created.id;
      }
    }
  }

  list(scope: TenantScope, f: MemberFilters): Promise<Page<TeamMember>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where: Prisma.UserWhereInput = {
        companyId: scope.companyId,
        ...(f.role ? { role: f.role as never } : {}),
        ...(f.status ? { status: f.status as never } : {}),
        ...(f.groupId ? { groupId: f.groupId } : {}),
        ...(f.isInternal !== undefined ? { isInternal: f.isInternal } : {}),
        // El filtro del equipo se suma a los demás: un group_id ajeno no lo amplía.
        ...(f.teamLeaderId ? { group: { is: { leaderId: f.teamLeaderId } } } : {}),
      };
      const desc = f.sort.startsWith('-');
      const orderBy: Prisma.UserOrderByWithRelationInput[] = [f.sort.endsWith('email') ? { email: desc ? 'desc' : 'asc' } : { createdAt: desc ? 'desc' : 'asc' }, { id: 'asc' }];
      const total = await tx.user.count({ where });
      const rows = await tx.user.findMany({ where, orderBy, skip: (f.page - 1) * f.pageSize, take: f.pageSize, select: SELECT });
      return { items: rows.map(toMember), total, page: f.page, pageSize: f.pageSize };
    });
  }

  update(scope: TenantScope, id: string, change: MemberChange, at: Date, audit: Parameters<TeamUserRepository['update']>[4]): Promise<TeamMember | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Reactivar compite por el cupo con las altas y con otras reactivaciones. Se toma el turno (fila de la empresa) ANTES de leer el estado de la cuenta: así el
      // estado que se evalúa es el de ese turno, y dos peticiones sobre la misma persona no deciden con un estado ya viejo.
      const quota = change.status === 'active' ? await lockUserQuota(tx, scope.companyId) : null;
      const found = await tx.user.findFirst({ where: { id }, select: SELECT });
      if (!found) return null;
      // Nadie se desactiva a sí mismo: la empresa se quedaría sin quien la administre. El nombre sí se puede corregir.
      if (found.id === scope.userId && change.status) throw new DomainError('LAST_ADMIN');
      // admin_monkey no se toca desde aquí: para quien llama, no existe. Otro administrador de la empresa sí (D98).
      if (!isTeamRole(found.role)) return null;
      const before = toMember(found);

      if (change.status && found.status === 'pending') throw new DomainError('USER_NOT_ACTIVATED');

      let sessionsClosed = 0;
      let controlsUnassigned = 0;
      if (change.name !== undefined || change.lastName !== undefined) await tx.user.update({ where: { id }, data: { ...(change.name !== undefined ? { name: change.name } : {}), ...(change.lastName !== undefined ? { lastName: change.lastName } : {}) } });
      if (change.status && change.status !== found.status) {
        // Solo `inactive` -> `active` suma una cuenta al conteo (D103); `suspended` ya cuenta.
        if (quota && found.status === 'inactive') assertRoomIn(quota);
        await tx.user.update({ where: { id }, data: { status: change.status } });
        // Desactivar es el deprovisioning de CC6.3: la sesión abierta no sobrevive.
        if (change.status === 'inactive') sessionsClosed = (await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: at } })).count;
      }
      let moved = true;
      if (change.groupId !== undefined) {
        const move = await this.moveDelegate(tx, scope, found, change.groupId, change.confirmUnassign === true);
        moved = move.moved;
        controlsUnassigned = move.controlsUnassigned;
      }
      const after = toMember(await tx.user.findUniqueOrThrow({ where: { id }, select: SELECT }));
      // Mandar el equipo en el que ya está (y nada más) no cambia nada: no hay qué auditar.
      const nothingChanged = !moved && change.name === undefined && change.lastName === undefined && !change.status;
      if (!nothingChanged) await insertAuditLog(tx, audit({ before, after, sessionsClosed, controlsUnassigned } satisfies MemberUpdated));
      return after;
    });
  }

  // Mueve a un delegado al equipo `groupId` y dice si se movió y cuántos controles dejó sin ejecutor (siguen con su dueño). Corre en la transacción del PATCH, junto con la auditoría.
  private async moveDelegate(tx: TransactionClient, scope: TenantScope, subject: Row, groupId: string, confirmed: boolean): Promise<{ moved: boolean; controlsUnassigned: number }> {
    if (subject.role !== 'delegado') throw new ValidationException([{ field: 'group_id', code: 'group_id.not_allowed' }]);
    const target = await tx.userGroup.findFirst({
      where: { id: groupId, companyId: scope.companyId, kind: 'team', leader: { is: { role: 'responsable', status: { in: [...LIVE_STATUSES] } } } },
      select: { id: true },
    });
    if (!target) throw new DomainError('NOT_FOUND');
    if (target.id === subject.group?.id) return { moved: false, controlsUnassigned: 0 };

    // Bloquea la fila del delegado: asignarle un ejecutor (FK) toma KEY SHARE sobre ella, así que una asignación concurrente termina antes de contar o espera a este movimiento.
    await tx.$queryRaw`SELECT id FROM platform.users WHERE id = ${subject.id}::uuid FOR UPDATE`;
    const controlsCount = await tx.clientControlAssignment.count({ where: { executorId: subject.id } });
    if (controlsCount > 0 && !confirmed) throw new DomainError('USER_HAS_ASSIGNMENTS', { controls_count: controlsCount });
    const unassigned = controlsCount > 0 ? (await tx.clientControlAssignment.updateMany({ where: { executorId: subject.id }, data: { executorId: null } })).count : 0;
    await tx.user.update({ where: { id: subject.id }, data: { groupId: target.id } });
    return { moved: true, controlsUnassigned: unassigned };
  }

  reissueCode(scope: TenantScope, id: string, input: { codeHash: string; codeExpiresAt: Date; createdBy: string }, audit: Parameters<TeamUserRepository['reissueCode']>[3]): Promise<TeamMember | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Serializa las reemisiones de la misma cuenta: la segunda espera, ve el código ya revocado y deja uno solo vigente.
      await tx.$queryRaw`SELECT id FROM platform.users WHERE id = ${id}::uuid FOR UPDATE`;
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
