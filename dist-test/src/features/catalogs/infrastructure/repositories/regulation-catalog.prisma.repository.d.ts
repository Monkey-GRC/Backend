import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { RegulationItem } from '../../domain/entities/catalog-item';
import { RegulationCatalogRepository } from '../../domain/repositories/regulation-catalog.repository';
export declare class RegulationCatalogPrismaRepository extends RegulationCatalogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<RegulationItem[]>;
}
