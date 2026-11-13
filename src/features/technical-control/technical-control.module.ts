import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TechnicalControlRepository } from './domain/repositories/technical-control.repository';
import { ScanRepository } from './domain/repositories/scan.repository';
import { ConnectionCatalogRepository } from './domain/repositories/connection-catalog.repository';
import { ConnectionProbe } from './domain/ports/connection-probe';
import {
  ActivateAssetUseCase,
  CreateAssetUseCase,
  GetAssetUseCase,
  ListAssetsUseCase,
  ScheduleAssetUseCase,
  SetAssetConnectionUseCase,
  UpdateAssetUseCase,
  RetireAssetUseCase,
  ListAssetResourcesUseCase,
  SetServiceAssetsUseCase,
  ValidateAssetUseCase,
} from './application/use-cases/asset.use-cases';
import { GetTechnicalControlUseCase } from './application/use-cases/service-technical-control.use-cases';
import {
  ClaimExecutionUseCase,
  CompleteExecutionUseCase,
  CompleteValidationUseCase,
  FailExecutionUseCase,
  GetAssetReadinessUseCase,
  ImportScanUseCase,
  ListExecutionsUseCase,
  QueueExecutionUseCase,
} from './application/use-cases/scan.use-cases';
import { ListFindingsUseCase } from './application/use-cases/findings.use-cases';
import { EngineOutputParser } from './domain/ports/engine-output-parser';
import { OcsfEngineOutputParser } from './infrastructure/engine/ocsf-parser';
import { RUNNER_POOL, readRunnerPool } from './application/runner-pool';
import { ConnectionTemplates } from './application/connection-templates';
import { StaticConnectionTemplates } from './infrastructure/templates/connection-templates.provider';
import { createConnectionProbe } from './infrastructure/probes/connection-probe.factory';
import { ConnectionCatalogPrismaRepository } from './infrastructure/repositories/connection-catalog.prisma.repository';
import { ScanPrismaRepository } from './infrastructure/repositories/scan.prisma.repository';
import { TechnicalControlPrismaRepository } from './infrastructure/repositories/technical-control.prisma.repository';
import { AssetsController } from './presentation/assets.controller';
import { ConnectionTemplatesController } from './presentation/connection-templates.controller';
import { ExecutionsController } from './presentation/executions.controller';
import { FindingsController } from './presentation/findings.controller';
import { RunnerController } from './presentation/runner/runner.controller';
import { RunnerTokenGuard } from './presentation/runner/runner-token.guard';
import { TechnicalControlController } from './presentation/technical-control.controller';

@Module({
  controllers: [TechnicalControlController, AssetsController, ConnectionTemplatesController, ExecutionsController, FindingsController, RunnerController],
  providers: [
    { provide: TechnicalControlRepository, useClass: TechnicalControlPrismaRepository },
    // Se evalúa al arrancar: un RUNNER_POOL inválido impide levantar el servidor (D112).
    { provide: RUNNER_POOL, useFactory: (config: ConfigService) => readRunnerPool(config.get<string>('RUNNER_POOL')), inject: [ConfigService] },
    { provide: ScanRepository, useClass: ScanPrismaRepository },
    { provide: ConnectionCatalogRepository, useClass: ConnectionCatalogPrismaRepository },
    // La sonda la decide PROBE_MODE (por defecto «unavailable»; «simulated» solo fuera de producción).
    { provide: ConnectionProbe, useFactory: createConnectionProbe, inject: [ConfigService, ScanRepository] },
    { provide: ConnectionTemplates, useClass: StaticConnectionTemplates },
    GetTechnicalControlUseCase,
    CreateAssetUseCase,
    ListAssetsUseCase,
    GetAssetUseCase,
    ValidateAssetUseCase,
    ActivateAssetUseCase,
    ScheduleAssetUseCase,
    SetAssetConnectionUseCase,
    UpdateAssetUseCase,
    RetireAssetUseCase,
    ListAssetResourcesUseCase,
    SetServiceAssetsUseCase,
    { provide: EngineOutputParser, useClass: OcsfEngineOutputParser },
    RunnerTokenGuard,
    QueueExecutionUseCase,
    ListExecutionsUseCase,
    GetAssetReadinessUseCase,
    ListFindingsUseCase,
    ImportScanUseCase,
    ClaimExecutionUseCase,
    CompleteExecutionUseCase,
    CompleteValidationUseCase,
    FailExecutionUseCase,
  ],
  exports: [QueueExecutionUseCase, ListExecutionsUseCase, GetAssetReadinessUseCase, ImportScanUseCase, ClaimExecutionUseCase, CompleteExecutionUseCase, FailExecutionUseCase],
})
export class TechnicalControlModule {}
