import { NOTIFICATION_TYPES } from '../notifications/notification-type';

// La lista de Notificaciones que sirve `GET /v1/catalogs/notification_type` (contracts/enums/notificaciones.md, D151). Las etiquetas salen de `catalogs.notification_type.*`.
export const NOTIFICATION_ENUM_CATALOGS = {
  notification_type: NOTIFICATION_TYPES,
} as const;
