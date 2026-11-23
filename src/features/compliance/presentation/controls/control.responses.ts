import { ApiProperty } from '@nestjs/swagger';
import { PersonResponse } from '../../../../common/swagger/shared.responses';
import { ResponsibleRefResponse } from '../responsibles/responsible.responses';

// Formas del `data` de contracts/modules/compliance-controls.md y compliance-overview.md, solo para la documentación (las arman control-response.mapper.ts y
// overview-response.mapper.ts). El avance informa, nunca decide el cumplimiento: siempre viaja junto al estado y a la cobertura.

export const READINESS = ['ready', 'almost_ready', 'needs_work', 'not_measured'] as const;
export const READINESS_DOC =
  '`ready` Preparado (100 %) · `almost_ready` Casi listo (80 % o más, o todo lo medido cumple pero falta algo) · `needs_work` Requiere trabajo (menos de 80 %) · `not_measured` Sin medir (aún nada con resultado: un hueco de cobertura, no un fallo).';
export const TRUST_CRITERIA = ['security', 'availability', 'confidentiality', 'integrity', 'privacy'] as const;
export const CONTROL_TYPES = ['manual', 'automated', 'hybrid', 'technical_manual'] as const;
export const DIMENSIONS = ['policy', 'server', 'database', 'app', 'cloud', 'network', 'endpoint', 'physical', 'process'] as const;
export const CONTROL_STATES = ['effective', 'ineffective', 'expired', 'error', 'incomplete', 'evaluating', 'no_tests'] as const;
export const TEST_STATES = ['compliant', 'non_compliant', 'pending', 'evaluating', 'in_review', 'expired', 'error', 'no_assets', 'not_applicable', 'deactivated'] as const;
export const ROLLUP_STATES = ['compliant', 'non_compliant', 'evaluating', 'no_controls', 'out_of_scope'] as const;
export const APPROVAL = ['approved', 'pending', 'rejected'] as const;

export class ProgressResponse {
  @ApiProperty({ example: 7, description: 'Cuántos están cumplidos (todo o nada: lo pendiente no cuenta como cumplido).' }) done!: number;
  @ApiProperty({ example: 9, description: 'Total contra el que se cuenta. El porcentaje de avance es `done / total` y se cuenta, no se promedia.' }) total!: number;
}

export class CoverageResponse {
  @ApiProperty({ example: 6, description: 'Cuánto se midió ya.' }) measured!: number;
  @ApiProperty({ example: 9, description: 'Cuánto es medible (aplicable).' }) applicable!: number;
}

export class ControlPartyResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true, example: 'Ana' }) name!: string | null;
  @ApiProperty({ nullable: true, example: 'Pérez' }) last_name!: string | null;
  @ApiProperty({ enum: ['admin_empresa', 'responsable', 'delegado', 'auditor', 'admin_monkey'], enumName: 'UserRole' }) role!: string;
}

export class FailingAffectedResponse {
  @ApiProperty({ enum: ['asset', 'test'], description: '`asset` un activo que no cumple · `test` una prueba sin activos o pendiente en esa dimensión.' }) kind!: string;
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ required: false, description: 'Solo si `kind` es `asset`: nombre del activo.' }) name?: string;
  @ApiProperty({ required: false, description: 'Solo si `kind` es `test`: nombre neutro de la prueba (nunca el texto del comité).' }) display_name?: string;
}

export class FailingResponse {
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension' }) dimension!: string;
  @ApiProperty({ type: FailingAffectedResponse, isArray: true, description: 'Qué falla en esa dimensión.' }) affected!: FailingAffectedResponse[];
}

export class ControlTechnicalTestResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador de la prueba: lo piden las exclusiones y enlaza cada prueba documental con sus evidencias (`test.id` de una evidencia requerida, D88).' }) test_id!: string;
  @ApiProperty({ example: 'T-CLD-001', description: 'Código de la prueba en el catálogo.' }) test_code!: string;
  @ApiProperty({ description: 'Nombre neutro de la prueba.' }) display_name!: string;
  @ApiProperty({ nullable: true, description: 'Descripción corta de la prueba para el cliente.' }) display_description!: string | null;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension' }) dimension!: string;
  @ApiProperty({ enum: TEST_STATES, enumName: 'TestState' }) state!: string;
}

export class ControlTechnicalResponse {
  @ApiProperty({ isArray: true, type: String, description: 'Puntos de enfoque a los que sirve.' }) points_of_focus!: string[];
  @ApiProperty({ enum: CONTROL_STATES, enumName: 'ControlState', description: 'Estado del control según el motor del comité (derivado, nunca almacenado).' }) control_state!: string;
  @ApiProperty({ example: 3, description: 'Pruebas del control.' }) tests_count!: number;
  @ApiProperty({ type: ControlTechnicalTestResponse, isArray: true, required: false, description: 'Solo en el detalle: las pruebas con su estado.' }) tests?: ControlTechnicalTestResponse[];
}

