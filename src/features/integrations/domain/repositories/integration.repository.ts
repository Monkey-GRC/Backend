import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { CatalogIntegration, IntegrationConnections, IntegrationDetailRecord } from '../entities/integration.entities';

export abstract class IntegrationRepository {
  // El catálogo en su orden (medición antes que flujo de trabajo, luego `sort_order`) con `connected` de la empresa.
  abstract findCatalog(scope: TenantScope): Promise<CatalogIntegration[]>;
  // Cada integración del catálogo con sus conexiones vigentes (activo `active`, sin padre, con aprovisionamiento) de la empresa.
  abstract findConnections(scope: TenantScope): Promise<IntegrationConnections[]>;
  // Una integración del catálogo con sus conexiones vigentes y lo que el catálogo dice de su plataforma; null si el código no existe.
  abstract findDetail(scope: TenantScope, code: string): Promise<IntegrationDetailRecord | null>;
}
