import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { revokeTrustedDevices } from '../../../../infrastructure/database/trusted-devices';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import { PasswordChange, PasswordRepository } from '../../domain/repositories/password.repository';

@Injectable()
export class PasswordPrismaRepository extends PasswordRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async recentHashes(scope: TenantScope, userId: string, limit: number): Promise<string[]> {
    const rows = await this.prisma.withScope(scope, (tx) =>
      tx.passwordHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit, select: { passwordHash: true } }),
    );
    return rows.map((row) => row.passwordHash);
  }

  countChangesSince(scope: TenantScope, userId: string, since: Date): Promise<number> {
    return this.prisma.withScope(scope, (tx) => tx.passwordHistory.count({ where: { userId, createdAt: { gte: since } } }));
  }

  async change(scope: TenantScope, data: PasswordChange, audit: AuditIntent<{ userId: string; sessionsClosed: number }>): Promise<number> {
    return this.prisma.withScope(scope, async (tx) => {
      if (data.resetTokenId) {
        // Escritura condicional: de dos peticiones con el mismo enlace, una sola lo gasta.
        const spent = await tx.passwordResetToken.updateMany({ where: { id: data.resetTokenId, usedAt: null, expiresAt: { gt: data.at } }, data: { usedAt: data.at } });
        if (spent.count !== 1) throw new DomainError('PASSWORD_RESET_INVALID');
      }
      await tx.user.update({ where: { id: data.userId }, data: { passwordHash: data.newHash, passwordChangedAt: data.at } });
      await tx.passwordHistory.create({ data: { companyId: scope.companyId, userId: data.userId, passwordHash: data.previousHash, createdAt: data.at } });
      // Cualquier otro enlace pendiente deja de servir: la contraseña acaba de cambiar.
      await tx.passwordResetToken.updateMany({ where: { userId: data.userId, usedAt: null }, data: { usedAt: data.at } });
      const closed = await tx.session.updateMany({
        where: { userId: data.userId, revokedAt: null, ...(data.keepSessionId ? { id: { not: data.keepSessionId } } : {}) },
        data: { revokedAt: data.at },
      });
      // D123 · Otra contraseña, otros dispositivos: los recordados dejan de valer en la misma transacción.
      await revokeTrustedDevices(tx, { userId: data.userId }, data.at);
      await insertAuditLog(tx, audit({ userId: data.userId, sessionsClosed: closed.count }));
      return closed.count;
    });
  }

  async issueResetToken(scope: TenantScope, data: { userId: string; tokenHash: string; expiresAt: Date; at: Date }): Promise<void> {
    await this.prisma.withScope(scope, async (tx) => {
      await tx.passwordResetToken.updateMany({ where: { userId: data.userId, usedAt: null }, data: { usedAt: data.at } });
      await tx.passwordResetToken.create({ data: { companyId: scope.companyId, userId: data.userId, tokenHash: data.tokenHash, expiresAt: data.expiresAt, createdAt: data.at } });
    });
  }

  countResetRequestsSince(scope: TenantScope, userId: string, since: Date): Promise<number> {
    return this.prisma.withScope(scope, (tx) => tx.passwordResetToken.count({ where: { userId, createdAt: { gte: since } } }));
  }

  async findResetTokenByHash(hash: string): Promise<{ scope: TenantScope; token: PasswordResetToken } | null> {
    // Antes de conocer el tenant: la única puerta es la función SECURITY DEFINER angosta de la migración. Lo demás se lee con RLS.
    const rows = await this.prisma.$queryRaw<{ id: string; company_id: string; user_id: string }[]>`
      SELECT id, company_id, user_id FROM platform.find_password_reset_token(${hash})
    `;
    const found = rows[0];
    if (!found) return null;
    const scope: TenantScope = { companyId: found.company_id, userId: found.user_id };
    const row = await this.prisma.withScope(scope, (tx) => tx.passwordResetToken.findUnique({ where: { id: found.id } }));
    return row ? { scope, token: new PasswordResetToken(row.id, row.userId, row.expiresAt, row.usedAt) } : null;
  }
}
