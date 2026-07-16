import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { ChecklistOs, ControlType } from 'generated/prisma/browser';

export class ControlChecklistItemDto {
    @ApiProperty({ description: 'check_id del check CIS en Wazuh', example: '28500' })
    @IsString()
    @IsNotEmpty()
    checkId!: string;

    @ApiProperty({ description: 'Título del check tal como se mostró al usuario', example: 'Ensure /tmp is a separate partition.' })
    @IsString()
    @IsNotEmpty()
    title!: string;
}

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

    @ApiPropertyOptional({
        enum: ChecklistOs,
        description: 'Sistema operativo del checklist seleccionado. Obligatorio si se envía "checklist".',
    })
    @ValidateIf((dto: CreateControlDto) => !!dto.checklist?.length)
    @IsEnum(ChecklistOs)
    os?: ChecklistOs;

    @ApiPropertyOptional({
        type: [ControlChecklistItemDto],
        description: 'Checks CIS seleccionados para un control automático (obtenidos de GET /checklist).',
    })
    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ControlChecklistItemDto)
    checklist?: ControlChecklistItemDto[];
}
