import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { REGULATION_CODES } from '../../../../common/catalogs/onboarding-catalogs';
import {
  ACTIVE_CLIENT_COUNT_VALUES,
  DATA_TYPE_VALUES,
  EXPECTED_AVAILABILITY_VALUES,
  PREVIOUS_CERTIFICATION_VALUES,
  SERVED_INDUSTRY_VALUES,
  SERVICE_COUNTRY_VALUES,
  SERVICE_TYPE_VALUES,
  SUBSERVICE_TYPE_VALUES,
  TRUST_CRITERION_VALUES,
} from '../../../../common/catalogs/service-catalogs';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
// Un detalle opcional vacío se guarda como "no lo dijo", no como texto vacío.
const trimOrNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

export class SubserviceDto {
  @ApiProperty({ enum: SUBSERVICE_TYPE_VALUES })
  @IsIn(SUBSERVICE_TYPE_VALUES)
  type!: (typeof SUBSERVICE_TYPE_VALUES)[number];

  @ApiPropertyOptional({ nullable: true, example: 'Amazon Web Services' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(200)
  provider?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Cómputo y almacenamiento' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(300)
  service_provided?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(1000)
  responsibility?: string | null;
}

// Por ahora la Descripción del Sistema es un enlace (kind=link). La carga de archivo queda
// pendiente de decisión (contracts/modules/onboarding-service-context.md, preguntas abiertas).
export class SystemDescriptionDto {
  @ApiProperty({ enum: ['link'] })
  @IsIn(['link'])
  kind!: 'link';

  @ApiProperty({ example: 'https://docs.ejemplo.com/system-description-v2.pdf' })
  @Transform(trim)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2000)
  url!: string;
}

// contracts/modules/onboarding-service-context.md — POST /v1/services.
// 13 obligatorios + 3 opcionales del Excel, en 15 claves (el subservicio colapsa en un array).
export class CreateServiceDto {
  @ApiProperty({ example: 'Mesa de servicio gestionada' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  scope_statement!: string;

  @ApiProperty({ enum: SERVICE_TYPE_VALUES })
  @IsIn(SERVICE_TYPE_VALUES)
  type!: (typeof SERVICE_TYPE_VALUES)[number];

  @ApiProperty({ enum: SERVED_INDUSTRY_VALUES, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(SERVED_INDUSTRY_VALUES, { each: true })
  industries_served!: (typeof SERVED_INDUSTRY_VALUES)[number][];

  @ApiPropertyOptional({ enum: ACTIVE_CLIENT_COUNT_VALUES, nullable: true })
  @IsOptional()
  @IsIn(ACTIVE_CLIENT_COUNT_VALUES)
  active_client_count?: (typeof ACTIVE_CLIENT_COUNT_VALUES)[number] | null;

  @ApiProperty({ enum: SERVICE_COUNTRY_VALUES, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(SERVICE_COUNTRY_VALUES, { each: true })
  countries!: (typeof SERVICE_COUNTRY_VALUES)[number][];

  @ApiProperty({ enum: DATA_TYPE_VALUES, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(DATA_TYPE_VALUES, { each: true })
  data_types!: (typeof DATA_TYPE_VALUES)[number][];

  @ApiProperty({
    enum: TRUST_CRITERION_VALUES,
    isArray: true,
    description: 'Si falta `security`, el servidor la añade.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(TRUST_CRITERION_VALUES, { each: true })
  trust_criteria!: (typeof TRUST_CRITERION_VALUES)[number][];

  @ApiProperty({ type: () => [SubserviceDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubserviceDto)
  subservice_organizations!: SubserviceDto[];

  @ApiProperty({ isArray: true, example: ['soc2'], description: 'Opciones en GET /v1/catalogs/frameworks.' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  framework_codes!: string[];

  @ApiProperty({ enum: REGULATION_CODES, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(REGULATION_CODES, { each: true })
  regulation_codes!: (typeof REGULATION_CODES)[number][];

  @ApiPropertyOptional({ enum: PREVIOUS_CERTIFICATION_VALUES, nullable: true })
  @IsOptional()
  @IsIn(PREVIOUS_CERTIFICATION_VALUES)
  previous_certification?: (typeof PREVIOUS_CERTIFICATION_VALUES)[number] | null;

  @ApiProperty({ enum: EXPECTED_AVAILABILITY_VALUES })
  @IsIn(EXPECTED_AVAILABILITY_VALUES)
  expected_availability!: (typeof EXPECTED_AVAILABILITY_VALUES)[number];

  @ApiProperty({ type: () => SystemDescriptionDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => SystemDescriptionDto)
  system_description!: SystemDescriptionDto;
}
