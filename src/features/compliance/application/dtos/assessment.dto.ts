import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// POST /v1/services/{service_id}/frameworks/{framework_code}/assessments (compliance-overview.md, D77, MD-155). El rol de quien emite lo pone el servidor; el cuerpo no lo lleva.
// Aquí se acepta cualquiera de los cuatro valores; que sea el del rol de quien emite lo comprueba el caso de uso (`403` si es el del otro).
export class IssueAssessmentDto {
  @ApiProperty({ enum: ['ready', 'not_ready', 'certified', 'not_certified'], enumName: 'AssessmentVerdict', description: '`ready`/`not_ready` los emite el consultor; `certified`/`not_certified`, el auditor. El del otro rol responde `403`; uno que no existe, `422 enum.invalid`.' })
  @IsIn(['ready', 'not_ready', 'certified', 'not_certified']) verdict!: 'ready' | 'not_ready' | 'certified' | 'not_certified';
  @ApiProperty({ description: 'La justificación. **Obligatoria** (máx. 4000).', example: 'Las evidencias del período están completas y los accesos remediados.' }) @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) @IsString() @IsNotEmpty() @MaxLength(4000) rationale!: string;
}

// GET …/assessments
export class ListAssessmentsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['consultor', 'auditor'], enumName: 'AssessorRole', description: 'Solo las de este rol.' }) @IsOptional() @IsIn(['consultor', 'auditor']) assessor_role?: 'consultor' | 'auditor';
  @ApiPropertyOptional({ type: Boolean, description: '`true`: solo la vigente de cada rol (la última).' }) @IsOptional() @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value)) @IsBoolean() current?: boolean;
}
