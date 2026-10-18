import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// contracts/modules/auth.md — POST /v1/auth/login. La política de 12+ caracteres se exige al
// crear la contraseña, no al usarla: aquí solo se valida la forma.
export class LoginDto {
  @ApiProperty({ example: 'ana.perez@ejemplo.com', description: 'Correo del usuario (máx. 254).' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'UnaClaveLarga123!', description: 'Contraseña (máx. 256). Aquí solo se valida la forma; la política de 12+ caracteres se exige al crearla.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  password!: string;
}
