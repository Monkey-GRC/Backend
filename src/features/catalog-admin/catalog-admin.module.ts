import { Module } from '@nestjs/common';
import {
  GetCatalogCauseUseCase,
  GetCatalogControlUseCase,
  GetCatalogRiskUseCase,
  GetCatalogTestUseCase,
  GetFrameworkUseCase,
  ListCatalogCausesUseCase,
  ListCatalogControlsUseCase,
  ListCatalogEvidenceTemplatesUseCase,
  ListCatalogRisksUseCase,
  ListCatalogTestsUseCase,
  ListFrameworkControlsUseCase,
  ListFrameworksUseCase,
} from './application/use-cases/catalog-queries.use-cases';
import { CatalogAdminRepository } from './domain/repositories/catalog-admin.repository';
import { CatalogAdminPrismaRepository } from './infrastructure/repositories/catalog-admin.prisma.repository';
import { CatalogAdminController } from './presentation/catalog-admin.controller';

// El catálogo maestro visto desde Monkey Admin (contracts/modules/monkey-admin-catalog.md). Hoy solo lectura; la escritura llega después.
@Module({
  controllers: [CatalogAdminController],
  providers: [
    { provide: CatalogAdminRepository, useClass: CatalogAdminPrismaRepository },
    ListFrameworksUseCase,
    GetFrameworkUseCase,
    ListFrameworkControlsUseCase,
    ListCatalogControlsUseCase,
    GetCatalogControlUseCase,
    ListCatalogRisksUseCase,
    GetCatalogRiskUseCase,
    ListCatalogCausesUseCase,
    GetCatalogCauseUseCase,
    ListCatalogTestsUseCase,
    GetCatalogTestUseCase,
    ListCatalogEvidenceTemplatesUseCase,
  ],
})
export class CatalogAdminModule {}
