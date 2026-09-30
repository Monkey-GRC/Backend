import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH } from '../../../../common/security/password-policy';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// contracts/modules/auth.md — POST /v1/auth/redeem (forma de "código", supuesto de P2a).
export class RedeemAccessKeyDto {
  @ApiProperty({ example: 'MNK-7F3A-92KD-5QXB' })
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
  @ApiProperty({ example: 'UnaClaveLarga123!' })
  @IsString()
  @MaxLength(128)
  @IsStrongPassword({
    minLength: PASSWORD_MIN_LENGTH,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password!: string;

  @ApiProperty({ example: 'Ana' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'Pérez' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name!: string;
}
