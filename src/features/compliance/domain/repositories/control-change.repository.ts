import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// Crear un control propio y proponer cambios (D65, modelo-datos.md §7.1). Toda escritura recibe su `audit`, que se escribe en la MISMA transacción: si el
// rastro falla, el cambio se revierte (SEG-36).

export type ChangeType = 'create' | 'retire' | 'edit_dimensions' | 'edit_interpretation';
export type ChangeStatus = 'pending' | 'approved' | 'rejected';
export type Person = { id: string; name: string | null; lastName: string | null };

export type ControlChange = {
  id: string;
  controlId: string;
  changeType: ChangeType;
  status: ChangeStatus;
  proposedValues: Record<string, unknown>;
  requestedBy: Person;
  requestedAt: Date;
  decidedBy: Person | null;
  decisionNote: string | null;
  decidedAt: Date | null;
};

/** Lo mínimo para decidir si alguien puede tocar una acción. Incluye las dadas de baja. */
export type ControlAccess = { id: string; serviceId: string; isActive: boolean; assignedUserIds: string[] };

export type OwnControlInput = { serviceId: string; name: string; interpretation: string; trustCriterion: string; requestedBy: string; meta: RequestMeta };
export type OwnControlCreated = { controlId: string; ownCode: string; change: ControlChange };

export abstract class ControlChangeRepository {
  // Las categorías que el servicio contrató; null si el servicio no existe (o es de otra empresa).
  abstract contractedCriteria(scope: TenantScope, serviceId: string): Promise<string[] | null>;

  // Crea el control propio (solo documental), su propuesta `create` pendiente y el evento de cumplimiento. El código `C01…` lo asigna el servidor.
  abstract createOwnControl(scope: TenantScope, input: OwnControlInput, audit: AuditIntent<OwnControlCreated>): Promise<OwnControlCreated>;

  // null si la acción no existe (o es de otra empresa).
  abstract findAccess(scope: TenantScope, controlId: string): Promise<ControlAccess | null>;

  // Lanza CHANGE_ALREADY_PENDING si ya hay una pendiente del mismo tipo.
  abstract propose(
    scope: TenantScope,
    input: { controlId: string; changeType: ChangeType; proposedValues: Record<string, unknown>; requestedBy: string },
    audit: AuditIntent<ControlChange>,
  ): Promise<ControlChange>;

  abstract listChanges(scope: TenantScope, controlId: string, filters: { status?: ChangeStatus; page: number; pageSize: number }): Promise<Page<ControlChange>>;
}
