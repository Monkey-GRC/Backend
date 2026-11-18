import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { revokeTrustedDevices } from '../../../../infrastructure/database/trusted-devices';
import { MfaChallenge } from '../../domain/entities/mfa-challenge.entity';
import { MfaRepository, NewMfaChallenge } from '../../domain/repositories/mfa.repository';

@Injectable()
export class MfaPrismaRepository extends MfaRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createChallenge(scope: TenantScope, data: NewMfaChallenge): Promise<void> {
    await this.prisma.withScope(scope, (tx) =>
      tx.mfaChallenge.create({
        data: {
          companyId: scope.companyId,
          userId: data.userId,
          tokenHash: data.tokenHash,
          purpose: data.purpose,
          ipAddress: data.ipAddress,
          expiresAt: data.expiresAt,
        },
      }),
    );
  }

  async findChallengeByTokenHash(hash: string): Promise<{ scope: TenantScope; challenge: MfaChallenge } | null> {
    // Antes de conocer el tenant: la única puerta es la función SECURITY DEFINER angosta de la migración (como la de la sesión). Lo demás se lee con RLS.
    const rows = await this.prisma.$queryRaw<{ id: string; company_id: string; user_id: string }[]>`
      SELECT id, company_id, user_id FROM platform.find_mfa_challenge(${hash})
    `;
    const found = rows[0];
    if (!found) return null;
    const scope: TenantScope = { companyId: found.company_id, userId: found.user_id };
    const row = await this.prisma.withScope(scope, (tx) => tx.mfaChallenge.findUnique({ where: { id: found.id } }));
    if (!row) return null;
    return {
      scope,
      challenge: new MfaChallenge(row.id, row.userId, row.purpose, row.pendingSecretEncrypted, row.failedAttempts, row.expiresAt, row.consumedAt),
    };
  }

  async setPendingSecret(scope: TenantScope, challengeId: string, encrypted: string): Promise<void> {
    await this.prisma.withScope(scope, (tx) =>
      tx.mfaChallenge.updateMany({ where: { id: challengeId, consumedAt: null }, data: { pendingSecretEncrypted: encrypted } }),
    );
  }

  async registerChallengeFailure(scope: TenantScope, challengeId: string): Promise<number> {
    const row = await this.prisma.withScope(scope, (tx) =>
      tx.mfaChallenge.update({ where: { id: challengeId }, data: { failedAttempts: { increment: 1 } }, select: { failedAttempts: true } }),
    );
    return row.failedAttempts;
  }

  async consumeChallenge(scope: TenantScope, challengeId: string, at: Date): Promise<void> {
    await this.prisma.withScope(scope, (tx) => tx.mfaChallenge.updateMany({ where: { id: challengeId, consumedAt: null }, data: { consumedAt: at } }));
  }

  async recordTotpUse(scope: TenantScope, userId: string, step: number): Promise<boolean> {
    const done = await this.prisma.withScope(scope, (tx) =>
      tx.user.updateMany({
        where: { id: userId, OR: [{ mfaLastUsedStep: null }, { mfaLastUsedStep: { lt: step } }] },
        data: { mfaLastUsedStep: step },
      }),
    );
    return done.count === 1;
  }

  async useRecoveryCode(scope: TenantScope, userId: string, codeHash: string, at: Date): Promise<{ used: boolean; remaining: number }> {
    return this.prisma.withScope(scope, async (tx) => {
      const spent = await tx.userRecoveryCode.updateMany({ where: { userId, codeHash, usedAt: null }, data: { usedAt: at } });
      const remaining = await tx.userRecoveryCode.count({ where: { userId, usedAt: null } });
      return { used: spent.count === 1, remaining };
    });
  }

  countRecoveryCodes(scope: TenantScope, userId: string): Promise<number> {
    return this.prisma.withScope(scope, (tx) => tx.userRecoveryCode.count({ where: { userId, usedAt: null } }));
  }

  async activate(
    scope: TenantScope,
    userId: string,
    data: { challengeId: string; secretEncrypted: string; step: number; recoveryCodeHashes: string[]; at: Date },
    audit: AuditIntent<{ userId: string }>,
  ): Promise<void> {
    await this.prisma.withScope(scope, async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { isMfaEnabled: true, mfaSecretEncrypted: data.secretEncrypted, mfaLastUsedStep: data.step },
      });
      await tx.userRecoveryCode.deleteMany({ where: { userId } });
      await tx.userRecoveryCode.createMany({
        data: data.recoveryCodeHashes.map((codeHash) => ({ companyId: scope.companyId, userId, codeHash })),
      });
      await tx.mfaChallenge.updateMany({ where: { id: data.challengeId, consumedAt: null }, data: { consumedAt: data.at } });
      await insertAuditLog(tx, audit({ userId }));
    });
  }

  async replaceRecoveryCodes(scope: TenantScope, userId: string, hashes: string[], audit: AuditIntent<{ userId: string }>): Promise<void> {
    await this.prisma.withScope(scope, async (tx) => {
      await tx.userRecoveryCode.deleteMany({ where: { userId } });
      // D123 · Códigos nuevos: los dispositivos recordados se olvidan en la misma transacción.
      await revokeTrustedDevices(tx, { userId }, new Date());
      await tx.userRecoveryCode.createMany({ data: hashes.map((codeHash) => ({ companyId: scope.companyId, userId, codeHash })) });
      await insertAuditLog(tx, audit({ userId }));
    });
  }

  async reset(
    scope: TenantScope,
    userId: string,
    at: Date,
    audit: AuditIntent<{ userId: string; sessionsClosed: number }>,
  ): Promise<number | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) return null;
      await tx.user.update({ where: { id: userId }, data: { isMfaEnabled: false, mfaSecretEncrypted: null, mfaLastUsedStep: null } });
      await tx.userRecoveryCode.deleteMany({ where: { userId } });
      await tx.mfaChallenge.updateMany({ where: { userId, consumedAt: null }, data: { consumedAt: at } });
      const closed = await tx.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: at } });
      await revokeTrustedDevices(tx, { userId }, at);
      await insertAuditLog(tx, audit({ userId, sessionsClosed: closed.count }));
      return closed.count;
    });
  }
}
