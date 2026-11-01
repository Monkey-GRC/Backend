import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MaxLength, ValidateIf } from 'class-validator';
import { PASSWORD_POLICY } from '../../../../common/security/password-policy';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// contracts/modules/auth.md — cambio y recuperación de contraseña (D101). La contraseña nueva cumple la política de SEG-13.
export class ChangePasswordDto {
  @ApiProperty({ description: 'La contraseña con la que la persona entró.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  current_password!: string;

  @ApiProperty({ example: 'UnaClaveLarga123!', minLength: 12, maxLength: 128, description: 'Contraseña nueva: 12 o más caracteres con mayúscula, minúscula, número y símbolo.' })
  @IsString()
  @MaxLength(128)
  @IsStrongPassword({ ...PASSWORD_POLICY })
  new_password!: string;

  @ApiPropertyOptional({ example: '123456', description: 'El código de 6 dígitos de la app de autenticación. Se envía este o `recovery_code`.' })
  @ValidateIf((o: ChangePasswordDto) => !o.recovery_code)
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  code?: string;

  @ApiPropertyOptional({ example: 'K7QWM-3PZ9T', description: 'Uno de los códigos de recuperación. Se envía este o `code`.' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  recovery_code?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ana.perez@ejemplo.com', description: 'El correo de la cuenta. La respuesta es la misma exista o no.' })
  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'El código del enlace que llegó al correo.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  token!: string;

  @ApiProperty({ example: 'UnaClaveLarga123!', minLength: 12, maxLength: 128, description: 'Contraseña nueva: 12 o más caracteres con mayúscula, minúscula, número y símbolo.' })
  @IsString()
  @MaxLength(128)
  @IsStrongPassword({ ...PASSWORD_POLICY })
  new_password!: string;

  @ApiPropertyOptional({ example: '123456', description: 'El código de 6 dígitos de la app de autenticación. Se envía este o `recovery_code`. Lo exige quien ya tiene el segundo factor.' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  code?: string;

  @ApiPropertyOptional({ example: 'K7QWM-3PZ9T', description: 'Uno de los códigos de recuperación. Se envía este o `code`.' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  recovery_code?: string;
}
