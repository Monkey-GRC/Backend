import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';

// Crear, editar y dar de baja un control (D65, D96, modelo-datos.md §7.1). El admin_empresa lo hace directo, sin propuestas ni aprobación. Toda escritura recibe su
// `audit`, que se escribe en la MISMA transacción: si el rastro falla, el cambio se revierte (SEG-36).

/** Lo mínimo para decidir quién puede tocar un control (`ownerId`: su dueño, si tiene uno; el `responsable` edita solo los suyos, D150). Incluye los dados de baja. */
export type ControlAccess = { id: string; serviceId: string; isActive: boolean; origin: 'catalog' | 'own'; ownerId: string | null };

export type OwnControlInput = { serviceId: string; name: string; interpretation: string; trustCriterion: string; createdBy: string; meta: RequestMeta };
export type OwnControlCreated = { controlId: string; ownCode: string };

/** Una dimensión del control tal como queda: `reasonNotApplicable` es nulo cuando aplica. */
export type DimensionState = { dimension: string; applies: boolean; reasonNotApplicable: string | null };
export type ControlEdit = { interpretation?: string; dimensions?: DimensionState[] };
export type ControlSnapshot = { interpretation: string; dimensions: DimensionState[] };

/** La periodicidad del control (D147): la de sus requisitos y de dónde viene. */
export type PeriodicityState = { periodicity: string | null; source: 'catalog' | 'client'; justification: string | null };
export type PeriodicityChange = { changed: boolean; before: PeriodicityState; after: PeriodicityState };

export abstract class ControlEditRepository {
  // Las categorías que el servicio contrató; null si el servicio no existe (o es de otra empresa).
  abstract contractedCriteria(scope: TenantScope, serviceId: string): Promise<string[] | null>;

  // Crea el control propio (solo documental), aprobado y contando desde ya, y el evento de cumplimiento. El código `C01…` lo asigna el servidor.
  abstract createOwnControl(scope: TenantScope, input: OwnControlInput, audit: AuditIntent<OwnControlCreated>): Promise<OwnControlCreated>;

  // null si el control no existe (o es de otra empresa).
  abstract findAccess(scope: TenantScope, controlId: string): Promise<ControlAccess | null>;

  // null si no existe. CONTROL_RETIRED si está dado de baja. Una dimensión que el control no lleva es 422 `dimension.not_in_control`. Si cambian las dimensiones deja el evento
  // de cumplimiento y, si mueve el estado de algún control, el de su estado.
  abstract update(
    scope: TenantScope,
    controlId: string,
    edit: ControlEdit,
    actor: { userId: string; meta: RequestMeta },
    audit: AuditIntent<{ before: ControlSnapshot; after: ControlSnapshot }>,
  ): Promise<{ before: ControlSnapshot; after: ControlSnapshot } | null>;

  // MD-500, D147 · Pone la periodicidad en TODOS los requisitos del control (`null` = copiar otra vez la del catálogo y borrar el cambio). Si ya la tienen, no escribe nada ni deja rastro
  // (`changed: false`). Si cambia el estado de algún control, deja el evento (D91). null si el control no existe. CONTROL_RETIRED si está dado de baja.
  abstract setPeriodicity(
    scope: TenantScope,
    controlId: string,
    input: { periodicity: string | null; justification: string },
    actor: { userId: string; meta: RequestMeta },
    audit: AuditIntent<{ before: PeriodicityState; after: PeriodicityState }>,
  ): Promise<PeriodicityChange | null>;

  // Baja (`is_active = false`), no borrado. null si no existe. CONTROL_RETIRED si ya estaba de baja.
  abstract retire(scope: TenantScope, controlId: string, actor: { userId: string; meta: RequestMeta }, audit: AuditIntent<{ before: ControlSnapshot & { ownCode: string } }>): Promise<boolean>;
}