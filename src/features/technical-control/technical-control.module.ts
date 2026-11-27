import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TechnicalControlRepository } from './domain/repositories/technical-control.repository';
import { ScanRepository } from './domain/repositories/scan.repository';
import { ConnectionCatalogRepository } from './domain/repositories/connection-catalog.repository';
import { CertificateIssuer } from './domain/ports/certificate-issuer';
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
  ReportExecutionProgressUseCase,
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
import { ForgeCertificateIssuer } from './infrastructure/security/forge-certificate.issuer';
import { HmacConsentTickets, JwksMicrosoftIdentityVerifier } from './infrastructure/security/microsoft-consent.adapters';
import { ConsentTickets, MicrosoftIdentityVerifier } from './domain/ports/microsoft-consent';
import { MicrosoftConsentCallbackController, MicrosoftConsentController } from './presentation/microsoft-consent.controller';
import { CompleteMicrosoftConsentUseCase, MicrosoftConsentedUseCase, MicrosoftSignedInUseCase, StartMicrosoftConsentUseCase } from './application/use-cases/microsoft-consent.use-cases';
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
import { CloudScheduleConfig } from './application/cloud-schedule-config';
import { QueueScheduledAssessmentsUseCase } from './application/use-cases/cloud-schedule.use-cases';
import { CloudScheduleScheduler } from './infrastructure/cloud-schedule.scheduler';
import { EvaluationParametersModule } from '../../infrastructure/evaluation-parameters/evaluation-parameters.module';

@Module({
  imports: [EvaluationParametersModule],
  controllers: [TechnicalControlController, AssetsController, ConnectionTemplatesController, ExecutionsController, FindingsController, RunnerController, AgentInstallController, InstallScriptsController, MicrosoftConsentController, MicrosoftConsentCallbackController],
  providers: [
    { provide: TechnicalControlRepository, useClass: TechnicalControlPrismaRepository },
    // Se evalúa al arrancar: un RUNNER_POOL inválido impide levantar el servidor (D112).
    { provide: RUNNER_POOL, useFactory: (config: ConfigService) => readRunnerPool(config.get<string>('RUNNER_POOL')), inject: [ConfigService] },
    { provide: ScanRepository, useClass: ScanPrismaRepository },
    // Instalar la sonda en un servidor (D113).
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
    { provide: ConnectionTemplates, useClass: StaticConnectionTemplates },
    // Microsoft 365 (D154): el certificado de cada conexión lo genera Monkey.
    { provide: CertificateIssuer, useFactory: () => new ForgeCertificateIssuer() },
    { provide: ConsentTickets, inject: [ConfigService], useFactory: (config: ConfigService) => new HmacConsentTickets(config) },
    { provide: MicrosoftIdentityVerifier, useFactory: () => new JwksMicrosoftIdentityVerifier() },
    StartMicrosoftConsentUseCase,
    MicrosoftSignedInUseCase,
    MicrosoftConsentedUseCase,
    CompleteMicrosoftConsentUseCase,
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
    ReportExecutionProgressUseCase,
    // La lectura automática de la sonda de un servidor (D113): qué servidores tocan, quién los encola y la tarea que lo hace cada minuto.
    AgentReadingConfig,
    QueueAgentReadingsUseCase,
    AgentReadingScheduler,
    CloudScheduleConfig,
    QueueScheduledAssessmentsUseCase,
    CloudScheduleScheduler,
  ],
  exports: [QueueExecutionUseCase, ListExecutionsUseCase, GetAssetReadinessUseCase, ImportScanUseCase, ClaimExecutionUseCase, CompleteExecutionUseCase, FailExecutionUseCase],
})
export class TechnicalControlModule {}
