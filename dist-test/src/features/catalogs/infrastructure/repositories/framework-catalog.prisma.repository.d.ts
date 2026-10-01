import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { FrameworkItem } from '../../domain/entities/catalog-item';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';
export declare class FrameworkCatalogPrismaRepository extends FrameworkCatalogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<FrameworkItem[]>;
}
