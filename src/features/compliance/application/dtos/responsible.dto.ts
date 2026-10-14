import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { RESPONSIBLE_TYPES } from '../../domain/repositories/responsible.repository';

// contracts/modules/compliance-responsibles.md (MD-133)
export class CreateResponsibleDto {
  @ApiProperty({ enum: RESPONSIBLE_TYPES }) @IsIn(RESPONSIBLE_TYPES) type!: (typeof RESPONSIBLE_TYPES)[number];
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) person_name!: string;
}

export class UpdateResponsibleDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(200) person_name!: string;
}

export class ListResponsiblesQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: RESPONSIBLE_TYPES }) @IsOptional() @IsIn(RESPONSIBLE_TYPES) type?: (typeof RESPONSIBLE_TYPES)[number];
}
