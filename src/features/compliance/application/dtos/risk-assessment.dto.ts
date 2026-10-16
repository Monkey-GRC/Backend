import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { TREATMENT_DECISIONS } from '../../domain/risk-types';

// contracts/modules/compliance-risks.md (MD-123). El rango 1–5 y la fecha futura se validan en `risk-assessment.validation.ts`, que devuelve `number.range` y
// `date.past` como dice el contrato.
export class EvaluateRiskDto {
  @ApiProperty({ minimum: 1, maximum: 5 }) @IsDefined() @IsInt() likelihood!: number;
  @ApiProperty({ minimum: 1, maximum: 5 }) @IsDefined() @IsInt() impact!: number;
  // El valor y el nivel los calcula el servidor: si el cliente los manda, se ignoran (no son un error).
  @IsOptional() inherent_risk_value?: unknown;
  @IsOptional() inherent_risk_level?: unknown;
}

export class CreateTreatmentDto {
  @ApiProperty({ enum: TREATMENT_DECISIONS }) @IsIn(TREATMENT_DECISIONS) decision!: string;
  @ApiProperty({ description: 'Un cargo de la organización (GET /v1/responsibles), no una persona con cuenta' }) @IsUUID() responsible_id!: string;
  @ApiProperty({ example: '2026-12-15' }) @IsString() @IsNotEmpty() due_date!: string;
}

export class HistoryQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
}
