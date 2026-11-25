import { Module } from '@nestjs/common';
import { ListEvaluationPeriodsUseCase, RollEvaluationPeriodsUseCase, SetEvaluationPeriodUseCase } from './application/periods/evaluation-period.use-cases';
import { ListExclusionsUseCase, RequestExclusionUseCase } from './application/exclusions/exclusion.use-cases';
import {
  AnswerObservationUseCase, CreateObservationUseCase, GetObservationUseCase, ListObservationsUseCase, UpdateObservationUseCase,
} from './application/observations/observation.use-cases';
import {
  CreateEvidenceRequirementUseCase, GetEvidenceDownloadUseCase, ListEvidenceUseCase, ListServiceEvidenceUseCase, ListSubmissionsUseCase, ListTestEvidenceUseCase, ReviewEvidenceUseCase, UploadEvidenceUseCase, UploadTestEvidenceUseCase,
} from './application/evidence/evidence.use-cases';
import { ListAssignmentsUseCase } from './application/assignments/list-assignments.use-case';
import { ListMyWorkUseCase, TeamWorkloadUseCase } from './application/work/work.use-cases';
import { CreateControlUseCase } from './application/controls/create-control.use-case';
import { RetireControlUseCase, SetControlPeriodicityUseCase, UpdateControlUseCase } from './application/controls/edit-control.use-cases';
import { GetControlUseCase } from './application/controls/get-control.use-case';
import { ListControlTestsUseCase } from './application/controls/list-control-tests.use-case';
import { GetOverviewUseCase } from './application/overview/get-overview.use-case';
import { ListControlsUseCase } from './application/controls/list-controls.use-case';
import { CreateTreatmentUseCase, EvaluateRiskUseCase, EvaluationHistoryUseCase, ListTreatmentsUseCase } from './application/risks/risk-assessment.use-cases';
import { IssueVerdictUseCase, ListVerdictsUseCase, ReviewVerdictUseCase } from './application/verdicts/verdict.use-cases';
import { CreateResponsibleUseCase, DeleteResponsibleUseCase, ListResponsiblesUseCase, UpdateResponsibleUseCase } from './application/responsibles/responsible.use-cases';
import {
  CreateCauseUseCase, CreateRiskUseCase, DeactivateCauseUseCase, DeactivateRiskUseCase, GetCauseUseCase, GetRiskUseCase, LinkUseCases, ListCausesUseCase, ListRisksUseCase, ReactivateRiskUseCase,
  UpdateCauseUseCase, UpdateRiskUseCase,
} from './application/risks/risk.use-cases';
import { AssignmentRepository } from './domain/assignments/assignment.repository';
import { ControlEditRepository } from './domain/controls/control-edit.repository';
import { ControlRepository } from './domain/controls/control.repository';
import { EvidenceRepository } from './domain/evidence/evidence.repository';
import { IntegrationConnections } from './domain/evidence/integration-connections';
import { NoIntegrationConnections } from './infrastructure/evidence/no-integration-connections';
import { EvaluationPeriodRepository, EvaluationPeriodRollover } from './domain/periods/evaluation-period.repository';
import { WorkRepository } from './domain/work/work.repository';
import { ExclusionRepository } from './domain/exclusions/exclusion.repository';
import { ObservationRepository } from './domain/observations/observation.repository';
import { TestVerdictRepository } from './domain/verdicts/test-verdict.repository';
import { RiskRepository } from './domain/risks/risk.repository';
import { ResponsibleRepository } from './domain/responsibles/responsible.repository';
import { AssignmentPrismaRepository } from './infrastructure/assignments/assignment.prisma.repository';
import { ControlEditPrismaRepository } from './infrastructure/controls/control-edit.prisma.repository';
import { EvidencePrismaRepository } from './infrastructure/evidence/evidence.prisma.repository';
import { EvaluationPeriodPrismaRepository, EvaluationPeriodRolloverPrismaRepository } from './infrastructure/periods/evaluation-period.prisma.repository';
import { EvaluationPeriodScheduler } from './infrastructure/periods/evaluation-period.scheduler';
import { ExclusionPrismaRepository } from './infrastructure/exclusions/exclusion.prisma.repository';
import { ObservationPrismaRepository } from './infrastructure/observations/observation.prisma.repository';
import { TestVerdictPrismaRepository } from './infrastructure/verdicts/test-verdict.prisma.repository';
import { ControlPrismaRepository } from './infrastructure/controls/control.prisma.repository';
import { RiskPrismaRepository } from './infrastructure/risks/risk.prisma.repository';
import { ResponsiblePrismaRepository } from './infrastructure/responsibles/responsible.prisma.repository';
import { WorkPrismaRepository } from './infrastructure/work/work.prisma.repository';
import { WorkController } from './presentation/work/work.controller';
import { AssignmentsListController } from './presentation/assignments/assignments.controller';
import { VerdictsController } from './presentation/verdicts/verdicts.controller';
import { ControlsController } from './presentation/controls/controls.controller';
import { EvaluationPeriodController } from './presentation/periods/evaluation-period.controller';
import { EvidenceController } from './presentation/evidence/evidence.controller';
import { ExclusionsController } from './presentation/exclusions/exclusions.controller';
import { ObservationsController } from './presentation/observations/observations.controller';
import { OverviewController } from './presentation/overview/overview.controller';
import { ResponsiblesController } from './presentation/responsibles/responsibles.controller';
import { RiskAssessmentController } from './presentation/risks/risk-assessment.controller';
import { RisksController } from './presentation/risks/risks.controller';
import { EvaluationParametersModule } from '../../infrastructure/evaluation-parameters/evaluation-parameters.module';

