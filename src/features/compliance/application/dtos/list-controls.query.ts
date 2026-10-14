import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export const CONTROL_SORTS = ['code', '-code', 'name', '-name'] as const;
export type ControlSort = (typeof CONTROL_SORTS)[number];

// GET /v1/services/{service_id}/controls (contracts/modules/compliance-controls.md)
export class ListControlsQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: CONTROL_SORTS, default: 'code' }) @IsOptional() @IsIn(CONTROL_SORTS) sort: ControlSort = 'code';

  @ApiPropertyOptional() @IsOptional() @IsIn(['security', 'availability', 'confidentiality', 'integrity', 'privacy']) trust_criterion?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['manual', 'automated', 'hybrid', 'technical_manual']) type?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['ready', 'almost_ready', 'needs_work', 'not_measured']) readiness?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['approved', 'pending', 'rejected']) approval?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assigned_to?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['catalog', 'own']) origin?: string;
  @ApiPropertyOptional({ enum: ['technical'] }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}

// GET /v1/controls/{id}
export class GetControlQuery {
  @ApiPropertyOptional({ enum: ['technical'] }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}
