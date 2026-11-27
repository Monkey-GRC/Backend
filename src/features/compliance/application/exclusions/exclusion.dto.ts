import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

// contracts/modules/compliance-audit.md (MD-144). MD-501: la vigencia la manda el cliente (`valid_until`) con el tope de PR-04.
const bool = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);

export class RequestExclusionDto {
  @ApiProperty({ format: 'uuid', description: 'Prueba que se pide excluir.' }) @IsUUID() test_id!: string;
  @ApiProperty({ format: 'uuid', description: 'Activo al que se le excluye la prueba.' }) @IsUUID() asset_id!: string;
  @ApiProperty({ description: 'Por qué se excluye (máx. 2000).' }) @IsString() @IsNotEmpty() @MaxLength(2000) justification!: string;
  @ApiProperty({ description: 'El sustento técnico (control compensatorio, aislamiento…): la sonda no se acepta en falla sin él (máx. 2000).' }) @IsString() @IsNotEmpty() @MaxLength(2000) technical_justification!: string;
  @ApiProperty({ example: '2027-01-31', description: 'Fecha de fin (YYYY-MM-DD): posterior a hoy y como mucho hoy + el tope de excepciones (PR-04).' }) @IsDateString({ strict: true }) valid_until!: string;
}

export class ListExclusionsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo las de esta prueba.' }) @IsOptional() @IsUUID() test_id?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo las de este activo.' }) @IsOptional() @IsUUID() asset_id?: string;
  @ApiPropertyOptional({ description: '`true` solo las aprobadas cuya vigencia ya pasó; `false` las vigentes.' }) @IsOptional() @Transform(bool) @IsBoolean() expired?: boolean;
}
