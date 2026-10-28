import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { DIMENSIONS, TEAM_ROLES } from '../../domain/team.types';
import type { Dimension, TeamRole } from '../../domain/team.types';

// contracts/modules/users-team.md. El correo se guarda siempre en minúsculas.
const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'juan@acme.co', description: 'Correo de la persona. Es único en toda la plataforma.' }) @Transform(lower) @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({ example: 'Juan', description: 'Nombre de la persona (máx. 100). Es obligatorio: la cuenta no se identifica solo por el correo.' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) name!: string;
  @ApiProperty({ example: 'Pérez', description: 'Apellido de la persona (máx. 100).' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) last_name!: string;
  @ApiProperty({ enum: TEAM_ROLES, enumName: 'TeamRole', description: 'Rol de la cuenta: `admin_empresa` (otro administrador de la empresa), `funcional` o `auditor`.' }) @IsIn([...TEAM_ROLES]) role!: TeamRole;
  @ApiPropertyOptional({ enum: DIMENSIONS, enumName: 'Dimension', isArray: true, description: 'Especialidades del `funcional`: obligatorias y no vacías. Un administrador o un `auditor` no las llevan.' })
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayUnique() @IsIn([...DIMENSIONS], { each: true }) dimensions?: Dimension[];
}

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ example: 'Juan', description: 'Corrige el nombre (máx. 100).' }) @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) name?: string;
  @ApiPropertyOptional({ example: 'Pérez', description: 'Corrige el apellido (máx. 100).' }) @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) last_name?: string;
  @ApiPropertyOptional({ enum: ['active', 'inactive'], enumName: 'TeamMemberStatus', description: '`inactive` desactiva la cuenta y cierra todas sus sesiones; `active` la reactiva.' }) @IsOptional() @IsIn(['active', 'inactive']) status?: 'active' | 'inactive';
  @ApiPropertyOptional({ enum: DIMENSIONS, enumName: 'Dimension', isArray: true, description: 'Las especialidades nuevas del `funcional` (reemplazan a las anteriores).' })
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayUnique() @IsIn([...DIMENSIONS], { each: true }) dimensions?: Dimension[];
}

export class ListTeamQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['created_at', '-created_at', 'email', '-email'], enumName: 'TeamSort', default: '-created_at', description: 'Orden; el guion inicial es descendente.' })
  @IsOptional() @IsIn(['created_at', '-created_at', 'email', '-email']) sort: 'created_at' | '-created_at' | 'email' | '-email' = '-created_at';
  @ApiPropertyOptional({ enum: ['admin_empresa', 'funcional', 'auditor'], enumName: 'TeamRoleFilter', description: 'Solo las cuentas con este rol.' }) @IsOptional() @IsIn(['admin_empresa', 'funcional', 'auditor']) role?: string;
  @ApiPropertyOptional({ enum: ['active', 'inactive', 'pending'], enumName: 'TeamStatusFilter', description: 'Solo las cuentas en este estado.' }) @IsOptional() @IsIn(['active', 'inactive', 'pending']) status?: string;
}

export class SetResponsibleDto {
  @ApiProperty({ format: 'uuid', nullable: true, description: 'El `funcional` responsable, con esa especialidad. `null` quita al responsable (en un control, la excepción; en un servicio, el principal).' })
  @ValidateIf((o: SetResponsibleDto) => o.user_id !== null) @IsUUID() user_id!: string | null;
}
