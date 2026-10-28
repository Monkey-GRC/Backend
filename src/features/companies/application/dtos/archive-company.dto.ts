import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export const DEACTIVATION_REASONS = ['non_payment', 'client_request', 'other'] as const;
export const DEFAULT_RETENTION_DAYS = 180; // 6 meses (D95)
export const MIN_RETENTION_DAYS = 7;

// contracts/modules/monkey-admin.md — POST /v1/companies/{id}/deactivation (D95).
export class ArchiveCompanyDto {
  @ApiProperty({ example: 'Next Audit & Consulting S.A.S.', description: 'La razón social, escrita **exactamente** como está registrada.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  confirm_name!: string;

  @ApiProperty({ enum: DEACTIVATION_REASONS, enumName: 'CompanyDeactivationReason' })
  @IsIn(DEACTIVATION_REASONS)
  reason_code!: (typeof DEACTIVATION_REASONS)[number];

  @ApiProperty({ example: 'Dos facturas vencidas.', minLength: 5, maxLength: 500, description: 'Por qué se archiva. Queda con la empresa y se borra con ella.' })
  @Transform(trim)
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ example: 180, default: DEFAULT_RETENTION_DAYS, minimum: MIN_RETENTION_DAYS, maximum: 3650, description: 'Días hasta el borrado definitivo de la empresa y todos sus datos (6 meses por defecto, mínimo 7).' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MIN_RETENTION_DAYS)
  @Max(3650)
  retention_days: number = DEFAULT_RETENTION_DAYS;

  @ApiPropertyOptional({ example: '123456', description: 'Código vigente de la app de autenticación **de quien archiva**.' })
  @IsOptional()
  @Matches(/^\d{6}$/)
  totp_code?: string;
}

// POST /v1/companies/{id}/reactivation
export class ReactivateCompanyDto {
  @ApiProperty({ example: 'Pagó la deuda.', minLength: 5, maxLength: 500, description: 'Por qué se reactiva. Queda en el rastro de auditoría.' })
  @Transform(trim)
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ example: '123456', description: 'Código vigente de la app de autenticación **de quien reactiva**.' })
  @IsOptional()
  @Matches(/^\d{6}$/)
  totp_code?: string;
}
