import type { NotificationDraft } from './notification-draft';

/**
 * La transacción abierta del hecho que causa el aviso. Opaca para quien emite: el adaptador de `infrastructure/notifications` sabe qué es. El aviso nace EN esa transacción
 * (si la escritura se revierte, el aviso también) y solo se publica en vivo cuando se confirma.
 */
export type NotificationTransaction = object;

/** Un hecho de un control cuyos destinatarios resuelve el adaptador con la cadena del control (dueño, ejecutor, administradores). */
export type ControlNotificationEvent =
  | { type: 'control_assigned'; controlId: string; assigneeId: string; assigneeRole: 'owner' | 'executor'; actorId: string; dedupeSuffix: string }
  | { type: 'evidence_approved' | 'evidence_rejected'; controlId: string; uploaderId: string; actorId: string; dedupeSuffix: string };

// Puerto del sistema de notificaciones (D151, MD-515). Lo implementa `infrastructure/notifications`; los repositorios que escriben el hecho solo conocen esta abstracción.
export abstract class NotificationEmitter {
  /** Guarda avisos ya resueltos (la pasada diaria de ventanas: ya tiene la foto del servicio). Idempotente por `(user_id, dedupe_key)`. */
  abstract emit(tx: NotificationTransaction, drafts: readonly NotificationDraft[]): Promise<void>;

  /** Resuelve la cadena de cada control (una consulta por lote, no por control), arma los avisos y los guarda. */
  abstract emitForControls(tx: NotificationTransaction, companyId: string, events: readonly ControlNotificationEvent[]): Promise<void>;
}
