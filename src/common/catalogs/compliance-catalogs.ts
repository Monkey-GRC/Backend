import {
  AssessmentVerdict,
  AuditObservationStatus,
  AuditObservationType,
  AssessorRole,
  CatalogOrigin,
  CauseOrigin,
  CauseType,
  CheckRole,
  ClientCauseControlEffect,
  ControlApprovalDecision,
  ControlApprovalStep,
  ControlDimensionType,
  ControlType,
  Dimension,
  DocumentAcceptance,
  DocumentOrigin,
  DocumentType,
  EvaluationParameterUnit,
  EvaluationPeriodOrigin,
  EvaluationPeriodStatus,
  ExclusionStatus,
  FailureCategory,
  ManualTestResultValue,
  OrganizationResponsibleType,
  Periodicity,
  RequirementType,
  RiskCriterion,
  RiskLevel,
  RiskTreatmentDecision,
  TestAutomation,
  TestLevel,
  TestPrimarySource,
} from '../../../generated/prisma/enums';
import { MANAGEMENT_STATES } from '../../features/compliance/domain/controls/management-state';
import { LOSS_TYPES, RISK_SCALE } from '../../features/compliance/domain/risks/risk-types';

// Las listas de Cumplimiento que el frontend necesita para armar sus formularios y filtros (contracts/enums.md, contracts/conventions.md): `GET /v1/catalogs/{nombre}`.
// La FUENTE DE VERDAD es el enum de Postgres: aquí se lee del cliente de Prisma, que lo genera del schema, en vez de volver a escribirlo. Así una lista no puede
// quedar distinta de la base (lo vigila `compliance-catalogs.spec.ts`). El texto de cada valor está en `i18n/<lang>/catalogs.json`; el frontend no escribe estas listas.
const values = <T extends Record<string, string>>(e: T): T[keyof T][] => Object.values(e) as T[keyof T][];

export const COMPLIANCE_ENUM_CATALOGS = {
  risk_criterion: values(RiskCriterion),
  failure_category: values(FailureCategory),
  risk_level: values(RiskLevel),
  risk_treatment_decision: values(RiskTreatmentDecision),
  responsible_type: values(OrganizationResponsibleType),
  cause_control_effect: values(ClientCauseControlEffect),
  exclusion_status: values(ExclusionStatus),
  audit_observation_type: values(AuditObservationType),
  audit_observation_status: values(AuditObservationStatus),
  assessor_role: values(AssessorRole),
  assessment_verdict: values(AssessmentVerdict),
  dimension: values(Dimension),
  control_type: values(ControlDimensionType),
  catalog_origin: values(CatalogOrigin),
  // Catálogo v2 (VF18, MD-491). `control_type` sigue siendo el de la v1 (tipo de la dimensión) hasta la fase 2; el de la v2 va como `catalog_control_type`.
  catalog_control_type: values(ControlType),
  periodicity: values(Periodicity),
  requirement_type: values(RequirementType),
  test_primary_source: values(TestPrimarySource),
  test_level: values(TestLevel),
  test_automation: values(TestAutomation),
  check_role: values(CheckRole),
  cause_origin: values(CauseOrigin),
  cause_type: values(CauseType),
  document_type: values(DocumentType),
  document_origin: values(DocumentOrigin),
  document_acceptance: values(DocumentAcceptance),
  // RC-19, MD-495 · La forma del valor de un parámetro de evaluación. `window_mode` no es un enum de Postgres: es el valor de PR-07, una lista de modos.
  evaluation_parameter_unit: values(EvaluationParameterUnit),
  window_mode: ['calendar', 'rolling'],
  evaluation_period_status: values(EvaluationPeriodStatus),
  evaluation_period_origin: values(EvaluationPeriodOrigin),
  // MD-504 (D132, D140) · La gestión del control se deriva al leer (no es un enum de Postgres); los otros tres sí lo son.
  control_management_state: [...MANAGEMENT_STATES],
  control_approval_step: values(ControlApprovalStep),
  control_approval_decision: values(ControlApprovalDecision),
  manual_test_result_value: values(ManualTestResultValue),
  // MD-529 · Enums de la gestión del control que no son de Postgres (contracts/enums/cumplimiento.md): se derivan al leer.
  control_level: ['not_evaluated', 'ineffective', 'weak', 'partial', 'adequate', 'solid'],
  requirement_status: ['compliant', 'non_compliant', 'pending', 'expired', 'not_applicable'],
  change_request_status: ['pending', 'approved', 'rejected'],
  requirement_applicability: ['applicable', 'not_applicable_pending', 'not_applicable'],
  management_action: ['approve', 'return', 'register_result', 'propose_level', 'decide_level', 'register_plan', 'decide_plan', 'request_not_applicable', 'decide_not_applicable', 'revert_not_applicable', 'declare_no_occurrences', 'register_occurrence'],
  management_history_type: ['approval', 'return', 'approval_invalidated', 'manual_result', 'level_proposed', 'level_decided', 'plan_registered', 'plan_decided', 'not_applicable_requested', 'not_applicable_decided', 'not_applicable_reverted', 'occurrence_registered', 'no_occurrences_declared'],
  work_decision_kind: ['control_approval', 'manual_result', 'level_override', 'remediation_plan', 'not_applicable'],
  // MD-500 · No es un enum de Postgres: se deriva (de si el `admin_empresa` cambió la periodicidad del control, D147).
  periodicity_source: ['catalog', 'client'],
  // No es un enum de Postgres: el impacto potencial se guarda como texto del comité y la API lo traduce a estos valores (`risk-types.ts`, P9).
  loss_type: [...LOSS_TYPES],
  // La escala de la matriz 5×5: del mínimo al máximo que acepta la evaluación de un riesgo.
  risk_scale: Array.from({ length: RISK_SCALE.max - RISK_SCALE.min + 1 }, (_, i) => String(RISK_SCALE.min + i)),
} as const satisfies Record<string, readonly string[]>;
