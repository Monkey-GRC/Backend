import { randomUUID } from 'node:crypto';
import { Prisma } from '../../../generated/prisma/client';
import type { NotificationDraft } from '../../common/notifications/notification-draft';
import { NOTIFICATION_CHANNEL } from '../../common/notifications/notification-type';
import type { TransactionClient } from '../database/prisma.service';

// D151, SEG-87 · Guarda los avisos DENTRO de la transacción del hecho que los causa (si se revierte, el aviso también). SIN `RETURNING`: la política de lectura es por persona y quien
// causa el hecho no es el destinatario (mismo motivo que `insertAuditLog`). Un aviso repetido `(user_id, dedupe_key)` se descarta en silencio con `ON CONFLICT DO NOTHING` SIN objetivo: con el índice nombrado, Postgres exige además que la fila nueva pase la política de lectura
// (por persona) y quien causa el hecho no es el destinatario.
//
// En vivo: `pg_notify` dentro de la misma transacción. Postgres entrega la notificación SOLO si la transacción se confirma y a TODAS las réplicas que escuchan el canal, así que ni un
// aviso revertido llega a una campana ni dos réplicas se estorban. El id se genera aquí: si el aviso era un duplicado, quien escucha no lo encuentra y no publica nada.
export async function insertNotifications(tx: TransactionClient, drafts: readonly NotificationDraft[]): Promise<void> {
  if (drafts.length === 0) return;
  const ids = drafts.map(() => randomUUID());
  await tx.$executeRaw(Prisma.sql`
    INSERT INTO platform.notifications (id, company_id, user_id, type, target_kind, target_id, params, due_at, dedupe_key)
    SELECT v.id, v.company_id, v.user_id, v.type::platform.notification_type, v.target_kind::platform.notification_target_kind, v.target_id, v.params::jsonb, v.due_at, v.dedupe_key
      FROM unnest(
        ${ids}::uuid[], ${drafts.map((d) => d.companyId)}::uuid[], ${drafts.map((d) => d.userId)}::uuid[], ${drafts.map((d) => d.type)}::text[], ${drafts.map((d) => d.targetKind)}::text[],
        ${drafts.map((d) => d.targetId)}::uuid[], ${drafts.map((d) => JSON.stringify(d.params))}::text[], ${drafts.map((d) => d.dueAt)}::date[], ${drafts.map((d) => d.dedupeKey)}::text[]
      ) AS v(id, company_id, user_id, type, target_kind, target_id, params, due_at, dedupe_key)
    ON CONFLICT DO NOTHING`);
  const payloads = drafts.map((d, i) => JSON.stringify({ i: ids[i], u: d.userId, c: d.companyId }));
  await tx.$executeRaw(Prisma.sql`SELECT pg_notify(${NOTIFICATION_CHANNEL}, p) FROM unnest(${payloads}::text[]) AS p`);
}
