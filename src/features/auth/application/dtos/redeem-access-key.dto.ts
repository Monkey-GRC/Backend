import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { PASSWORD_POLICY } from '../../../../common/security/password-policy';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// contracts/modules/auth.md — POST /v1/auth/redeem (forma de "código", supuesto de P2a).
export class RedeemAccessKeyDto {
  @ApiProperty({ example: 'MNK-7F3A-92KD-5QXB', maxLength: 32, description: 'Clave de acceso que Monkey entregó al cliente (de un solo uso).' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  code!: string;

  @ApiProperty({ example: 'ana.perez@ejemplo.com', description: 'Debe ser el correo administrativo registrado' })
  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  email!: string;

  // Política de §5.3: 12+ caracteres con mayúscula, minúscula, número y símbolo.
  @ApiProperty({ example: 'UnaClaveLarga123!', minLength: 12, maxLength: 128, description: 'Contraseña nueva: 12 o más caracteres con mayúscula, minúscula, número y símbolo.' })
  @IsString()
  @MaxLength(128)
  @IsStrongPassword({ ...PASSWORD_POLICY })
  password!: string;
}
