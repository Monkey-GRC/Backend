import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';
import { CAUSE_CONTROL_EFFECTS, FAILURE_CATEGORIES, LOSS_TYPES, RISK_CRITERIA, RISK_LEVELS } from '../../domain/risk-types';

// contracts/modules/compliance-risks.md (MD-122)
const bool = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);
const CODE = /^[A-Z]{1,3}\d{1,5}$/;

export class CreateRiskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(CODE) code?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) name!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(2000) description!: string;
  @ApiProperty({ enum: RISK_CRITERIA }) @IsIn(RISK_CRITERIA) trust_criterion!: string;
  @ApiProperty({ enum: LOSS_TYPES, isArray: true }) @IsArray() @ArrayUnique() @IsIn(LOSS_TYPES, { each: true }) potential_impact!: string[];
}

export class UpdateRiskDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ enum: RISK_CRITERIA }) @IsOptional() @IsIn(RISK_CRITERIA) trust_criterion?: string;
  @ApiPropertyOptional({ enum: LOSS_TYPES, isArray: true }) @IsOptional() @IsArray() @ArrayUnique() @IsIn(LOSS_TYPES, { each: true }) potential_impact?: string[];
}

export class CreateCauseDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Matches(CODE) code?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) name!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(2000) description!: string;
  @ApiProperty({ enum: FAILURE_CATEGORIES }) @IsIn(FAILURE_CATEGORIES) failure_category!: string;
}

export class UpdateCauseDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(2000) description?: string;
  @ApiPropertyOptional({ enum: FAILURE_CATEGORIES }) @IsOptional() @IsIn(FAILURE_CATEGORIES) failure_category?: string;
}

export class LinkRiskCauseDto {
  @ApiProperty() @IsUUID() cause_id!: string;
}

export class LinkCauseControlDto {
  @ApiProperty() @IsUUID() control_id!: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() is_mandatory?: boolean;
  @ApiPropertyOptional({ enum: CAUSE_CONTROL_EFFECTS, nullable: true }) @IsOptional() @IsIn(CAUSE_CONTROL_EFFECTS) effect?: 'probability' | 'impact' | null;
}

class PageQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['technical'] }) @IsOptional() @IsIn(['technical']) view?: 'technical';
  @ApiPropertyOptional() @IsOptional() @Transform(bool) @IsBoolean() include_inactive?: boolean;
  @ApiPropertyOptional({ enum: ['catalog', 'own'] }) @IsOptional() @IsIn(['catalog', 'own']) origin?: 'catalog' | 'own';
}

export class ListRisksQuery extends PageQuery {
  @ApiPropertyOptional({ enum: RISK_CRITERIA }) @IsOptional() @IsIn(RISK_CRITERIA) trust_criterion?: string;
  @ApiPropertyOptional({ enum: RISK_LEVELS }) @IsOptional() @IsIn(RISK_LEVELS) inherent_risk_level?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(bool) @IsBoolean() evaluated?: boolean;
}

export class ListCausesQuery extends PageQuery {
  @ApiPropertyOptional({ enum: FAILURE_CATEGORIES }) @IsOptional() @IsIn(FAILURE_CATEGORIES) failure_category?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() risk_id?: string;
}

export class ViewQuery {
  @ApiPropertyOptional({ enum: ['technical'] }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}
