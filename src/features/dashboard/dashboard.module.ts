import { Module } from '@nestjs/common';
import { ChecklistModule } from 'src/features/checklist/checklist.module';
import { AssetModule } from 'src/features/asset/asset.module';
import { DashboardController } from './presentation/dashboard.controller';
import { ControlComplianceRepository } from './domain/repositories/control-compliance.repository';
import { ControlCompliancePrismaRepository } from './infrastructure/repositories/control-compliance.prisma.repository';
import { GetDashboardControlsUseCase } from './application/use-cases/get-dashboard-controls.use-case';
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.use-case';
import { GetDashboardServersUseCase } from './application/use-cases/get-dashboard-servers.use-case';
import { GetControlChecksDetailUseCase } from './application/use-cases/get-control-checks-detail.use-case';

@Module({
  imports: [ChecklistModule, AssetModule],
  controllers: [DashboardController],
  providers: [
    {
      provide: ControlComplianceRepository,
      useClass: ControlCompliancePrismaRepository,
    },
    GetDashboardControlsUseCase,
    GetDashboardSummaryUseCase,
    GetDashboardServersUseCase,
    GetControlChecksDetailUseCase,
  ],
})
export class DashboardModule {}
