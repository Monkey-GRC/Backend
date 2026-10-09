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
  DEPLOYMENT_SCENARIO_VALUES,
  SCHEDULE_FREQUENCY_VALUES,
} from '../../../../common/catalogs/technical-catalogs';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const trimOrNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

// PUT /v1/services/{id}/deployment-scenario
export class DeploymentScenarioDto {
  @ApiProperty({ enum: DEPLOYMENT_SCENARIO_VALUES })
  @IsIn(DEPLOYMENT_SCENARIO_VALUES)
  deployment_scenario!: (typeof DEPLOYMENT_SCENARIO_VALUES)[number];
}

// PUT /v1/services/{id}/connections/{assetId}/assets — los activos de la conexión que son de este servicio (los demás quedan fuera).
export class ServiceAssetsDto {
  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  asset_ids!: string[];
}

// POST /v1/assets — registrar y conectar. El tipo del activo se deduce de la conexión (D46).
export class CreateAssetDto {
  @ApiProperty({ example: 'srv-app-prod-01' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ enum: CONNECTION_CATEGORY_VALUES })
  @IsIn(CONNECTION_CATEGORY_VALUES)
  connection_category!: (typeof CONNECTION_CATEGORY_VALUES)[number];

  @ApiProperty({ example: 'Linux' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  platform!: string;

  @ApiPropertyOptional({ nullable: true, example: '10.20.3.14' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsIP()
  ip_address?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Azure East US' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(200)
  location?: string | null;

  @ApiPropertyOptional({ enum: ASSET_CRITICALITY_VALUES, default: 'medium' })
  @IsOptional()
  @IsIn(ASSET_CRITICALITY_VALUES)
  criticality?: (typeof ASSET_CRITICALITY_VALUES)[number];

  @ApiPropertyOptional({ isArray: true, type: String })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiProperty({ isArray: true, type: String, description: 'Servicios a los que da soporte (al menos uno).' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  service_ids!: string[];

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  responsible_id?: string | null;

  @ApiPropertyOptional({
    description: 'Solo viaja al crear: se guarda cifrado y nunca se devuelve. Los campos dependen de la conexión.',
  })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: CONNECTION_METHOD_VALUES, description: 'Canal de conexión (D53). Sin él rige el formulario provisional.' })
  @IsOptional()
  @IsIn(CONNECTION_METHOD_VALUES)
  connection_method?: (typeof CONNECTION_METHOD_VALUES)[number];

  @ApiPropertyOptional({ nullable: true, example: '123456789012', description: 'Cuenta de AWS a la que apunta la conexión.' })
  @IsOptional()
  @Transform(trimOrNull)
  @IsString()
  @MaxLength(20)
  external_account_id?: string | null;

  @ApiPropertyOptional({ isArray: true, type: String, example: ['us-east-1'], description: 'Regiones a evaluar: las únicas que se miran (D53).' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  regions?: string[];
}

// PATCH /v1/assets/{id} — editar un sistema. Todo es opcional; lo que cambia la conexión (cuenta, regiones, rol, llaves) la devuelve a «pendiente».
export class UpdateAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: ASSET_CRITICALITY_VALUES })
  @IsOptional()
  @IsIn(ASSET_CRITICALITY_VALUES)
  criticality?: (typeof ASSET_CRITICALITY_VALUES)[number];

  @ApiPropertyOptional({ isArray: true, type: String })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(20)
  external_account_id?: string;

  @ApiPropertyOptional({ isArray: true, type: String, example: ['us-east-1'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional({ example: 'arn:aws:iam::123456789012:role/MonkeyReadOnly' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(700)
  role_arn?: string;

  @ApiPropertyOptional({ description: 'Solo en el canal de llaves: reemplaza las llaves. Se guardan cifradas y nunca se devuelven.' })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, unknown>;
}

// PATCH /v1/assets/{id}/connection — el cliente entrega el rol que creó con la plantilla.
export class SetConnectionDto {
  @ApiProperty({ example: 'arn:aws:iam::123456789012:role/MonkeyReadOnly' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(700)
  role_arn!: string;
}

// PUT /v1/assets/{id}/schedule
export class ScheduleDto {
  @ApiProperty({ enum: SCHEDULE_FREQUENCY_VALUES })
  @IsIn(SCHEDULE_FREQUENCY_VALUES)
  frequency!: (typeof SCHEDULE_FREQUENCY_VALUES)[number];
}

// GET /v1/assets?page=1&page_size=25&service_id=…&connection_category=…&operational_status=…
export class ListAssetsQuery {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size = 25;

  @ApiPropertyOptional() @IsOptional() @IsUUID() service_id?: string;

  @ApiPropertyOptional({ enum: CONNECTION_CATEGORY_VALUES })
  @IsOptional()
  @IsIn(CONNECTION_CATEGORY_VALUES)
  connection_category?: (typeof CONNECTION_CATEGORY_VALUES)[number];

  @ApiPropertyOptional({ enum: ['operational', 'warning', 'error', 'not_monitored'] })
  @IsOptional()
  @IsIn(['operational', 'warning', 'error', 'not_monitored'])
  operational_status?: string;
}
