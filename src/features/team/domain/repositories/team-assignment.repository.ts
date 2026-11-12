import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ReleasedControl } from '../team.types';

// Dueño y ejecutor de los controles del cliente (platform.client_control_assignments). Cada operación es UNA transacción con las reglas de `domain/assignment-plan.ts`:
// todo o nada, y la auditoría (una entrada por control que cambió) se escribe en ella (SEG-36). Devuelve los controles que cambiaron; su número es `updated`.
// Orden de bloqueos (row-locks.ts): actor y dueño o ejecutor (KEY SHARE, por id) → filas de los controles (FOR NO KEY UPDATE, por id) → asignaciones (FOR UPDATE, por id).
export abstract class TeamAssignmentRepository {
  // NOT_FOUND (dueño o control ajeno o inexistente) · CONTROL_RETIRED · OWNER_NOT_ELIGIBLE. `ownerId = null` deja los controles «Sin asignar» (se borra la fila). Cambiar el dueño limpia el ejecutor.
  abstract setOwner(scope: TenantScope, input: { controlIds: string[]; ownerId: string | null }, audit: AuditIntent<ReleasedControl[]>): Promise<ReleasedControl[]>;

  // NOT_FOUND · FORBIDDEN (un control que no es del actor) · CONTROL_RETIRED · EXECUTOR_NOT_IN_TEAM. `executorId = null` quita el ejecutor.
  abstract setExecutor(scope: TenantScope, input: { controlIds: string[]; executorId: string | null }, audit: AuditIntent<ReleasedControl[]>): Promise<ReleasedControl[]>;
}
