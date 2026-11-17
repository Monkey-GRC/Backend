import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { isScopedRole } from '../../../../common/enums/user-role.enum';
import { Page } from '../../../../common/pagination/page';
import { AssignmentRepository } from '../../domain/assignments/assignment.repository';
import { AssignmentItem, AssignmentListFilters, listAssignments } from './assignment-listing';

// contracts/gestion-usuarios.md · GET /v1/assignments. `admin_monkey` recibe 403 de `@Roles`; `admin_empresa` y `auditor` ven todo; `responsable` y `delegado`, lo suyo (`canSeeControl`, D102).
@Injectable()
export class ListAssignmentsUseCase {
  constructor(private readonly repo: AssignmentRepository) {}

  async execute(p: Principal, f: AssignmentListFilters): Promise<Page<AssignmentItem>> {
    const data = await this.repo.load({ companyId: p.companyId, userId: p.userId, role: p.role }, {
      serviceId: f.serviceId, frameworkId: f.frameworkId, assignment: f.assignment, ownerId: f.ownerId, executorId: f.executorId,
      involvedUserId: isScopedRole(p.role) ? p.userId : undefined,
    });
    return listAssignments(p, data, f);
  }
}
