import { Injectable } from '@nestjs/common';
import { ComplianceReadings, type ComplianceTransaction, type ControlStatesPhoto, type GapScope } from '../../../../common/compliance/compliance-readings.port';
import type { EvaluationParameters } from '../../../../common/evaluation-parameters/parameters';
import type { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import type { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { gapScopeOf } from '../../domain/controls/control-readout';
import type { ControlStateSnapshot } from '../../domain/controls/control-state-events';
import { captureControlStates, recordControlStateChanges } from '../shared/control-state-events';
import { loadServiceSnapshot } from '../shared/service-snapshot.loader';

// MD-502 · El adaptador del puerto `ComplianceReadings`: technical-control pide estas lecturas sin importar nada de compliance.
@Injectable()
export class ComplianceReadingsPrisma extends ComplianceReadings {
  // La foto es opaca hacia afuera; aquí se guarda su contenido, atado al objeto que se entrega.
  private readonly photos = new WeakMap<ControlStatesPhoto, ReadonlyMap<string, ControlStateSnapshot>>();

  async loadGapScope(tx: TransactionClient, input: { serviceId: string; controlId: string; testId: string; parameters: EvaluationParameters }): Promise<GapScope | null> {
    const snapshot = await loadServiceSnapshot(tx, input.serviceId, input.parameters, input.controlId, { withLinkItems: true });
    const control = snapshot.controls.find((c) => c.id === input.controlId);
    return control ? gapScopeOf(control, input.testId, snapshot) : null;
  }

  async captureControlStates(tx: TransactionClient, serviceId: string, parameters: EvaluationParameters): Promise<ControlStatesPhoto> {
    const photo: ControlStatesPhoto = Object.freeze({});
    this.photos.set(photo, await captureControlStates(tx, serviceId, parameters));
    return photo;
  }

  async recordProbeStateChanges(tx: TransactionClient, input: { tenantId: string; serviceId: string; parameters: EvaluationParameters; before: ControlStatesPhoto; notifications: NotificationEmitter }): Promise<void> {
    const before = this.photos.get(input.before);
    if (!before) throw new Error('La foto de los controles no es de esta lectura.');
    await recordControlStateChanges(tx, {
      tenantId: input.tenantId, serviceId: input.serviceId, parameters: input.parameters, before, cause: 'probe_result', notifications: input.notifications, actor: { userId: null, ipAddress: null, userAgent: null },
    });
  }
}

export type { ComplianceTransaction };
