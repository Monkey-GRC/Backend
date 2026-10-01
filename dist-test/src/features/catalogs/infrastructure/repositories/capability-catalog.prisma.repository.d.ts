import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CapabilityItem } from '../../domain/entities/catalog-item';
import { CapabilityCatalogRepository } from '../../domain/repositories/capability-catalog.repository';
export declare class CapabilityCatalogPrismaRepository extends CapabilityCatalogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<CapabilityItem[]>;
}
