import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import type { CatalogOrigin } from '../../domain/repositories/catalog-admin.repository';

const ORIGINS: CatalogOrigin[] = ['committee', 'monkey_admin'];
const DIMENSIONS = ['policy', 'server', 'database', 'app', 'cloud'];
const bool = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);

// contracts/modules/monkey-admin-catalog.md. `forbidNonWhitelisted` está activo: cada clase declara solo los filtros que su lista entiende.

/** Paginación sola (la lista de marcos). */
export class CatalogPageQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
}

/** Riesgos, causas y plantillas de evidencia. */
export class CatalogListQuery extends CatalogPageQuery {
  @ApiPropertyOptional({ description: 'Busca en el código y en el nombre o la descripción' }) @IsOptional() @IsString() @MaxLength(100) search?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(bool) @IsBoolean() is_active?: boolean;
  @ApiPropertyOptional({ enum: ORIGINS }) @IsOptional() @IsIn(ORIGINS) origin?: CatalogOrigin;
}

export class ControlsListQuery extends CatalogListQuery {
  @ApiPropertyOptional({ description: 'Uno de los 27 dominios del catálogo, tal cual' }) @IsOptional() @IsString() @MaxLength(200) domain?: string;
  @ApiPropertyOptional({ description: 'Código del requisito del marco' }) @IsOptional() @IsString() @MaxLength(50) requirement_code?: string;
  @ApiPropertyOptional({ description: 'false lista los controles sin evidencia requerida' }) @IsOptional() @Transform(bool) @IsBoolean() has_evidence_template?: boolean;
}

/** La lista global de controles: opcionalmente de un marco, o solo los que no pertenecen a ningún requisito. */
export class AllControlsListQuery extends ControlsListQuery {
  @ApiPropertyOptional({ description: 'Solo los controles de este marco' }) @IsOptional() @IsUUID() framework_id?: string;
  @ApiPropertyOptional({ description: 'true lista los controles que no cuelgan de ningún requisito (CPL-1, o uno nuevo sin vincular)' }) @IsOptional() @Transform(bool) @IsBoolean() unlinked?: boolean;
}

export class TestsListQuery extends CatalogListQuery {
  @ApiPropertyOptional({ enum: DIMENSIONS }) @IsOptional() @IsIn(DIMENSIONS) dimension?: string;
}
