import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
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
  @ApiProperty({ enum: SUBSERVICE_TYPE_VALUES, enumName: 'SubserviceType', description: 'Tipo de tercero del que depende el servicio (`GET /v1/catalogs/subservice_type`).' })
  @IsIn(SUBSERVICE_TYPE_VALUES)
  type!: (typeof SUBSERVICE_TYPE_VALUES)[number];

  @ApiPropertyOptional({ nullable: true, example: 'Amazon Web Services', maxLength: 200, description: 'Nombre del proveedor.' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(200)
  provider?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Cómputo y almacenamiento', maxLength: 300, description: 'Qué servicio presta.' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(300)
  service_provided?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 1000, description: 'Qué responsabilidad asume el tercero frente al servicio.' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(1000)
  responsibility?: string | null;
}

// En el JSON la Descripción del Sistema es siempre un enlace (kind=link); el archivo viaja por
// multipart en POST /v1/services/{id}/system-description (D51).
export class SystemDescriptionDto {
  @ApiProperty({ enum: ['link'], description: 'En el JSON la Descripción del Sistema es siempre un enlace. Para un archivo se usa la subida multipart.' })
  @IsIn(['link'])
  kind!: 'link';

  @ApiProperty({ example: 'https://docs.ejemplo.com/system-description-v2.pdf', maxLength: 2000, description: 'Enlace `http` o `https` al documento.' })
  @Transform(trim)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2000)
  url!: string;
}

// contracts/modules/onboarding-service-context.md — POST /v1/services.
// 13 obligatorios + 3 opcionales del Excel, en 15 claves (el subservicio colapsa en un array).
export class CreateServiceDto {
  @ApiProperty({ example: 'Mesa de servicio gestionada', maxLength: 200, description: 'Nombre del servicio. Es único dentro de la empresa.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ maxLength: 2000, description: 'Qué hace el servicio.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ maxLength: 2000, description: 'Alcance: qué entra y qué no en la evaluación.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  scope_statement!: string;

  @ApiProperty({ enum: SERVICE_TYPE_VALUES, enumName: 'ServiceType', description: 'Tipo de servicio (`GET /v1/catalogs/service_type`).' })
  @IsIn(SERVICE_TYPE_VALUES)
  type!: (typeof SERVICE_TYPE_VALUES)[number];

  @ApiProperty({ enum: SERVED_INDUSTRY_VALUES, enumName: 'ServedIndustry', isArray: true, description: 'Industrias a las que sirve; al menos una, sin repetir.' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(SERVED_INDUSTRY_VALUES, { each: true })
  industries_served!: (typeof SERVED_INDUSTRY_VALUES)[number][];

  @ApiPropertyOptional({ enum: ACTIVE_CLIENT_COUNT_VALUES, enumName: 'ActiveClientCount', nullable: true, description: 'Opcional: rango de clientes activos.' })
  @IsOptional()
  @IsIn(ACTIVE_CLIENT_COUNT_VALUES)
  active_client_count?: (typeof ACTIVE_CLIENT_COUNT_VALUES)[number] | null;

  @ApiProperty({ enum: SERVICE_COUNTRY_VALUES, enumName: 'ServiceCountry', isArray: true, description: 'Países (o regiones como `latam`) donde se presta; al menos uno, sin repetir.' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(SERVICE_COUNTRY_VALUES, { each: true })
  countries!: (typeof SERVICE_COUNTRY_VALUES)[number][];

  @ApiProperty({ enum: DATA_TYPE_VALUES, enumName: 'DataType', isArray: true, description: 'Tipos de datos que el servicio trata; al menos uno, sin repetir.' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(DATA_TYPE_VALUES, { each: true })
  data_types!: (typeof DATA_TYPE_VALUES)[number][];

  @ApiProperty({ enum: TRUST_CRITERION_VALUES, enumName: 'TrustCriterion', isArray: true, description: 'Criterios de confianza de SOC 2 a evaluar. Si falta `security`, el servidor la añade. Cambiarlos recalcula los requisitos aplicables.' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(TRUST_CRITERION_VALUES, { each: true })
  trust_criteria!: (typeof TRUST_CRITERION_VALUES)[number][];

  @ApiProperty({ type: () => [SubserviceDto], description: 'Terceros de los que depende el servicio; al menos uno.' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubserviceDto)
  subservice_organizations!: SubserviceDto[];

  @ApiProperty({ isArray: true, type: String, example: ['soc2'], description: 'Marcos a evaluar en este servicio; deben estar contratados por la empresa (`GET /v1/catalogs/contracted-frameworks`).' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  framework_codes!: string[];

  @ApiPropertyOptional({ enum: PREVIOUS_CERTIFICATION_VALUES, enumName: 'PreviousCertification', nullable: true, description: 'Opcional: certificación previa que ya tenga.' })
  @IsOptional()
  @IsIn(PREVIOUS_CERTIFICATION_VALUES)
  previous_certification?: (typeof PREVIOUS_CERTIFICATION_VALUES)[number] | null;

  @ApiProperty({ enum: EXPECTED_AVAILABILITY_VALUES, enumName: 'ExpectedAvailability', description: 'Cuándo espera tener el informe.' })
  @IsIn(EXPECTED_AVAILABILITY_VALUES)
  expected_availability!: (typeof EXPECTED_AVAILABILITY_VALUES)[number];

  // Opcional: quien prefiere subir un archivo crea el servicio y lo sube a continuación con
  // POST /v1/services/{id}/system-description (multipart). El servicio queda incompleto hasta entonces.
  @ApiPropertyOptional({ type: () => SystemDescriptionDto, description: 'Opcional. Con un archivo en vez de enlace, el servicio se crea primero y el archivo se sube después; queda incompleto hasta entonces.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SystemDescriptionDto)
  system_description?: SystemDescriptionDto;
}
