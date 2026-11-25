import { ApiProperty } from '@nestjs/swagger';
import { COMPLIANCE_ENUM_CATALOGS } from '../../../../common/catalogs/compliance-catalogs';
import { PersonResponse } from '../../../../common/swagger/shared.responses';
import { CAUSE_CONTROL_EFFECTS, FAILURE_CATEGORIES, LOSS_TYPES, RISK_CRITERIA, RISK_LEVELS, TREATMENT_DECISIONS } from '../../domain/risks/risk-types';
import { ResponsibleRefResponse } from '../responsibles/responsible.responses';

// Formas del `data` de contracts/modules/compliance-risks.md, solo para la documentación (las arma risk-response.mapper.ts y riskMatrix()).

export const RISK_LEVEL_DOC = 'Nivel del valor (probabilidad × impacto): `low` 1–4 · `moderate` 5–9 · `high` 10–16 · `critical` 17–25.';

export class RiskMatrixCellResponse {
  @ApiProperty({ example: 3, minimum: 1, maximum: 5, description: 'Probabilidad de la casilla (1 a 5).' }) likelihood!: number;
  @ApiProperty({ example: 4, minimum: 1, maximum: 5, description: 'Impacto de la casilla (1 a 5).' }) impact!: number;
  @ApiProperty({ example: 12, description: 'Probabilidad × impacto.' }) value!: number;
  @ApiProperty({ enum: RISK_LEVELS, enumName: 'RiskLevel', description: RISK_LEVEL_DOC }) level!: string;
}

export class RiskMatrixResponse {
  @ApiProperty({ example: 1, description: 'Valor mínimo de la escala.' }) min!: number;
  @ApiProperty({ example: 5, description: 'Valor máximo de la escala.' }) max!: number;
  @ApiProperty({ type: RiskMatrixCellResponse, isArray: true, description: 'Las 25 casillas de la matriz 5×5, cada una con el nivel que le corresponde.' }) cells!: RiskMatrixCellResponse[];
}

export class RiskTreatmentSummaryResponse {
  @ApiProperty({ enum: TREATMENT_DECISIONS, enumName: 'TreatmentDecision', description: '`mitigate` mitigar · `accept` aceptar · `transfer` transferir · `avoid` evitar.' }) decision!: string;
  @ApiProperty({ example: '2026-12-15', description: 'Fecha límite del tratamiento (YYYY-MM-DD).' }) due_date!: string;
  @ApiProperty({ type: ResponsibleRefResponse }) responsible!: ResponsibleRefResponse;
}

export class RiskTechnicalResponse {
  @ApiProperty({ nullable: true, example: 'R001', description: 'Código del catálogo. Los riesgos y causas propios no lo tienen.' }) catalog_code!: string | null;
}

export class RiskControlLinkResponse {
  @ApiProperty({ format: 'uuid' }) control_id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código que identifica al control y se muestra siempre (D80): el del catálogo o el propio.' }) code!: string;
  @ApiProperty({ nullable: true, example: 'C01', description: 'Numeración de los controles propios; un control del catálogo no la tiene.' }) own_code!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty({ description: 'Si el control es obligatorio para tratar la causa.' }) is_mandatory!: boolean;
  @ApiProperty({ enum: CAUSE_CONTROL_EFFECTS, enumName: 'CauseControlEffect', nullable: true, description: 'Sobre qué actúa el control: la probabilidad o el impacto.' }) effect!: string | null;
  @ApiProperty({ type: RiskTechnicalResponse, required: false, description: 'Solo en la vista técnica.' }) technical?: RiskTechnicalResponse;
}

export class RiskCauseInRiskResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'F001' }) code!: string;
  @ApiProperty({ type: String, nullable: true, description: 'Nombre de la causa. Nulo en las causas del catálogo v2.' }) name!: string | null;
  @ApiProperty({ enum: FAILURE_CATEGORIES, enumName: 'FailureCategory', nullable: true }) failure_category!: string | null;
  @ApiProperty({ type: RiskControlLinkResponse, isArray: true, description: 'Controles que tratan la causa.' }) controls!: RiskControlLinkResponse[];
  @ApiProperty({ type: RiskTechnicalResponse, required: false }) technical?: RiskTechnicalResponse;
}

class RiskEvaluationFields {
  @ApiProperty({ nullable: true, minimum: 1, maximum: 5, description: 'Probabilidad de 1 a 5; `null` si el riesgo aún no se evaluó.' }) likelihood!: number | null;
  @ApiProperty({ nullable: true, minimum: 1, maximum: 5, description: 'Impacto de 1 a 5; `null` si aún no se evaluó.' }) impact!: number | null;
  @ApiProperty({ nullable: true, description: 'Probabilidad × impacto. Lo calcula el servidor.' }) inherent_risk_value!: number | null;
  @ApiProperty({ enum: RISK_LEVELS, enumName: 'RiskLevel', nullable: true, description: RISK_LEVEL_DOC }) inherent_risk_level!: string | null;
}

export class RiskListItemResponse extends RiskEvaluationFields {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'R001' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: RISK_CRITERIA, enumName: 'RiskCriterion' }) trust_criterion!: string;
  @ApiProperty({ enum: ['catalog', 'own'], enumName: 'ControlOrigin', description: '`catalog` viene del catálogo clonado · `own` lo creó la empresa.' }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ type: RiskTreatmentSummaryResponse, nullable: true, description: 'Tratamiento vigente (el último). El historial completo está en `GET /v1/risks/{id}/treatments`.' }) treatment!: RiskTreatmentSummaryResponse | null;
  @ApiProperty({ example: 3, description: 'Causas activas.' }) causes_count!: number;
  @ApiProperty({ type: RiskTechnicalResponse, required: false }) technical?: RiskTechnicalResponse;
}

