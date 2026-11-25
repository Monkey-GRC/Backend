import { I18nService } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';
import { isServiceNotice } from '../../../common/notifications/notification-draft';
import type { Language, NotificationRecord } from '../domain/notification';
import { buildNotificationText, type DetailField } from '../domain/notification-text';

/** El aviso tal como lo ve la persona, ya traducido. La presentación lo pasa al JSON del contrato. */
export type NotificationView = {
  id: string;
  type: NotificationRecord['type'];
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  dueAt: string | null;
  title: string;
  detail: Record<DetailField, string | null>;
  service: { id: string; name: string } | null;
  control: { id: string; code: string; name: string; requirementCodes: string[] } | null;
  controls: { id: string; code: string }[];
  target: { kind: NotificationRecord['targetKind']; id: string; serviceId: string | null };
};

// Arma el texto de un aviso al leerlo, en el idioma de quien lo lee (`Accept-Language` en la lista; `users.preferred_language` en el canal en vivo y el correo).
@Injectable()
export class NotificationViewer {
  constructor(private readonly i18n: I18nService) {}

  view(record: NotificationRecord, lang: Language, now: Date): NotificationView {
    const { params } = record;
    const t = (key: string, args?: Record<string, string | number>): string => this.i18n.t(key, { lang, ...(args ? { args } : {}) }) as string;
    const { title, detail } = buildNotificationText({ type: record.type, params, dueAt: record.dueAt, today: now.toISOString().slice(0, 10), lang }, t);
    const isControl = record.targetKind === 'control';
    return {
      id: record.id,
      type: record.type,
      isRead: record.readAt !== null,
      readAt: record.readAt,
      createdAt: record.createdAt,
      dueAt: record.dueAt,
      title,
      detail,
      service: params.service_id ? { id: params.service_id, name: params.service_name } : null,
      control: isControl && !isServiceNotice(params) && params.control_code ? { id: record.targetId, code: params.control_code, name: params.control_name, requirementCodes: params.requirement_codes ?? [] } : null,
      controls: isServiceNotice(params) ? (params.controls ?? []) : [],
      target: { kind: record.targetKind, id: record.targetId, serviceId: params.service_id ?? null },
    };
  }
}
