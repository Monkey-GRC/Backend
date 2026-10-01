import { CapabilityItem } from '../entities/catalog-item';
export declare abstract class CapabilityCatalogRepository {
    abstract findAll(): Promise<CapabilityItem[]>;
}
