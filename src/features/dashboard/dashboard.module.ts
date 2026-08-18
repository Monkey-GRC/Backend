import { Module } from '@nestjs/common';
import { ChecklistModule } from 'src/features/checklist/checklist.module';
import { DashboardController } from './presentation/dashboard.controller';
import { ControlComplianceRepository } from './domain/repositories/control-compliance.repository';
import { ScaResultRepository } from './domain/repositories/sca-result.repository';
import { ControlCompliancePrismaRepository } from './infrastructure/repositories/control-compliance.prisma.repository';
import { ScaResultWazuhRepository } from './infrastructure/repositories/sca-result.wazuh.repository';
import { WazuhApiClient } from './infrastructure/wazuh/wazuh-api.client';
import { GetDashboardControlsUseCase } from './application/use-cases/get-dashboard-controls.use-case';
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.use-case';
import { GetControlChecksDetailUseCase } from './application/use-cases/get-control-checks-detail.use-case';

@Module({
  imports: [ChecklistModule],
  controllers: [DashboardController],
  providers: [
    WazuhApiClient,
    {
      provide: ControlComplianceRepository,
      useClass: ControlCompliancePrismaRepository,
    },
    {
      provide: ScaResultRepository,
      useClass: ScaResultWazuhRepository,
    },
    GetDashboardControlsUseCase,
    GetDashboardSummaryUseCase,
    GetControlChecksDetailUseCase,
  ],
})
export class DashboardModule {}
