import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

// API interna del trabajador (contracts/modules/control-tecnico.md). No es para el frontend.
const MAX_FINDINGS = 200_000;

// POST /internal/runner/executions/{id}/results
export class RunnerResultsDto {
  @ApiProperty() @IsUUID() tenant_id!: string;
  @ApiProperty({ example: '5.44.0' }) @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)) @IsString() @IsNotEmpty() @MaxLength(40) engine_version!: string;
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(50) @IsString({ each: true }) regions!: string[];
  @ApiProperty() @Type(() => Date) @IsDate() started_at!: Date;
  @ApiProperty() @Type(() => Date) @IsDate() finished_at!: Date;
  // La salida del motor, sin tocar. Su forma la valida el parser (ENGINE_OUTPUT_INVALID diciendo qué fila), no class-validator.
  @ApiProperty({ type: [Object] }) @IsArray() @ArrayMaxSize(MAX_FINDINGS) findings!: unknown[];
}

// POST /internal/runner/executions/{id}/fail
export class RunnerFailDto {
  @ApiProperty() @IsUUID() tenant_id!: string;
  // Clave i18n (connection.role_not_found, connection.credentials_invalid…), no texto libre.
  @ApiProperty({ example: 'connection.role_not_found' }) @IsString() @IsNotEmpty() @MaxLength(100) reason!: string;
}

// GET /v1/assets/{id}/executions
export class ListExecutionsQuery {
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiProperty({ required: false, default: 25, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
}
