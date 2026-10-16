import { Module } from '@nestjs/common';
import { CreateControlUseCase } from './application/use-cases/create-control.use-case';
import { GetControlUseCase } from './application/use-cases/get-control.use-case';
import { ListChangesUseCase } from './application/use-cases/list-changes.use-case';
import { ListControlsUseCase } from './application/use-cases/list-controls.use-case';
import { CreateTreatmentUseCase, EvaluateRiskUseCase, EvaluationHistoryUseCase, ListTreatmentsUseCase } from './application/use-cases/risk-assessment.use-cases';
import { ProposeChangeUseCase } from './application/use-cases/propose-change.use-case';
import { CreateResponsibleUseCase, DeleteResponsibleUseCase, ListResponsiblesUseCase, UpdateResponsibleUseCase } from './application/use-cases/responsible.use-cases';
import {
  CreateCauseUseCase, CreateRiskUseCase, DeactivateCauseUseCase, DeactivateRiskUseCase, GetCauseUseCase, GetRiskUseCase, LinkUseCases, ListCausesUseCase, ListRisksUseCase,
  UpdateCauseUseCase, UpdateRiskUseCase,
} from './application/use-cases/risk.use-cases';
import { ControlChangeRepository } from './domain/repositories/control-change.repository';
import { ControlRepository } from './domain/repositories/control.repository';
import { RiskRepository } from './domain/repositories/risk.repository';
import { ResponsibleRepository } from './domain/repositories/responsible.repository';
import { ControlChangePrismaRepository } from './infrastructure/repositories/control-change.prisma.repository';
import { ControlPrismaRepository } from './infrastructure/repositories/control.prisma.repository';
import { RiskPrismaRepository } from './infrastructure/repositories/risk.prisma.repository';
import { ResponsiblePrismaRepository } from './infrastructure/repositories/responsible.prisma.repository';
import { ControlChangesController } from './presentation/control-changes.controller';
import { ControlsController } from './presentation/controls.controller';
import { ResponsiblesController } from './presentation/responsibles.controller';
import { RiskAssessmentController } from './presentation/risk-assessment.controller';
import { RisksController } from './presentation/risks.controller';

// Cumplimiento (modelo-datos.md §7 y §9). El motor de evaluación vive en `domain/engine/` (funciones puras).
@Module({
  controllers: [ControlsController, ControlChangesController, ResponsiblesController, RisksController, RiskAssessmentController],
  providers: [
    { provide: ControlRepository, useClass: ControlPrismaRepository },
    { provide: ControlChangeRepository, useClass: ControlChangePrismaRepository },
    ListControlsUseCase,
    GetControlUseCase,
    CreateControlUseCase,
    ProposeChangeUseCase,
    ListChangesUseCase,
    { provide: ResponsibleRepository, useClass: ResponsiblePrismaRepository },
    ListResponsiblesUseCase,
    CreateResponsibleUseCase,
    UpdateResponsibleUseCase,
    DeleteResponsibleUseCase,
    { provide: RiskRepository, useClass: RiskPrismaRepository },
    ListRisksUseCase, GetRiskUseCase, CreateRiskUseCase, UpdateRiskUseCase, DeactivateRiskUseCase,
    ListCausesUseCase, GetCauseUseCase, CreateCauseUseCase, UpdateCauseUseCase, DeactivateCauseUseCase, LinkUseCases,
    EvaluateRiskUseCase, EvaluationHistoryUseCase, CreateTreatmentUseCase, ListTreatmentsUseCase,
  ],
})
export class ComplianceModule {}
