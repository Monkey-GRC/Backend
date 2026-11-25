import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { isScopedRole } from '../../../../common/enums/user-role.enum';
import { Page } from '../../../../common/pagination/page';
import { ControlState } from '../../domain/engine/states';
import { AssignmentRepository } from '../../domain/assignments/assignment.repository';
import { AssignmentItem, AssignmentListFilters, pickAssignments } from './assignment-listing';

// contracts/gestion-usuarios.md · GET /v1/assignments. `admin_monkey` recibe 403 de `@Roles`; `admin_empresa` y `auditor` ven todo; `responsable` y `delegado`, lo suyo (`canSeeControl`, D102).
// El estado de un control se deriva y es lo caro (motor v2 por servicio): sin el filtro `status` solo se calcula el de los controles de la página que se pide; con él, el de todos los que
// pasaron los demás filtros, porque hay que filtrar y paginar después de calcularlo.
@Injectable()
export class ListAssignmentsUseCase {
  constructor(private readonly repo: AssignmentRepository) {}

  async execute(p: Principal, f: AssignmentListFilters): Promise<Page<AssignmentItem>> {
    const scope = { companyId: p.companyId, userId: p.userId, role: p.role };
    const data = await this.repo.loadCandidates(scope, {
      serviceId: f.serviceId, frameworkId: f.frameworkId, assignment: f.assignment, ownerId: f.ownerId, executorId: f.executorId,
      involvedUserId: isScopedRole(p.role) ? p.userId : undefined,
    });
    const picks = pickAssignments(p, data, f);
    const start = (f.page - 1) * f.pageSize;
    if (!f.status) {
      const shown = picks.slice(start, start + f.pageSize);
      const states = shown.length ? await this.repo.statesOf(scope, shown.map((i) => i.clientControlId)) : new Map<string, ControlState>();
      // Un control que se dio de baja entre las dos lecturas ya no se lista.
      return { items: shown.flatMap((i) => { const state = states.get(i.clientControlId); return state ? [{ ...i, state }] : []; }), total: picks.length, page: f.page, pageSize: f.pageSize };
    }
    const states = await this.repo.statesOf(scope, picks.map((i) => i.clientControlId));
    const matching = picks.flatMap((i) => (states.get(i.clientControlId) === f.status ? [{ ...i, state: f.status as ControlState }] : []));
    return { items: matching.slice(start, start + f.pageSize), total: matching.length, page: f.page, pageSize: f.pageSize };
  }
}
