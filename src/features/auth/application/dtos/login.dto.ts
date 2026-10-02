import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// contracts/modules/auth.md — POST /v1/auth/login. La política de 12+ caracteres se exige al
// crear la contraseña, no al usarla: aquí solo se valida la forma.
export class LoginDto {
  @ApiProperty({ example: 'ana.perez@ejemplo.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'UnaClaveLarga123!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  password!: string;
}
