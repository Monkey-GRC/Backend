import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { AssignmentRepository } from '../../domain/assignments/assignment.repository';
import { IntegrationConnections } from '../../domain/evidence/integration-connections';
import { ConnectedIntegrationCategories } from '../../domain/evidence/test-evidence-source';
import { WorkRepository } from '../../domain/work/work.repository';
import { scopeOf as grantOf } from '../../../../common/authorization/permission-matrix';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { buildWorkload, listAdminApprovals, listMyWork, pickMyControls, WorkListFilters } from './work-listing';

// contracts/gestion-usuarios.md · GET /v1/me/work y GET /v1/team/workload (D122). El estado de cada servicio se calcula UNA vez (`AssignmentRepository.load`, el mismo cálculo de
// `GET /v1/assignments`) y se reparte por persona en memoria: el número de consultas no depende de cuántas personas ni controles haya. Los roles los fija `@Can` en el controller.
@Injectable()
export class ListMyWorkUseCase {
  constructor(private readonly assignments: AssignmentRepository, private readonly work: WorkRepository, private readonly integrations: IntegrationConnections) {}

  async execute(p: Principal, f: WorkListFilters & { serviceId?: string }) {
    const scope = { companyId: p.companyId, userId: p.userId, role: p.role };
    // MD-529 · El `admin_empresa` solo ve su bandeja «Por aprobar» (`to_review`): lo que le toca decidir en cualquier control de la empresa, sin avance.
    if (grantOf('work.mine', p.role) === 'all') {
      if (f.bucket && f.bucket !== 'to_review') throw new ValidationException([{ field: 'bucket', code: 'bucket.invalid' }]);
      return { page: listAdminApprovals(p.userId, await this.assignments.load(scope, { serviceId: f.serviceId }), f), progress: null };
    }
    const data = await this.assignments.load(scope, { serviceId: f.serviceId, involvedUserId: p.userId });
    const mine = pickMyControls(p.userId, data);
    // Las integraciones conectadas de cada servicio, antes de abrir la transacción de la lectura.
    const connected = new Map<string, ConnectedIntegrationCategories>(
      await Promise.all([...new Set(mine.map((m) => m.service.id))].map(async (id) => [id, await this.integrations.connectedCategories(scope, id)] as const)),
    );
    const deliveries = await this.work.deliveriesOf(scope, mine.map((m) => m.readout.control.id), connected);
    return listMyWork(p.userId, mine, deliveries, f);
  }
}

@Injectable()
export class TeamWorkloadUseCase {
  constructor(private readonly assignments: AssignmentRepository, private readonly work: WorkRepository) {}

  async execute(p: Principal, locale?: string) {
    const scope = { companyId: p.companyId, userId: p.userId, role: p.role };
    const data = await this.assignments.load(scope, {});
    return buildWorkload(await this.work.people(scope), data, locale);
  }
}
