import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { AssetSource, AssetType, ChecklistOs } from 'generated/prisma-tenant/browser';

export class CreateAssetDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name!: string;

    @ApiProperty({ enum: AssetType })
    @IsEnum(AssetType)
    type!: AssetType;

    @ApiPropertyOptional({ enum: AssetSource, default: AssetSource.MANUAL })
    @IsOptional()
    @IsEnum(AssetSource)
    source?: AssetSource;

    @ApiPropertyOptional({
        description: 'Identificador en el sistema origen (ej. agent_id de Wazuh). Obligatorio si source es WAZUH_AGENT.',
    })
    @ValidateIf((dto: CreateAssetDto) => dto.source === AssetSource.WAZUH_AGENT)
    @IsString()
    @IsNotEmpty()
    externalId?: string;

    @ApiPropertyOptional({ enum: ChecklistOs, description: 'Sistema operativo, si el activo es un servidor evaluado por Wazuh.' })
    @IsOptional()
    @IsEnum(ChecklistOs)
    os?: ChecklistOs;
}
