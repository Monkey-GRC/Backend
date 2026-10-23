import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

const DIMENSIONS = ['policy', 'server', 'database', 'app', 'cloud'] as const;

// PUT /v1/evidence-submissions/{id}/review (compliance-audit.md, D84). El rol del revisor lo pone el servidor desde la base; el cuerpo no lo lleva.
// `ai_prevalidated` no se acepta: lo deriva el sistema, nunca una persona. Un atributo ausente o `null` queda sin valorar.
export class ReviewEvidenceDto {
  @ApiPropertyOptional({ nullable: true, description: 'El tipo de documento es el que se pide.' }) @IsOptional() @IsBoolean() type_ok?: boolean | null;
  @ApiPropertyOptional({ nullable: true, description: 'La fecha del documento cae dentro del período de evaluación.' }) @IsOptional() @IsBoolean() period_ok?: boolean | null;
  @ApiPropertyOptional({ nullable: true, description: 'Está vigente. En `false` la evidencia queda vencida (RN-02).' }) @IsOptional() @IsBoolean() valid_ok?: boolean | null;
  @ApiPropertyOptional({ nullable: true, description: 'El documento está aprobado por quien corresponde.' }) @IsOptional() @IsBoolean() approved_ok?: boolean | null;
  @ApiPropertyOptional({ nullable: true, description: 'Lleva la firma o autorización.' }) @IsOptional() @IsBoolean() signed_ok?: boolean | null;
  @ApiPropertyOptional({ nullable: true, description: 'Tiene el contenido obligatorio.' }) @IsOptional() @IsBoolean() content_ok?: boolean | null;
  @ApiProperty({ enum: ['pending_review', 'human_validated'], enumName: 'EvidenceReviewInput', description: 'Solo una evidencia **validada por una persona** puede cumplir (RN-03). `ai_prevalidated` lo deriva el sistema: no se acepta.' })
  @IsIn(['pending_review', 'human_validated']) review!: 'pending_review' | 'human_validated';
  @ApiPropertyOptional({ nullable: true, description: 'Observación de quien revisa (máx. 2000).' }) @IsOptional() @IsString() @MaxLength(2000) note?: string | null;
}

// POST /v1/controls/{id}/evidence-requirements (compliance-evidence.md, D88)
export class CreateEvidenceRequirementDto {
  @ApiProperty({ description: 'Qué documento se pide (máx. 500).', example: 'Política de retención de datos aprobada' }) @IsString() @IsNotEmpty() @MaxLength(500) description!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', example: 'policy', description: 'Dimensión de la evidencia: debe ser una que el control exige.' }) @IsIn(DIMENSIONS) dimension!: (typeof DIMENSIONS)[number];
  @ApiPropertyOptional({ format: 'uuid', description: 'Prueba documental de ESTE control a la que sirve. Sin ella queda compartida con todas las pruebas documentales del control (D88).' }) @IsOptional() @IsUUID() test_id?: string;
}

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
