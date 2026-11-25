import { Injectable } from '@nestjs/common';
import { resolveRecipients } from '../../common/notifications/notification-audience';
import type { NotificationDraft } from '../../common/notifications/notification-draft';
import { ControlNotificationEvent, NotificationEmitter, type NotificationTransaction } from '../../common/notifications/notification-emitter';
import { AUDIENCES } from '../../common/notifications/notification-type';
import type { TransactionClient } from '../database/prisma.service';
import { loadControlFacts, loadParty } from './control-chain.loader';
import { insertNotifications } from './notification.insert';

// D151 · El adaptador del puerto: guarda los avisos en la transacción que le dan (`tx`) y resuelve la cadena del control cuando el emisor no la tiene a mano.
@Injectable()
export class PrismaNotificationEmitter extends NotificationEmitter {
  async emit(tx: TransactionClient, drafts: readonly NotificationDraft[]): Promise<void> {
    await insertNotifications(tx, drafts);
  }

  async emitForControls(tx: TransactionClient, companyId: string, events: readonly ControlNotificationEvent[]): Promise<void> {
    if (events.length === 0) return;
    const facts = await loadControlFacts(tx, events.map((e) => e.controlId));
    const parties = new Map<string, Awaited<ReturnType<typeof loadParty>>>();
    for (const actorId of new Set(events.map((e) => e.actorId))) parties.set(actorId, await loadParty(tx, actorId));
    const drafts: NotificationDraft[] = [];
    for (const event of events) {
      const control = facts.get(event.controlId);
      if (!control) continue;
      const base = { companyId, type: event.type, targetKind: 'control' as const, targetId: control.controlId, dueAt: null };
      const actor = parties.get(event.actorId) ?? null;
      if (event.type === 'control_assigned') {
        for (const userId of resolveRecipients(AUDIENCES.control_assigned, { chain: control.chain, assigneeId: event.assigneeId, actorId: event.actorId })) {
          drafts.push({ ...base, userId, params: { ...control.params, actor, assignee_role: event.assigneeRole }, dedupeKey: `control_assigned:${control.controlId}:${event.assigneeRole}:${event.dedupeSuffix}` });
        }
      } else {
        for (const userId of resolveRecipients(AUDIENCES[event.type], { chain: control.chain, uploaderId: event.uploaderId, actorId: event.actorId })) {
          drafts.push({ ...base, userId, params: { ...control.params, actor }, dedupeKey: `${event.type}:${event.dedupeSuffix}` });
        }
      }
    }
    await insertNotifications(tx, drafts);
  }
}

export type { NotificationTransaction };
