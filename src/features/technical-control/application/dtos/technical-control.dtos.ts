import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsIP,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ASSET_CRITICALITY_VALUES,
  CONNECTION_CATEGORY_VALUES,
  CONNECTION_METHOD_VALUES,
  SCHEDULE_FREQUENCY_VALUES,
} from '../../../../common/catalogs/technical-catalogs';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const trimOrNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

// PUT /v1/services/{id}/connections/{assetId}/assets — los activos de la conexión que son de este servicio (los demás quedan fuera).
export class ServiceAssetsDto {
  @ApiProperty({ isArray: true, type: String, format: 'uuid', maxItems: 500, description: 'Activos de la conexión que pertenecen a este servicio, sin repetir. El conjunto es exacto: los que no vengan quedan fuera.' })
  @IsArray()
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  asset_ids!: string[];
}

// POST /v1/assets — registrar y conectar. El tipo del activo se deduce de la conexión (D46).
export class CreateAssetDto {
  @ApiProperty({ example: 'srv-app-prod-01', maxLength: 200, description: 'Nombre del activo.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ enum: CONNECTION_CATEGORY_VALUES, enumName: 'ConnectionCategory', description: 'Qué se quiere conectar (`ac_01`…`ac_06`, de `GET /v1/catalogs/automated-capabilities`). De aquí se deduce el tipo del activo.' })
  @IsIn(CONNECTION_CATEGORY_VALUES)
  connection_category!: (typeof CONNECTION_CATEGORY_VALUES)[number];

  @ApiProperty({ example: 'aws', description: 'El `code` de la plataforma que el cliente eligió en el marketplace (D67). Debe pertenecer a la conexión y estar disponible.' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  platform!: string;

  @ApiPropertyOptional({ nullable: true, example: '10.20.3.14', description: 'Dirección IP, si aplica.' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsIP()
  ip_address?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Azure East US', maxLength: 200, description: 'Dónde está el activo.' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(200)
  location?: string | null;

  @ApiPropertyOptional({ enum: ASSET_CRITICALITY_VALUES, enumName: 'AssetCriticality', default: 'medium', description: 'Qué tan crítico es para el negocio.' })
  @IsOptional()
  @IsIn(ASSET_CRITICALITY_VALUES)
  criticality?: (typeof ASSET_CRITICALITY_VALUES)[number];

  @ApiPropertyOptional({ isArray: true, type: String, maxItems: 20, description: 'Etiquetas libres (máx. 20, hasta 50 caracteres cada una, sin repetir).' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiProperty({ isArray: true, type: String, format: 'uuid', description: 'Servicios a los que da soporte; al menos uno, sin repetir.' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  service_ids!: string[];

  @ApiPropertyOptional({ nullable: true, format: 'uuid', description: 'Responsable del activo (`GET /v1/responsibles`).' })
  @IsOptional()
  @IsUUID()
  responsible_id?: string | null;

  @ApiPropertyOptional({ type: Object, description: 'Solo en el canal de llaves: se guardan cifradas y **nunca se devuelven**.' })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;

  @ApiProperty({ enum: CONNECTION_METHOD_VALUES, enumName: 'ConnectionMethod', description: 'Canal de conexión (D53): uno de los de su plataforma.' })
  @IsIn(CONNECTION_METHOD_VALUES)
  connection_method!: (typeof CONNECTION_METHOD_VALUES)[number];

  @ApiPropertyOptional({ nullable: true, example: '123456789012', maxLength: 30, description: 'Cuenta de AWS a la que apunta la conexión (12 dígitos) o, en GCP, el ID del proyecto.' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(30)
  external_account_id?: string | null;

  @ApiPropertyOptional({ isArray: true, type: String, example: ['us-east-1'], maxItems: 50, description: 'Regiones a evaluar: las únicas que se miran (D53). Opciones en `GET /v1/catalogs/aws_region`. No van en GCP (`identity_federation`): se evalúa el proyecto completo.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  regions?: string[];
}

// PATCH /v1/assets/{id} — editar un sistema. Todo es opcional; lo que cambia la conexión (cuenta, regiones, rol, llaves) la devuelve a «pendiente».
export class UpdateAssetDto {
  @ApiPropertyOptional({ maxLength: 200, description: 'Nuevo nombre.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: ASSET_CRITICALITY_VALUES, enumName: 'AssetCriticality' })
  @IsOptional()
  @IsIn(ASSET_CRITICALITY_VALUES)
  criticality?: (typeof ASSET_CRITICALITY_VALUES)[number];

  @ApiPropertyOptional({ isArray: true, type: String, maxItems: 20, description: 'Reemplaza las etiquetas.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: '123456789012', maxLength: 30, description: 'Cuenta nueva. **Reinicia la conexión** a `pending` y genera un identificador externo nuevo.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(30)
  external_account_id?: string;

  @ApiPropertyOptional({ isArray: true, type: String, example: ['us-east-1'], maxItems: 50, description: 'Regiones nuevas. Reinicia la conexión a `pending`.' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional({ example: 'arn:aws:iam::123456789012:role/MonkeyReadOnly', maxLength: 700, description: 'Rol nuevo. Reinicia la conexión a `pending`.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(700)
  role_arn?: string;

  @ApiPropertyOptional({ type: Object, description: 'Solo en el canal de llaves: reemplaza las llaves. Se guardan cifradas y nunca se devuelven. Reinicia la conexión a `pending`.' })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;
}

// PATCH /v1/assets/{id}/connection — el cliente entrega el rol (AWS) o el número de proyecto (GCP). Cuál es obligatorio lo decide el canal del activo.
export class SetConnectionDto {
  @ApiPropertyOptional({ example: 'arn:aws:iam::123456789012:role/MonkeyReadOnly', maxLength: 700, description: '`RoleArn` del rol de solo lectura que el cliente creó con la plantilla. Obligatorio en `readonly_role`; no va en `identity_federation`.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(700)
  role_arn?: string;

  @ApiPropertyOptional({ example: '407295138461', maxLength: 19, description: 'Número del proyecto de GCP que imprime el script de alta (6 a 19 dígitos). Obligatorio en `identity_federation`; no va en `readonly_role`. No es un secreto.' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(19)
  project_number?: string;
}

// PUT /v1/assets/{id}/schedule
export class ScheduleDto {
  @ApiProperty({ enum: SCHEDULE_FREQUENCY_VALUES, enumName: 'ScheduleFrequency', description: 'Cada cuánto se evalúa (`GET /v1/catalogs/schedule_frequency`).' })
  @IsIn(SCHEDULE_FREQUENCY_VALUES)
  frequency!: (typeof SCHEDULE_FREQUENCY_VALUES)[number];
}

// GET /v1/assets?page=1&page_size=25&service_id=…&connection_category=…&operational_status=…
export class ListAssetsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size = 25;

  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los activos de este servicio.' }) @IsOptional() @IsUUID() service_id?: string;

  @ApiPropertyOptional({ enum: CONNECTION_CATEGORY_VALUES, enumName: 'ConnectionCategory', description: 'Solo esta categoría de conexión.' })
  @IsOptional()
  @IsIn(CONNECTION_CATEGORY_VALUES)
  connection_category?: (typeof CONNECTION_CATEGORY_VALUES)[number];

  @ApiPropertyOptional({ enum: ['operational', 'warning', 'error', 'not_monitored'], enumName: 'OperationalStatus', description: 'Solo este estado operativo.' })
  @IsOptional()
  @IsIn(['operational', 'warning', 'error', 'not_monitored'])
  operational_status?: string;
}
