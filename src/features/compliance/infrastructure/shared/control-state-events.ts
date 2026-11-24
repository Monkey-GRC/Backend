import { Prisma } from '../../../../../generated/prisma/client';
import { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { readControl } from '../../domain/controls/control-readout';
import { ControlStateSnapshot, diffControlStates, ControlStateChange } from '../../domain/controls/control-state-events';
import { EvaluationParameters } from '../../domain/engine/v2/parameters';
import { loadServiceSnapshot } from './service-snapshot.loader';

// D91 · Todo cambio de estado de un control deja un evento en `audit.compliance_events` (inmutable, REQ-044). El estado se deriva de los resultados, así que no hay un «momento»
// en que cambie: quien escribe algo que puede moverlo toma una foto de los controles del servicio ANTES, escribe, y llama a `recordControlStateChanges`, que toma la de DESPUÉS
// y escribe un evento por cada control que cambió. Todo dentro de la misma transacción: si el evento falla, la escritura se revierte.

/** Quién lo causó: una persona, o el sistema (la sonda al escribir un resultado: `userId` nulo). */
export type StateChangeActor = { userId: string | null; ipAddress: string | null; userAgent: string | null };

/** Qué escritura movió el estado; viaja en el evento. */
export type StateChangeCause = 'test_verdict' | 'test_verdict_review' | 'evidence_submission' | 'evidence_review' | 'exclusion_approved' | 'control_updated' | 'probe_result' | 'periodicity_changed' | 'evaluation_period_set' | 'window_closed';

export async function captureControlStates(tx: TransactionClient, serviceId: string, parameters: EvaluationParameters): Promise<Map<string, ControlStateSnapshot>> {
  const data = await loadServiceSnapshot(tx, serviceId, parameters);
  return new Map(
    data.controls.map((control) => {
      const r = readControl(control, data);
      return [control.id, { code: control.catalogCode ?? control.ownCode, state: r.state, readiness: r.readiness, progress: r.progress, level: r.level, levelValue: r.levelValue }] as const;
    }),
  );
}

const eventValue = (s: ControlStateSnapshot) => ({ state: s.state, level: s.level, level_value: s.levelValue, readiness: s.readiness, progress: s.progress });

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

/** Escribe un evento por cada control cuyo estado o semáforo cambió respecto de `before`. Devuelve cuántos escribió. */
export async function recordControlStateChanges(
  tx: TransactionClient,
  input: { tenantId: string; serviceId: string; parameters: EvaluationParameters; before: ReadonlyMap<string, ControlStateSnapshot>; cause: StateChangeCause; actor: StateChangeActor },
): Promise<number> {
  return writeStateEvents(tx, input, diffControlStates(input.before, await captureControlStates(tx, input.serviceId, input.parameters)));
}

type LastEventRow = { controlId: string; value: { control_code?: string; state?: string; level?: string; level_value?: number; readiness?: string; progress?: { done: number; total: number } } };

/**
 * D91, D148 · Lo que cambia SOLO por el paso del tiempo (una ventana que cierra sin evidencia): nadie escribió nada, así que no hay «foto de antes». El «antes» de cada control es su
 * último evento de estado; si nunca tuvo uno, el estado de ayer con los mismos datos. Idempotente: tras escribir el evento, la siguiente pasada ya no ve diferencia.
 */
export async function recordTimeDrivenStateChanges(
  tx: TransactionClient,
  input: { tenantId: string; serviceId: string; parameters: EvaluationParameters; now: Date; actor: StateChangeActor },
): Promise<number> {
  const data = await loadServiceSnapshot(tx, input.serviceId, input.parameters);
  if (data.controls.length === 0) return 0;
  const last = await tx.$queryRaw<LastEventRow[]>(Prisma.sql`
    SELECT DISTINCT ON (new_value->>'control_id') new_value->>'control_id' AS "controlId", new_value AS "value"
      FROM audit.compliance_events
     WHERE tenant_id = ${input.tenantId}::uuid AND changed_field = 'control.state' AND new_value->>'service_id' = ${input.serviceId}
     ORDER BY new_value->>'control_id', created_at DESC, id DESC`);
  const lastOf = new Map(last.map((r) => [r.controlId, r.value]));
  const yesterday = { ...data, signals: { ...data.signals, now: new Date(input.now.getTime() - 86_400_000) } };

  const before = new Map<string, ControlStateSnapshot>();
  const after = new Map<string, ControlStateSnapshot>();
  for (const control of data.controls) {
    const code = control.catalogCode ?? control.ownCode;
    const r = readControl(control, data);
    after.set(control.id, { code, state: r.state, readiness: r.readiness, progress: r.progress, level: r.level, levelValue: r.levelValue });
    const e = lastOf.get(control.id);
    if (e?.state && e.level && e.readiness) {
      before.set(control.id, { code, state: e.state as ControlStateSnapshot['state'], readiness: e.readiness as ControlStateSnapshot['readiness'], progress: e.progress ?? r.progress, level: e.level as ControlStateSnapshot['level'], levelValue: e.level_value ?? 0 });
    } else {
      const y = readControl(control, yesterday);
      before.set(control.id, { code, state: y.state, readiness: y.readiness, progress: y.progress, level: y.level, levelValue: y.levelValue });
    }
  }
  return writeStateEvents(tx, { ...input, cause: 'window_closed' }, diffControlStates(before, after));
}
