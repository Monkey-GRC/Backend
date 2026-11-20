import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { lockUserRow } from '../../../../infrastructure/database/row-locks';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { revokeTrustedDevices } from '../../../../infrastructure/database/trusted-devices';
import { TrustedDevice } from '../../domain/entities/trusted-device.entity';
import { TrustedDeviceRepository } from '../../domain/repositories/trusted-device.repository';
import { revokeActiveDevice } from './trusted-device.queries';
import { toTrustedDevice } from './trusted-device.mapper';

@Injectable()
export class TrustedDevicePrismaRepository extends TrustedDeviceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findActiveByTokenHash(scope: TenantScope, userId: string, tokenHash: string, now: Date): Promise<TrustedDevice | null> {
    const row = await this.prisma.withScope(scope, (tx) =>
      tx.trustedDevice.findFirst({ where: { tokenHash, userId, revokedAt: null, expiresAt: { gt: now } } }),
    );
    return row ? toTrustedDevice(row) : null;
  }

  async revokeByTokenHash(tokenHash: string, now: Date, audit: AuditIntent<TrustedDevice>): Promise<boolean> {
    // Antes de conocer el tenant: la única puerta es la función SECURITY DEFINER angosta de la migración. Lo demás, con RLS.
    const rows = await this.prisma.$queryRaw<{ id: string; company_id: string; user_id: string }[]>`
      SELECT id, company_id, user_id FROM platform.find_trusted_device(${tokenHash})
    `;
    const found = rows[0];
    if (!found) return false;
    const revoked = await this.revokeOne({ companyId: found.company_id, userId: found.user_id }, found.user_id, found.id, now, audit);
    return revoked !== null;
  }

  async existsActiveByTokenHash(tokenHash: string): Promise<boolean> {
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM platform.find_trusted_device(${tokenHash})
    `;
    return rows.length > 0;
  }

  async listActive(scope: TenantScope, userId: string, now: Date): Promise<TrustedDevice[]> {
    const rows = await this.prisma.withScope(scope, (tx) =>
      tx.trustedDevice.findMany({ where: { userId, revokedAt: null, expiresAt: { gt: now } }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }] }),
    );
    return rows.map(toTrustedDevice);
  }

  async revokeOne(scope: TenantScope, userId: string, deviceId: string, now: Date, audit: AuditIntent<TrustedDevice>): Promise<TrustedDevice | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Orden global (row-locks.ts): la fila del usuario antes que la del dispositivo; el rastro la pide por la FK `user_id`.
      await lockUserRow(tx, userId, 'KEY SHARE');
      const device = await revokeActiveDevice(tx, { id: deviceId, userId, expiresAt: { gt: now } }, now);
      if (!device) return null;
      await insertAuditLog(tx, audit(device));
      return device;
    });
  }

  async revokeAll(scope: TenantScope, userId: string, now: Date, audit: AuditIntent<{ count: number }>): Promise<number> {
    return this.prisma.withScope(scope, async (tx) => {
      await lockUserRow(tx, userId, 'KEY SHARE');
      const count = await revokeTrustedDevices(tx, { userId }, now);
      if (count > 0) await insertAuditLog(tx, audit({ count }));
      return count;
    });
  }
}
