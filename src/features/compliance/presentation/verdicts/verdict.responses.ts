import { ApiProperty } from '@nestjs/swagger';
import { TEST_STATES } from '../controls/control.responses';

export class VerdictPersonResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Camilo' }) name!: string;
  @ApiProperty({ example: 'Ortiz' }) last_name!: string;
}

export class VerdictControlRefResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'IAC-12', description: 'Código del control (el del catálogo o el propio).' }) code!: string;
}

export class VerdictResponse {
  @ApiProperty({ format: 'uuid', description: 'La evaluación del control de origen. Las demás filas de este veredicto (una por control y activo) comparten quién, cuándo y qué.' }) id!: string;
  @ApiProperty({ format: 'uuid', description: 'El control de origen: desde el que se dio el veredicto (D85).' }) control_id!: string;
  @ApiProperty({ format: 'uuid', description: 'El test al que se le dio el veredicto.' }) test_id!: string;
  @ApiProperty({ enum: ['server', 'database', 'app', 'cloud'], enumName: 'Dimension', description: 'Dimensión del test.' }) dimension!: string;
  @ApiProperty({ enum: ['manual'], enumName: 'EvaluationOrigin', description: 'Siempre `manual`: lo dio una persona.' }) origin!: string;
  @ApiProperty({ enum: ['compliant', 'non_compliant'], enumName: 'VerdictResult' }) result!: string;
  @ApiProperty({ nullable: true, description: 'Por qué.' }) note!: string | null;
  @ApiProperty({ nullable: true, description: 'La razón por la que se dio aunque el control de origen tuviera observaciones abiertas.' }) closure_observation_reason!: string | null;
  @ApiProperty({ type: VerdictPersonResponse, description: 'Quién lo confirmó.' }) confirmed_by!: VerdictPersonResponse;
  @ApiProperty({ format: 'date-time' }) evaluated_at!: string;
  @ApiProperty({ enum: TEST_STATES, enumName: 'TestState', required: false, description: 'El estado del test en el control de origen después del veredicto. Solo al emitirlo.' }) test_state?: string;
  @ApiProperty({ type: VerdictControlRefResponse, isArray: true, description: 'Los controles del servicio donde cuenta (D85): todos los que llevan el test.' }) applies_to_controls!: VerdictControlRefResponse[];
}
