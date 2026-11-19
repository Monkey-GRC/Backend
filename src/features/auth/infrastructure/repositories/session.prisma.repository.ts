import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { Prisma } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { lockUserRow } from '../../../../infrastructure/database/row-locks';
import { Session, SessionOwner } from '../../domain/entities/session.entity';
import { NewSession, SessionRepository } from '../../domain/repositories/session.repository';
import type { DeviceEffect, DeviceForget } from '../../domain/repositories/trusted-device.repository';
import { toTrustedDevice } from './trusted-device.mapper';
import { revokeActiveDevice } from './trusted-device.queries';

type SessionRow = {
  id: string;
  companyId: string;
  userId: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

type SessionWithOwnerRow = {
  id: string;
  company_id: string;
  user_id: string;
  created_at: Date;
  last_activity_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  owner_id: string | null;
  owner_company_id: string | null;
  owner_role: string | null;
  owner_status: string | null;
};

const toEntity = (row: SessionRow): Session =>
  new Session(
    row.id,
    row.companyId,
    row.userId,
    row.createdAt,
    row.lastActivityAt,
    row.expiresAt,
    row.revokedAt,
  );

@Injectable()
export class SessionPrismaRepository extends SessionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(scope: TenantScope, data: NewSession, audit: AuditIntent<Session> | null, device?: DeviceEffect): Promise<Session> {
    const created = await this.prisma.withScope(scope, async (tx) => {
      const row = await tx.session.create({
        data: {
          companyId: scope.companyId,
          userId: data.userId,
          refreshTokenHash: data.refreshTokenHash,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          createdAt: data.createdAt,
          lastActivityAt: data.createdAt,
          expiresAt: data.expiresAt,
        },
      });
      const session = toEntity(row);
      if (audit) await insertAuditLog(tx, audit(session));
      if (device?.kind === 'trust') {
        const created = await tx.trustedDevice.create({
          data: { companyId: scope.companyId, userId: device.device.userId, tokenHash: device.device.tokenHash, browser: device.device.browser, os: device.device.os, deviceType: device.device.deviceType, ipAddress: device.device.ipAddress, country: device.device.country, city: device.device.city ?? undefined, createdAt: device.device.createdAt, expiresAt: device.device.expiresAt },
        });
        await insertAuditLog(tx, device.audit(toTrustedDevice(created)));
      } else if (device?.kind === 'use') {
        await tx.trustedDevice.updateMany({ where: { id: device.deviceId, revokedAt: null }, data: { lastUsedAt: device.at, ipAddress: device.ipAddress, country: device.country, city: device.city ?? Prisma.DbNull } });
      }
      return session;
    });
    return created;
  }

  async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    // Búsqueda previa al tenant por la función SECURITY DEFINER (D29); el resto con RLS.
    const rows = await this.prisma.$queryRaw<{ id: string; company_id: string; user_id: string }[]>`
      SELECT id, company_id, user_id FROM platform.find_session_by_token(${hash})
    `;
    const found = rows[0];
    if (!found) return null;
    return this.findById({ companyId: found.company_id, userId: found.user_id }, found.id);
  }

  async findById(scope: TenantScope, sessionId: string): Promise<Session | null> {
    const row = await this.prisma.withScope(scope, (tx) =>
      tx.session.findUnique({ where: { id: sessionId } }),
    );
    return row ? toEntity(row) : null;
  }

  async findWithOwner(scope: TenantScope, sessionId: string): Promise<{ session: Session; owner: SessionOwner | null } | null> {
    const rows = await this.prisma.withScope(scope, (tx) =>
      tx.$queryRaw<SessionWithOwnerRow[]>`
        SELECT s.id, s.company_id, s.user_id, s.created_at, s.last_activity_at, s.expires_at, s.revoked_at,
               u.id AS owner_id, u.company_id AS owner_company_id, u.role::text AS owner_role, u.status::text AS owner_status
        FROM platform.sessions s
        LEFT JOIN platform.users u ON u.id = s.user_id
        WHERE s.id = ${sessionId}::uuid
      `,
    );
    const row = rows[0];
    if (!row) return null;
    const session = new Session(row.id, row.company_id, row.user_id, row.created_at, row.last_activity_at, row.expires_at, row.revoked_at);
    const owner = row.owner_id ? new SessionOwner(row.owner_id, row.owner_company_id as string, row.owner_role as SessionOwner['role'], row.owner_status as SessionOwner['status']) : null;
    return { session, owner };
  }

  async rotate(scope: TenantScope, sessionId: string, newHash: string, at: Date): Promise<void> {
    await this.prisma.withScope(scope, (tx) =>
      tx.session.update({
        where: { id: sessionId },
        data: { refreshTokenHash: newHash, lastActivityAt: at },
      }),
    );
  }

  async touch(scope: TenantScope, sessionId: string, at: Date): Promise<void> {
    await this.prisma.withScope(scope, (tx) =>
      tx.session.update({ where: { id: sessionId }, data: { lastActivityAt: at } }),
    );
  }

  async revoke(scope: TenantScope, sessionId: string, at: Date, audit: AuditIntent<Session> | null, forget?: DeviceForget): Promise<void> {
    await this.prisma.withScope(scope, async (tx) => {
      // Orden global (row-locks.ts): la fila del usuario antes que la de la sesión. El insert de auditoría la pide (FK `user_id`) y la baja del usuario la tiene FOR UPDATE
      // mientras cierra sus sesiones: tocar la sesión primero formaría un ciclo. Sin auditoría no hay FK que esperar.
      if ((audit || forget) && scope.userId) await lockUserRow(tx, scope.userId, 'KEY SHARE');
      const closed = await tx.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: at },
      });
      // D123 · Cerrar sesión olvida el dispositivo recordado de este navegador, en la misma transacción.
      if (forget && scope.userId) {
        const device = await revokeActiveDevice(tx, { tokenHash: forget.tokenHash, userId: scope.userId }, at);
        if (device) await insertAuditLog(tx, forget.audit(device));
      }
      // Otro cierre llegó primero: no hubo cambio, no hay rastro que escribir.
      if (closed.count === 0 || !audit) return;
      const row = await tx.session.findUniqueOrThrow({ where: { id: sessionId } });
      await insertAuditLog(tx, audit(toEntity(row)));
    });
  }
}
