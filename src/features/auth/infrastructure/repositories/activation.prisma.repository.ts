import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { lockUserRow } from '../../../../infrastructure/database/row-locks';
import { ActivatingAccount, RedeemableActivationCode } from '../../domain/entities/redeemable-activation-code.entity';
import { ActivateOutcome, ActivationRepository } from '../../domain/repositories/activation.repository';

// Señal interna para abortar la transacción (y deshacer lo hecho) cuando el código ya no estaba pendiente al momento de marcarlo.
class CodeNoLongerPending extends Error {}

@Injectable()
export class ActivationPrismaRepository extends ActivationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByCodeHash(codeHash: string): Promise<RedeemableActivationCode | null> {
    // Antes de conocer el tenant, la única puerta es la función SECURITY DEFINER (D29, D95). Con el company_id ya conocido, la fila se relee con RLS normal.
    const rows = await this.prisma.$queryRaw<{ id: string; company_id: string }[]>`
      SELECT id, company_id FROM platform.find_activation_code(${codeHash})
    `;
    const found = rows[0];
    if (!found) return null;

    const code = await this.prisma.withScope({ companyId: found.company_id }, (tx) =>
      tx.userActivationCode.findUnique({ where: { id: found.id } }),
    );
    return code ? new RedeemableActivationCode(code.id, code.companyId, code.userId, code.status, code.expiresAt, code.usedAt) : null;
  }

  findAccount(scope: TenantScope, userId: string): Promise<ActivatingAccount | null> {
    return this.prisma.withScope(scope, (tx) =>
      tx.user.findUnique({ where: { id: userId }, select: { id: true, companyId: true, email: true, role: true, status: true } }),
    );
  }

  async activate(
    scope: TenantScope,
    codeId: string,
    userId: string,
    passwordHash: string,
    at: Date,
    audit: AuditIntent<{ userId: string }>,
  ): Promise<ActivateOutcome> {
    try {
      await this.prisma.withScope(scope, async (tx) => {
        // Orden global (row-locks.ts): la fila del usuario antes que su código, como en la reemisión (que bloquea al usuario y luego revoca el código vigente).
        await lockUserRow(tx, userId, 'UPDATE');
        // Condicional: solo si sigue pendiente y vigente. Si otra activación llegó primero, count = 0.
        const marked = await tx.userActivationCode.updateMany({
          where: { id: codeId, status: 'pending', usedAt: null, expiresAt: { gt: at } },
          data: { status: 'used', usedAt: at },
        });
        if (marked.count !== 1) throw new CodeNoLongerPending();

        // Solo se activa una cuenta que sigue `pending`: si la desactivaron mientras tanto, el código ya no sirve.
        const activated = await tx.user.updateMany({
          where: { id: userId, status: 'pending' },
          data: { passwordHash, status: 'active', passwordChangedAt: at },
        });
        if (activated.count !== 1) throw new CodeNoLongerPending();

        await insertAuditLog(tx, audit({ userId }));
      });
      return { kind: 'activated' };
    } catch (error) {
      if (error instanceof CodeNoLongerPending) return { kind: 'already_used' };
      throw error;
    }
  }
}