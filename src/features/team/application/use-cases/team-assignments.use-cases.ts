import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TeamAssignmentRepository } from '../../domain/repositories/team-assignment.repository';
import { SetExecutorDto, SetOwnerDto } from '../dtos/assignment.dto';
import { assignmentEntry } from './assignment-audit';

// contracts/gestion-usuarios.md · Asignación de controles (SEG-73). Quién puede qué lo fija `@Roles` en la ruta (dueño: `admin_empresa`; ejecutor: `responsable`); las reglas del cambio
// (a quién se puede asignar, qué controles) viven en `domain/assignment-plan.ts` y corren dentro de la transacción del repositorio, con las filas ya bloqueadas.
const scopeOf = (p: Principal) => ({ companyId: p.companyId, userId: p.userId, role: p.role });

@Injectable()
export class SetControlOwnerUseCase {
  constructor(private readonly repo: TeamAssignmentRepository) {}

  /** Devuelve cuántos controles cambiaron. */
  async execute(p: Principal, dto: SetOwnerDto, meta: RequestMeta): Promise<number> {
    const changes = await this.repo.setOwner(scopeOf(p), { controlIds: dto.client_control_ids, ownerId: dto.owner_id }, (done) => done.map((r) => assignmentEntry(p, meta, r)));
    return changes.length;
  }
}

@Injectable()
export class SetControlExecutorUseCase {
  constructor(private readonly repo: TeamAssignmentRepository) {}

  /** Devuelve cuántos controles cambiaron. */
  async execute(p: Principal, dto: SetExecutorDto, meta: RequestMeta): Promise<number> {
    const changes = await this.repo.setExecutor(scopeOf(p), { controlIds: dto.client_control_ids, executorId: dto.executor_id }, (done) => done.map((r) => assignmentEntry(p, meta, r)));
    return changes.length;
  }
}
