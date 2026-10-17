import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, Min } from 'class-validator';

// contracts/modules/monkey-admin-catalog.md — escritura. `forbidNonWhitelisted` está activo: un campo que no se declara aquí se rechaza.
// Los textos del comité no tienen tope corto (son párrafos); los códigos y nombres sí.

export const DIMENSIONS = ['policy', 'server', 'database', 'app', 'cloud'] as const;
export const CONTROL_TYPES = ['manual', 'automated', 'hybrid', 'technical_manual'] as const;
export const RISK_CRITERIA = ['confidentiality', 'integrity', 'availability', 'privacy', 'compliance', 'security', 'continuity', 'third_parties', 'fraud', 'reputation', 'operations'] as const;
export const FAILURE_CATEGORIES = ['human_resource', 'processes', 'information_technology', 'infrastructure', 'external', 'governance'] as const;

/** Un código del catálogo: sin espacios, empieza por letra o número (`CAP-1`, `T-DOC-001`, `DOC-745f…`). */
export const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/;
const TEXT = 20000;

// ---- controles ----------------------------------------------------------------------------------------------------------------------------------

export class CreateControlDto {
  @ApiProperty({ example: 'CTL-1' }) @IsString() @Matches(CODE_PATTERN) code!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(TEXT) description!: string;
  @ApiProperty({ description: 'Uno de los dominios del catálogo, tal cual' }) @IsString() @IsNotEmpty() @MaxLength(200) domain!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) source_ref?: string;
}

export class UpdateControlDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) domain?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) source_ref?: string;
  @ApiPropertyOptional({ description: 'false da de baja; true la reactiva' }) @IsOptional() @IsBoolean() is_active?: boolean;
}

// ---- riesgos y causas ---------------------------------------------------------------------------------------------------------------------------

export class CreateRiskDto {
  @ApiPropertyOptional({ description: 'Si no viene, el servidor asigna el siguiente R0NN libre' }) @IsOptional() @IsString() @Matches(CODE_PATTERN) code?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(TEXT) description!: string;
  @ApiProperty({ enum: RISK_CRITERIA }) @IsIn(RISK_CRITERIA) trust_criterion!: string;
  @ApiProperty({ description: 'Los impactos tal como los escribe el comité («Reputacional»…)', type: [String] })
  @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @IsNotEmpty({ each: true }) potential_impact!: string[];
}

export class UpdateRiskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ApiPropertyOptional({ enum: RISK_CRITERIA }) @IsOptional() @IsIn(RISK_CRITERIA) trust_criterion?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @IsNotEmpty({ each: true }) potential_impact?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}

export class CreateCauseDto {
  @ApiPropertyOptional({ description: 'Si no viene, el servidor asigna el siguiente F0NN libre' }) @IsOptional() @IsString() @Matches(CODE_PATTERN) code?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(TEXT) description!: string;
  @ApiProperty({ enum: FAILURE_CATEGORIES }) @IsIn(FAILURE_CATEGORIES) failure_category!: string;
}

export class UpdateCauseDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ApiPropertyOptional({ enum: FAILURE_CATEGORIES }) @IsOptional() @IsIn(FAILURE_CATEGORIES) failure_category?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}

// ---- plantillas de evidencia --------------------------------------------------------------------------------------------------------------------

export class CreateEvidenceTemplateDto {
  @ApiProperty({ example: 'DOC-900' }) @IsString() @Matches(CODE_PATTERN) code!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(TEXT) description!: string;
  @ApiPropertyOptional({ enum: DIMENSIONS, default: 'policy' }) @IsOptional() @IsIn(DIMENSIONS) dimension?: string;
}

export class UpdateEvidenceTemplateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}

// ---- pruebas ------------------------------------------------------------------------------------------------------------------------------------

/** Los textos del comité de una prueba: opcionales al crearla (llegan vacíos) y editables después. Nunca salen al cliente (D70). */
class CommitteeTextsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) tool?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) population?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) period?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) population_size?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) suggested_sample_size?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) selection_method?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) evidence_to_request?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) prerequisites?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) step_by_step?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) attributes_to_validate?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) compliance_criterion?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) exceptions?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) exceptions_handling?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) evidence_to_retain?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) automated_coverage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) complementary_manual_validation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(TEXT) limitations?: string;
}

export class CreateTestDto extends CommitteeTextsDto {
  @ApiProperty({ example: 'T-DOC-900', description: 'El prefijo dice la dimensión: T-DOC, T-SRV, T-BD, T-APP o T-CLD' }) @IsString() @Matches(CODE_PATTERN) code!: string;
  @ApiProperty({ enum: DIMENSIONS }) @IsIn(DIMENSIONS) dimension!: string;
  @ApiProperty({ description: 'El nombre interno (el del comité)' }) @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @ApiProperty({ description: 'El nombre neutro que ve el cliente (D70): no nombra al proveedor de la sonda' }) @IsString() @IsNotEmpty() @MaxLength(255) display_name!: string;
  @ApiProperty({ description: 'La descripción corta que ve el cliente (D82): no nombra al proveedor de la sonda' }) @IsString() @IsNotEmpty() @MaxLength(TEXT) display_description!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(TEXT) objective!: string;
  @ApiProperty({ description: 'Texto libre: Manual, Mixta, Técnica…' }) @IsString() @IsNotEmpty() @MaxLength(500) type!: string;
}

export class UpdateTestDto extends CommitteeTextsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) display_name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) display_description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) objective?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(500) type?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_active?: boolean;
}

// ---- vínculos -----------------------------------------------------------------------------------------------------------------------------------

export class LinkEvidenceTemplateDto {
  @ApiProperty() @IsUUID() evidence_template_id!: string;
  @ApiPropertyOptional({ description: 'Posición (1…N+1); si no viene, al final' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) sequence?: number;
}

export class LinkTestDto {
  @ApiProperty() @IsUUID() test_id!: string;
}

export class LinkPointOfFocusDto {
  @ApiProperty() @IsUUID() point_of_focus_id!: string;
}

export class LinkControlDto {
  @ApiProperty() @IsUUID() control_id!: string;
}

export class LinkCauseDto {
  @ApiProperty() @IsUUID() cause_id!: string;
}

export class AddDimensionDto {
  @ApiProperty({ enum: DIMENSIONS }) @IsIn(DIMENSIONS) dimension!: string;
  @ApiProperty({ enum: CONTROL_TYPES }) @IsIn(CONTROL_TYPES) type!: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requires_probe?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requires_ai?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() requires_compliance_confirmation?: boolean;
}

export class PointsOfFocusQuery {
  @ApiPropertyOptional({ description: 'Código del requisito' }) @IsOptional() @IsString() @MaxLength(50) requirement_code?: string;
}
