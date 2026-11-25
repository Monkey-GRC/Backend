import { ApiProperty, ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, Min } from 'class-validator';
import { DIMENSIONS } from '../../../../common/catalogs/dimensions';

// contracts/modules/monkey-admin-catalog.md — escritura. `forbidNonWhitelisted` está activo: un campo que no se declara aquí se rechaza.
// Los textos del comité no tienen tope corto (son párrafos); los códigos y nombres sí.

export const CONTROL_TYPES = ['manual', 'automated', 'hybrid', 'technical_manual'] as const;
export const RISK_CRITERIA = ['confidentiality', 'integrity', 'availability', 'privacy', 'compliance', 'security', 'continuity', 'third_parties', 'fraud', 'reputation', 'operations'] as const;
export const FAILURE_CATEGORIES = ['human_resource', 'processes', 'information_technology', 'infrastructure', 'external', 'governance'] as const;

/** Un código del catálogo: sin espacios, empieza por letra o número (`CAP-1`, `T-DOC-001`, `DOC-745f…`). */
export const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/;
const TEXT = 20000;

// ---- controles ----------------------------------------------------------------------------------------------------------------------------------

@ApiSchema({ name: 'CatalogCreateControlDto' })
export class CreateControlDto {
  @ApiProperty({ example: 'CTL-1', description: 'Código del control: sin espacios, empieza por letra o número; hasta 40 caracteres. No se repite.' }) @IsString() @Matches(CODE_PATTERN) code!: string;
  @ApiProperty({ description: 'Nombre del control (máx. 255).' }) @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @ApiProperty({ description: 'Qué exige el control (texto largo, máx. 20 000).' }) @IsString() @IsNotEmpty() @MaxLength(TEXT) description!: string;
  @ApiProperty({ description: 'Uno de los dominios del catálogo, tal cual (máx. 200).' }) @IsString() @IsNotEmpty() @MaxLength(200) domain!: string;
  @ApiPropertyOptional({ description: 'Referencia de origen (máx. 255).' }) @IsOptional() @IsString() @MaxLength(255) source_ref?: string;
}

export class UpdateControlDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre (máx. 255).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @ApiPropertyOptional({ description: 'Nueva descripción (máx. 20 000).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ApiPropertyOptional({ description: 'Nuevo dominio, tal cual está en el catálogo (máx. 200).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) domain?: string;
  @ApiPropertyOptional({ description: 'Nueva referencia de origen (máx. 255).' }) @IsOptional() @IsString() @MaxLength(255) source_ref?: string;
  @ApiPropertyOptional({ description: '`false` da de baja el control; `true` lo reactiva.' }) @IsOptional() @IsBoolean() is_active?: boolean;
}

// ---- riesgos y causas ---------------------------------------------------------------------------------------------------------------------------

@ApiSchema({ name: 'CatalogCreateRiskDto' })
export class CreateRiskDto {
  @ApiPropertyOptional({ description: 'Código del riesgo. Si no viene, el servidor asigna el siguiente `R0NN` libre.' }) @IsOptional() @IsString() @Matches(CODE_PATTERN) code?: string;
  @ApiProperty({ description: 'Nombre del riesgo (máx. 255).' }) @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @ApiProperty({ description: 'Descripción del riesgo (máx. 20 000).' }) @IsString() @IsNotEmpty() @MaxLength(TEXT) description!: string;
  @ApiProperty({ enum: RISK_CRITERIA, enumName: 'RiskCriterion', description: 'Criterio de confianza al que afecta el riesgo.' }) @IsIn(RISK_CRITERIA) trust_criterion!: string;
  @ApiProperty({ type: [String], maxItems: 20, example: ['Reputacional'], description: 'Impactos potenciales, tal como los escribe el comité; hasta 20, ninguno vacío.' })
  @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @IsNotEmpty({ each: true }) potential_impact!: string[];
}

