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

// contracts/modules/monkey-admin.md — el comité fija 3 campos (modelo-datos.md §4.2) y D43 añade el
// marco que se contrata para la empresa.
export class CreateCompanyDto {
  @ApiProperty({ example: 'Next Audit & Consulting S.A.S.', description: 'Razón social' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: false, description: 'true → isolation_strategy dedicated' })
  @IsDefined()
  @IsBoolean()
  requires_dedicated_database!: boolean;

  @ApiProperty({ example: 'contacto@ejemplo.com' })
  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  admin_email!: string;

  @ApiPropertyOptional({
    isArray: true,
    type: String,
    example: ['soc2'],
    description: 'Marcos que se contratan para la empresa (GET /v1/catalogs/frameworks). Por defecto, SOC 2.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  framework_codes?: string[];
}
