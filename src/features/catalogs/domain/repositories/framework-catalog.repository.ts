import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { FrameworkItem } from '../entities/catalog-item';

// catalog.frameworks: lectura libre para cualquier usuario autenticado (no lleva tenant).
export abstract class FrameworkCatalogRepository {
  abstract findAll(): Promise<FrameworkItem[]>;

  // Solo los marcos que Monkey Admin contrató para la empresa del que consulta (D43).
  abstract findContracted(scope: TenantScope): Promise<FrameworkItem[]>;
}
