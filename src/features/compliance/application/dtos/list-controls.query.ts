import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export const CONTROL_SORTS = ['code', '-code', 'name', '-name'] as const;
export type ControlSort = (typeof CONTROL_SORTS)[number];

// GET /v1/services/{service_id}/controls (contracts/modules/compliance-controls.md)
export class ListControlsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: CONTROL_SORTS, default: 'code', description: 'Orden. El prefijo `-` es descendente.' }) @IsOptional() @IsIn(CONTROL_SORTS) sort: ControlSort = 'code';

  @ApiPropertyOptional({ enum: ['security', 'availability', 'confidentiality', 'integrity', 'privacy'], enumName: 'TrustCriterion', description: 'Solo los controles de esta categoría.' }) @IsOptional() @IsIn(['security', 'availability', 'confidentiality', 'integrity', 'privacy']) trust_criterion?: string;
  @ApiPropertyOptional({ enum: ['manual', 'automated', 'hybrid', 'technical_manual'], enumName: 'ControlType', description: 'Solo los controles de este tipo.' }) @IsOptional() @IsIn(['manual', 'automated', 'hybrid', 'technical_manual']) type?: string;
  @ApiPropertyOptional({ enum: ['ready', 'almost_ready', 'needs_work', 'not_measured'], enumName: 'Readiness', description: 'Solo los controles en este estado.' }) @IsOptional() @IsIn(['ready', 'almost_ready', 'needs_work', 'not_measured']) readiness?: string;
  @ApiPropertyOptional({ enum: ['approved', 'pending', 'rejected'], enumName: 'Approval', description: 'Solo los controles con esta aprobación (útil para los propios).' }) @IsOptional() @IsIn(['approved', 'pending', 'rejected']) approval?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los controles asignados a este usuario.' }) @IsOptional() @IsUUID() assigned_to?: string;
  @ApiPropertyOptional({ enum: ['catalog', 'own'], enumName: 'ControlOrigin', description: '`catalog` clonados del catálogo · `own` creados por la empresa.' }) @IsOptional() @IsIn(['catalog', 'own']) origin?: string;
  @ApiPropertyOptional({ enum: ['technical'], description: 'Vista técnica: agrega el bloque `technical`. Solo `auditor`, `consultor` y, por ahora, `admin_empresa`; para otro rol responde 403.' }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}

// GET /v1/controls/{id}
export class GetControlQuery {
  @ApiPropertyOptional({ enum: ['technical'], description: 'Vista técnica: agrega el bloque `technical`. Solo `auditor`, `consultor` y, por ahora, `admin_empresa`; para otro rol responde 403.' }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}
