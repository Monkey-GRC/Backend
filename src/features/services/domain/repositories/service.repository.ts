import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { PageRequest, Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import {
  ServiceDetail,
  ServiceInput,
  ServicePatch,
  SystemDescriptionInput,
} from '../entities/service.entity';

export type Change = { before: ServiceDetail; after: ServiceDetail };

// Los servicios de UNA empresa (tenant.services). Todo pasa por withScope: RLS impone el aislamiento
// entre empresas y el filtro por organización/servicio el aislamiento entre servicios.
export abstract class ServiceRepository {
  // catalog.frameworks: lectura libre, sin tenant.
  abstract existingFrameworkCodes(codes: string[]): Promise<string[]>;

  // Los marcos que Monkey Admin contrató para ESTA empresa (platform.company_frameworks, D47).
  abstract contractedFrameworkCodes(scope: TenantScope): Promise<string[]>;

  // Declara el servicio y clona el catálogo de sus marcos, todo en una sola transacción.
  // Lanza ORGANIZATION_NOT_DECLARED y SERVICE_NAME_TAKEN. Toda acción que cambia datos recibe su `audit`, que se
  // escribe en la MISMA transacción: si el rastro falla, el cambio se revierte (SEG-36).
  abstract create(scope: TenantScope, input: ServiceInput, audit: AuditIntent<ServiceDetail>): Promise<ServiceDetail>;

  abstract list(scope: TenantScope, request: PageRequest): Promise<Page<ServiceDetail>>;
  abstract findById(scope: TenantScope, id: string): Promise<ServiceDetail | null>;
  // D102 · ¿La persona es dueña o ejecutora de algún control de este servicio (`client_control_assignments`)? Es lo que le da a un `responsable` derecho a leerlo.
  abstract isResponsible(scope: TenantScope, serviceId: string): Promise<boolean>;

  // null si el servicio no existe (o es de otra empresa: RLS no deja verlo); en ese caso no hay cambio ni rastro.
  abstract update(
    scope: TenantScope,
    id: string,
    patch: ServicePatch,
    audit: AuditIntent<Change>,
  ): Promise<Change | null>;
  abstract setSystemDescription(
    scope: TenantScope,
    id: string,
    input: SystemDescriptionInput,
    audit: AuditIntent<Change>,
  ): Promise<Change | null>;

  // Lanza SERVICE_HAS_EVALUATIONS si ya tiene histórico. null si no existe.
  abstract remove(scope: TenantScope, id: string, audit: AuditIntent<ServiceDetail>): Promise<ServiceDetail | null>;
}
