import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';
import { COMPLIANCE_ENUM_CATALOGS } from '../../../../common/catalogs/compliance-catalogs';
import { CAUSE_CONTROL_EFFECTS, FAILURE_CATEGORIES, LOSS_TYPES, RISK_CRITERIA, RISK_LEVELS } from '../../domain/risks/risk-types';

// contracts/modules/compliance-risks.md (MD-122)
const bool = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);
const CODE = /^[A-Z]{1,3}\d{1,5}$/;

export class CreateRiskDto {
  @ApiPropertyOptional({ description: 'Código del riesgo (letras y número, por ejemplo `R012`). Si no viene, el servidor asigna el siguiente libre.' }) @IsOptional() @IsString() @Matches(CODE) code?: string;
  @ApiProperty({ description: 'Nombre del riesgo (máx. 200).' }) @IsString() @IsNotEmpty() @MaxLength(200) name!: string;
  @ApiProperty({ description: 'Descripción del riesgo (máx. 2000).' }) @IsString() @IsNotEmpty() @MaxLength(2000) description!: string;
  @ApiProperty({ enum: RISK_CRITERIA, enumName: 'RiskCriterion', description: 'Criterio al que afecta el riesgo.' }) @IsIn(RISK_CRITERIA) trust_criterion!: string;
  @ApiProperty({ enum: LOSS_TYPES, enumName: 'LossType', isArray: true, description: 'Tipos de pérdida que puede causar, sin repetir.' }) @IsArray() @ArrayUnique() @IsIn(LOSS_TYPES, { each: true }) potential_impact!: string[];
}

