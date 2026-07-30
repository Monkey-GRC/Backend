import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChecklistOs } from 'generated/prisma-tenant/browser';

export class GetChecklistQueryDto {
    @ApiProperty({ enum: ChecklistOs, description: 'Sistema operativo del checklist CIS' })
    @IsEnum(ChecklistOs)
    os!: ChecklistOs;

    @ApiPropertyOptional({ description: 'Filtro de búsqueda por título del check' })
    @IsOptional()
    @IsString()
    search?: string;
}
