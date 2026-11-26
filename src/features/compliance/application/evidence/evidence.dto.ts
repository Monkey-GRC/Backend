import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { DIMENSIONS } from '../../../../common/catalogs/dimensions';

// POST /v1/controls/{id}/evidence-requirements (compliance-evidence.md, D88)
export class CreateEvidenceRequirementDto {
  @ApiProperty({ description: 'Qué documento se pide (máx. 500).', example: 'Política de retención de datos aprobada' }) @IsString() @IsNotEmpty() @MaxLength(500) description!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', example: 'policy', description: 'Dimensión de la evidencia: debe ser una que el control exige.' }) @IsIn(DIMENSIONS) dimension!: (typeof DIMENSIONS)[number];
  @ApiPropertyOptional({ format: 'uuid', description: 'Prueba documental de ESTE control a la que sirve. Sin ella queda compartida con todas las pruebas documentales del control (D88).' }) @IsOptional() @IsUUID() test_id?: string;
}

// GET /v1/evidence-requirements/{id}/submissions
export class ListSubmissionsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
}

// GET /v1/controls/{id}/tests (compliance-audit.md)
export class ListControlTestsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
}

// GET /v1/evidence-submissions/{id}/download (compliance-evidence.md)
export class DownloadEvidenceQuery {
  @ApiPropertyOptional({ enum: ['attachment', 'inline'], default: 'attachment', description: '`attachment`: el navegador descarga el archivo. `inline`: la pantalla lo muestra sin descargarlo; solo PDF, PNG y JPG (con DOCX o XLSX responde 422).' })
  @IsOptional() @IsIn(['attachment', 'inline']) disposition?: 'attachment' | 'inline';
}
