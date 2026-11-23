import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { readControl } from '../../domain/controls/control-readout';
import { buildOverview, OverviewFramework } from '../../domain/overview/compliance-overview';
import { ControlRepository } from '../../domain/controls/control.repository';
import { ViewMode, viewModeOf } from '../shared/view-access';
import { canSeeControl } from '../../domain/controls/control-access';
import { isScopedRole } from '../../../../common/enums/user-role.enum';

// MD-137 · El resumen de un servicio: un bloque por marco contratado, con sus categorías en alcance y las acciones que fallan. Lo leen todos los roles de la empresa;
// la vista técnica, `auditor` y `admin_empresa` (D81, D96). `responsable` y `delegado` reciben el resumen de sus controles (D118).
@Injectable()
export class GetOverviewUseCase {
  constructor(private readonly controls: ControlRepository) {}

  async execute(principal: Principal, serviceId: string, requested: 'technical' | undefined): Promise<{ view: ViewMode; frameworks: OverviewFramework[] }> {
    const view = viewModeOf(principal, requested);
    const data = await this.controls.loadOverview({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, serviceId);
    if (!data) throw new DomainError('NOT_FOUND');
    const scoped = isScopedRole(principal.role);
    // D118 · El `responsable` y el `delegado` reciben el resumen de SUS controles, calculado con el mismo motor.
    const readouts = data.controls.filter((c) => canSeeControl(principal, c.access)).map((c) => readControl(c, data));
    const frameworks = buildOverview({
      readouts,
      frameworks: data.frameworks,
      criteria: data.criteria,
      placements: data.placements,
      scoped,
    });
    return { view, frameworks };
  }
}
