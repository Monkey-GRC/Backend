import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import { insertAuditLog } from '../../../infrastructure/audit/audit-log.insert';
import type { AuditIntent } from '../../../common/audit/audit-log.writer';
import type { NotificationParams } from '../../../common/notifications/notification-draft';
import type { TenantScope } from '../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { DigestBatch, Language } from '../domain/notification';
import { NotificationDigestRepository } from '../domain/notification.repository';

// D143, D151 · El resumen diario: una fila por persona y día. `candidates` es lo único que corre sin persona (una función angosta de la base); todo lo demás va como la persona destinataria,
// con la RLS normal de sus avisos.
export const MAX_DIGEST_ATTEMPTS = 3;
export const MAX_DIGEST_ITEMS = 20;

@Injectable()
export class NotificationDigestPrismaRepository extends NotificationDigestRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async candidates(today: Date): Promise<Array<{ companyId: string; userId: string }>> {
    const rows = await this.prisma.$queryRaw<Array<{ company_id: string; user_id: string }>>(Prisma.sql`SELECT company_id, user_id FROM platform.list_digest_candidates(${today.toISOString().slice(0, 10)}::date)`);
    return rows.map((r) => ({ companyId: r.company_id, userId: r.user_id }));
  }

  claim(scope: TenantScope, today: Date, now: Date, since: Date): Promise<DigestBatch | null> {
    const userId = scope.userId;
    if (!userId) throw new Error('El resumen se arma como la persona destinataria');
    const day = today.toISOString().slice(0, 10);
    return this.prisma.withScope(scope, async (tx) => {
      // El intento se reclama con un solo `INSERT … ON CONFLICT`: con dos réplicas, una sola lo gana. Un `sending` viejo (la réplica murió) se puede retomar.
      const claimed = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        INSERT INTO platform.notification_digests AS d (id, company_id, user_id, digest_date, status, attempts, updated_at)
        VALUES (gen_random_uuid(), ${scope.companyId}::uuid, ${userId}::uuid, ${day}::date, 'sending', 1, now())
        ON CONFLICT (user_id, digest_date) DO UPDATE
           SET status = 'sending', attempts = d.attempts + 1, updated_at = now()
         WHERE d.attempts < ${MAX_DIGEST_ATTEMPTS}::int
           AND (d.status = 'failed' OR (d.status = 'sending' AND d.updated_at < now() - interval '15 minutes'))
        RETURNING id`);
      if (claimed.length === 0) return null;
      const digestId = claimed[0].id;

      const user = await tx.user.findFirst({ where: { id: userId }, select: { email: true, preferredLanguage: true, status: true, isEmailDigestEnabled: true, company: { select: { name: true } } } });
      const where: Prisma.NotificationWhereInput = { userId, readAt: null, emailedAt: null, createdAt: { gte: since, lte: now } };
      const total = user && user.status === 'active' && user.isEmailDigestEnabled ? await tx.notification.count({ where }) : 0;
      if (!user || total === 0) {
        await tx.notificationDigest.update({ where: { id: digestId }, data: { status: 'skipped', itemCount: 0 } });
        return null;
      }
      const rows = await tx.notification.findMany({
        where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: MAX_DIGEST_ITEMS,
        select: { id: true, type: true, targetKind: true, targetId: true, params: true, dueAt: true, readAt: true, createdAt: true },
      });
      return {
        digestId, email: user.email, language: (user.preferredLanguage === 'en' ? 'en' : 'es') as Language, companyName: user.company.name, total, snapshotAt: now,
        items: rows.map((r) => ({ id: r.id, type: r.type, targetKind: r.targetKind, targetId: r.targetId, params: r.params as unknown as NotificationParams, dueAt: r.dueAt ? r.dueAt.toISOString().slice(0, 10) : null, readAt: r.readAt, createdAt: r.createdAt })),
      };
    });
  }

  finish(scope: TenantScope, batch: DigestBatch, outcome: 'sent' | 'failed', now: Date, audit: AuditIntent<{ outcome: 'sent' | 'failed'; itemCount: number }>): Promise<void> {
    return this.prisma.withScope(scope, async (tx) => {
      await tx.notificationDigest.update({ where: { id: batch.digestId }, data: { status: outcome, itemCount: batch.total, ...(outcome === 'sent' ? { sentAt: now } : {}) } });
      // Solo lo que entró en este resumen: lo que llegó después de armarlo espera al siguiente.
      if (outcome === 'sent') await tx.notification.updateMany({ where: { userId: scope.userId, emailedAt: null, readAt: null, createdAt: { lte: batch.snapshotAt } }, data: { emailedAt: now } });
      await insertAuditLog(tx, audit({ outcome, itemCount: batch.total }));
    });
  }
}
