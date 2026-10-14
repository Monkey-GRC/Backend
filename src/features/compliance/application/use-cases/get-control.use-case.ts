import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ControlReadout, readControl } from '../../domain/control-readout';
import { ControlDetailData, ControlRepository } from '../../domain/repositories/control.repository';
import { ViewMode, viewModeOf } from '../view-access';

export type ControlDetail = { view: ViewMode; readout: ControlReadout; evidence: ControlDetailData['evidence']; causes: ControlDetailData['causes'] };

@Injectable()
export class GetControlUseCase {
  constructor(private readonly controls: ControlRepository) {}

  async execute(principal: Principal, controlId: string, view: 'technical' | undefined): Promise<ControlDetail> {
    const mode = viewModeOf(principal, view);
    const data = await this.controls.loadControl({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, controlId);
    if (!data || data.controls.length === 0) throw new DomainError('NOT_FOUND');
    const readout = readControl(data.controls[0], data.assets, data.results);
    // Una acción de la propia empresa que el `funcional` no tiene asignada: no es de otra empresa (eso sería 404), es que no le toca (403).
    if (principal.role === 'funcional' && !readout.control.assignedUserIds.includes(principal.userId)) throw new DomainError('FORBIDDEN');
    return { view: mode, readout, evidence: data.evidence, causes: data.causes };
  }
}
