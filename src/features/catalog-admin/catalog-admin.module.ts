import { Module } from '@nestjs/common';
import {
  GetCatalogCauseUseCase,
  GetCatalogControlUseCase,
  GetCatalogEvidenceTemplateUseCase,
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
import { CatalogLinks, CauseWrites, ControlWrites, EvidenceTemplateWrites, ListPointsOfFocusUseCase, RiskWrites, TestWrites } from './application/use-cases/catalog-write.use-cases';
import { CatalogAdminRepository } from './domain/repositories/catalog-admin.repository';
import { CatalogAdminWriteRepository } from './domain/repositories/catalog-admin-write.repository';
import { CatalogAdminPrismaRepository } from './infrastructure/repositories/catalog-admin.prisma.repository';
import { CatalogAdminWritePrismaRepository } from './infrastructure/repositories/catalog-admin-write.prisma.repository';
import { ListEvaluationParametersUseCase, UpdateEvaluationParameterUseCase } from './application/use-cases/evaluation-parameters.use-cases';
import { EvaluationParametersAdminRepository } from './domain/repositories/evaluation-parameters.repository';
import { EvaluationParametersAdminPrismaRepository } from './infrastructure/repositories/evaluation-parameters-admin.prisma.repository';
import { EvaluationParametersController } from './presentation/evaluation-parameters.controller';
import { CatalogAdminController } from './presentation/catalog-admin.controller';
import { CatalogAdminWriteController } from './presentation/catalog-admin-write.controller';

// El catálogo maestro visto desde Monkey Admin (contracts/modules/monkey-admin-catalog.md). Lectura y escritura (crear, editar, dar de baja y vincular); todo exclusivo de `admin_monkey`.
@Module({
  controllers: [CatalogAdminController, CatalogAdminWriteController, EvaluationParametersController],
  providers: [
    { provide: CatalogAdminRepository, useClass: CatalogAdminPrismaRepository },
    { provide: CatalogAdminWriteRepository, useClass: CatalogAdminWritePrismaRepository },
    { provide: EvaluationParametersAdminRepository, useClass: EvaluationParametersAdminPrismaRepository },
    ListEvaluationParametersUseCase,
    UpdateEvaluationParameterUseCase,
    ControlWrites,
    RiskWrites,
    CauseWrites,
    EvidenceTemplateWrites,
    TestWrites,
    CatalogLinks,
    ListPointsOfFocusUseCase,
    GetCatalogEvidenceTemplateUseCase,
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
