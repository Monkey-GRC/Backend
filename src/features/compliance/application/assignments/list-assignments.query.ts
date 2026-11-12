import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export const CONTROL_STATES = ['effective', 'ineffective', 'expired', 'error', 'incomplete', 'evaluating', 'no_tests'] as const;
export const ASSIGNMENT_FILTERS = ['unassigned', 'assigned'] as const;
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// GET /v1/assignments (contracts/gestion-usuarios.md · Asignación de controles). Todos los filtros se combinan.
export class ListAssignmentsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los controles de este servicio.' }) @IsOptional() @IsUUID() service_id?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los controles que cubren algún requisito de este marco.' }) @IsOptional() @IsUUID() framework_id?: string;
  @ApiPropertyOptional({ example: 'CC', description: 'Prefijo del código de requisito (`CC`, `A`, `C`, `PI`, `P` en SOC 2): entra el control que cubra algún requisito cuyo código empiece por él seguido de un número. Un control propio no entra.' })
  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(20) category?: string;
  @ApiPropertyOptional({ example: 'CC6.1', description: 'Código exacto de un requisito: entra el control que lo cubre.' }) @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(50) requirement_code?: string;
  @ApiPropertyOptional({ enum: CONTROL_STATES, enumName: 'ControlState', description: 'Estado del control. Se deriva: se calcula por servicio y se filtra y pagina después.' }) @IsOptional() @IsIn(CONTROL_STATES) status?: (typeof CONTROL_STATES)[number];
  @ApiPropertyOptional({ enum: ASSIGNMENT_FILTERS, enumName: 'AssignmentFilter', description: '`unassigned` (sin dueño) o `assigned`.' }) @IsOptional() @IsIn(ASSIGNMENT_FILTERS) assignment?: (typeof ASSIGNMENT_FILTERS)[number];
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los controles de este dueño.' }) @IsOptional() @IsUUID() owner_id?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo los controles de este ejecutor.' }) @IsOptional() @IsUUID() executor_id?: string;
  @ApiPropertyOptional({ description: 'Busca, sin distinguir mayúsculas ni acentos, en el código del control, sus códigos de requisito y su nombre.' }) @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) q?: string;
}
