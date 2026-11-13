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
  CompleteScaExecutionUseCase,
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
import { AgentInstallConfig } from './application/agent-install-config';
import {
  CompleteAgentRemovalUseCase,
  CompleteEnrollmentUseCase,
  GetAgentInstallStateUseCase,
  RegenerateAgentInstallUseCase,
  RevealAgentInstallUseCase,
  StartAgentInstallUseCase,
} from './application/use-cases/agent-install.use-cases';
import { AgentInstallRepository } from './domain/repositories/agent-install.repository';
import { AgentInstallPrismaRepository } from './infrastructure/repositories/agent-install.prisma.repository';
import { AgentInstallController, InstallScriptsController } from './presentation/agent-install.controller';
import { AgentReadingConfig } from './application/agent-reading-config';
import { QueueAgentReadingsUseCase } from './application/use-cases/agent-reading.use-cases';
import { AgentReadingScheduler } from './infrastructure/agent-reading.scheduler';

@Module({
  controllers: [TechnicalControlController, AssetsController, ConnectionTemplatesController, ExecutionsController, FindingsController, RunnerController, AgentInstallController, InstallScriptsController],
  providers: [
    { provide: TechnicalControlRepository, useClass: TechnicalControlPrismaRepository },
    { provide: ScanRepository, useClass: ScanPrismaRepository },
    // Instalar la sonda en un servidor (D112).
    { provide: AgentInstallRepository, useClass: AgentInstallPrismaRepository },
    AgentInstallConfig,
    GetAgentInstallStateUseCase,
    StartAgentInstallUseCase,
    RevealAgentInstallUseCase,
    RegenerateAgentInstallUseCase,
    CompleteEnrollmentUseCase,
    CompleteAgentRemovalUseCase,
    { provide: ConnectionCatalogRepository, useClass: ConnectionCatalogPrismaRepository },
    // La sonda la decide PROBE_MODE (por defecto «unavailable»; «simulated» solo fuera de producción).
    { provide: ConnectionProbe, useFactory: createConnectionProbe, inject: [ConfigService, ScanRepository] },
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
    CompleteScaExecutionUseCase,
    CompleteValidationUseCase,
    FailExecutionUseCase,
    // La lectura automática de la sonda de un servidor (D112): qué servidores tocan, quién los encola y la tarea que lo hace cada minuto.
    AgentReadingConfig,
    QueueAgentReadingsUseCase,
    AgentReadingScheduler,
  ],
  exports: [QueueExecutionUseCase, ListExecutionsUseCase, GetAssetReadinessUseCase, ImportScanUseCase, ClaimExecutionUseCase, CompleteExecutionUseCase, FailExecutionUseCase],
})
export class TechnicalControlModule {}
