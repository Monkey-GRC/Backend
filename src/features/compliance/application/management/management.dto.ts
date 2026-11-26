import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

// POST /v1/controls/{control_id}/approval (contracts/cumplimiento/aprobacion.md, D132). Quién da el paso lo decide el servidor según quién llama; el cuerpo no lo lleva.
export class ControlApprovalDto {
  @ApiProperty({ enum: ['approve', 'return'], enumName: 'ControlApprovalDecision', description: 'Aprobar el cumplimiento del control o devolverlo.' }) @IsIn(['approve', 'return']) decision!: 'approve' | 'return';
  @ApiPropertyOptional({ description: 'Obligatorio al devolver (`422 reason.required`): por qué se devuelve (máx. 2000). En blanco no vale.' }) @IsOptional() @IsString() @MaxLength(2000) reason?: string;
  @ApiPropertyOptional({ type: String, isArray: true, format: 'uuid', description: 'Al devolver: las entregas de evidencia manual del control que causan la devolución; quedan devueltas y dejan de contar. Una que no es del control: `422 returned_submission_ids.invalid`.' })
  @IsOptional() @IsArray() @IsUUID('all', { each: true }) returned_submission_ids?: string[];
}

// POST /v1/controls/{control_id}/tests/{test_id}/result (aprobacion.md, D140). Quién lo registra sale de la sesión.
export class ManualTestResultDto {
  @ApiProperty({ enum: ['correct', 'observation', 'exception'], enumName: 'ManualTestResult', description: 'El resultado de la prueba manual en este control (subconjunto de `test_status`).' }) @IsIn(['correct', 'observation', 'exception']) result!: 'correct' | 'observation' | 'exception';
  @ApiPropertyOptional({ description: 'Obligatoria si el resultado es `observation` o `exception` (`422 note.required`): lo que se vio (máx. 2000).' }) @IsOptional() @IsString() @MaxLength(2000) note?: string;
}
