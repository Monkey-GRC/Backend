import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// contracts/modules/monkey-admin.md — el comité fija 3 campos (modelo-datos.md §4.2) y D47 añade el
// marco que se contrata para la empresa.
export class CreateCompanyDto {
  @ApiProperty({ example: 'Next Audit & Consulting S.A.S.', maxLength: 255, description: 'Razón social. Es única entre las empresas.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: false, description: '`true` pide una base de datos dedicada (`isolation_strategy: dedicated`); hoy no está disponible y responde `DEDICATED_DATABASE_NOT_AVAILABLE`. `false` usa la base compartida con aislamiento por empresa.' })
  @IsDefined()
  @IsBoolean()
  requires_dedicated_database!: boolean;

  @ApiProperty({ example: 'contacto@ejemplo.com', maxLength: 254, description: 'Correo del administrador de la empresa. Con este correo se canjea la clave de acceso.' })
  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  admin_email!: string;

  @ApiPropertyOptional({
    isArray: true,
    type: String,
    example: ['soc2'],
    description: 'Marcos que se contratan para la empresa (`GET /v1/catalogs/frameworks`), sin repetir. Por defecto, SOC 2.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  framework_codes?: string[];
}