@ApiSchema({ name: 'CatalogUpdateRiskDto' })
export class UpdateRiskDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre (máx. 255).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @ApiPropertyOptional({ description: 'Nueva descripción (máx. 20 000).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ApiPropertyOptional({ enum: RISK_CRITERIA, enumName: 'RiskCriterion', description: 'Nuevo criterio de confianza.' }) @IsOptional() @IsIn(RISK_CRITERIA) trust_criterion?: string;
  @ApiPropertyOptional({ type: [String], maxItems: 20, description: 'Reemplaza los impactos potenciales.' }) @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @IsNotEmpty({ each: true }) potential_impact?: string[];
  @ApiPropertyOptional({ description: '`false` da de baja el riesgo; `true` lo reactiva.' }) @IsOptional() @IsBoolean() is_active?: boolean;
}

@ApiSchema({ name: 'CatalogCreateCauseDto' })
export class CreateCauseDto {
  @ApiPropertyOptional({ description: 'Código de la causa. Si no viene, el servidor asigna el siguiente `F0NN` libre.' }) @IsOptional() @IsString() @Matches(CODE_PATTERN) code?: string;
  @ApiProperty({ description: 'Nombre de la causa (máx. 255).' }) @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @ApiProperty({ description: 'Descripción de la causa (máx. 20 000).' }) @IsString() @IsNotEmpty() @MaxLength(TEXT) description!: string;
  @ApiProperty({ enum: FAILURE_CATEGORIES, enumName: 'FailureCategory', description: 'Categoría de falla a la que pertenece la causa.' }) @IsIn(FAILURE_CATEGORIES) failure_category!: string;
}

@ApiSchema({ name: 'CatalogUpdateCauseDto' })
export class UpdateCauseDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre (máx. 255).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @ApiPropertyOptional({ description: 'Nueva descripción (máx. 20 000).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ApiPropertyOptional({ enum: FAILURE_CATEGORIES, enumName: 'FailureCategory', description: 'Nueva categoría de falla.' }) @IsOptional() @IsIn(FAILURE_CATEGORIES) failure_category?: string;
  @ApiPropertyOptional({ description: '`false` da de baja la causa; `true` la reactiva.' }) @IsOptional() @IsBoolean() is_active?: boolean;
}

// ---- plantillas de evidencia --------------------------------------------------------------------------------------------------------------------

export class CreateEvidenceTemplateDto {
  @ApiProperty({ example: 'DOC-900', description: 'Código de la plantilla: sin espacios, hasta 40 caracteres. No se repite.' }) @IsString() @Matches(CODE_PATTERN) code!: string;
  @ApiProperty({ description: 'Qué evidencia se pide (máx. 20 000).' }) @IsString() @IsNotEmpty() @MaxLength(TEXT) description!: string;
  @ApiPropertyOptional({ enum: DIMENSIONS, enumName: 'Dimension', default: 'policy', description: 'Dimensión de la evidencia.' }) @IsOptional() @IsIn(DIMENSIONS) dimension?: string;
}

export class UpdateEvidenceTemplateDto {
  @ApiPropertyOptional({ description: 'Nueva descripción (máx. 20 000).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) description?: string;
  @ApiPropertyOptional({ description: '`false` da de baja la plantilla; `true` la reactiva.' }) @IsOptional() @IsBoolean() is_active?: boolean;
}

// ---- pruebas ------------------------------------------------------------------------------------------------------------------------------------

/** Los textos del comité de una prueba: opcionales al crearla (llegan vacíos) y editables después. Nunca salen al cliente (D70). */
class CommitteeTextsDto {
  @ApiPropertyOptional({ description: 'Herramienta con la que se ejecuta la prueba.' }) @IsOptional() @IsString() @MaxLength(TEXT) tool?: string;
  @ApiPropertyOptional({ description: 'Población sobre la que se prueba.' }) @IsOptional() @IsString() @MaxLength(TEXT) population?: string;
  @ApiPropertyOptional({ description: 'Periodo que cubre la prueba.' }) @IsOptional() @IsString() @MaxLength(TEXT) period?: string;
  @ApiPropertyOptional({ description: 'Tamaño de la población.' }) @IsOptional() @IsString() @MaxLength(TEXT) population_size?: string;
  @ApiPropertyOptional({ description: 'Tamaño de muestra sugerido.' }) @IsOptional() @IsString() @MaxLength(TEXT) suggested_sample_size?: string;
  @ApiPropertyOptional({ description: 'Método de selección de la muestra.' }) @IsOptional() @IsString() @MaxLength(TEXT) selection_method?: string;
  @ApiPropertyOptional({ description: 'Evidencia que se solicita.' }) @IsOptional() @IsString() @MaxLength(TEXT) evidence_to_request?: string;
  @ApiPropertyOptional({ description: 'Prerrequisitos para ejecutar la prueba.' }) @IsOptional() @IsString() @MaxLength(TEXT) prerequisites?: string;
  @ApiPropertyOptional({ type: [String], maxItems: 100, description: 'Pasos de la prueba, en orden.' }) @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) step_by_step?: string[];
  @ApiPropertyOptional({ type: [String], maxItems: 100, description: 'Atributos que la prueba valida.' }) @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) attributes_to_validate?: string[];
  @ApiPropertyOptional({ description: 'Criterio para considerar que cumple.' }) @IsOptional() @IsString() @MaxLength(TEXT) compliance_criterion?: string;
  @ApiPropertyOptional({ description: 'Excepciones que se aceptan.' }) @IsOptional() @IsString() @MaxLength(TEXT) exceptions?: string;
  @ApiPropertyOptional({ description: 'Cómo se tratan las excepciones.' }) @IsOptional() @IsString() @MaxLength(TEXT) exceptions_handling?: string;
  @ApiPropertyOptional({ description: 'Evidencia que se conserva.' }) @IsOptional() @IsString() @MaxLength(TEXT) evidence_to_retain?: string;
  @ApiPropertyOptional({ description: 'Qué cubre la parte automática.' }) @IsOptional() @IsString() @MaxLength(TEXT) automated_coverage?: string;
  @ApiPropertyOptional({ description: 'Validación manual complementaria.' }) @IsOptional() @IsString() @MaxLength(TEXT) complementary_manual_validation?: string;
  @ApiPropertyOptional({ description: 'Limitaciones de la prueba.' }) @IsOptional() @IsString() @MaxLength(TEXT) limitations?: string;
}

export class CreateTestDto extends CommitteeTextsDto {
  @ApiProperty({ example: 'T-DOC-900', description: 'Código de la prueba. El prefijo dice la dimensión: `T-DOC`, `T-SRV`, `T-BD`, `T-APP` o `T-CLD`, y debe coincidir con `dimension`.' }) @IsString() @Matches(CODE_PATTERN) code!: string;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión de la prueba.' }) @IsIn(DIMENSIONS) dimension!: string;
  @ApiProperty({ description: 'Nombre interno (el del comité). Máx. 255.' }) @IsString() @IsNotEmpty() @MaxLength(255) name!: string;
  @ApiProperty({ description: 'Nombre neutro que ve el cliente (D70): no nombra al proveedor de la sonda. Máx. 255.' }) @IsString() @IsNotEmpty() @MaxLength(255) display_name!: string;
  @ApiProperty({ description: 'Descripción corta que ve el cliente (D82): no nombra al proveedor de la sonda.' }) @IsString() @IsNotEmpty() @MaxLength(TEXT) display_description!: string;
  @ApiProperty({ description: 'Objetivo de la prueba.' }) @IsString() @IsNotEmpty() @MaxLength(TEXT) objective!: string;
  @ApiProperty({ description: 'Texto libre del comité: Manual, Mixta, Técnica… (máx. 500).' }) @IsString() @IsNotEmpty() @MaxLength(500) type!: string;
}

export class UpdateTestDto extends CommitteeTextsDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre interno (máx. 255).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) name?: string;
  @ApiPropertyOptional({ description: 'Nuevo nombre que ve el cliente (máx. 255).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(255) display_name?: string;
  @ApiPropertyOptional({ description: 'Nueva descripción corta que ve el cliente.' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) display_description?: string;
  @ApiPropertyOptional({ description: 'Nuevo objetivo.' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(TEXT) objective?: string;
  @ApiPropertyOptional({ description: 'Nuevo tipo, texto libre (máx. 500).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(500) type?: string;
  @ApiPropertyOptional({ description: '`false` da de baja la prueba; `true` la reactiva.' }) @IsOptional() @IsBoolean() is_active?: boolean;
}

// ---- vínculos -----------------------------------------------------------------------------------------------------------------------------------

export class LinkEvidenceTemplateDto {
  @ApiProperty({ format: 'uuid', description: 'Plantilla de evidencia que se vincula.' }) @IsUUID() evidence_template_id!: string;
  @ApiPropertyOptional({ minimum: 1, description: 'Posición dentro del control (1…N+1). Si no viene, va al final.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) sequence?: number;
}

export class LinkTestDto {
  @ApiProperty({ format: 'uuid', description: 'Prueba que se vincula.' }) @IsUUID() test_id!: string;
}

export class LinkPointOfFocusDto {
  @ApiProperty({ format: 'uuid', description: 'Punto de enfoque al que se vincula el control (`GET /v1/catalog/frameworks/{id}/points-of-focus`).' }) @IsUUID() point_of_focus_id!: string;
}

export class LinkControlDto {
  @ApiProperty({ format: 'uuid', description: 'Control que se vincula.' }) @IsUUID() control_id!: string;
}

export class LinkCauseDto {
  @ApiProperty({ format: 'uuid', description: 'Causa que se vincula.' }) @IsUUID() cause_id!: string;
}

export class AddDimensionDto {
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Dimensión en que se evalúa el control.' }) @IsIn(DIMENSIONS) dimension!: string;
  @ApiProperty({ enum: CONTROL_TYPES, enumName: 'ControlType', description: 'Cómo se evalúa en esa dimensión: `manual`, `automated`, `hybrid` o `technical_manual`.' }) @IsIn(CONTROL_TYPES) type!: string;
  @ApiPropertyOptional({ description: 'Si requiere la sonda (evaluación automática).' }) @IsOptional() @IsBoolean() requires_probe?: boolean;
  @ApiPropertyOptional({ description: 'Si requiere apoyo de IA (siempre etiquetado como generado por IA).' }) @IsOptional() @IsBoolean() requires_ai?: boolean;
  @ApiPropertyOptional({ description: 'Si requiere confirmación del admin_empresa.' }) @IsOptional() @IsBoolean() requires_compliance_confirmation?: boolean;
}

export class PointsOfFocusQuery {
  @ApiPropertyOptional({ description: 'Solo los puntos de este requisito (por ejemplo `CC6.1`).' }) @IsOptional() @IsString() @MaxLength(50) requirement_code?: string;
}
