import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { AssetStatus, AssetType, ChecklistOs } from 'generated/prisma-tenant/browser';

export class UpdateAssetDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name?: string;

    @ApiPropertyOptional({ enum: AssetType })
    @IsOptional()
    @IsEnum(AssetType)
    type?: AssetType;

    @ApiPropertyOptional({ enum: AssetStatus })
    @IsOptional()
    @IsEnum(AssetStatus)
    status?: AssetStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    externalId?: string;

    @ApiPropertyOptional({ enum: ChecklistOs })
    @IsOptional()
    @IsEnum(ChecklistOs)
    os?: ChecklistOs;
}
