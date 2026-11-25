import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { assertRoomIn, assertUserRoom, lockUserQuota } from '../../../../common/quota/user-quota';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { lockActorAndSubject, lockGroupRow, lockLeaderShare } from '../../../../infrastructure/database/row-locks';
import { revokeTrustedDevices } from '../../../../infrastructure/database/trusted-devices';
import { isEmailTaken } from './unique-violation';
import { MemberChange, MemberFilters, MemberUpdated, NewMember, Placement, TeamUserRepository } from '../../domain/repositories/team-user.repository';
import { assertNoLiveDelegates, describeReleased, isMoving, leaderToCheck, MemberState, partitionReleased, planMemberChange, releasesControls, TargetTeam } from '../../domain/member-change-plan';
import { InvitationContext, isLiveStatus, LIVE_STATUSES, ReleasedControl, RESPONSIBLES_GROUP_NAME, TEAM_ROLES, TeamMember } from '../../domain/team.types';

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
const isTeamRole = (role: string) => (TEAM_ROLES as readonly string[]).includes(role);

@Injectable()
export class TeamUserPrismaRepository extends TeamUserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(scope: TenantScope, input: NewMember, audit: Parameters<TeamUserRepository['create']>[2]): Promise<TeamMember> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        // Orden de bloqueos global (infrastructure/database/row-locks.ts): actor, responsable líder, empresa (cupo).
        await this.lockTeamLeader(tx, scope.userId, input.placement);
        await assertUserRoom(tx, scope.companyId);
        const groupId = await this.resolveGroup(tx, scope, input.placement, input.createdBy);
        const user = await tx.user.create({
          data: { companyId: scope.companyId, email: input.email, name: input.name, lastName: input.lastName, passwordHash: input.passwordHash, role: input.role, status: 'pending', groupId, isInternal: input.isInternal, preferredLanguage: input.language },
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

  // Pasos 1, 2 y 2b del orden de bloqueo (row-locks.ts): actor, grupo destino, responsable líder.
  // El estado del líder lo valida `resolveGroup`, ya con la fila bloqueada: un delegado que entra no convive con un responsable que se desactiva.
  private async lockTeamLeader(tx: TransactionClient, actorId: string | undefined, placement: Placement): Promise<void> {
    await lockActorAndSubject(tx, actorId, null);
    if (placement.kind === 'team-of') {
      const team = await tx.userGroup.findFirst({ where: { id: placement.groupId, kind: 'team' }, select: { id: true, leaderId: true } });
      if (!team) throw new DomainError('NOT_FOUND');
      await lockGroupRow(tx, team.id, 'SHARE');
      await lockLeaderShare(tx, team.leaderId);
    } else if (placement.kind === 'responsibles-group' && placement.groupId) {
      await lockGroupRow(tx, placement.groupId, 'SHARE');
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

  // Orden de bloqueos global (row-locks.ts): actor y sujeto por id, grupo, responsable líder, empresa (cupo). Las reglas del cambio viven en `domain/member-change-plan.ts`;
  // aquí solo se bloquea, se lee, se escribe y se audita, todo en una transacción.
  update(scope: TenantScope, id: string, change: MemberChange, at: Date, audit: Parameters<TeamUserRepository['update']>[4]): Promise<TeamMember | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Se bloquea la fila ANTES de leerla: dos peticiones sobre la misma persona no deciden con un estado ya viejo, y una asignación nueva (FK, KEY SHARE) espera a esta transacción.
      await lockActorAndSubject(tx, scope.userId, id);
      const found = await tx.user.findFirst({ where: { id }, select: SELECT });
      if (!found) return null;
      const state: MemberState = { id: found.id, role: found.role, status: found.status, groupId: found.group?.id ?? null, leaderId: found.group?.leader.id ?? null };
      const plan = planMemberChange(state, change, scope.userId);
      if (!plan) return null;
      const before = toMember(found);

      const target = change.groupId !== undefined ? await this.findTargetTeam(tx, scope, change.groupId) : null;
      const moving = isMoving(state, target);
      const check = leaderToCheck(plan, state, target);
      if (check) {
        await lockGroupRow(tx, check.groupId, 'SHARE');
        if (!isLiveStatus(await lockLeaderShare(tx, check.leaderId))) throw new DomainError(check.onDead);
      }
      // Reactivar compite por el cupo con las altas y con otras reactivaciones (fila de la empresa, al final del orden de bloqueos). Solo `inactive` -> `active` suma una cuenta (D103).
      if (plan.reactivating && found.status === 'inactive') assertRoomIn(await lockUserQuota(tx, scope.companyId));

      let released: ReleasedControl[] = [];
      if (releasesControls(plan, moving)) {
        // La fila del responsable ya está bloqueada: un delegado que entra a su equipo espera (FOR SHARE) y luego ve al responsable inactivo.
        if (plan.deactivating && found.role === 'responsable') {
          assertNoLiveDelegates(state, plan, await tx.user.count({ where: { role: 'delegado', status: { in: [...LIVE_STATUSES] }, group: { is: { leaderId: found.id, kind: 'team' } } } }));
        }
        released = await this.releaseAssignments(tx, found.id, change.confirmUnassign === true);
      }

      const data: Prisma.UserUpdateInput = {
        ...(change.name !== undefined ? { name: change.name } : {}),
        ...(change.lastName !== undefined ? { lastName: change.lastName } : {}),
        ...(change.isInternal !== undefined ? { isInternal: change.isInternal } : {}),
        ...(change.status && change.status !== found.status ? { status: change.status } : {}),
        ...(moving && target ? { group: { connect: { id: target.id } } } : {}),
      };
      if (Object.keys(data).length > 0) await tx.user.update({ where: { id }, data });
      // Desactivar es el deprovisioning de CC6.3: la sesión abierta no sobrevive (después de la fila del usuario, ya bloqueada).
      const sessionsClosed = plan.deactivating ? (await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: at } })).count : 0;
      // D123 · Tampoco sobreviven los dispositivos recordados.
      if (plan.deactivating) await revokeTrustedDevices(tx, { userId: id }, at);

      const after = toMember(await tx.user.findUniqueOrThrow({ where: { id }, select: SELECT }));
      // Mandar el equipo en el que ya está (y nada más) no cambia nada: no hay qué auditar.
      if (Object.keys(data).length > 0) await insertAuditLog(tx, audit({ before, after, sessionsClosed, controlsUnassigned: released.length, released } satisfies MemberUpdated));
      return after;
    });
  }

  // El equipo (`kind = team`) de un responsable de la empresa. Que su líder siga activo o pendiente se comprueba con la fila del líder ya bloqueada (`lockLeaderShare`).
  private async findTargetTeam(tx: TransactionClient, scope: TenantScope, groupId: string): Promise<TargetTeam> {
    const team = await tx.userGroup.findFirst({ where: { id: groupId, companyId: scope.companyId, kind: 'team', leader: { is: { role: 'responsable' } } }, select: { id: true, leaderId: true } });
    if (!team) throw new DomainError('NOT_FOUND');
    return team;
  }

  // Las asignaciones de la persona se bloquean (FOR UPDATE, por id: dos bajas sobre el mismo control se turnan sin ciclo) y se leen ya bloqueadas. Se borran o se limpian en lote y el rastro sale de
  // las filas que la base devolvió (RETURNING), no de lo que se esperaba: nada se registra que no haya cambiado de verdad.
  private async releaseAssignments(tx: TransactionClient, userId: string, confirmed: boolean): Promise<ReleasedControl[]> {
    const rows = await tx.$queryRaw<Array<{ id: string; client_control_id: string; owner_id: string; executor_id: string | null }>>`
      SELECT id, client_control_id, owner_id, executor_id FROM platform.client_control_assignments
       WHERE owner_id = ${userId}::uuid OR executor_id = ${userId}::uuid ORDER BY id FOR UPDATE`;
    const { owned, executed } = partitionReleased(rows.map((r) => ({ id: r.id, clientControlId: r.client_control_id, ownerId: r.owner_id, executorId: r.executor_id })), userId, confirmed);
    const deleted = owned.length === 0 ? [] : await tx.$queryRaw<Array<{ id: string }>>`DELETE FROM platform.client_control_assignments WHERE id = ANY(${owned.map((r) => r.id)}::uuid[]) RETURNING id`;
    const cleared =
      executed.length === 0 ? [] : await tx.$queryRaw<Array<{ id: string }>>`UPDATE platform.client_control_assignments SET executor_id = NULL, updated_at = now() WHERE id = ANY(${executed.map((r) => r.id)}::uuid[]) RETURNING id`;
    const gone = new Set(deleted.map((r) => r.id));
    const done = new Set(cleared.map((r) => r.id));
    return describeReleased(owned.filter((r) => gone.has(r.id)), executed.filter((r) => done.has(r.id)));
  }

  reissueCode(scope: TenantScope, id: string, input: { codeHash: string; codeExpiresAt: Date; createdBy: string }, audit: Parameters<TeamUserRepository['reissueCode']>[3]): Promise<TeamMember | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Serializa las reemisiones de la misma cuenta: la segunda espera, ve el código ya revocado y deja uno solo vigente.
      await lockActorAndSubject(tx, scope.userId, id);
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
