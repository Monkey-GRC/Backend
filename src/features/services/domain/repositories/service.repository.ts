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
  // catalog.frameworks / catalog.regulations: lectura libre, sin tenant.
  abstract existingFrameworkCodes(codes: string[]): Promise<string[]>;
  abstract existingRegulationCodes(codes: string[]): Promise<string[]>;

  // Declara el servicio y clona el catálogo de sus marcos, todo en una sola transacción.
  // Lanza ORGANIZATION_NOT_DECLARED y SERVICE_NAME_TAKEN.
  abstract create(scope: TenantScope, input: ServiceInput): Promise<ServiceDetail>;

  abstract list(scope: TenantScope, request: PageRequest): Promise<Page<ServiceDetail>>;
  abstract findById(scope: TenantScope, id: string): Promise<ServiceDetail | null>;

  // null si el servicio no existe (o es de otra empresa: RLS no deja verlo).
  abstract update(scope: TenantScope, id: string, patch: ServicePatch): Promise<Change | null>;
  abstract setSystemDescription(
    scope: TenantScope,
    id: string,
    input: SystemDescriptionInput,
  ): Promise<Change | null>;

  // Lanza SERVICE_HAS_EVALUATIONS si ya tiene histórico. null si no existe.
  abstract remove(scope: TenantScope, id: string): Promise<ServiceDetail | null>;
}
