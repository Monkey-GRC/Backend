import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TechnicalControlRepository } from './domain/repositories/technical-control.repository';
import { ScanRepository } from './domain/repositories/scan.repository';
import { ConnectionProbe } from './domain/ports/connection-probe';
import {
  ActivateAssetUseCase,
  CreateAssetUseCase,
  GetAssetUseCase,
  ListAssetsUseCase,
  ScheduleAssetUseCase,
  ValidateAssetUseCase,
} from './application/use-cases/asset.use-cases';
import {
  GetTechnicalControlUseCase,
  SetDeploymentScenarioUseCase,
  SetScopeUseCase,
} from './application/use-cases/service-technical-control.use-cases';
import {
  ClaimExecutionUseCase,
  CompleteExecutionUseCase,
  FailExecutionUseCase,
  GetAssetReadinessUseCase,
  ImportScanUseCase,
  ListExecutionsUseCase,
  QueueExecutionUseCase,
} from './application/use-cases/scan.use-cases';
import { EngineOutputParser } from './domain/ports/engine-output-parser';
import { OcsfEngineOutputParser } from './infrastructure/engine/ocsf-parser';
import { createConnectionProbe } from './infrastructure/probes/connection-probe.factory';
import { ScanPrismaRepository } from './infrastructure/repositories/scan.prisma.repository';
import { TechnicalControlPrismaRepository } from './infrastructure/repositories/technical-control.prisma.repository';
import { AssetsController } from './presentation/assets.controller';
import { ExecutionsController } from './presentation/executions.controller';
import { RunnerController } from './presentation/runner.controller';
import { RunnerTokenGuard } from './presentation/runner-token.guard';
import { TechnicalControlController } from './presentation/technical-control.controller';

@Module({
  controllers: [TechnicalControlController, AssetsController, ExecutionsController, RunnerController],
  providers: [
    { provide: TechnicalControlRepository, useClass: TechnicalControlPrismaRepository },
    { provide: ScanRepository, useClass: ScanPrismaRepository },
    // La sonda la decide PROBE_MODE (por defecto «unavailable»; «simulated» solo fuera de producción).
    { provide: ConnectionProbe, useFactory: createConnectionProbe, inject: [ConfigService] },
    GetTechnicalControlUseCase,
    SetDeploymentScenarioUseCase,
    SetScopeUseCase,
    CreateAssetUseCase,
    ListAssetsUseCase,
    GetAssetUseCase,
    ValidateAssetUseCase,
    ActivateAssetUseCase,
    ScheduleAssetUseCase,
    { provide: EngineOutputParser, useClass: OcsfEngineOutputParser },
    RunnerTokenGuard,
    QueueExecutionUseCase,
    ListExecutionsUseCase,
    GetAssetReadinessUseCase,
    ImportScanUseCase,
    ClaimExecutionUseCase,
    CompleteExecutionUseCase,
    FailExecutionUseCase,
  ],
  exports: [QueueExecutionUseCase, ListExecutionsUseCase, GetAssetReadinessUseCase, ImportScanUseCase, ClaimExecutionUseCase, CompleteExecutionUseCase, FailExecutionUseCase],
})
export class TechnicalControlModule {}
