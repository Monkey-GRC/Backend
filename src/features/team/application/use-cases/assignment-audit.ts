import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { AssignmentState, ReleasedControl } from '../../domain/team.types';

// Una entrada `control_assignment.set` por control cuyo dueño o ejecutor cambia (contracts/gestion-usuarios.md · Auditoría); el control va en el estado porque la entrada no tiene columna de recurso.
const assignmentState = (controlId: string, s: AssignmentState) => ({ client_control_id: controlId, owner_id: s.ownerId, executor_id: s.executorId });

export const assignmentEntry = (p: Principal, meta: RequestMeta, r: ReleasedControl): AuditEntry => ({
  tenantId: p.companyId, userId: p.userId, action: 'control_assignment.set', resource: 'control_assignment', result: 'success', ipAddress: meta.ipAddress, userAgent: meta.userAgent,
  beforeState: assignmentState(r.controlId, r.before), afterState: assignmentState(r.controlId, r.after),
});
