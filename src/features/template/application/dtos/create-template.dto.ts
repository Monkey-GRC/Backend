import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateTemplateDto {
    @ApiProperty({ description: 'Nombre del template', example: 'SOC 2' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @ApiProperty({
        description: 'Identificador único legible del template (minúsculas, guiones)',
        example: 'soc-2',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        message: 'slug debe contener solo minúsculas, números y guiones',
    })
    slug!: string;

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(500)
    scope?: string;
}
