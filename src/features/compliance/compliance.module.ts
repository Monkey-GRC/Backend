import { Module } from '@nestjs/common';
import { SetEvaluationPeriodUseCase } from './application/use-cases/evaluation-period.use-cases';
import { ListExclusionsUseCase, RequestExclusionUseCase } from './application/use-cases/exclusion.use-cases';
import {
  CreateEvidenceRequirementUseCase, GetEvidenceDownloadUseCase, ListEvidenceUseCase, ListSubmissionsUseCase, ListTestEvidenceUseCase, ReviewEvidenceUseCase, UploadEvidenceUseCase, UploadTestEvidenceUseCase,
} from './application/use-cases/evidence.use-cases';
import { CreateControlUseCase } from './application/use-cases/create-control.use-case';
import { RetireControlUseCase, UpdateControlUseCase } from './application/use-cases/edit-control.use-cases';
import { GetControlUseCase } from './application/use-cases/get-control.use-case';
import { ListControlTestsUseCase } from './application/use-cases/list-control-tests.use-case';
import { GetOverviewUseCase } from './application/use-cases/get-overview.use-case';
import { ListControlsUseCase } from './application/use-cases/list-controls.use-case';
import { CreateTreatmentUseCase, EvaluateRiskUseCase, EvaluationHistoryUseCase, ListTreatmentsUseCase } from './application/use-cases/risk-assessment.use-cases';
import { IssueVerdictUseCase, ListVerdictsUseCase } from './application/use-cases/verdict.use-cases';
import { CreateResponsibleUseCase, DeleteResponsibleUseCase, ListResponsiblesUseCase, UpdateResponsibleUseCase } from './application/use-cases/responsible.use-cases';
import {
  CreateCauseUseCase, CreateRiskUseCase, DeactivateCauseUseCase, DeactivateRiskUseCase, GetCauseUseCase, GetRiskUseCase, LinkUseCases, ListCausesUseCase, ListRisksUseCase, ReactivateRiskUseCase,
  UpdateCauseUseCase, UpdateRiskUseCase,
} from './application/use-cases/risk.use-cases';
import { ControlEditRepository } from './domain/repositories/control-edit.repository';
import { ControlRepository } from './domain/repositories/control.repository';
import { EvidenceRepository } from './domain/repositories/evidence.repository';
import { EvaluationPeriodRepository } from './domain/repositories/evaluation-period.repository';
import { ExclusionRepository } from './domain/repositories/exclusion.repository';
import { TestVerdictRepository } from './domain/repositories/test-verdict.repository';
import { RiskRepository } from './domain/repositories/risk.repository';
import { ResponsibleRepository } from './domain/repositories/responsible.repository';
import { ControlEditPrismaRepository } from './infrastructure/repositories/control-edit.prisma.repository';
import { EvidencePrismaRepository } from './infrastructure/repositories/evidence.prisma.repository';
import { EvaluationPeriodPrismaRepository } from './infrastructure/repositories/evaluation-period.prisma.repository';
import { ExclusionPrismaRepository } from './infrastructure/repositories/exclusion.prisma.repository';
import { TestVerdictPrismaRepository } from './infrastructure/repositories/test-verdict.prisma.repository';
import { ControlPrismaRepository } from './infrastructure/repositories/control.prisma.repository';
import { RiskPrismaRepository } from './infrastructure/repositories/risk.prisma.repository';
import { ResponsiblePrismaRepository } from './infrastructure/repositories/responsible.prisma.repository';
import { VerdictsController } from './presentation/verdicts.controller';
import { ControlsController } from './presentation/controls.controller';
import { EvaluationPeriodController } from './presentation/evaluation-period.controller';
import { EvidenceController } from './presentation/evidence.controller';
import { ExclusionsController } from './presentation/exclusions.controller';
import { OverviewController } from './presentation/overview.controller';
import { ResponsiblesController } from './presentation/responsibles.controller';
import { RiskAssessmentController } from './presentation/risk-assessment.controller';
import { RisksController } from './presentation/risks.controller';

// Cumplimiento (modelo-datos.md §7 y §9). El motor de evaluación vive en `domain/engine/` (funciones puras).
@Module({
  controllers: [ControlsController, ResponsiblesController, RisksController, RiskAssessmentController, ExclusionsController, EvidenceController, OverviewController, VerdictsController, EvaluationPeriodController],
  providers: [
    { provide: ControlRepository, useClass: ControlPrismaRepository },
    { provide: ControlEditRepository, useClass: ControlEditPrismaRepository },
    ListControlsUseCase,
    GetControlUseCase,
    GetOverviewUseCase,
    CreateControlUseCase,
    UpdateControlUseCase,
    RetireControlUseCase,
    { provide: ResponsibleRepository, useClass: ResponsiblePrismaRepository },
    ListResponsiblesUseCase,
    CreateResponsibleUseCase,
    UpdateResponsibleUseCase,
    DeleteResponsibleUseCase,
    { provide: RiskRepository, useClass: RiskPrismaRepository },
    ListRisksUseCase, GetRiskUseCase, CreateRiskUseCase, UpdateRiskUseCase, DeactivateRiskUseCase, ReactivateRiskUseCase,
    ListCausesUseCase, GetCauseUseCase, CreateCauseUseCase, UpdateCauseUseCase, DeactivateCauseUseCase, LinkUseCases,
    EvaluateRiskUseCase, EvaluationHistoryUseCase, CreateTreatmentUseCase, ListTreatmentsUseCase,
    { provide: ExclusionRepository, useClass: ExclusionPrismaRepository },
    ListExclusionsUseCase, RequestExclusionUseCase,
    { provide: EvaluationPeriodRepository, useClass: EvaluationPeriodPrismaRepository },
    SetEvaluationPeriodUseCase,
    { provide: TestVerdictRepository, useClass: TestVerdictPrismaRepository },
    IssueVerdictUseCase, ListVerdictsUseCase,
    { provide: EvidenceRepository, useClass: EvidencePrismaRepository },
    ListEvidenceUseCase, ListSubmissionsUseCase, UploadEvidenceUseCase, GetEvidenceDownloadUseCase, ReviewEvidenceUseCase, CreateEvidenceRequirementUseCase, UploadTestEvidenceUseCase, ListTestEvidenceUseCase, ListControlTestsUseCase,
  ],
})
export class ComplianceModule {}
