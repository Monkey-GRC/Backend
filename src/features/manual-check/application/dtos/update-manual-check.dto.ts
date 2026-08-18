import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateManualCheckDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    remediation?: string;
}
