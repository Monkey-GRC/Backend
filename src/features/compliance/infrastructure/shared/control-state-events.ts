import { Prisma } from '../../../../../generated/prisma/client';
import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { ControlReadout, readControl } from '../../domain/controls/control-readout';
import { ControlStateSnapshot, diffControlStates, ControlStateChange, droppedFromComplying, reachedPendingApproval, snapshotOf } from '../../domain/controls/control-state-events';
import { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { EvaluationParameters } from '../../../../common/evaluation-parameters/parameters';
import { loadServiceSnapshot } from './service-snapshot.loader';

// D91 · Todo cambio de estado de un control deja un evento en `audit.compliance_events` (inmutable, REQ-044). El estado se deriva de los resultados, así que no hay un «momento»
// en que cambie: quien escribe algo que puede moverlo toma una foto de los controles del servicio ANTES, escribe, y llama a `recordControlStateChanges`, que toma la de DESPUÉS
// y escribe un evento por cada control que cambió. Todo dentro de la misma transacción: si el evento falla, la escritura se revierte.

/** Quién lo causó: una persona, o el sistema (la sonda al escribir un resultado: `userId` nulo). */
export type StateChangeActor = { userId: string | null; ipAddress: string | null; userAgent: string | null };

/** Qué escritura movió el estado; viaja en el evento. */
export type StateChangeCause = 'manual_test_result' | 'control_approval' | 'evidence_submission' | 'exclusion_approved' | 'control_updated' | 'probe_result' | 'periodicity_changed' | 'evaluation_period_set' | 'window_closed';

export async function captureControlStates(tx: TransactionClient, serviceId: string, parameters: EvaluationParameters): Promise<Map<string, ControlStateSnapshot>> {
  const data = await loadServiceSnapshot(tx, serviceId, parameters);
  return new Map(data.controls.map((control) => [control.id, snapshotOf(readControl(control, data))] as const));
}

const eventValue = (s: ControlStateSnapshot) => ({ state: s.state, level: s.level, level_value: s.levelValue, readiness: s.readiness, progress: s.progress, management_state: s.managementState });

async function writeStateEvents(tx: TransactionClient, input: { tenantId: string; serviceId: string; cause: StateChangeCause; actor: StateChangeActor }, changes: ControlStateChange[]): Promise<number> {
  if (changes.length === 0) return 0;
  await tx.complianceEvent.createMany({
    data: changes.map((c) => ({
      tenantId: input.tenantId,
      userId: input.actor.userId,
      changedField: 'control.state',
      previousValue: eventValue(c.before) as Prisma.InputJsonObject,
      newValue: { control_id: c.controlId, control_code: c.code, service_id: input.serviceId, cause: input.cause, ...eventValue(c.after) } as Prisma.InputJsonObject,
      ipAddress: input.actor.ipAddress,
      userAgent: input.actor.userAgent,
    })),
  });
  return changes.length;
}

/**
 * D132 · Lo que una persona o el paso del tiempo mueve en la gestión del control, además del evento: un control que dejó de cumplir pierde sus aprobaciones (`invalidated_at`, una sola vez)
 * y uno que llegó a «Cumple – por aprobar» avisa a quien aprueba (`control_pending_approval`, solo con el emisor a mano).
 */
async function applyManagementEffects(tx: TransactionClient, tenantId: string, changes: ControlStateChange[], notifications: NotificationEmitter | undefined): Promise<void> {
  const dropped = changes.filter(droppedFromComplying).map((c) => c.controlId);
  if (dropped.length > 0) {
    await tx.controlApproval.updateMany({ where: { clientControlId: { in: dropped }, decision: 'approved', invalidatedAt: null }, data: { invalidatedAt: new Date() } });
  }
  const pending = changes.filter(reachedPendingApproval);
  if (notifications && pending.length > 0) {
    const at = Date.now();
    await notifications.emitForControls(tx, tenantId, pending.map((c) => ({ type: 'control_pending_approval' as const, controlId: c.controlId, dedupeSuffix: String(at) })));
  }
}

/** Escribe un evento por cada control cuyo estado o semáforo cambió entre dos fotos ya tomadas (y sus efectos de gestión, D132). Devuelve cuántos escribió. */
export async function recordChangesBetween(
  tx: TransactionClient,
  input: { tenantId: string; serviceId: string; cause: StateChangeCause; actor: StateChangeActor; notifications?: NotificationEmitter },
  before: ReadonlyMap<string, ControlStateSnapshot>,
  after: ReadonlyMap<string, ControlStateSnapshot>,
): Promise<number> {
  const changes = diffControlStates(before, after);
  await applyManagementEffects(tx, input.tenantId, changes, input.notifications);
  return writeStateEvents(tx, input, changes);
}

/** Escribe un evento por cada control cuyo estado o semáforo cambió respecto de `before`. Devuelve cuántos escribió. */
export async function recordControlStateChanges(
  tx: TransactionClient,
  input: { tenantId: string; serviceId: string; parameters: EvaluationParameters; before: ReadonlyMap<string, ControlStateSnapshot>; cause: StateChangeCause; actor: StateChangeActor; notifications?: NotificationEmitter },
): Promise<number> {
  return recordChangesBetween(tx, input, input.before, await captureControlStates(tx, input.serviceId, input.parameters));
}

type LastEventRow = { controlId: string; value: { control_code?: string; state?: string; level?: string; level_value?: number; readiness?: string; progress?: { done: number; total: number }; management_state?: string } };

/** Lo que dejó la lectura del paso del tiempo: los eventos escritos y la lectura de cada control (la foto ya cargada, para quien avisa de las ventanas sin volver a la base). */
export type TimeDrivenResult = { written: number; readouts: ControlReadout[] };

/**
 * D91, D148 · Lo que cambia SOLO por el paso del tiempo (una ventana que cierra sin evidencia): nadie escribió nada, así que no hay «foto de antes». El «antes» de cada control es su
 * último evento de estado; si nunca tuvo uno, el estado de ayer con los mismos datos. Idempotente: tras escribir el evento, la siguiente pasada ya no ve diferencia.
 * Con `recordEvents: false` solo lee (un servicio sin período auditado no deja eventos, pero sus controles sí avisan de la ventana por vencer, MD-515).
 */
export async function recordTimeDrivenStateChanges(
  tx: TransactionClient,
  input: { tenantId: string; serviceId: string; parameters: EvaluationParameters; now: Date; actor: StateChangeActor; recordEvents?: boolean; notifications?: NotificationEmitter },
): Promise<TimeDrivenResult> {
  const data = await loadServiceSnapshot(tx, input.serviceId, input.parameters, undefined, { now: input.now });
  if (data.controls.length === 0) return { written: 0, readouts: [] };
  const readouts = data.controls.map((control) => readControl(control, data));
  // D132 · Los efectos de gestión (invalidar aprobaciones, avisar «por aprobar») van siempre; los eventos D91 solo si el servicio los registra. Sin evento previo el «antes» es el de ayer.
  const record = input.recordEvents !== false;
  const last = record
    ? await tx.$queryRaw<LastEventRow[]>(Prisma.sql`
    SELECT DISTINCT ON (new_value->>'control_id') new_value->>'control_id' AS "controlId", new_value AS "value"
      FROM audit.compliance_events
     WHERE tenant_id = ${input.tenantId}::uuid AND changed_field = 'control.state' AND new_value->>'service_id' = ${input.serviceId}
     ORDER BY new_value->>'control_id', created_at DESC, id DESC`)
    : [];
  const lastOf = new Map(last.map((r) => [r.controlId, r.value]));
  const yesterday = { ...data, signals: { ...data.signals, now: new Date(input.now.getTime() - 86_400_000) } };

  const before = new Map<string, ControlStateSnapshot>();
  const after = new Map<string, ControlStateSnapshot>();
  for (const r of readouts) {
    const { control } = r;
    const code = control.catalogCode ?? control.ownCode;
    after.set(control.id, snapshotOf(r));
    const e = lastOf.get(control.id);
    if (e?.state && e.level && e.readiness) {
      const managementState = (e.management_state ?? readControl(control, yesterday).managementState) as ControlStateSnapshot['managementState'];
      before.set(control.id, { code, state: e.state as ControlStateSnapshot['state'], readiness: e.readiness as ControlStateSnapshot['readiness'], progress: e.progress ?? r.progress, level: e.level as ControlStateSnapshot['level'], levelValue: e.level_value ?? 0, managementState });
    } else {
      const y = readControl(control, yesterday);
      before.set(control.id, { code, state: y.state, readiness: y.readiness, progress: y.progress, level: y.level, levelValue: y.levelValue, managementState: y.managementState });
    }
  }
  const changes = diffControlStates(before, after);
  await applyManagementEffects(tx, input.tenantId, changes, input.notifications);
  const written = record ? await writeStateEvents(tx, { ...input, cause: 'window_closed' }, changes) : 0;
  return { written, readouts };
}
