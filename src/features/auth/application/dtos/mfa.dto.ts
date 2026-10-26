import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

// contracts/modules/auth.md — segundo factor (D94).

export class VerifyMfaDto {
  @ApiPropertyOptional({ example: '123456', description: 'El código de 6 dígitos de la app de autenticación (con o sin espacios). Se envía este o `recovery_code`.' })
  @ValidateIf((o: VerifyMfaDto) => !o.recovery_code)
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  code?: string;

  @ApiPropertyOptional({ example: 'K7QWM-3PZ9T', description: 'Uno de los códigos de recuperación (con o sin guion). Se envía este o `code`.' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  recovery_code?: string;
}

export class MfaCodeDto {
  @ApiProperty({ example: '123456', description: 'El código de 6 dígitos de la app de autenticación.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  code!: string;
}