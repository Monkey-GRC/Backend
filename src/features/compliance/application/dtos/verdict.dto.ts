import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

// POST /v1/controls/{control_id}/tests/{test_id}/verdicts (compliance-audit.md, MD-155, D85). Quién lo confirma sale de la sesión; el cuerpo no lo lleva.
export class IssueVerdictDto {
  @ApiProperty({ enum: ['compliant', 'non_compliant'], enumName: 'VerdictResult', description: 'El veredicto del test: cumple o no cumple.' }) @IsIn(['compliant', 'non_compliant']) result!: 'compliant' | 'non_compliant';
  @ApiPropertyOptional({ nullable: true, description: 'Por qué (máx. 2000).' }) @IsOptional() @IsString() @MaxLength(2000) note?: string | null;
  @ApiPropertyOptional({ nullable: true, description: 'La razón por la que se da el veredicto aunque el control de origen tenga observaciones abiertas (D85). Se guarda con la evaluación (máx. 2000).' })
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(2000) closure_observation_reason?: string | null;
}

// GET /v1/controls/{control_id}/tests/{test_id}/verdicts
export class ListVerdictsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
}
