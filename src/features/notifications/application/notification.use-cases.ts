import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../common/audit/audit-log.writer';
import type { Principal } from '../../../common/auth/principal';
import { DomainError } from '../../../common/errors/domain-error';
import type { RequestMeta } from '../../../common/http/request-meta';
import { NOTIFICATION_RETENTION_DAYS } from '../../../common/notifications/notification-type';
import type { Page } from '../../../common/pagination/page';
import type { TenantScope } from '../../../common/tenancy/tenant-scope';
import type { Language } from '../domain/notification';
import { NotificationRepository } from '../domain/notification.repository';
import type { ListNotificationsQuery } from './notification.dto';
import { NotificationViewer, type NotificationView } from './notification-view';

// Todo es de UNA persona: el scope lleva su `userId` y la RLS hace el resto (SEG-87). Un aviso de otra persona responde 404 igual que uno que no existe.
const scopeOf = (p: Principal): TenantScope => ({ companyId: p.companyId, userId: p.userId, role: p.role });

/** El límite de la retención: la API nunca devuelve avisos de más de 90 días, aunque la pasada de borrado no haya corrido. */
export const retentionLimit = (now: Date): Date => new Date(now.getTime() - NOTIFICATION_RETENTION_DAYS * 86_400_000);

@Injectable()
export class ListNotificationsUseCase {
  constructor(private readonly repo: NotificationRepository, private readonly viewer: NotificationViewer) {}

  async execute(p: Principal, query: ListNotificationsQuery, lang: Language): Promise<Page<NotificationView>> {
    const now = new Date();
    const page = await this.repo.list(scopeOf(p), { status: query.status, type: query.type, page: query.page, pageSize: query.page_size }, retentionLimit(now));
    return { ...page, items: page.items.map((r) => this.viewer.view(r, lang, now)) };
  }
}

@Injectable()
export class UnreadCountUseCase {
  constructor(private readonly repo: NotificationRepository) {}

  execute(p: Principal): Promise<number> {
    return this.repo.unreadCount(scopeOf(p), retentionLimit(new Date()));
  }
}

@Injectable()
export class MarkNotificationUseCase {
  constructor(private readonly repo: NotificationRepository, private readonly viewer: NotificationViewer) {}

  async execute(p: Principal, id: string, isRead: boolean, lang: Language): Promise<NotificationView> {
    const now = new Date();
    const record = await this.repo.mark(scopeOf(p), id, isRead, now, retentionLimit(now));
    if (!record) throw new DomainError('NOT_FOUND');
    return this.viewer.view(record, lang, now);
  }
}

@Injectable()
export class ReadAllNotificationsUseCase {
  constructor(private readonly repo: NotificationRepository) {}

  execute(p: Principal, upTo: Date | null): Promise<number> {
    const now = new Date();
    return this.repo.readAll(scopeOf(p), upTo, now, retentionLimit(now));
  }
}

export type NotificationPreferences = { isEmailDigestEnabled: boolean };

@Injectable()
export class GetNotificationPreferencesUseCase {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(p: Principal): Promise<NotificationPreferences> {
    const enabled = await this.repo.digestPreference(scopeOf(p));
    if (enabled === null) throw new DomainError('NOT_FOUND');
    return { isEmailDigestEnabled: enabled };
  }
}

@Injectable()
export class UpdateNotificationPreferencesUseCase {
  constructor(private readonly repo: NotificationRepository) {}

  async execute(p: Principal, enabled: boolean, meta: RequestMeta): Promise<NotificationPreferences> {
    const done = await this.repo.setDigestPreference(scopeOf(p), enabled, (r): AuditEntry => ({
      tenantId: p.companyId, userId: p.userId, action: 'user.notification_preferences_changed', resource: 'user', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
      beforeState: { user_id: p.userId, is_email_digest_enabled: r.before },
      afterState: { user_id: p.userId, is_email_digest_enabled: r.after },
    }));
    if (!done) throw new DomainError('NOT_FOUND');
    return { isEmailDigestEnabled: done.after };
  }
}
