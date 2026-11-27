import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { LEVELS } from '../../domain/controls/management-extras';

// MD-529 (contracts/cumplimiento/aprobacion.md, «Lo nuevo de MD-529»). Quién actúa sale de la sesión; los cuerpos no lo llevan.
const PROPOSABLE = LEVELS.filter((l) => l !== 'not_evaluated') as string[];

export class ProposeLevelDto {
  @ApiProperty({ enum: PROPOSABLE, enumName: 'ControlLevel', description: 'El nivel final que se propone (`control_level`). Nunca `not_evaluated`; con un sugerido de 1 a 3 solo otro de 1 a 3 (R4).' }) @IsIn(PROPOSABLE) proposed_level!: string;
  @ApiProperty({ description: 'Por qué el nivel del motor no refleja la realidad (máx. 2000). En blanco no vale (`422 justification.required`).' }) @IsOptional() @IsString() @MaxLength(2000) justification!: string;
}

export class RegisterPlanDto {
  @ApiProperty({ format: 'uuid', description: 'La prueba del control que hoy está en excepción (`409 TEST_NOT_IN_EXCEPTION` si no).' }) @IsUUID('all') test_id!: string;
  @ApiProperty({ description: 'Qué se hará (máx. 2000). En blanco no vale (`422 what.required`).' }) @IsOptional() @IsString() @MaxLength(2000) what!: string;
  @ApiProperty({ format: 'uuid', description: 'Persona activa de la empresa que lo hará (`422 owner_id.invalid` si no lo es). Se elige de `GET /v1/users/directory`.' }) @IsUUID('all') owner_id!: string;
  @ApiProperty({ format: 'date', example: '2026-12-31', description: 'Para cuándo: hoy o después (`422 due_date.past`).' }) @IsDateString({ strict: true }) due_date!: string;
}

export class NotApplicableRequestDto {
  @ApiProperty({ description: 'La justificación (máx. 2000). En blanco no vale (`422 reason.required`).' }) @IsOptional() @IsString() @MaxLength(2000) reason!: string;
}

export class RequestDecisionDto {
  @ApiProperty({ enum: ['approve', 'reject'], enumName: 'RequestDecision', description: 'Aprobar o rechazar la solicitud.' }) @IsIn(['approve', 'reject']) decision!: 'approve' | 'reject';
  @ApiPropertyOptional({ description: 'Obligatorio al rechazar (`422 reason.required`); opcional al aprobar (máx. 2000).' }) @IsOptional() @IsString() @MaxLength(2000) reason?: string;
}

export class RegisterOccurrenceDto {
  @ApiProperty({ format: 'date', example: '2026-11-20', description: 'Cuándo ocurrió: hoy o antes (`422 occurred_on.future`); fija el trimestre.' }) @IsDateString({ strict: true }) occurred_on!: string;
  @ApiProperty({ description: 'Qué pasó, en una línea (máx. 500). En blanco no vale (`422 description.required`).' }) @IsOptional() @IsString() @MaxLength(500) description!: string;
}

export class DeclareNoOccurrencesDto {
  @ApiPropertyOptional({ description: 'Una nota opcional (máx. 1000).' }) @IsOptional() @IsString() @MaxLength(1000) note?: string;
}
