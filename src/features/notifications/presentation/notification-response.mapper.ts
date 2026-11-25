import type { NotificationPreferences } from '../application/notification.use-cases';
import type { LiveEvent } from '../application/live/notification-hub';
import type { NotificationView } from '../application/notification-view';

// Del aviso al JSON del contrato (snake_case, fechas ISO 8601 UTC).
export const toNotification = (n: NotificationView) => ({
  id: n.id,
  type: n.type,
  is_read: n.isRead,
  read_at: n.readAt ? n.readAt.toISOString() : null,
  created_at: n.createdAt.toISOString(),
  due_at: n.dueAt,
  title: n.title,
  detail: n.detail,
  service: n.service,
  control: n.control ? { id: n.control.id, code: n.control.code, name: n.control.name, requirement_codes: n.control.requirementCodes } : null,
  controls: n.controls.map((c) => ({ id: c.id, code: c.code })),
  target: { kind: n.target.kind, id: n.target.id, service_id: n.target.serviceId },
});

export const toPreferences = (p: NotificationPreferences, digestHourUtc: number) => ({
  is_email_digest_enabled: p.isEmailDigestEnabled,
  email_digest_time_utc: `${String(digestHourUtc).padStart(2, '0')}:00`,
});

/** El evento del canal en vivo como `event:` y `data:` (contracts/notificaciones.md). */
export function toStreamEvent(e: LiveEvent): { type: string; data: Record<string, unknown> } {
  switch (e.kind) {
    case 'ready': return { type: 'ready', data: { unread_count: e.unreadCount } };
    case 'unread_count': return { type: 'unread_count', data: { unread_count: e.unreadCount } };
    case 'notification': return { type: 'notification', data: { unread_count: e.unreadCount, notification: toNotification(e.notification) } };
  }
}
