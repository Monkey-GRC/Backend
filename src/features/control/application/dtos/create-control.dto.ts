import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ControlType } from 'generated/prisma/browser';

export class CreateControlDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    objective?: string;

    @ApiPropertyOptional({ enum: ControlType })
    @IsOptional()
    @IsEnum(ControlType)
    type?: ControlType;
}
