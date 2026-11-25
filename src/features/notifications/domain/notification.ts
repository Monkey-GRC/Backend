import type { NotificationParams } from '../../../common/notifications/notification-draft';
import type { NotificationTargetKind, NotificationType } from '../../../common/notifications/notification-type';

// Un aviso de la campana de una persona (platform.notifications). Lo que se guarda es el tipo y los datos (`params`); el texto se arma al leer (domain/notification-text.ts).
export type NotificationRecord = {
  id: string;
  type: NotificationType;
  targetKind: NotificationTargetKind;
  targetId: string;
  params: NotificationParams;
  /** El cierre de la ventana (`YYYY-MM-DD`). */
  dueAt: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export type Language = 'es' | 'en';

/** Un aviso con su contador y el idioma de su dueño: lo que el canal en vivo necesita para publicarlo. */
export type LiveNotification = { record: NotificationRecord; unreadCount: number; language: Language };

export type DigestBatch = {
  digestId: string;
  email: string;
  language: Language;
  companyName: string;
  items: NotificationRecord[];
  /** Cuántos avisos entran en este resumen (puede ser más que los que se listan). */
  total: number;
  /** Hasta qué aviso llega este resumen: lo que llegue después entra en el siguiente. */
  snapshotAt: Date;
};
