import { FrameworkItem } from '../entities/catalog-item';
export declare abstract class FrameworkCatalogRepository {
    abstract findAll(): Promise<FrameworkItem[]>;
}
