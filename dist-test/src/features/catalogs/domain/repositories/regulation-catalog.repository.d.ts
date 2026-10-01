import { RegulationItem } from '../entities/catalog-item';
export declare abstract class RegulationCatalogRepository {
    abstract findAll(): Promise<RegulationItem[]>;
}
