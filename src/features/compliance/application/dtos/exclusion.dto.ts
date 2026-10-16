import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

// contracts/modules/compliance-audit.md (MD-144). La vigencia no la manda el cliente: sale del período del servicio.
const bool = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);

export class RequestExclusionDto {
  @ApiProperty() @IsUUID() test_id!: string;
  @ApiProperty() @IsUUID() asset_id!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(2000) justification!: string;
  @ApiPropertyOptional({ description: 'Obligatoria si el test es automático: la sonda no se sobrescribe sin sustento técnico.' })
  @IsOptional() @IsString() @MaxLength(2000) technical_justification?: string;
}

export class DecideExclusionDto {
  @ApiProperty({ enum: ['approved', 'rejected'] }) @IsIn(['approved', 'rejected']) status!: 'approved' | 'rejected';
  @ApiPropertyOptional({ description: 'Obligatoria al rechazar.' }) @IsOptional() @IsString() @MaxLength(2000) decision_note?: string;
}

export class ListExclusionsQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected'] }) @IsOptional() @IsIn(['pending', 'approved', 'rejected']) status?: 'pending' | 'approved' | 'rejected';
  @ApiPropertyOptional() @IsOptional() @IsUUID() test_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() asset_id?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(bool) @IsBoolean() expired?: boolean;
}
