import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmpty,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  BUSINESS_MODEL_VALUES,
  CLIENT_COUNTRY_VALUES,
  COMPLIANCE_MATURITY_VALUES,
  INCORPORATION_COUNTRY_VALUES,
  INDUSTRY_VALUES,
  REGULATION_CODES,
  SIZE_VALUES,
  YEARS_IN_OPERATION_VALUES,
} from '../../../../common/catalogs/onboarding-catalogs';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// contracts/modules/onboarding-organizational-context.md — PUT /v1/onboarding/organizational-context.
// Se guarda el formulario completo (9 obligatorios + 1 opcional).
export class SaveOrganizationalContextDto {
  // La razón social se fijó al registrar la empresa y llega bloqueada: enviarla es un error.
  @ApiPropertyOptional({ description: 'No se acepta: la razón social es solo lectura.' })
  @IsEmpty()
  name?: string;

  @ApiProperty({ example: 'Consultoría de auditoría y cumplimiento para empresas de servicios en LATAM.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ enum: SIZE_VALUES })
  @IsIn(SIZE_VALUES)
  size!: (typeof SIZE_VALUES)[number];

  @ApiProperty({ enum: INDUSTRY_VALUES })
  @IsIn(INDUSTRY_VALUES)
  industry!: (typeof INDUSTRY_VALUES)[number];

  @ApiProperty({ enum: BUSINESS_MODEL_VALUES })
  @IsIn(BUSINESS_MODEL_VALUES)
  business_model!: (typeof BUSINESS_MODEL_VALUES)[number];

  @ApiPropertyOptional({ enum: YEARS_IN_OPERATION_VALUES, nullable: true })
  @IsOptional()
  @IsIn(YEARS_IN_OPERATION_VALUES)
  years_in_operation?: (typeof YEARS_IN_OPERATION_VALUES)[number] | null;

  @ApiProperty({ enum: INCORPORATION_COUNTRY_VALUES, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(INCORPORATION_COUNTRY_VALUES, { each: true })
  incorporation_countries!: (typeof INCORPORATION_COUNTRY_VALUES)[number][];

  @ApiProperty({ enum: CLIENT_COUNTRY_VALUES, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(CLIENT_COUNTRY_VALUES, { each: true })
  client_countries!: (typeof CLIENT_COUNTRY_VALUES)[number][];

  @ApiProperty({ enum: COMPLIANCE_MATURITY_VALUES })
  @IsIn(COMPLIANCE_MATURITY_VALUES)
  compliance_maturity!: (typeof COMPLIANCE_MATURITY_VALUES)[number];

  @ApiProperty({ enum: REGULATION_CODES, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(REGULATION_CODES, { each: true })
  regulation_codes!: (typeof REGULATION_CODES)[number][];
}
