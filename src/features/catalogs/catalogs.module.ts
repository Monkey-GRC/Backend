import { Module } from '@nestjs/common';
import { FrameworkCatalogRepository } from './domain/repositories/framework-catalog.repository';
import { RegulationCatalogRepository } from './domain/repositories/regulation-catalog.repository';
import { GetCatalogUseCase } from './application/use-cases/get-catalog.use-case';
import { FrameworkCatalogPrismaRepository } from './infrastructure/repositories/framework-catalog.prisma.repository';
import { RegulationCatalogPrismaRepository } from './infrastructure/repositories/regulation-catalog.prisma.repository';
import { CatalogsController } from './presentation/catalogs.controller';

@Module({
  controllers: [CatalogsController],
  providers: [
    { provide: RegulationCatalogRepository, useClass: RegulationCatalogPrismaRepository },
    { provide: FrameworkCatalogRepository, useClass: FrameworkCatalogPrismaRepository },
    GetCatalogUseCase,
  ],
})
export class CatalogsModule {}
