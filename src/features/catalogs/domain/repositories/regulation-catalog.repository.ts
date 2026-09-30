import { RegulationItem } from '../entities/catalog-item';

// catalog.regulations: lectura libre para cualquier usuario autenticado (no lleva tenant).
export abstract class RegulationCatalogRepository {
  abstract findAll(): Promise<RegulationItem[]>;
}
