import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import { DomainError } from '../../../common/errors/domain-error';
import { Page } from '../../../common/pagination/page';
import { TenantScope } from '../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../infrastructure/audit/audit-log.insert';
import { resolveAttributions } from '../../../infrastructure/database/attribution';
import { PrismaService, TransactionClient } from '../../../infrastructure/database/prisma.service';
import { lockActorAndSubject } from '../../../infrastructure/database/row-locks';
import { revokeTrustedDevices } from '../../../infrastructure/database/trusted-devices';
import { AdminAccount, AdminFilters, DeactivationOutcome, PersonStamp, PurgedAdmin, ReactivationOutcome, Refusal } from '../domain/admin-account';
import { AdminAccountRepository, NewAdmin } from '../domain/repositories/admin-account.repository';

const SELECT = { id: true, email: true, name: true, lastName: true, role: true, status: true, isMfaEnabled: true, lastLoginAt: true, createdAt: true, purgeAt: true } as const;
type Row = Prisma.UserGetPayload<{ select: typeof SELECT }>;

const toAccount = (r: Row, invitedBy: PersonStamp | null): AdminAccount => ({
  id: r.id, email: r.email, name: r.name, lastName: r.lastName, role: r.role, status: r.status, isMfaEnabled: r.isMfaEnabled, lastLoginAt: r.lastLoginAt, createdAt: r.createdAt, invitedBy, purgeAt: r.purgeAt,
});

// Una violación única dentro de esta transacción solo puede ser el correo (el código se genera al azar): `users_email_key`.
const isUniqueViolation = (e: unknown): boolean => (e as { code?: string } | null)?.code === 'P2002';

type AdminRow = { id: string; status: string };

