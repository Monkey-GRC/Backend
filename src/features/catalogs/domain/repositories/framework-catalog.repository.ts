import { FrameworkItem } from '../entities/catalog-item';

// catalog.frameworks: lectura libre para cualquier usuario autenticado (no lleva tenant).
export abstract class FrameworkCatalogRepository {
  abstract findAll(): Promise<FrameworkItem[]>;
}
