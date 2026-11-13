import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsDate, IsIn, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateIf, ValidateNested } from 'class-validator';
import { RESOURCE_KIND_VALUES } from '../../../../common/catalogs/technical-catalogs';

// API interna del trabajador (contracts/modules/control-tecnico.md). No es para el frontend.
const MAX_FINDINGS = 200_000;
export const MAX_RESOURCES = 500;

// Lo que la sonda de un servidor entrega (D113). Los textos de `reason` son internos: nunca salen al cliente.
const MAX_SCA_POLICIES = 50;
const MAX_SCA_CHECKS = 5_000;
const asText = ({ value }: { value: unknown }) => (typeof value === 'number' ? String(value) : value);

export class RunnerScaComplianceDto {
  @ApiProperty() @IsString() @MaxLength(200) key!: string;
  @ApiProperty() @IsString() @MaxLength(500) value!: string;
}

export class RunnerScaCheckDto {
  // La sonda numera los checks: llega como número o como texto.
  @ApiProperty() @Transform(asText) @IsString() @IsNotEmpty() @MaxLength(40) id!: string;
  @ApiProperty({ description: 'passed · failed · not applicable · invalid · not run (cualquier otro valor se guarda como `invalid`).' }) @IsString() @MaxLength(40) result!: string;
  @ApiProperty({ nullable: true, required: false }) @IsOptional() @IsString() @MaxLength(2000) reason?: string | null;
  @ApiProperty({ type: [RunnerScaComplianceDto], required: false }) @IsOptional() @IsArray() @ArrayMaxSize(200) @ValidateNested({ each: true }) @Type(() => RunnerScaComplianceDto) compliance?: RunnerScaComplianceDto[];
}

export class RunnerScaPolicyDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(120) policy_id!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(400) name!: string;
  @ApiProperty({ nullable: true, required: false }) @IsOptional() @IsString() @MaxLength(40) scan_ended_at?: string | null;
  @ApiProperty({ type: [RunnerScaCheckDto] }) @IsArray() @ArrayMaxSize(MAX_SCA_CHECKS) @ValidateNested({ each: true }) @Type(() => RunnerScaCheckDto) checks!: RunnerScaCheckDto[];
}

export class RunnerScaAgentDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(8) agent_id!: string;
  @ApiProperty() @IsString() @MaxLength(200) name!: string;
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) @MaxLength(200, { each: true }) groups!: string[];
}

// POST /internal/runner/executions/{id}/results
// Dos formas, según `source`: la de la nube (sin `source`, como siempre) y la de la sonda de un servidor (`source: 'sca'`, D113).
export class RunnerResultsDto {
  @ApiProperty() @IsUUID() tenant_id!: string;
  @ApiProperty({ required: false, enum: ['sca'], description: 'Ausente: salida del motor de nube. `sca`: lectura de la sonda de un servidor.' }) @IsOptional() @IsIn(['sca']) source?: 'sca';
  @ApiProperty() @Type(() => Date) @IsDate() started_at!: Date;
  @ApiProperty() @Type(() => Date) @IsDate() finished_at!: Date;

  // Nube
  @ApiProperty({ example: '5.44.0', required: false }) @ValidateIf((o: RunnerResultsDto) => o.source !== 'sca') @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) @IsString() @IsNotEmpty() @MaxLength(40) engine_version!: string;
  @ApiProperty({ type: [String], required: false, description: 'Regiones evaluadas. Vacío en GCP (se evalúa el proyecto completo, D113).' }) @ValidateIf((o: RunnerResultsDto) => o.source !== 'sca') @IsArray() @ArrayMaxSize(50) @IsString({ each: true }) regions!: string[];
  // La salida del motor, sin tocar. Su forma la valida el parser (ENGINE_OUTPUT_INVALID diciendo qué fila), no class-validator.
  @ApiProperty({ type: [Object], required: false }) @ValidateIf((o: RunnerResultsDto) => o.source !== 'sca') @IsArray() @ArrayMaxSize(MAX_FINDINGS) findings!: unknown[];

  // Sonda de un servidor
  @ApiProperty({ example: '4.14.6', required: false }) @ValidateIf((o: RunnerResultsDto) => o.source === 'sca') @IsString() @IsNotEmpty() @MaxLength(40) sonda_version!: string;
  @ApiProperty({ type: RunnerScaAgentDto, required: false }) @ValidateIf((o: RunnerResultsDto) => o.source === 'sca') @ValidateNested() @Type(() => RunnerScaAgentDto) agent!: RunnerScaAgentDto;
  @ApiProperty({ type: [RunnerScaPolicyDto], required: false }) @ValidateIf((o: RunnerResultsDto) => o.source === 'sca') @IsArray() @ArrayMaxSize(MAX_SCA_POLICIES) @ValidateNested({ each: true }) @Type(() => RunnerScaPolicyDto) policies!: RunnerScaPolicyDto[];
}

