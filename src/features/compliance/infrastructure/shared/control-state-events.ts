import { Prisma } from '../../../../../generated/prisma/client';
import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { ControlReadout, exceptionTestIdsOf, isPendingPlanLive, readControl } from '../../domain/controls/control-readout';
import { ControlStateSnapshot, diffControlStates, ControlStateChange, droppedFromComplying, reachedPendingApproval, snapshotOf } from '../../domain/controls/control-state-events';
import { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { EvaluationParameters } from '../../../../common/evaluation-parameters/parameters';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { isValidRequest, sameWindowStart } from '../../domain/controls/management-extras';
import { loadServiceSnapshot } from './service-snapshot.loader';

// D91 · Todo cambio de estado de un control deja un evento en `audit.compliance_events` (inmutable, REQ-044). El estado se deriva de los resultados, así que no hay un «momento»
// en que cambie: quien escribe algo que puede moverlo toma una foto de los controles del servicio ANTES, escribe, y llama a `recordControlStateChanges`, que toma la de DESPUÉS
// y escribe un evento por cada control que cambió. Todo dentro de la misma transacción: si el evento falla, la escritura se revierte.

/** Quién lo causó: una persona, o el sistema (la sonda al escribir un resultado: `userId` nulo). */
export type StateChangeActor = { userId: string | null; ipAddress: string | null; userAgent: string | null };

/** Qué escritura movió el estado; viaja en el evento. */
export type StateChangeCause = 'manual_test_result' | 'control_approval' | 'evidence_submission' | 'exclusion_approved' | 'control_updated' | 'probe_result' | 'periodicity_changed' | 'evaluation_period_set' | 'window_closed' | 'level_override' | 'remediation_plan' | 'requirement_applicability' | 'requirement_occurrence';

export async function captureControlStates(tx: TransactionClient, serviceId: string, parameters: EvaluationParameters): Promise<Map<string, ControlStateSnapshot>> {
  return (await captureControlReadouts(tx, serviceId, parameters)).snapshots;
}

/** La misma foto, con la lectura completa de cada control: quien la necesita para responder (MD-529) no vuelve a leer el servicio. */
export async function captureControlReadouts(tx: TransactionClient, serviceId: string, parameters: EvaluationParameters): Promise<{ snapshots: Map<string, ControlStateSnapshot>; readouts: Map<string, ControlReadout> }> {
  const data = await loadServiceSnapshot(tx, serviceId, parameters);
  const readouts = new Map(data.controls.map((control) => [control.id, readControl(control, data)] as const));
  return { readouts, snapshots: new Map([...readouts].map(([id, r]) => [id, snapshotOf(r)] as const)) };
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
async function applyManagementEffects(tx: TransactionClient, tenantId: string, changes: ControlStateChange[], notifications: NotificationEmitter | undefined, actor: StateChangeActor): Promise<void> {
  const dropped = changes.filter(droppedFromComplying);
  if (dropped.length > 0) {
    const live = await tx.controlApproval.findMany({ where: { clientControlId: { in: dropped.map((c) => c.controlId) }, decision: 'approved', invalidatedAt: null }, select: { id: true, clientControlId: true, step: true } });
    if (live.length > 0) {
      await tx.controlApproval.updateMany({ where: { id: { in: live.map((a) => a.id) } }, data: { invalidatedAt: new Date() } });
      // G-09 · Cada control que pierde sus aprobaciones deja su rastro en la misma transacción (contracts/cumplimiento/aprobacion.md).
      await insertAuditLog(tx, dropped.filter((c) => live.some((a) => a.clientControlId === c.controlId)).map((c) => ({
        tenantId, userId: actor.userId, action: 'control_approval.invalidate', resource: 'control_approval', result: 'success' as const, ipAddress: actor.ipAddress ?? '', userAgent: actor.userAgent ?? '',
        beforeState: { control_id: c.controlId, control_code: c.code, management_state: c.before.managementState, level: c.before.level },
        afterState: { control_id: c.controlId, control_code: c.code, management_state: c.after.managementState, level: c.after.level, approval_ids: live.filter((a) => a.clientControlId === c.controlId).map((a) => a.id), steps: live.filter((a) => a.clientControlId === c.controlId).map((a) => a.step) },
      })));
    }
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
  await applyManagementEffects(tx, input.tenantId, changes, input.notifications, input.actor);
  return writeStateEvents(tx, input, changes);
}

/** Escribe un evento por cada control cuyo estado o semáforo cambió respecto de `before`. Devuelve cuántos escribió. */
export async function recordControlStateChanges(
  tx: TransactionClient,
  input: { tenantId: string; serviceId: string; parameters: EvaluationParameters; before: ReadonlyMap<string, ControlStateSnapshot>; cause: StateChangeCause; actor: StateChangeActor; notifications?: NotificationEmitter },
): Promise<number> {
  const { snapshots, readouts } = await captureControlReadouts(tx, input.serviceId, input.parameters);
  const written = await recordChangesBetween(tx, input, input.before, snapshots);
  // MD-529 · Lo que este cambio dejó sin valor (una corrección de otro sugerido, un plan cuya prueba ya no está en Excepción) se invalida ya, con el actor real; sale de la lectura que ya se tomó.
  await invalidateStaleRequests(tx, input.tenantId, [...readouts.values()], input.actor);
  return written;
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
  await applyManagementEffects(tx, input.tenantId, changes, input.notifications, input.actor);
  await invalidateStaleRequests(tx, input.tenantId, readouts, input.actor);
  const written = record ? await writeStateEvents(tx, { ...input, cause: 'window_closed' }, changes) : 0;
  return { written, readouts };
}

/**
 * MD-529 · Lo que dejó de valer por el paso del tiempo o por un cambio del nivel sugerido: una corrección de nivel (pendiente o aprobada) de otra ventana o de otro sugerido, un plan de otra ventana y un plan pendiente cuya prueba dejó de estar en Excepción, reciben su
 * `invalidated_at` (una sola vez) y su rastro, en la misma transacción. La pasada diaria la llama con la lectura del servicio, y cada acto de gestión (`finish`) con la foto de después que ya tomó: así lo que deja de valer se invalida al instante, con su rastro, y no resucita si el sugerido vuelve. Sin consultas por control: las filas salen de la lectura.
 */
export async function invalidateStaleRequests(tx: TransactionClient, tenantId: string, readouts: readonly ControlReadout[], actor: StateChangeActor): Promise<void> {
  const overrides: Array<{ id: string; controlId: string; code: string }> = [];
  const plans: Array<{ id: string; controlId: string; code: string }> = [];
  for (const r of readouts) {
    const extras = r.control.extras;
    if (!extras) continue;
    const code = r.control.catalogCode ?? r.control.ownCode;
    for (const o of extras.overrides) if ((o.status === 'pending' || o.status === 'approved') && o.invalidatedAt === null && !isValidRequest(o, r.suggestedLevelValue, r.windowStart)) overrides.push({ id: o.id, controlId: r.control.id, code });
    const exceptions = exceptionTestIdsOf(r);
    // Un plan de otra ventana ya no vale; uno pendiente cuya prueba dejó de ser excepción (o cuyo requisito pasó a «No aplica») tampoco: nadie lo puede decidir.
    for (const p of extras.plans) {
      if (p.invalidatedAt !== null) continue;
      if (((p.status === 'pending' || p.status === 'approved') && !sameWindowStart(p.windowStart, r.windowStart)) || (p.status === 'pending' && !isPendingPlanLive(p, r, exceptions))) plans.push({ id: p.id, controlId: r.control.id, code });
    }
  }
  const now = new Date();
  const audit = (kind: 'control_level_override' | 'remediation_plan', rows: typeof overrides) =>
    rows.map((x) => ({
      tenantId, userId: actor.userId, action: `${kind}.invalidate`, resource: kind, result: 'success' as const, ipAddress: actor.ipAddress ?? '', userAgent: actor.userAgent ?? '',
      beforeState: { id: x.id, control_id: x.controlId, control_code: x.code }, afterState: { id: x.id, control_id: x.controlId, control_code: x.code, cause: 'no_longer_valid' },
    }));
  if (overrides.length > 0) {
    await tx.controlLevelOverride.updateMany({ where: { id: { in: overrides.map((x) => x.id) }, invalidatedAt: null }, data: { invalidatedAt: now } });
    await insertAuditLog(tx, audit('control_level_override', overrides));
  }
  if (plans.length > 0) {
    await tx.remediationPlan.updateMany({ where: { id: { in: plans.map((x) => x.id) }, invalidatedAt: null }, data: { invalidatedAt: now } });
    await insertAuditLog(tx, audit('remediation_plan', plans));
  }
}
