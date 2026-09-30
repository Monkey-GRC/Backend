import { Module } from '@nestjs/common';
import { RegulationCatalogRepository } from './domain/repositories/regulation-catalog.repository';
import { GetCatalogUseCase } from './application/use-cases/get-catalog.use-case';
import { RegulationCatalogPrismaRepository } from './infrastructure/repositories/regulation-catalog.prisma.repository';
import { CatalogsController } from './presentation/catalogs.controller';

@Module({
  controllers: [CatalogsController],
  providers: [
    { provide: RegulationCatalogRepository, useClass: RegulationCatalogPrismaRepository },
    GetCatalogUseCase,
  ],
})
export class CatalogsModule {}
