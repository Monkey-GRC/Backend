import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  RedeemableAccessKey,
  RedeemingCompany,
} from '../../domain/entities/redeemable-access-key.entity';
import {
  AccessKeyRedemptionRepository,
  NewCompanyAdmin,
  RedeemOutcome,
} from '../../domain/repositories/access-key-redemption.repository';

// Señal interna para abortar la transacción (y deshacer lo hecho) cuando la clave ya no estaba
// pendiente al momento de marcarla.
class KeyNoLongerPending extends Error {}

@Injectable()
export class AccessKeyRedemptionPrismaRepository extends AccessKeyRedemptionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByCodeHash(codeHash: string): Promise<RedeemableAccessKey | null> {
    // Antes de conocer el tenant, la única puerta es la función SECURITY DEFINER (D29). Con el
    // company_id ya conocido, la fila se relee con RLS normal y con los tipos de Prisma.
    const rows = await this.prisma.$queryRaw<{ id: string; company_id: string }[]>`
      SELECT id, company_id FROM platform.find_access_key(${codeHash})
    `;
    const found = rows[0];
    if (!found) return null;

    const key = await this.prisma.withScope({ companyId: found.company_id }, (tx) =>
      tx.accessKey.findUnique({ where: { id: found.id } }),
    );
    return key
      ? new RedeemableAccessKey(key.id, key.companyId, key.status, key.expiresAt, key.usedAt)
      : null;
  }

  findCompany(scope: TenantScope): Promise<RedeemingCompany | null> {
    return this.prisma.withScope(scope, (tx) =>
      tx.company.findUnique({
        where: { id: scope.companyId },
        select: { id: true, name: true, adminEmail: true, status: true },
      }),
    );
  }

  async redeem(
    scope: TenantScope,
    accessKeyId: string,
    admin: NewCompanyAdmin,
    at: Date,
  ): Promise<RedeemOutcome> {
    try {
      const user = await this.prisma.withScope(scope, async (tx) => {
        // Condicional: solo si sigue pendiente y vigente. Si otro canje llegó primero, count = 0.
        const marked = await tx.accessKey.updateMany({
          where: { id: accessKeyId, status: 'pending', usedAt: null, expiresAt: { gt: at } },
          data: { status: 'used', usedAt: at },
        });
        if (marked.count !== 1) throw new KeyNoLongerPending();

        return tx.user.create({
          data: {
            companyId: scope.companyId,
            email: admin.email,
            name: admin.name,
            lastName: admin.lastName,
            passwordHash: admin.passwordHash,
            role: 'admin_empresa',
            status: 'active',
            passwordChangedAt: at,
          },
          select: { id: true },
        });
      });
      return { kind: 'created', userId: user.id };
    } catch (error) {
      if (error instanceof KeyNoLongerPending) return { kind: 'already_used' };
      // users.email es único global (D29): el correo ya pertenece a una cuenta de otra empresa.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { kind: 'email_taken' };
      }
      throw error;
    }
  }
}
