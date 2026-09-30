import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsDefined, IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// contracts/modules/monkey-admin.md — el comité fija 3 campos, no más (modelo-datos.md §4.2).
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
}
