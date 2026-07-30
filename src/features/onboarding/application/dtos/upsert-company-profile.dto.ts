import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BusinessType } from 'generated/prisma-tenant/browser';

export class UpsertCompanyProfileDto {
  @ApiPropertyOptional({ enum: BusinessType })
  @IsOptional()
  @IsEnum(BusinessType)
  business_type?: BusinessType;

  @ApiPropertyOptional({ description: 'Número de servidores a evaluar' })
  @IsOptional()
  @IsInt()
  @Min(1)
  server_count?: number;
}
