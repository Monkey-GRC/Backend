import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { OBSERVATION_TYPES } from '../../domain/observation-lifecycle';

// contracts/modules/compliance-audit.md (MD-154). El texto de la observación llega hasta 5000 caracteres; el de la respuesta, 2000.
export class CreateObservationDto {
  @ApiProperty({ enum: OBSERVATION_TYPES, enumName: 'AuditObservationType', description: '`observation`, `recommendation` o `information_request`.' }) @IsIn(OBSERVATION_TYPES) type!: (typeof OBSERVATION_TYPES)[number];
  @ApiProperty({ description: 'Lo que el auditor le dice a la empresa (máx. 5000).' }) @IsString() @IsNotEmpty() @MaxLength(5000) body!: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'El control del que habla. Sin él (y sin evidencia) habla del servicio completo.' }) @IsOptional() @IsUUID() client_control_id?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'La entrega de evidencia que comenta. Si va con `client_control_id`, la evidencia debe ser de ese control; si va sola, la observación queda en el control de la evidencia.' })
  @IsOptional() @IsUUID() evidence_submission_id?: string;
}

// Un PATCH hace una sola cosa: cambiar el texto o cambiar el estado.
export class UpdateObservationDto {
  @ApiPropertyOptional({ description: 'Nuevo texto (máx. 5000). Solo mientras no esté cerrada.' }) @IsOptional() @IsString() @IsNotEmpty() @MaxLength(5000) body?: string;
  @ApiPropertyOptional({ enum: ['open', 'closed'], enumName: 'AuditObservationReviewStatus', description: '`closed` la cierra (solo una respondida); `open` la devuelve a la empresa porque no quedó conforme.' })
  @IsOptional() @IsIn(['open', 'closed']) status?: 'open' | 'closed';
}

export class AnswerObservationDto {
  @ApiProperty({ description: 'Qué hizo la empresa para atenderla (máx. 2000).' }) @IsString() @IsNotEmpty() @MaxLength(2000) answer_note!: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Una entrega de evidencia de un control del mismo servicio que respalda la respuesta.' }) @IsOptional() @IsUUID() answer_evidence_id?: string;
}

export class ListObservationsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['open', 'answered', 'closed'], enumName: 'AuditObservationStatus', description: 'Solo las que están en este estado.' }) @IsOptional() @IsIn(['open', 'answered', 'closed']) status?: 'open' | 'answered' | 'closed';
  @ApiPropertyOptional({ enum: OBSERVATION_TYPES, enumName: 'AuditObservationType', description: 'Solo las de este tipo.' }) @IsOptional() @IsIn(OBSERVATION_TYPES) type?: (typeof OBSERVATION_TYPES)[number];
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo las de este control.' }) @IsOptional() @IsUUID() client_control_id?: string;
}
