import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { CheckLinkReadout, checkLinksByTest, ControlReadout, readControl } from '../../domain/controls/control-readout';
import { ControlDetailData, ControlRepository } from '../../domain/controls/control.repository';
import { IntegrationConnections } from '../../domain/evidence/integration-connections';
import { ConnectedIntegrationCategories } from '../../domain/evidence/test-evidence-source';
import { ViewMode, viewModeOf } from '../shared/view-access';
import { canSeeControl } from '../../domain/controls/control-access';

export type ControlDetail = { view: ViewMode; readout: ControlReadout; evidence: ControlDetailData['evidence']; causes: ControlDetailData['causes']; checkLinks: Map<string, CheckLinkReadout[]>; connectedIntegrations: ConnectedIntegrationCategories };

@Injectable()
export class GetControlUseCase {
  constructor(private readonly controls: ControlRepository, private readonly integrations: IntegrationConnections) {}

  async execute(principal: Principal, controlId: string, view: 'technical' | undefined): Promise<ControlDetail> {
    const mode = viewModeOf(principal, view);
    const data = await this.controls.loadControl({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, controlId, mode === 'technical');
    if (!data || data.controls.length === 0) throw new DomainError('NOT_FOUND');
    const readout = readControl(data.controls[0], data);
    // Un control de la propia empresa del que no es dueño ni ejecutor: no es de otra empresa (eso sería 404), es que no le toca (403).
    if (!canSeeControl(principal, readout.control.access)) throw new DomainError('FORBIDDEN');
    const checkLinks = mode === 'technical' ? checkLinksByTest(readout.control, data) : new Map<string, CheckLinkReadout[]>();
    // MD-499 · Qué pruebas aceptan subida (y cuáles solo de respaldo) depende de las integraciones que el servicio tenga conectadas.
    const connectedIntegrations = await this.integrations.connectedCategories({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, readout.control.serviceId);
    return { view: mode, readout, evidence: data.evidence, causes: data.causes, checkLinks, connectedIntegrations };
  }
}
