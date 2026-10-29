import { ApiProperty } from '@nestjs/swagger';
import { CONTROL_TYPES, DIMENSIONS, TEST_STATES } from './control.responses';
import { AiSuggestionResponse, EvidenceControlRefResponse } from './evidence.responses';

// Forma del `data` de GET /v1/controls/{id}/tests (contracts/modules/compliance-audit.md), solo para la documentación: la arma control-test-response.mapper.ts.

export class LastVerdictPersonResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() last_name!: string;
}

export class LastVerdictResponse {
  @ApiProperty({ enum: ['compliant', 'non_compliant'], enumName: 'VerdictResult' }) result!: string;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se dio el veredicto.' }) evaluated_at!: string;
  @ApiProperty({ type: LastVerdictPersonResponse, description: 'Quién lo dio: el `admin_empresa` (D96).' }) confirmed_by!: LastVerdictPersonResponse;
}

export class ControlTestItemResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador de la prueba: lo piden el veredicto, la evidencia y las exclusiones.' }) test_id!: string;
  @ApiProperty({ example: 'T-DOC-001', description: 'Código de la prueba en el catálogo.' }) test_code!: string;
  @ApiProperty({ description: 'Nombre neutro de la prueba (D70); el texto del comité no sale.' }) display_name!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension' }) dimension!: string;
  @ApiProperty({ enum: CONTROL_TYPES, enumName: 'ControlType', nullable: true, description: 'Cómo se resuelve la dimensión de la prueba en este control: a mano, automática o mixta.' }) type!: string | null;
  @ApiProperty({ description: 'Si la prueba cuenta para el estado del control.' }) is_mandatory!: boolean;
  @ApiProperty({ description: 'Si la prueba está activa; una desactivada no cuenta (D68).' }) is_active!: boolean;
  @ApiProperty({ type: EvidenceControlRefResponse, isArray: true, description: 'Los **otros** controles del servicio que llevan la prueba: su veredicto vale en todos (D85). Vacío en una prueba documental, cuyo estado es de este control (D88).' }) shared_with!: EvidenceControlRefResponse[];
  @ApiProperty({ enum: TEST_STATES, enumName: 'TestState' }) state!: string;
  @ApiProperty({ type: LastVerdictResponse, nullable: true, description: 'El último veredicto del `admin_empresa` sobre una prueba manual que no es documental; `null` si no lo hay.' }) last_verdict!: LastVerdictResponse | null;
  @ApiProperty({ type: AiSuggestionResponse, nullable: true, description: 'Sugerencia de la IA marcada como tal; hoy no se guarda y siempre es `null`. La IA nunca decide.' }) ai_suggestion!: AiSuggestionResponse | null;
}
