import { Prisma } from '../../../../generated/prisma/client';
import { TransactionClient } from '../../../infrastructure/database/prisma.service';
import { readControl } from '../domain/control-readout';
import { ControlStateSnapshot, diffControlStates } from '../domain/control-state-events';
import { loadServiceSnapshot } from './service-snapshot.loader';

// D91 · Todo cambio de estado de un control deja un evento en `audit.compliance_events` (inmutable, REQ-044). El estado se deriva de los resultados, así que no hay un «momento»
// en que cambie: quien escribe algo que puede moverlo toma una foto de los controles del servicio ANTES, escribe, y llama a `recordControlStateChanges`, que toma la de DESPUÉS
// y escribe un evento por cada control que cambió. Todo dentro de la misma transacción: si el evento falla, la escritura se revierte.

/** Quién lo causó: una persona, o el sistema (la sonda al escribir un resultado: `userId` nulo). */
export type StateChangeActor = { userId: string | null; ipAddress: string | null; userAgent: string | null };

/** Qué escritura movió el estado; viaja en el evento. */
export type StateChangeCause = 'test_verdict' | 'evidence_submission' | 'evidence_review' | 'exclusion_approved' | 'probe_result';

export async function captureControlStates(tx: TransactionClient, serviceId: string): Promise<Map<string, ControlStateSnapshot>> {
  const data = await loadServiceSnapshot(tx, serviceId);
  return new Map(
    data.controls.map((control) => {
      const r = readControl(control, data.assets, data.results);
      return [control.id, { code: control.catalogCode ?? control.ownCode, state: r.state, readiness: r.readiness, progress: r.progress }] as const;
    }),
  );
}

/** Escribe un evento por cada control cuyo estado o semáforo cambió respecto de `before`. Devuelve cuántos escribió. */
export async function recordControlStateChanges(
  tx: TransactionClient,
  input: { tenantId: string; serviceId: string; before: ReadonlyMap<string, ControlStateSnapshot>; cause: StateChangeCause; actor: StateChangeActor },
): Promise<number> {
  const changes = diffControlStates(input.before, await captureControlStates(tx, input.serviceId));
  if (changes.length === 0) return 0;
  const value = (s: ControlStateSnapshot) => ({ state: s.state, readiness: s.readiness, progress: s.progress });
  await tx.complianceEvent.createMany({
    data: changes.map((c) => ({
      tenantId: input.tenantId,
      userId: input.actor.userId,
      changedField: 'control.state',
      previousValue: value(c.before) as Prisma.InputJsonObject,
      newValue: { control_id: c.controlId, control_code: c.code, service_id: input.serviceId, cause: input.cause, ...value(c.after) } as Prisma.InputJsonObject,
      ipAddress: input.actor.ipAddress,
      userAgent: input.actor.userAgent,
    })),
  });
  return changes.length;
}
