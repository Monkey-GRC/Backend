import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TechnicalControlRepository } from './domain/repositories/technical-control.repository';
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
import { createConnectionProbe } from './infrastructure/probes/connection-probe.factory';
import { TechnicalControlPrismaRepository } from './infrastructure/repositories/technical-control.prisma.repository';
import { AssetsController } from './presentation/assets.controller';
import { TechnicalControlController } from './presentation/technical-control.controller';

@Module({
  controllers: [TechnicalControlController, AssetsController],
  providers: [
    { provide: TechnicalControlRepository, useClass: TechnicalControlPrismaRepository },
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
  ],
})
export class TechnicalControlModule {}
