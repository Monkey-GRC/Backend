import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { RESPONSIBLE_TYPES } from '../../domain/responsibles/responsible.repository';

// contracts/modules/compliance-responsibles.md (MD-133)
export class CreateResponsibleDto {
  @ApiProperty({ enum: RESPONSIBLE_TYPES, enumName: 'ResponsibleType', description: 'Cargo dentro de la organización (`GET /v1/catalogs/responsible_type`). Es un cargo, no una persona con cuenta.' }) @IsIn(RESPONSIBLE_TYPES) type!: (typeof RESPONSIBLE_TYPES)[number];
  @ApiProperty({ description: 'Nombre de quien ocupa el cargo (máx. 200).' }) @IsString() @IsNotEmpty() @MaxLength(200) person_name!: string;
}

export class UpdateResponsibleDto {
  @ApiProperty({ description: 'Nuevo nombre de quien ocupa el cargo (máx. 200).' }) @IsString() @IsNotEmpty() @MaxLength(200) person_name!: string;
}

export class ListResponsiblesQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: RESPONSIBLE_TYPES, enumName: 'ResponsibleType', description: 'Solo este cargo.' }) @IsOptional() @IsIn(RESPONSIBLE_TYPES) type?: (typeof RESPONSIBLE_TYPES)[number];
}