export class ControlListItemResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código que identifica al control y se muestra siempre (D80): el del catálogo (`IAC-12`) o el propio (`C01`).' }) code!: string;
  @ApiProperty({ isArray: true, type: String, example: ['CC6.1'], description: 'Requisitos del marco que cubre el control. Un control propio no cubre ninguno.' }) requirement_codes!: string[];
  @ApiProperty({ nullable: true, example: 'C01', description: 'Numeración de los controles propios de la empresa; un control del catálogo no la tiene.' }) own_code!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: ['catalog', 'own'], enumName: 'ControlOrigin', description: '`catalog` viene del catálogo clonado · `own` lo creó la empresa.' }) origin!: string;
  @ApiProperty({ enum: CONTROL_TYPES, enumName: 'ControlType' }) type!: string;
  @ApiProperty({ enum: TRUST_CRITERIA, enumName: 'TrustCriterion', isArray: true, description: 'Categorías (criterios de confianza) a las que sirve el control.' }) trust_criteria!: string[];
  @ApiProperty({ enum: APPROVAL, enumName: 'Approval', description: 'Siempre `approved` desde D96: el `admin_empresa` crea el control propio y nace aprobado.' }) approval!: string;
  @ApiProperty({ enum: READINESS, enumName: 'Readiness', description: READINESS_DOC }) readiness!: string;
  @ApiProperty({ type: ProgressResponse, description: 'Avance: pruebas cumplidas de las que cuentan. Informa; no decide el cumplimiento.' }) progress!: ProgressResponse;
  @ApiProperty({ type: CoverageResponse, description: 'Cobertura: cuánto de lo medible se midió.' }) coverage!: CoverageResponse;
  @ApiProperty({ type: ControlPartyResponse, nullable: true, description: 'Dueño del control (D102); `null` si no tiene. El `responsable` y el `delegado` solo lo ven en sus controles.' }) owner!: ControlPartyResponse | null;
  @ApiProperty({ type: ControlPartyResponse, nullable: true, description: 'Ejecutor del control (D102); `null` si lo ejecuta el dueño o no hay.' }) executor!: ControlPartyResponse | null;
  @ApiProperty({ type: ControlTechnicalResponse, required: false, description: 'Solo en la vista técnica (`view=technical`).' }) technical?: ControlTechnicalResponse;
}

export class ControlInterpretationResponse {
  @ApiProperty({ description: 'Cómo aplica el control a este servicio.' }) text!: string;
  @ApiProperty({ description: 'Si la empresa lo reescribió respecto al texto del catálogo.' }) is_customized!: boolean;
}

export class ControlDimensionResponse {
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension' }) dimension!: string;
  @ApiProperty({ description: 'Si el control se evalúa en esta dimensión.' }) applies!: boolean;
  @ApiProperty({ enum: CONTROL_TYPES, enumName: 'ControlType', nullable: true, description: 'Cómo se evalúa; `null` si no aplica.' }) type!: string | null;
  @ApiProperty({ nullable: true, description: 'Por qué no aplica, si no aplica.' }) reason_not_applicable!: string | null;
}

export class LatestSubmissionRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 2, description: 'Número de versión de la entrega.' }) version!: number;
  @ApiProperty({ example: 'pending', description: 'Estado derivado de la revisión (`pending`, `in_review`, `compliant`…).' }) evidence_state!: string;
}

export class EvidenceRequirementSummaryResponse {
  @ApiProperty({ format: 'uuid' }) requirement_id!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ type: ResponsibleRefResponse, nullable: true, description: 'Cargo responsable de aportarla.' }) responsible!: ResponsibleRefResponse | null;
  @ApiProperty({ type: LatestSubmissionRefResponse, nullable: true, description: 'Última entrega, si hay.' }) latest_submission!: LatestSubmissionRefResponse | null;
}

export class ControlCauseRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'F001', description: 'Código de la causa (D80).' }) code!: string;
  @ApiProperty({ type: String, nullable: true, description: 'Nombre de la causa. Nulo en las causas del catálogo v2.' }) name!: string | null;
}

export class ControlDetailResponse extends ControlListItemResponse {
  @ApiProperty({ format: 'uuid' }) service_id!: string;
  @ApiProperty({ type: ControlInterpretationResponse }) interpretation!: ControlInterpretationResponse;
  @ApiProperty({ type: ControlDimensionResponse, isArray: true, description: 'Dimensiones en que se evalúa el control y si aplican.' }) dimensions!: ControlDimensionResponse[];
  @ApiProperty({ type: EvidenceRequirementSummaryResponse, isArray: true, description: 'Evidencias que pide el control y su última entrega.' }) evidence!: EvidenceRequirementSummaryResponse[];
  @ApiProperty({ type: ControlCauseRefResponse, isArray: true, description: 'Causas de riesgo que el control trata.' }) causes!: ControlCauseRefResponse[];
  @ApiProperty({ type: FailingResponse, isArray: true, description: 'En qué falla el control, por dimensión.' }) failing!: FailingResponse[];
}

export class PersonRefResponse extends PersonResponse {}