export class UpdateRiskDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre (máx. 200).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) name?: string;
  @ApiPropertyOptional({ description: 'Nueva descripción (máx. 2000).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ enum: RISK_CRITERIA, enumName: 'RiskCriterion', description: 'Nuevo criterio.' }) @IsOptional() @IsIn(RISK_CRITERIA) trust_criterion?: string;
  @ApiPropertyOptional({ enum: LOSS_TYPES, enumName: 'LossType', isArray: true, description: 'Reemplaza los tipos de pérdida.' }) @IsOptional() @IsArray() @ArrayUnique() @IsIn(LOSS_TYPES, { each: true }) potential_impact?: string[];
}

export class DeactivateRiskDto {
  @ApiPropertyOptional({ description: 'Por qué el riesgo no aplica al servicio (máx. 500). Queda en el rastro de auditoría de la baja; el asistente de alta del servicio lo pide siempre.' }) @IsOptional() @IsString() @MaxLength(500) reason?: string;
}

export class CreateCauseDto {
  @ApiPropertyOptional({ description: 'Código de la causa (letras y número, por ejemplo `F012`). Si no viene, el servidor asigna el siguiente libre.' }) @IsOptional() @IsString() @Matches(CODE) code?: string;
  @ApiProperty({ description: 'Nombre de la causa (máx. 200).' }) @IsString() @IsNotEmpty() @MaxLength(200) name!: string;
  @ApiProperty({ description: 'Descripción de la causa (máx. 2000).' }) @IsString() @IsNotEmpty() @MaxLength(2000) description!: string;
  @ApiProperty({ enum: FAILURE_CATEGORIES, enumName: 'FailureCategory', description: 'Categoría de falla.' }) @IsIn(FAILURE_CATEGORIES) failure_category!: string;
  @ApiPropertyOptional({ enum: COMPLIANCE_ENUM_CATALOGS.cause_origin, enumName: 'CauseOrigin', description: 'Origen de la causa: interna o externa.' }) @IsOptional() @IsIn(COMPLIANCE_ENUM_CATALOGS.cause_origin) cause_origin?: string;
  @ApiPropertyOptional({ enum: COMPLIANCE_ENUM_CATALOGS.cause_type, enumName: 'CauseType', description: 'Tipo de causa.' }) @IsOptional() @IsIn(COMPLIANCE_ENUM_CATALOGS.cause_type) cause_type?: string;
}

export class UpdateCauseDto {
  @ApiPropertyOptional({ description: 'Nuevo nombre (máx. 200).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) name?: string;
  @ApiPropertyOptional({ description: 'Nueva descripción (máx. 2000).' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ enum: FAILURE_CATEGORIES, enumName: 'FailureCategory', description: 'Nueva categoría de falla.' }) @IsOptional() @IsIn(FAILURE_CATEGORIES) failure_category?: string;
  @ApiPropertyOptional({ enum: COMPLIANCE_ENUM_CATALOGS.cause_origin, enumName: 'CauseOrigin', nullable: true, description: 'Nuevo origen; `null` lo borra. Solo en una causa propia.' }) @IsOptional() @IsIn(COMPLIANCE_ENUM_CATALOGS.cause_origin) cause_origin?: string | null;
  @ApiPropertyOptional({ enum: COMPLIANCE_ENUM_CATALOGS.cause_type, enumName: 'CauseType', nullable: true, description: 'Nuevo tipo; `null` lo borra. Solo en una causa propia.' }) @IsOptional() @IsIn(COMPLIANCE_ENUM_CATALOGS.cause_type) cause_type?: string | null;
}

export class LinkRiskCauseDto {
  @ApiProperty({ format: 'uuid', description: 'Causa que se vincula al riesgo.' }) @IsUUID() cause_id!: string;
}

export class LinkCauseControlDto {
  @ApiProperty({ format: 'uuid', description: 'Control que pasa a tratar la causa.' }) @IsUUID() control_id!: string;
  @ApiPropertyOptional({ default: true, description: 'Si el control es obligatorio para tratar la causa.' }) @IsOptional() @IsBoolean() is_mandatory?: boolean;
  @ApiPropertyOptional({ enum: CAUSE_CONTROL_EFFECTS, enumName: 'CauseControlEffect', nullable: true, description: 'Sobre qué actúa el control: la `probability` o el `impact`.' }) @IsOptional() @IsIn(CAUSE_CONTROL_EFFECTS) effect?: 'probability' | 'impact' | null;
}

class PageQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['technical'], description: 'Vista técnica: agrega el bloque `technical`. Solo `auditor` y `admin_empresa`; para otro rol responde 403.' }) @IsOptional() @IsIn(['technical']) view?: 'technical';
  @ApiPropertyOptional({ description: '`true` incluye también los dados de baja.' }) @IsOptional() @Transform(bool) @IsBoolean() include_inactive?: boolean;
  @ApiPropertyOptional({ enum: ['catalog', 'own'], enumName: 'ControlOrigin', description: '`catalog` clonados del catálogo · `own` creados por la empresa.' }) @IsOptional() @IsIn(['catalog', 'own']) origin?: 'catalog' | 'own';
}

export class ListRisksQuery extends PageQuery {
  @ApiPropertyOptional({ enum: RISK_CRITERIA, enumName: 'RiskCriterion', description: 'Solo los riesgos de este criterio.' }) @IsOptional() @IsIn(RISK_CRITERIA) trust_criterion?: string;
  @ApiPropertyOptional({ enum: RISK_LEVELS, enumName: 'RiskLevel', description: 'Solo los riesgos con este nivel inherente.' }) @IsOptional() @IsIn(RISK_LEVELS) inherent_risk_level?: string;
  @ApiPropertyOptional({ description: '`true` solo los ya evaluados; `false` los que aún no.' }) @IsOptional() @Transform(bool) @IsBoolean() evaluated?: boolean;
}

export class ListCausesQuery extends PageQuery {
  @ApiPropertyOptional({ enum: FAILURE_CATEGORIES, enumName: 'FailureCategory', description: 'Solo las causas de esta categoría.' }) @IsOptional() @IsIn(FAILURE_CATEGORIES) failure_category?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo las causas de este riesgo.' }) @IsOptional() @IsUUID() risk_id?: string;
}

export class ViewQuery {
  @ApiPropertyOptional({ enum: ['technical'], description: 'Vista técnica: agrega el bloque `technical`. Solo `auditor` y `admin_empresa`; para otro rol responde 403.' }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}
