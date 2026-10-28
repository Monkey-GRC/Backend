import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { ControlResponsibleRow, Dimension, DimensionOwnerRow } from '../team.types';

// Quién es responsable de qué (platform.service_dimension_owners y platform.user_control_assignments, D96). El responsable efectivo de un par (control, dimensión) es la
// excepción del control si existe; si no, el responsable del servicio en esa dimensión; si tampoco, ninguno. No se guarda una fila por control.

export type OwnerChange = { serviceId: string; dimension: Dimension; userId: string | null; assignedBy: string };
export type ResponsibleChange = { controlId: string; dimension: Dimension; userId: string | null; assignedBy: string };

export abstract class ResponsibilityRepository {
  // null si el servicio no existe (o es de otra empresa). Siempre las cinco dimensiones.
  abstract listDimensionOwners(scope: TenantScope, serviceId: string): Promise<DimensionOwnerRow[] | null>;

  // null si el servicio no existe. NOT_FOUND si el usuario no es un `funcional` activo o pendiente de la empresa; USER_LACKS_DIMENSION si no tiene esa especialidad.
  // `userId: null` deja la dimensión sin responsable del servicio (las excepciones de los controles se conservan).
  abstract setDimensionOwner(scope: TenantScope, change: OwnerChange, audit: AuditIntent<{ before: DimensionOwnerRow; after: DimensionOwnerRow }>): Promise<DimensionOwnerRow | null>;

  // null si el control no existe (o es de otra empresa). Una fila por cada dimensión en la que el control tiene pruebas.
  abstract listControlResponsibles(scope: TenantScope, controlId: string): Promise<ControlResponsibleRow[] | null>;

  // null si el control no existe o no tiene pruebas en esa dimensión. CONTROL_RETIRED si está dado de baja. Mismas validaciones del usuario que arriba.
  // `userId: null` quita la excepción y el control vuelve al responsable del servicio.
  abstract setControlResponsible(scope: TenantScope, change: ResponsibleChange, audit: AuditIntent<{ before: ControlResponsibleRow; after: ControlResponsibleRow }>): Promise<ControlResponsibleRow | null>;
}