// Cumplimiento (modelo-datos.md §7 y §9). El motor de evaluación vive en `domain/engine/` (funciones puras).
@Module({
  imports: [EvaluationParametersModule],
  controllers: [AssignmentsListController, WorkController, ControlsController, ResponsiblesController, RisksController, RiskAssessmentController, ExclusionsController, ObservationsController, EvidenceController, OverviewController, VerdictsController, EvaluationPeriodController],
  providers: [
    { provide: ControlRepository, useClass: ControlPrismaRepository },
    { provide: ControlEditRepository, useClass: ControlEditPrismaRepository },
    { provide: AssignmentRepository, useClass: AssignmentPrismaRepository },
    ListAssignmentsUseCase,
    { provide: WorkRepository, useClass: WorkPrismaRepository },
    ListMyWorkUseCase,
    TeamWorkloadUseCase,
    ListControlsUseCase,
    GetControlUseCase,
    GetOverviewUseCase,
    CreateControlUseCase,
    UpdateControlUseCase,
    RetireControlUseCase,
    SetControlPeriodicityUseCase,
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
    { provide: ObservationRepository, useClass: ObservationPrismaRepository },
    CreateObservationUseCase, ListObservationsUseCase, GetObservationUseCase, UpdateObservationUseCase, AnswerObservationUseCase,
    { provide: EvaluationPeriodRepository, useClass: EvaluationPeriodPrismaRepository },
    SetEvaluationPeriodUseCase,
    ListEvaluationPeriodsUseCase,
    { provide: EvaluationPeriodRollover, useClass: EvaluationPeriodRolloverPrismaRepository },
    RollEvaluationPeriodsUseCase,
    EvaluationPeriodScheduler,
    { provide: TestVerdictRepository, useClass: TestVerdictPrismaRepository },
    IssueVerdictUseCase, ListVerdictsUseCase, ReviewVerdictUseCase,
    { provide: EvidenceRepository, useClass: EvidencePrismaRepository },
    { provide: IntegrationConnections, useClass: NoIntegrationConnections },
    ListEvidenceUseCase, ListServiceEvidenceUseCase, ListSubmissionsUseCase, UploadEvidenceUseCase, GetEvidenceDownloadUseCase, ReviewEvidenceUseCase, CreateEvidenceRequirementUseCase, UploadTestEvidenceUseCase, ListTestEvidenceUseCase, ListControlTestsUseCase,
  ],
})
export class ComplianceModule {}
