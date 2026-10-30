import {
  AssessmentVerdict,
  AuditObservationStatus,
  AuditObservationType,
  AssessorRole,
  CatalogOrigin,
  ClientCauseControlEffect,
  ControlDimensionType,
  Dimension,
  ExclusionStatus,
  FailureCategory,
  OrganizationResponsibleType,
  RiskCriterion,
  RiskLevel,
  RiskTreatmentDecision,
} from '../../../generated/prisma/enums';
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
  // No es un enum de Postgres: el impacto potencial se guarda como texto del comité y la API lo traduce a estos valores (`risk-types.ts`, P9).
  loss_type: [...LOSS_TYPES],
  // La escala de la matriz 5×5: del mínimo al máximo que acepta la evaluación de un riesgo.
  risk_scale: Array.from({ length: RISK_SCALE.max - RISK_SCALE.min + 1 }, (_, i) => String(RISK_SCALE.min + i)),
} as const satisfies Record<string, readonly string[]>;
