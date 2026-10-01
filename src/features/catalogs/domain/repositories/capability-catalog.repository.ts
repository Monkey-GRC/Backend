import { CapabilityItem } from '../entities/catalog-item';

// catalog.automated_capabilities: lectura libre para cualquier usuario autenticado. Nunca expone
// `provider`.
export abstract class CapabilityCatalogRepository {
  abstract findAll(): Promise<CapabilityItem[]>;
}
