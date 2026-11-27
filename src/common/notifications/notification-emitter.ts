import type { FailureParam, NotificationDraft, StaleAssetParam } from './notification-draft';

/**
 * La transacción abierta del hecho que causa el aviso. Opaca para quien emite: el adaptador de `infrastructure/notifications` sabe qué es. El aviso nace EN esa transacción
 * (si la escritura se revierte, el aviso también) y solo se publica en vivo cuando se confirma.
 */
export type NotificationTransaction = object;

/** Un hecho de un control cuyos destinatarios resuelve el adaptador con la cadena del control (dueño, ejecutor, administradores). */
export type ControlNotificationEvent =
  | { type: 'control_assigned'; controlId: string; assigneeId: string; assigneeRole: 'owner' | 'executor'; actorId: string; dedupeSuffix: string }
  // D132 · La gestión del control. «Por aprobar» lo causa el cambio de estado (sin actor); la primera aprobación y la devolución, una persona.
  | { type: 'control_pending_approval'; controlId: string; dedupeSuffix: string }
  | { type: 'control_owner_approved' | 'control_returned'; controlId: string; actorId: string; dedupeSuffix: string }
  // MD-529 · La corrección del nivel, el plan de remediación y el «No aplica»: los causa una persona. `assigneeId` solo en un plan aprobado: la persona que lo hará.
  | { type: 'level_override_proposed' | 'level_override_decided' | 'remediation_plan_proposed' | 'not_applicable_requested' | 'not_applicable_decided'; controlId: string; actorId: string; dedupeSuffix: string }
  | { type: 'remediation_plan_decided'; controlId: string; actorId: string; dedupeSuffix: string; assigneeId: string | null }
  // D153 · Los avisos de la evaluación automática los causa el sistema: no hay actor. `dedupeSuffix` es lo que sigue a `<tipo>:<control>:` en la clave.
  | { type: 'direct_check_failed'; controlId: string; dedupeSuffix: string; failures: FailureParam[]; failureCount: number }
  | { type: 'automatic_evidence_stale'; controlId: string; dedupeSuffix: string; staleAssets: StaleAssetParam[]; staleCount: number };

// Puerto del sistema de notificaciones (D151, MD-515). Lo implementa `infrastructure/notifications`; los repositorios que escriben el hecho solo conocen esta abstracción.
export abstract class NotificationEmitter {
  /** Guarda avisos ya resueltos (la pasada diaria de ventanas: ya tiene la foto del servicio). Idempotente por `(user_id, dedupe_key)`. */
  abstract emit(tx: NotificationTransaction, drafts: readonly NotificationDraft[]): Promise<void>;

  /** Resuelve la cadena de cada control (una consulta por lote, no por control), arma los avisos y los guarda. */
  abstract emitForControls(tx: NotificationTransaction, companyId: string, events: readonly ControlNotificationEvent[]): Promise<void>;
}
