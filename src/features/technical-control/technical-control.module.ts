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
import { GetAssetReadinessUseCase, RecordScanUseCase } from './application/use-cases/scan.use-cases';
import { createConnectionProbe } from './infrastructure/probes/connection-probe.factory';
import { ScanPrismaRepository } from './infrastructure/repositories/scan.prisma.repository';
import { TechnicalControlPrismaRepository } from './infrastructure/repositories/technical-control.prisma.repository';
import { AssetsController } from './presentation/assets.controller';
import { TechnicalControlController } from './presentation/technical-control.controller';

@Module({
  controllers: [TechnicalControlController, AssetsController],
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
    RecordScanUseCase,
    GetAssetReadinessUseCase,
  ],
  exports: [RecordScanUseCase, GetAssetReadinessUseCase],
})
export class TechnicalControlModule {}
