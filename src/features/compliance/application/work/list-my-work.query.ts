import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { WORK_BUCKETS } from '../../domain/work/work-bucket';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// GET /v1/me/work (contracts/gestion-usuarios.md · «Mi trabajo»).
export class ListMyWorkQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: WORK_BUCKETS, enumName: 'WorkBucket', description: 'Solo los controles de este bucket; `to_review` solo lo tiene el `responsable`.' }) @IsOptional() @IsIn(WORK_BUCKETS) bucket?: (typeof WORK_BUCKETS)[number];
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los controles de este servicio; el avance (`progress`) también.' }) @IsOptional() @IsUUID() service_id?: string;
  @ApiPropertyOptional({ description: 'Busca, sin distinguir mayúsculas ni acentos, en el código y el título del control.' }) @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) q?: string;
}
