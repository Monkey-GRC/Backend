import { ApiProperty } from '@nestjs/swagger';
import { CoverageResponse, FailingResponse, ProgressResponse, READINESS, READINESS_DOC, ROLLUP_STATES, TEST_STATES, TRUST_CRITERIA } from './control.responses';

// Forma del `data` de contracts/modules/compliance-overview.md, solo para la documentación (la arma overview-response.mapper.ts). La unidad es servicio × marco:
// nunca existe un número de toda la empresa.

export class OverviewFailingControlResponse {
  @ApiProperty({ format: 'uuid' }) control_id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código con el que se nombra el control: el del catálogo o, si es propio, el suyo (`C01`).' }) code!: string;
  @ApiProperty({ isArray: true, type: String, example: ['CC6.1'], description: 'Requisitos del marco a los que sirve.' }) requirement_codes!: string[];
  @ApiProperty({ nullable: true, example: 'C01', description: 'Numeración de un control propio (`C01`); `null` en uno del catálogo.' }) own_code!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: READINESS, enumName: 'Readiness', description: READINESS_DOC }) readiness!: string;
  @ApiProperty({ type: FailingResponse, isArray: true, description: 'En qué falla, por dimensión.' }) failing!: FailingResponse[];
}

export class OverviewBlockingTestResponse {
  @ApiProperty({ example: 'T-CLD-001', description: 'Código de la prueba en el catálogo.' }) test_code!: string;
  @ApiProperty({ description: 'Nombre neutro de la prueba.' }) display_name!: string;
  @ApiProperty({ enum: TEST_STATES, enumName: 'TestState' }) state!: string;
}

export class OverviewTechnicalControlResponse {
  @ApiProperty({ format: 'uuid' }) control_id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código con el que se nombra el control.' }) control_code!: string;
  @ApiProperty({ example: 'ineffective', description: 'Estado del control según el motor del comité.' }) state!: string;
  @ApiProperty({ type: ProgressResponse }) progress!: ProgressResponse;
  @ApiProperty({ type: OverviewBlockingTestResponse, isArray: true, description: 'Pruebas que impiden que el control sea efectivo.' }) blocking_tests!: OverviewBlockingTestResponse[];
}

export class OverviewCategoryTechnicalResponse {
  @ApiProperty({ enum: ROLLUP_STATES, enumName: 'RollupState', description: 'Estado de la categoría: todo o nada sobre sus controles.' }) state!: string;
  @ApiProperty({ type: OverviewTechnicalControlResponse, isArray: true, description: 'Controles de la categoría con su estado y las pruebas que los bloquean.' }) controls!: OverviewTechnicalControlResponse[];
}

export class OverviewCategoryResponse {
  @ApiProperty({ enum: TRUST_CRITERIA, enumName: 'TrustCriterion', description: 'Categoría (criterio de confianza).' }) trust_criterion!: string;
  @ApiProperty({ enum: READINESS, enumName: 'Readiness', description: READINESS_DOC }) readiness!: string;
  @ApiProperty({ type: ProgressResponse, description: 'Controles cumplidos de los de la categoría.' }) progress!: ProgressResponse;
  @ApiProperty({ type: CoverageResponse }) coverage!: CoverageResponse;
  @ApiProperty({ type: OverviewFailingControlResponse, isArray: true, description: 'Controles que fallan, con en qué fallan.' }) failing_controls!: OverviewFailingControlResponse[];
  @ApiProperty({ type: OverviewCategoryTechnicalResponse, required: false, description: 'Solo en la vista técnica (`view=technical`).' }) technical?: OverviewCategoryTechnicalResponse;
}

export class OverviewEvaluationResponse {
  @ApiProperty({ nullable: true, example: '1', description: 'Versión del catálogo con la que se evalúa. Nula si el servicio no tiene período definido (P26).' }) catalog_version!: string | null;
  @ApiProperty({ nullable: true, example: '2026-01-01', description: 'Inicio del período evaluado (YYYY-MM-DD).' }) period_start!: string | null;
  @ApiProperty({ nullable: true, example: '2026-12-31', description: 'Fin del período evaluado (YYYY-MM-DD).' }) period_end!: string | null;
  @ApiProperty({ nullable: true, example: '2026-10-15', description: 'Fecha de corte de la evaluación.' }) cutoff_date!: string | null;
}

export class OverviewAssessmentsResponse {
  @ApiProperty({ nullable: true, example: null, description: 'Veredicto del consultor. Todavía no se guarda (D77, MD-155).' }) consultant!: unknown;
  @ApiProperty({ nullable: true, example: null, description: 'Veredicto del auditor. Todavía no se guarda (D77, MD-155).' }) auditor!: unknown;
}

export class OverviewFrameworkTechnicalResponse {
  @ApiProperty({ enum: ROLLUP_STATES, enumName: 'RollupState' }) state!: string;
  @ApiProperty({ example: 52, description: 'Controles únicos del marco.' }) unique_controls!: number;
  @ApiProperty({ isArray: true, type: String, description: 'Códigos de los controles que fallan.' }) failing!: string[];
  @ApiProperty({ isArray: true, type: String, description: 'Códigos de los controles pendientes (lo pendiente no cuenta como cumplido).' }) pending!: string[];
  @ApiProperty({ type: OverviewAssessmentsResponse }) assessments!: OverviewAssessmentsResponse;
}

export class OverviewFrameworkResponse {
  @ApiProperty({ example: 'soc2', description: 'Código del marco.' }) framework_code!: string;
  @ApiProperty({ example: 'SOC 2' }) name!: string;
  @ApiProperty({ enum: READINESS, enumName: 'Readiness', description: READINESS_DOC }) readiness!: string;
  @ApiProperty({ type: ProgressResponse, description: 'Avance del marco en este servicio. Informa; el cumplimiento lo certifica la auditoría.' }) progress!: ProgressResponse;
  @ApiProperty({ type: CoverageResponse }) coverage!: CoverageResponse;
  @ApiProperty({ type: OverviewEvaluationResponse }) evaluation!: OverviewEvaluationResponse;
  @ApiProperty({ type: OverviewCategoryResponse, isArray: true, description: 'Categorías (criterios de confianza) en alcance, con su avance y cobertura.' }) categories!: OverviewCategoryResponse[];
  @ApiProperty({ type: OverviewFrameworkTechnicalResponse, required: false, description: 'Solo en la vista técnica (`view=technical`).' }) technical?: OverviewFrameworkTechnicalResponse;
}

export class ComplianceOverviewResponse {
  @ApiProperty({ format: 'uuid' }) service_id!: string;
  @ApiProperty({ type: OverviewFrameworkResponse, isArray: true, description: 'Un resumen por cada marco contratado del servicio.' }) frameworks!: OverviewFrameworkResponse[];
}