export class RiskDetailResponse extends RiskEvaluationFields {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) service_id!: string;
  @ApiProperty({ example: 'R001' }) code!: string;
  @ApiProperty() name!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ enum: RISK_CRITERIA, enumName: 'RiskCriterion' }) trust_criterion!: string;
  @ApiProperty({ enum: LOSS_TYPES, enumName: 'LossType', isArray: true, description: 'Impactos potenciales.' }) potential_impact!: string[];
  @ApiProperty({ enum: ['catalog', 'own'], enumName: 'ControlOrigin' }) origin!: string;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ type: RiskTreatmentSummaryResponse, nullable: true }) treatment!: RiskTreatmentSummaryResponse | null;
  @ApiProperty({ type: RiskCauseInRiskResponse, isArray: true, description: 'Causas activas, cada una con los controles que la tratan.' }) causes!: RiskCauseInRiskResponse[];
  @ApiProperty({ type: RiskTechnicalResponse, required: false }) technical?: RiskTechnicalResponse;
}

export class CauseRiskRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'R001' }) code!: string;
  @ApiProperty() name!: string;
}

export class CauseResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) service_id!: string;
  @ApiProperty({ example: 'F001' }) code!: string;
  @ApiProperty({ type: String, nullable: true, description: 'Nombre de la causa. Nulo en las causas del catálogo v2.' }) name!: string | null;
  @ApiProperty() description!: string;
  @ApiProperty({ enum: FAILURE_CATEGORIES, enumName: 'FailureCategory', nullable: true }) failure_category!: string | null;
  @ApiProperty({ enum: ['catalog', 'own'], enumName: 'ControlOrigin' }) origin!: string;
  @ApiProperty({ enum: COMPLIANCE_ENUM_CATALOGS.cause_origin, enumName: 'CauseOrigin', nullable: true, description: 'Origen de la causa: interna o externa. Nulo si no está clasificada.' }) cause_origin!: string | null;
  @ApiProperty({ enum: COMPLIANCE_ENUM_CATALOGS.cause_type, enumName: 'CauseType', nullable: true, description: 'Tipo de causa. Nulo si no está clasificada.' }) cause_type!: string | null;
  @ApiProperty() is_active!: boolean;
  @ApiProperty({ type: CauseRiskRefResponse, isArray: true, description: 'Riesgos activos a los que contribuye.' }) risks!: CauseRiskRefResponse[];
  @ApiProperty({ type: RiskControlLinkResponse, isArray: true, description: 'Controles que la tratan.' }) controls!: RiskControlLinkResponse[];
  @ApiProperty({ type: RiskTechnicalResponse, required: false }) technical?: RiskTechnicalResponse;
}

export class RiskCauseLinkResponse {
  @ApiProperty({ format: 'uuid' }) risk_id!: string;
  @ApiProperty({ format: 'uuid' }) cause_id!: string;
}

export class CauseControlLinkResponse {
  @ApiProperty({ format: 'uuid' }) cause_id!: string;
  @ApiProperty({ format: 'uuid' }) control_id!: string;
  @ApiProperty({ example: true, description: 'Si el control es obligatorio para tratar la causa.' }) is_mandatory!: boolean;
  @ApiProperty({ enum: CAUSE_CONTROL_EFFECTS, enumName: 'CauseControlEffect', nullable: true }) effect!: string | null;
}

export class RiskEvaluationValuesResponse extends RiskEvaluationFields {}

export class RiskEvaluationEntryResponse {
  @ApiProperty({ format: 'uuid' }) risk_id!: string;
  @ApiProperty({ minimum: 1, maximum: 5, description: 'Probabilidad de la evaluación.' }) likelihood!: number;
  @ApiProperty({ minimum: 1, maximum: 5, description: 'Impacto de la evaluación.' }) impact!: number;
  @ApiProperty({ example: 12, description: 'Probabilidad × impacto (lo calcula el servidor).' }) inherent_risk_value!: number;
  @ApiProperty({ enum: RISK_LEVELS, enumName: 'RiskLevel', description: RISK_LEVEL_DOC }) inherent_risk_level!: string;
  @ApiProperty({ type: RiskEvaluationValuesResponse, nullable: true, description: 'Evaluación inmediatamente anterior; `null` si es la primera.' }) previous!: RiskEvaluationValuesResponse | null;
  @ApiProperty({ type: PersonResponse, nullable: true }) evaluated_by!: PersonResponse | null;
  @ApiProperty({ format: 'date-time' }) evaluated_at!: string;
}

export class RiskTreatmentResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) risk_id!: string;
  @ApiProperty({ enum: TREATMENT_DECISIONS, enumName: 'TreatmentDecision', description: '`mitigate` mitigar · `accept` aceptar · `transfer` transferir · `avoid` evitar.' }) decision!: string;
  @ApiProperty({ type: ResponsibleRefResponse, description: 'Cargo responsable del tratamiento.' }) responsible!: ResponsibleRefResponse;
  @ApiProperty({ example: '2026-12-15', description: 'Fecha límite (YYYY-MM-DD).' }) due_date!: string;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
}
