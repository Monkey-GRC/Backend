import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { ASSIGNMENT_FILTERS } from '../shared/assignment-filters';

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
  @ApiPropertyOptional({ enum: ['catalog', 'own'], enumName: 'ControlOrigin', description: '`catalog` clonados del catálogo · `own` creados por la empresa.' }) @IsOptional() @IsIn(['catalog', 'own']) origin?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los controles de los que esa persona (`responsable` o `delegado`) es dueño o ejecutor (D102).' }) @IsOptional() @IsUUID() responsible?: string;
  @ApiPropertyOptional({ enum: ASSIGNMENT_FILTERS, enumName: 'AssignmentFilter', description: '`unassigned` lista los controles «Sin asignar»; `assigned`, los que tienen dueño. Solo `admin_empresa`; otro rol responde 403.' }) @IsOptional() @IsIn(ASSIGNMENT_FILTERS) assignment?: (typeof ASSIGNMENT_FILTERS)[number];
  @ApiPropertyOptional({ enum: ['technical'], description: 'Vista técnica: agrega el bloque `technical`. Solo `auditor` y `admin_empresa`; para otro rol responde 403.' }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}

// GET /v1/controls/{id}
export class GetControlQuery {
  @ApiPropertyOptional({ enum: ['technical'], description: 'Vista técnica: agrega el bloque `technical`. Solo `auditor` y `admin_empresa`; para otro rol responde 403.' }) @IsOptional() @IsIn(['technical']) view?: 'technical';
}