@Injectable()
export class AdminAccountPrismaRepository extends AdminAccountRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // Quién invitó a cada cuenta: quien emitió su primer código de activación. Las cuentas que creó la consola no tienen código: `null`. Si esa persona ya se purgó, sale su sello.
  private async invitersOf(tx: TransactionClient, userIds: string[]): Promise<Map<string, PersonStamp>> {
    const codes = await tx.userActivationCode.findMany({ where: { userId: { in: userIds } }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { userId: true, createdBy: true } });
    const firstBy = new Map<string, string>();
    for (const c of codes) if (!firstBy.has(c.userId)) firstBy.set(c.userId, c.createdBy);
    const people = await resolveAttributions(tx, [...firstBy.values()]);
    const out = new Map<string, PersonStamp>();
    for (const [userId, by] of firstBy) {
      const person = people.get(by);
      if (person) out.set(userId, person);
    }
    return out;
  }

  private async accountOf(tx: TransactionClient, id: string): Promise<AdminAccount> {
    const row = await tx.user.findUniqueOrThrow({ where: { id }, select: SELECT });
    return toAccount(row, (await this.invitersOf(tx, [id])).get(id) ?? null);
  }

  async invite(scope: TenantScope, input: NewAdmin, audit: Parameters<AdminAccountRepository['invite']>[2]): Promise<AdminAccount> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        // Quien invita tiene que seguir activo con su fila ya bloqueada: si lo desactivaron mientras tanto, no se escribe nada.
        await lockActorAndSubject(tx, scope.userId, null);
        // La empresa interna de Monkey no tiene cupo de usuarios (D117): aquí no se llama a `assertUserRoom`.
        const user = await tx.user.create({
          data: { companyId: scope.companyId, email: input.email, name: input.name, lastName: input.lastName, passwordHash: input.passwordHash, role: 'admin_monkey', status: 'pending', preferredLanguage: input.language },
          select: { id: true },
        });
        await tx.userActivationCode.create({ data: { companyId: scope.companyId, userId: user.id, createdBy: input.createdBy, codeHash: input.codeHash, expiresAt: input.codeExpiresAt } });
        const created = await this.accountOf(tx, user.id);
        await insertAuditLog(tx, audit(created));
        return created;
      });
    } catch (e) {
      if (isUniqueViolation(e)) throw new DomainError('EMAIL_TAKEN');
      throw e;
    }
  }

  inviterName(scope: TenantScope, inviterId: string): Promise<string | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const inviter = await tx.user.findFirst({ where: { id: inviterId }, select: { name: true, lastName: true, email: true } });
      if (!inviter) return null;
      return [inviter.name, inviter.lastName].filter(Boolean).join(' ') || inviter.email;
    });
  }

  list(scope: TenantScope, f: AdminFilters): Promise<Page<AdminAccount>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where: Prisma.UserWhereInput = { companyId: scope.companyId, role: 'admin_monkey', ...(f.status ? { status: f.status as never } : {}) };
      const dir = f.sort.startsWith('-') ? 'desc' : 'asc';
      const key = f.sort.replace(/^-/, '');
      const primary: Prisma.UserOrderByWithRelationInput = key === 'email' ? { email: dir } : key === 'purge_at' ? { purgeAt: { sort: dir, nulls: 'last' } } : { createdAt: dir };
      const total = await tx.user.count({ where });
      const rows = await tx.user.findMany({ where, orderBy: [primary, { id: 'asc' }], skip: (f.page - 1) * f.pageSize, take: f.pageSize, select: SELECT });
      const inviters = await this.invitersOf(tx, rows.map((r) => r.id));
      return { items: rows.map((r) => toAccount(r, inviters.get(r.id) ?? null)), total, page: f.page, pageSize: f.pageSize };
    });
  }

  reissueCode(scope: TenantScope, id: string, input: { codeHash: string; codeExpiresAt: Date; createdBy: string }, audit: Parameters<AdminAccountRepository['reissueCode']>[3]): Promise<AdminAccount | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Serializa las reemisiones de la misma cuenta: la segunda espera, ve el código ya revocado y deja uno solo vigente.
      await lockActorAndSubject(tx, scope.userId, id);
      const found = await tx.user.findFirst({ where: { id, role: 'admin_monkey' }, select: { status: true } });
      if (!found) return null;
      if (found.status !== 'pending') throw new DomainError('USER_ALREADY_ACTIVE');
      await tx.userActivationCode.updateMany({ where: { userId: id, status: 'pending' }, data: { status: 'revoked' } });
      await tx.userActivationCode.create({ data: { companyId: scope.companyId, userId: id, createdBy: input.createdBy, codeHash: input.codeHash, expiresAt: input.codeExpiresAt } });
      const account = await this.accountOf(tx, id);
      await insertAuditLog(tx, audit(account));
      return account;
    });
  }

  // SEG-79 · Todas las filas de admin_monkey, en orden ascendente por id (el orden de row-locks.ts, paso 1): dos desactivaciones cruzadas se turnan sin ciclo y quien llega segundo
  // decide con el estado que dejó la primera.
  private lockAdmins(tx: TransactionClient): Promise<AdminRow[]> {
    return tx.$queryRaw<AdminRow[]>`SELECT id, status::text AS status FROM platform.users WHERE role = 'admin_monkey' ORDER BY id FOR UPDATE`;
  }

  deactivate(scope: TenantScope, id: string, at: Date, purgeAt: Date, audit: Parameters<AdminAccountRepository['deactivate']>[4]): Promise<DeactivationOutcome | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const admins = await this.lockAdmins(tx);
      // Quien actúa tiene que seguir activo con la fila ya bloqueada (si no, esta petición ya no es de nadie y no escribe nada).
      if (admins.find((a) => a.id === scope.userId)?.status !== 'active') throw new DomainError('ACCOUNT_INACTIVE');
      const target = admins.find((a) => a.id === id);
      if (!target) return null;

      const refuse = async (reason: Refusal): Promise<DeactivationOutcome> => {
        const refused: DeactivationOutcome = { kind: 'refused', reason, targetId: id };
        await insertAuditLog(tx, audit(refused));
        return refused;
      };
      if (id === scope.userId) return refuse('cannot_deactivate_self');
      if (target.status === 'pending') throw new DomainError('USER_NOT_ACTIVATED');
      if (target.status === 'inactive') throw new DomainError('ADMIN_ALREADY_INACTIVE');
      // Cuentan solo los `active`: sin otro administrador activo, este no se desactiva.
      if (target.status === 'active' && !admins.some((a) => a.id !== id && a.status === 'active')) return refuse('last_admin');

      const before = await this.accountOf(tx, id);
      await tx.user.update({ where: { id }, data: { status: 'inactive', purgeAt } });
      // CC6.3 · La sesión abierta y los desafíos del segundo factor pendientes no sobreviven.
      const sessionsClosed = (await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: at } })).count;
      await tx.mfaChallenge.updateMany({ where: { userId: id, consumedAt: null }, data: { consumedAt: at } });
      await revokeTrustedDevices(tx, { userId: id }, at);
      const done: DeactivationOutcome = { kind: 'deactivated', before, after: await this.accountOf(tx, id), sessionsClosed };
      await insertAuditLog(tx, audit(done));
      return done;
    });
  }

  reactivate(scope: TenantScope, id: string, at: Date, audit: Parameters<AdminAccountRepository['reactivate']>[3]): Promise<ReactivationOutcome | null> {
    return this.prisma.withScope(scope, async (tx) => {
      await lockActorAndSubject(tx, scope.userId, id);
      const found = await tx.user.findFirst({ where: { id, role: 'admin_monkey' }, select: { status: true, purgeAt: true } });
      if (!found) return null;
      if (found.status !== 'inactive') throw new DomainError('ADMIN_NOT_INACTIVE');
      // Vencido el plazo la cuenta ya «no existe», aunque la purga programada aún no haya pasado.
      if (found.purgeAt && found.purgeAt <= at) return null;
      const before = await this.accountOf(tx, id);
      await tx.user.update({ where: { id }, data: { status: 'active', purgeAt: null } });
      const done: ReactivationOutcome = { before, after: await this.accountOf(tx, id) };
      await insertAuditLog(tx, audit(done));
      return done;
    });
  }

  async listDueForPurge(now: Date): Promise<Array<{ id: string; companyId: string }>> {
    const rows = await this.prisma.$queryRaw<Array<{ id: string; company_id: string }>>`
      SELECT id, company_id FROM platform.list_admins_due_for_purge((${now.toISOString()}::timestamptz AT TIME ZONE 'utc'))`;
    return rows.map((r) => ({ id: r.id, companyId: r.company_id }));
  }

  purge(companyId: string, id: string, now: Date, audit: Parameters<AdminAccountRepository['purge']>[3]): Promise<boolean> {
    // Quien ejecuta es el sistema: el rol que ya ve las cuentas de admin_monkey, sin persona detrás (como la purga de empresas).
    return this.prisma.withScope({ companyId, role: 'admin_monkey' }, async (tx) => {
      await tx.$queryRaw`SELECT id FROM platform.users WHERE id = ${id}::uuid FOR UPDATE`;
      // Con la fila bloqueada se vuelve a comprobar: si se reactivó o ya se purgó, no hay nada que hacer.
      const account = await tx.user.findFirst({ where: { id, role: 'admin_monkey', status: 'inactive', purgeAt: { lte: now } }, select: { id: true, name: true, lastName: true, role: true } });
      if (!account) return false;
      // El sello y el borrado van en la misma transacción: si algo falla, no queda nadie sin cuenta y sin sello.
      await tx.adminTombstone.createMany({ data: [{ userId: account.id, name: account.name, lastName: account.lastName, role: account.role }], skipDuplicates: true });
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.mfaChallenge.deleteMany({ where: { userId: id } });
      await tx.userRecoveryCode.deleteMany({ where: { userId: id } });
      await tx.passwordHistory.deleteMany({ where: { userId: id } });
      await tx.passwordResetToken.deleteMany({ where: { userId: id } });
      await tx.userActivationCode.deleteMany({ where: { userId: id } });
      await insertAuditLog(tx, audit({ id: account.id, role: account.role } satisfies PurgedAdmin));
      await tx.user.delete({ where: { id } });
      return true;
    });
  }
}
