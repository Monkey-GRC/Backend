import { Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { Session } from '../../domain/entities/session.entity';
import { NewSession, SessionRepository } from '../../domain/repositories/session.repository';

type SessionRow = {
  id: string;
  companyId: string;
  userId: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
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

  async create(scope: TenantScope, data: NewSession, audit: AuditIntent<Session> | null): Promise<Session> {
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

  async revoke(scope: TenantScope, sessionId: string, at: Date, audit: AuditIntent<Session> | null): Promise<void> {
    await this.prisma.withScope(scope, async (tx) => {
      const closed = await tx.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: at },
      });
      // Otro cierre llegó primero: no hubo cambio, no hay rastro que escribir.
      if (closed.count === 0 || !audit) return;
      const row = await tx.session.findUniqueOrThrow({ where: { id: sessionId } });
      await insertAuditLog(tx, audit(toEntity(row)));
    });
  }
}
