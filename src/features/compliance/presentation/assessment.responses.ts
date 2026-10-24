import { ApiProperty } from '@nestjs/swagger';
import { VerdictPersonResponse } from './verdict.responses';

export class AssessmentEvaluationResponse {
  @ApiProperty({ example: '3', description: 'Versión del catálogo con la que se evalúa (texto del número).' }) catalog_version!: string;
  @ApiProperty({ example: '2026-01-01', format: 'date', description: 'Inicio del período auditado.' }) period_start!: string;
  @ApiProperty({ example: '2026-12-31', format: 'date', description: 'Fin del período auditado.' }) period_end!: string;
  @ApiProperty({ example: '2026-10-14', format: 'date', description: 'La fecha de corte con la que se emitió: al emitir se congela.' }) cutoff_date!: string;
}

export class AssessmentResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) service_id!: string;
  @ApiProperty({ example: 'soc2', description: 'Código del marco.' }) framework_code!: string;
  @ApiProperty({ enum: ['consultor', 'auditor'], enumName: 'AssessorRole', description: 'Quién la emitió; lo pone el servidor.' }) assessor_role!: string;
  @ApiProperty({ enum: ['ready', 'not_ready', 'certified', 'not_certified'], enumName: 'AssessmentVerdict', description: '`ready`/`not_ready` del consultor · `certified`/`not_certified` del auditor.' }) verdict!: string;
  @ApiProperty({ description: 'La justificación de quien emite (obligatoria).' }) rationale!: string;
  @ApiProperty({ type: AssessmentEvaluationResponse, description: 'Sobre qué evaluación del servicio se hizo.' }) evaluation!: AssessmentEvaluationResponse;
  @ApiProperty({ type: VerdictPersonResponse }) issued_by!: VerdictPersonResponse;
  @ApiProperty({ format: 'date-time' }) issued_at!: string;
  @ApiProperty({ description: '`true` si es la última de ese rol sobre esta evaluación del servicio.' }) is_current!: boolean;
}
