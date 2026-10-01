import { Catalog } from '../../domain/entities/catalog-item';
import { CapabilityCatalogRepository } from '../../domain/repositories/capability-catalog.repository';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';
import { RegulationCatalogRepository } from '../../domain/repositories/regulation-catalog.repository';
export declare class GetCatalogUseCase {
    private readonly regulations;
    private readonly frameworks;
    private readonly capabilities;
    constructor(regulations: RegulationCatalogRepository, frameworks: FrameworkCatalogRepository, capabilities: CapabilityCatalogRepository);
    execute(name: string): Promise<Catalog>;
}
