import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

// GET /v1/controls/{id}/evidence (contracts/modules/compliance-evidence.md)
export class ListEvidenceQuery {
  @ApiPropertyOptional({ enum: ['technical'], description: 'Vista técnica: agrega el bloque `technical` de cada entrega. Solo `auditor`, `consultor` y, por ahora, `admin_empresa`; para otro rol responde 403.' }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}

// GET /v1/evidence-requirements/{id}/submissions
export class ListSubmissionsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['technical'], description: 'Vista técnica: agrega el bloque `technical` de cada entrega. Solo `auditor`, `consultor` y, por ahora, `admin_empresa`; para otro rol responde 403.' }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}
