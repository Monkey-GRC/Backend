import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { AssignmentRepository } from '../../domain/assignments/assignment.repository';
import { WorkRepository } from '../../domain/work/work.repository';
import { buildWorkload, listMyWork, pickMyControls, WorkListFilters } from './work-listing';

// contracts/gestion-usuarios.md · GET /v1/me/work y GET /v1/team/workload (D122). El estado de cada servicio se calcula UNA vez (`AssignmentRepository.load`, el mismo cálculo de
// `GET /v1/assignments`) y se reparte por persona en memoria: el número de consultas no depende de cuántas personas ni controles haya. Los roles los fija `@Roles` en el controller.
@Injectable()
export class ListMyWorkUseCase {
  constructor(private readonly assignments: AssignmentRepository, private readonly work: WorkRepository) {}

  async execute(p: Principal, f: WorkListFilters & { serviceId?: string }) {
    const scope = { companyId: p.companyId, userId: p.userId, role: p.role };
    const data = await this.assignments.load(scope, { serviceId: f.serviceId, involvedUserId: p.userId });
    const mine = pickMyControls(p.userId, data);
    const deliveries = await this.work.deliveriesOf(scope, mine.map((m) => m.readout.control.id));
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
