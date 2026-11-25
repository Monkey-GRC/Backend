import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client';
import type { AuditIntent } from '../../../common/audit/audit-log.writer';
import type { NotificationParams } from '../../../common/notifications/notification-draft';
import { NOTIFICATION_CHANNEL, type NotificationReadFilter, type NotificationType } from '../../../common/notifications/notification-type';
import type { Page } from '../../../common/pagination/page';
import type { TenantScope } from '../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../infrastructure/database/prisma.service';
import type { Language, LiveNotification, NotificationRecord } from '../domain/notification';
import { NotificationRepository } from '../domain/notification.repository';

const SELECT = { id: true, type: true, targetKind: true, targetId: true, params: true, dueAt: true, readAt: true, createdAt: true } satisfies Prisma.NotificationSelect;
type Row = Prisma.NotificationGetPayload<{ select: typeof SELECT }>;

const dayOf = (d: Date): string => d.toISOString().slice(0, 10);
const toRecord = (r: Row): NotificationRecord => ({
  id: r.id, type: r.type, targetKind: r.targetKind, targetId: r.targetId, params: r.params as unknown as NotificationParams,
  dueAt: r.dueAt ? dayOf(r.dueAt) : null, readAt: r.readAt, createdAt: r.createdAt,
});

// Toda operación de la campana es de una persona: sin `userId` en el scope es un error de quien llama, no algo que se resuelva en silencio.
const personOf = (scope: TenantScope): string => {
  if (!scope.userId) throw new Error('La campana exige el scope de una persona');
  return scope.userId;
};

const languageOf = (value: string | null | undefined): Language => (value === 'en' ? 'en' : 'es');

// Los avisos de UNA persona. La RLS (`notifications_read_own`, `notifications_mark_own`) deja ver y marcar solo lo suyo: el `where` por `userId` es de claridad y de índice, no de seguridad.
@Injectable()
export class NotificationPrismaRepository extends NotificationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  list(scope: TenantScope, filter: { status: NotificationReadFilter; type?: NotificationType; page: number; pageSize: number }, since: Date): Promise<Page<NotificationRecord>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where: Prisma.NotificationWhereInput = {
        userId: personOf(scope),
        createdAt: { gte: since },
        ...(filter.status === 'unread' ? { readAt: null } : filter.status === 'read' ? { readAt: { not: null } } : {}),
        ...(filter.type ? { type: filter.type } : {}),
      };
      const total = await tx.notification.count({ where });
      const rows = await tx.notification.findMany({ where, select: SELECT, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (filter.page - 1) * filter.pageSize, take: filter.pageSize });
      return { items: rows.map(toRecord), total, page: filter.page, pageSize: filter.pageSize };
    });
  }

  unreadCount(scope: TenantScope, since: Date): Promise<number> {
    return this.prisma.withScope(scope, (tx) => this.countUnread(tx, scope, since));
  }

  private countUnread(tx: TransactionClient, scope: TenantScope, since: Date): Promise<number> {
    return tx.notification.count({ where: { userId: personOf(scope), readAt: null, createdAt: { gte: since } } });
  }

  findLive(scope: TenantScope, id: string, since: Date): Promise<LiveNotification | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.notification.findFirst({ where: { id, userId: personOf(scope), createdAt: { gte: since } }, select: SELECT });
      if (!row) return null;
      const user = await tx.user.findFirst({ where: { id: personOf(scope) }, select: { preferredLanguage: true } });
      return { record: toRecord(row), unreadCount: await this.countUnread(tx, scope, since), language: languageOf(user?.preferredLanguage) };
    });
  }

  // Cambiar el contador avisa a las otras pestañas de la persona (en cualquier réplica): el `NOTIFY` sale con la transacción, así que solo si se confirma.
  private announceCount(tx: TransactionClient, scope: TenantScope): Promise<number> {
    return tx.$executeRaw(Prisma.sql`SELECT pg_notify(${NOTIFICATION_CHANNEL}, ${JSON.stringify({ k: 'count', u: personOf(scope), c: scope.companyId })})`);
  }

  mark(scope: TenantScope, id: string, isRead: boolean, now: Date, since: Date): Promise<NotificationRecord | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.notification.findFirst({ where: { id, userId: personOf(scope), createdAt: { gte: since } }, select: SELECT });
      if (!found) return null;
      // Solo si el estado cambia: marcar leído uno ya leído no cambia su `read_at` (idempotente) y no mueve el contador.
      const changes = isRead ? found.readAt === null : found.readAt !== null;
      if (!changes) return toRecord(found);
      const updated = await tx.notification.update({ where: { id }, data: { readAt: isRead ? now : null }, select: SELECT });
      await this.announceCount(tx, scope);
      return toRecord(updated);
    });
  }

  readAll(scope: TenantScope, upTo: Date | null, now: Date, since: Date): Promise<number> {
    return this.prisma.withScope(scope, async (tx) => {
      const { count } = await tx.notification.updateMany({ where: { userId: personOf(scope), readAt: null, createdAt: { gte: since, ...(upTo ? { lte: upTo } : {}) } }, data: { readAt: now } });
      if (count > 0) await this.announceCount(tx, scope);
      return count;
    });
  }

  digestPreference(scope: TenantScope): Promise<boolean | null> {
    return this.prisma.withScope(scope, async (tx) => (await tx.user.findFirst({ where: { id: personOf(scope) }, select: { isEmailDigestEnabled: true } }))?.isEmailDigestEnabled ?? null);
  }

  setDigestPreference(scope: TenantScope, enabled: boolean, audit: AuditIntent<{ before: boolean; after: boolean }>): Promise<{ before: boolean; after: boolean } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // La fila de la persona se bloquea: dos cambios a la vez dejan cada uno su rastro con su «antes» verdadero.
      const rows = await tx.$queryRaw<Array<{ is_email_digest_enabled: boolean }>>(Prisma.sql`SELECT is_email_digest_enabled FROM platform.users WHERE id = ${personOf(scope)}::uuid FOR UPDATE`);
      if (rows.length === 0) return null;
      const done = { before: rows[0].is_email_digest_enabled, after: enabled };
      if (done.before === done.after) return done;
      await tx.user.update({ where: { id: personOf(scope) }, data: { isEmailDigestEnabled: enabled } });
      await insertAuditLog(tx, audit(done));
      return done;
    });
  }
}
