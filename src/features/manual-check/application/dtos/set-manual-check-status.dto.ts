import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ManualCheckStatus } from 'generated/prisma-tenant/browser';

export class SetManualCheckStatusDto {
    @ApiProperty({ enum: ManualCheckStatus })
    @IsEnum(ManualCheckStatus)
    status!: ManualCheckStatus;

    @ApiPropertyOptional({ description: 'Observaciones de quien evaluó el check' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;
}
