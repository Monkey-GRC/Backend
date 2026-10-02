import { Module } from '@nestjs/common';
import { CapabilityCatalogRepository } from './domain/repositories/capability-catalog.repository';
import { FrameworkCatalogRepository } from './domain/repositories/framework-catalog.repository';
import { CapabilityCatalogPrismaRepository } from './infrastructure/repositories/capability-catalog.prisma.repository';
import { RegulationCatalogRepository } from './domain/repositories/regulation-catalog.repository';
import { GetCatalogUseCase } from './application/use-cases/get-catalog.use-case';
import { GetContractedFrameworksUseCase } from './application/use-cases/get-contracted-frameworks.use-case';
import { FrameworkCatalogPrismaRepository } from './infrastructure/repositories/framework-catalog.prisma.repository';
import { RegulationCatalogPrismaRepository } from './infrastructure/repositories/regulation-catalog.prisma.repository';
import { CatalogsController } from './presentation/catalogs.controller';

@Module({
  controllers: [CatalogsController],
  providers: [
    { provide: RegulationCatalogRepository, useClass: RegulationCatalogPrismaRepository },
    { provide: FrameworkCatalogRepository, useClass: FrameworkCatalogPrismaRepository },
    { provide: CapabilityCatalogRepository, useClass: CapabilityCatalogPrismaRepository },
    GetCatalogUseCase,
    GetContractedFrameworksUseCase,
  ],
})
export class CatalogsModule {}
