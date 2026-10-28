import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsEmail, IsIn, IsInt, IsOptional, IsUUID, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { DIMENSIONS, TEAM_ROLES } from '../../domain/team.types';
import type { Dimension, TeamRole } from '../../domain/team.types';

// contracts/modules/users-team.md. El correo se guarda siempre en minúsculas.
const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'juan@acme.co', description: 'Correo de la persona. Es único en toda la plataforma.' }) @Transform(lower) @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({ enum: TEAM_ROLES, enumName: 'TeamRole', description: 'Rol de la cuenta: `funcional` o `auditor`. Nunca otro administrador.' }) @IsIn([...TEAM_ROLES]) role!: TeamRole;
  @ApiPropertyOptional({ enum: DIMENSIONS, enumName: 'Dimension', isArray: true, description: 'Especialidades del `funcional`: obligatorias y no vacías. Un `auditor` no las lleva.' })
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayUnique() @IsIn([...DIMENSIONS], { each: true }) dimensions?: Dimension[];
}

export class UpdateTeamMemberDto {
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
