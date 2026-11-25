import type { AuditIntent } from '../../../common/audit/audit-log.writer';
import type { NotificationReadFilter, NotificationType } from '../../../common/notifications/notification-type';
import type { Page } from '../../../common/pagination/page';
import type { TenantScope } from '../../../common/tenancy/tenant-scope';
import type { DigestBatch, LiveNotification, NotificationRecord } from './notification';

// La campana de UNA persona (SEG-87). Todo va con el scope de la persona (`userId`): la RLS no deja ver ni marcar el aviso de otra, así que «de otra persona» y «no existe» son lo mismo: `null`.
// `since` es el límite de la retención (90 días): la API nunca devuelve algo más viejo, aunque la pasada de borrado no haya corrido.
export abstract class NotificationRepository {
  abstract list(scope: TenantScope, filter: { status: NotificationReadFilter; type?: NotificationType; page: number; pageSize: number }, since: Date): Promise<Page<NotificationRecord>>;
  abstract unreadCount(scope: TenantScope, since: Date): Promise<number>;
  /** El aviso recién confirmado, su contador y el idioma de su dueño; `null` si no existe (era un duplicado) o ya no está activo. */
  abstract findLive(scope: TenantScope, id: string, since: Date): Promise<LiveNotification | null>;
  /** Marca leído o no leído. Idempotente: marcar leído uno ya leído no cambia su `read_at`. Avisa a las otras pestañas del cambio del contador. */
  abstract mark(scope: TenantScope, id: string, isRead: boolean, now: Date, since: Date): Promise<NotificationRecord | null>;
  /** Marca como leídos los no leídos (hasta `upTo`, si se manda). Devuelve cuántos cambió. */
  abstract readAll(scope: TenantScope, upTo: Date | null, now: Date, since: Date): Promise<number>;

  abstract digestPreference(scope: TenantScope): Promise<boolean | null>;
  /** `null` si la cuenta no existe. Si no cambia, no escribe ni audita. La auditoría se escribe en la misma transacción (D52). */
  abstract setDigestPreference(scope: TenantScope, enabled: boolean, audit: AuditIntent<{ before: boolean; after: boolean }>): Promise<{ before: boolean; after: boolean } | null>;
}

// El resumen diario por correo (D143, D151).
export abstract class NotificationDigestRepository {
  /** A quién le toca hoy (cuentas activas con el resumen encendido y avisos sin enviar). Solo ids: lo demás se lee ya como esa persona. */
  abstract candidates(today: Date): Promise<Array<{ companyId: string; userId: string }>>;
  /**
   * Toma el resumen de hoy de la persona (un intento más, máximo 3) y arma lo que lleva. `null` si otra réplica lo tiene, ya salió, agotó sus intentos o no había nada que enviar
   * (en ese caso lo deja `skipped`).
   */
  abstract claim(scope: TenantScope, today: Date, now: Date, since: Date): Promise<DigestBatch | null>;
  /** Cierra el intento: `sent` marca sus avisos como enviados; `failed` los deja para el siguiente intento. El rastro `notification.digest_email` se escribe en la misma transacción. */
  abstract finish(scope: TenantScope, batch: DigestBatch, outcome: 'sent' | 'failed', now: Date, audit: AuditIntent<{ outcome: 'sent' | 'failed'; itemCount: number }>): Promise<void>;
}

// Lo que corre la tarea periódica sin ser una persona.
export abstract class NotificationMaintenanceRepository {
  abstract listCompanyIds(): Promise<string[]>;
  /** Borra los avisos de la empresa de más de 90 días. Devuelve cuántos. */
  abstract purgeExpired(companyId: string): Promise<number>;
  /** De estas sesiones (de una empresa), las que ya no valen: cerradas, vencidas o sin actividad. Cierra el canal en vivo de quien cerró sesión. */
  abstract deadSessions(companyId: string, sessionIds: readonly string[], now: Date, idleTimeoutSeconds: number): Promise<string[]>;
}
