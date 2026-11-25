import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { DIMENSIONS } from '../../../../common/catalogs/dimensions';
import type { CatalogOrigin } from '../../domain/repositories/catalog-admin.repository';

const ORIGINS: CatalogOrigin[] = ['committee', 'monkey_admin'];
const bool = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);

// contracts/modules/monkey-admin-catalog.md. `forbidNonWhitelisted` está activo: cada clase declara solo los filtros que su lista entiende.

/** Paginación sola (la lista de marcos). */
export class CatalogPageQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
}

/** Riesgos, causas y plantillas de evidencia. */
export class CatalogListQuery extends CatalogPageQuery {
  @ApiPropertyOptional({ description: 'Busca en el código y en el nombre o la descripción (máx. 100 caracteres).' }) @IsOptional() @IsString() @MaxLength(100) search?: string;
  @ApiPropertyOptional({ description: '`true` solo los activos · `false` solo los dados de baja. Sin enviar, todos.' }) @IsOptional() @Transform(bool) @IsBoolean() is_active?: boolean;
  @ApiPropertyOptional({ enum: ORIGINS, enumName: 'CatalogOrigin', description: '`committee` viene del Excel del comité · `monkey_admin` lo creó un administrador de Monkey.' }) @IsOptional() @IsIn(ORIGINS) origin?: CatalogOrigin;
}

export class ControlsListQuery extends CatalogListQuery {
  @ApiPropertyOptional({ description: 'Uno de los 27 dominios del catálogo, tal cual.' }) @IsOptional() @IsString() @MaxLength(200) domain?: string;
  @ApiPropertyOptional({ description: 'Código del requisito del marco (por ejemplo `CC6.1`).' }) @IsOptional() @IsString() @MaxLength(50) requirement_code?: string;
  @ApiPropertyOptional({ description: '`false` lista los controles sin evidencia requerida; `true`, los que sí la tienen.' }) @IsOptional() @Transform(bool) @IsBoolean() has_evidence_template?: boolean;
}

/** La lista global de controles: opcionalmente de un marco, o solo los que no pertenecen a ningún requisito. */
export class AllControlsListQuery extends ControlsListQuery {
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los controles de este marco.' }) @IsOptional() @IsUUID() framework_id?: string;
  @ApiPropertyOptional({ description: '`true` lista los controles que no cuelgan de ningún requisito (CPL-1, o uno nuevo sin vincular).' }) @IsOptional() @Transform(bool) @IsBoolean() unlinked?: boolean;
}

export class TestsListQuery extends CatalogListQuery {
  @ApiPropertyOptional({ enum: DIMENSIONS, enumName: 'Dimension', description: 'Solo las pruebas de esta dimensión.' }) @IsOptional() @IsIn(DIMENSIONS) dimension?: string;
}