// POST /internal/runner/claim — cada carril del trabajador pide solo su tipo (una validación no espera a una evaluación de minutos).
export class RunnerClaimDto {
  @ApiProperty({ required: false, enum: ['assessment', 'validation', 'enrollment'] }) @IsOptional() @IsIn(['assessment', 'validation', 'enrollment']) kind?: 'assessment' | 'validation' | 'enrollment';
}

// POST /internal/runner/executions/{id}/enrolled — el trabajador creó el agente de un servidor en la sonda (D113). La clave viaja SOLO aquí, por la red interna.
export class RunnerEnrolledDto {
  @ApiProperty() @IsUUID() tenant_id!: string;
  @ApiProperty({ example: '001', description: 'El id del agente en la sonda (3 a 8 dígitos).' }) @IsString() @IsNotEmpty() @MaxLength(8) agent_id!: string;
  @ApiProperty({ description: 'La clave del agente (base64). Se cifra, vive pocos minutos y no se registra nunca.' }) @IsString() @IsNotEmpty() @MaxLength(700) key!: string;
}

// POST /internal/runner/executions/{id}/validated
export class RunnerResourceDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(2048) uid!: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(100) type!: string;
  @ApiProperty({ enum: RESOURCE_KIND_VALUES }) @IsIn(RESOURCE_KIND_VALUES) kind!: (typeof RESOURCE_KIND_VALUES)[number];
  @ApiProperty({ nullable: true, required: false }) @IsOptional() @IsString() @MaxLength(256) name?: string | null;
  @ApiProperty({ nullable: true, required: false }) @IsOptional() @IsString() @MaxLength(40) region?: string | null;
  @ApiProperty({ required: false }) @IsOptional() @IsObject() attributes?: Record<string, unknown>;
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(120, { each: true }) tags?: string[];
}

// Lo que el descubrimiento encontró dentro de la cuenta (D59). Opcional: una validación sin descubrimiento sigue siendo válida.
export class RunnerInventoryDto {
  @ApiProperty({ type: [RunnerResourceDto] }) @IsArray() @ArrayMaxSize(MAX_RESOURCES) @ValidateNested({ each: true }) @Type(() => RunnerResourceDto) resources!: RunnerResourceDto[];
  // Servicios que no se pudieron leer (p. ej. permiso denegado): el cliente ve que el inventario está incompleto, no que está vacío.
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(60, { each: true }) warnings?: string[];
}

export class RunnerValidatedDto {
  @ApiProperty() @IsUUID() tenant_id!: string;
  @ApiProperty({ required: false, type: RunnerInventoryDto }) @IsOptional() @ValidateNested() @Type(() => RunnerInventoryDto) inventory?: RunnerInventoryDto;
}

// POST /internal/runner/executions/{id}/fail
export class RunnerFailDto {
  @ApiProperty() @IsUUID() tenant_id!: string;
  // Clave i18n (connection.role_not_found, connection.credentials_invalid…), no texto libre.
  @ApiProperty({ example: 'connection.role_not_found' }) @IsString() @IsNotEmpty() @MaxLength(100) reason!: string;
}

// GET /v1/assets/{id}/readiness — con `service_id` solo mide lo que es de ese servicio (D61).
export class ReadinessQuery {
  @ApiProperty({ required: false, format: 'uuid', description: 'Solo mide lo que es de este servicio (D61).' }) @IsOptional() @IsUUID() service_id?: string;
}

// GET /v1/assets/{id}/resources
export class ListResourcesQuery {
  @ApiProperty({ required: false, default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiProperty({ required: false, default: 50, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 50;
  @ApiProperty({ required: false, enum: RESOURCE_KIND_VALUES, enumName: 'ResourceKind', description: 'Solo esta clase de activo.' }) @IsOptional() @IsIn(RESOURCE_KIND_VALUES) kind?: (typeof RESOURCE_KIND_VALUES)[number];
  // Para saber cuáles de los activos de la conexión pertenecen a este servicio (D61).
  @ApiProperty({ required: false, format: 'uuid', description: 'Marca cuáles de los activos de la conexión pertenecen a este servicio (D61).' }) @IsOptional() @IsUUID() service_id?: string;
}

// GET /v1/assets/{id}/executions
export class ListExecutionsQuery {
  @ApiProperty({ required: false, default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiProperty({ required: false, default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
}
