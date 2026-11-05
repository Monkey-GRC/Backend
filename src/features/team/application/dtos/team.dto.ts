import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { TEAM_ROLES } from '../../domain/team.types';
import type { TeamRole } from '../../domain/team.types';

// contracts/gestion-usuarios.md. El correo se guarda siempre en minúsculas.
const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const toBoolean = ({ value }: { value: unknown }) => (value === 'true' ? true : value === 'false' ? false : value);
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'juan@acme.co', description: 'Correo de la persona. Es único en toda la plataforma.' }) @Transform(lower) @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({ example: 'Juan', description: 'Nombre de la persona (máx. 100). Es obligatorio: la cuenta no se identifica solo por el correo.' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) name!: string;
  @ApiProperty({ example: 'Pérez', description: 'Apellido de la persona (máx. 100).' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) last_name!: string;
  @ApiProperty({ enum: TEAM_ROLES, enumName: 'TeamRole', description: 'Rol de la cuenta: `admin_empresa` (otro administrador de la empresa), `responsable`, `delegado` o `auditor`.' }) @IsIn([...TEAM_ROLES]) role!: TeamRole;
  @ApiPropertyOptional({ format: 'uuid', description: '`delegado`: el equipo de un responsable (obligatorio si lo crea el administrador; si lo crea un responsable es el suyo y se omite). `responsable`: un grupo de responsables del administrador; por omisión, «Responsables». No se admite para `admin_empresa` ni `auditor` (`group_id.not_allowed`).' })
  @IsOptional() @IsUUID() group_id?: string;
  @ApiPropertyOptional({ description: 'Solo `delegado` (obligatorio): si es de la compañía (`true`) o externo (`false`). Para los demás roles no se admite (`is_internal.not_allowed`).' })
  @IsOptional() @IsBoolean() is_internal?: boolean;
}

export class UpdateTeamMemberDto {
  @ApiPropertyOptional({ example: 'Juan', description: 'Corrige el nombre (máx. 100).' }) @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) name?: string;
  @ApiPropertyOptional({ example: 'Pérez', description: 'Corrige el apellido (máx. 100).' }) @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) last_name?: string;
  @ApiPropertyOptional({ enum: ['active', 'inactive'], enumName: 'TeamMemberStatus', description: '`inactive` desactiva la cuenta y cierra todas sus sesiones; `active` la reactiva.' }) @IsOptional() @IsIn(['active', 'inactive']) status?: 'active' | 'inactive';
  @ApiPropertyOptional({ format: 'uuid', description: 'Mueve a un delegado al equipo (`kind = team`) de un responsable activo o pendiente de la empresa. Solo para `delegado` (`group_id.not_allowed`).' })
  @IsOptional() @IsUUID() group_id?: string;
  @ApiPropertyOptional({ description: 'Al mover: `true` confirma que los controles que el delegado ejecuta quedan sin ejecutor (siguen con su dueño). Sin él, `USER_HAS_ASSIGNMENTS`.' })
  @IsOptional() @IsBoolean() confirm_unassign?: boolean;
}

export class ListTeamQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['created_at', '-created_at', 'email', '-email'], enumName: 'TeamSort', default: '-created_at', description: 'Orden; el guion inicial es descendente.' })
  @IsOptional() @IsIn(['created_at', '-created_at', 'email', '-email']) sort: 'created_at' | '-created_at' | 'email' | '-email' = '-created_at';
  @ApiPropertyOptional({ enum: ['admin_empresa', 'responsable', 'delegado', 'auditor'], enumName: 'TeamRoleFilter', description: 'Solo las cuentas con este rol.' }) @IsOptional() @IsIn(['admin_empresa', 'responsable', 'delegado', 'auditor']) role?: string;
  @ApiPropertyOptional({ enum: ['active', 'inactive', 'pending'], enumName: 'TeamStatusFilter', description: 'Solo las cuentas en este estado.' }) @IsOptional() @IsIn(['active', 'inactive', 'pending']) status?: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo las cuentas de este grupo. Para un responsable no amplía su equipo.' }) @IsOptional() @IsUUID() group_id?: string;
  @ApiPropertyOptional({ description: 'Solo los delegados internos (`true`) o externos (`false`).' }) @IsOptional() @Transform(toBoolean) @IsBoolean() is_internal?: boolean;
}

export class CreateGroupDto {
  @ApiProperty({ example: 'Equipo de María', description: 'Nombre del grupo (máx. 100). Único en la empresa; «Responsables» está reservado (sin distinguir mayúsculas ni espacios de más).' })
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) name!: string;
  @ApiPropertyOptional({ format: 'uuid', description: 'Solo `admin_empresa`: el responsable (activo o pendiente) cuyo equipo de delegados se crea. Sin él se crea un grupo de responsables que lidera el administrador. Un responsable solo puede mandar su propio id.' })
  @IsOptional() @IsUUID() leader_id?: string;
}

export class RenameGroupDto {
  @ApiProperty({ example: 'Equipo de María', description: 'Nombre nuevo (máx. 100). Único en la empresa; «Responsables» está reservado.' })
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) name!: string;
}

export class ListGroupsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ['name', '-name'], enumName: 'GroupSort', default: 'name', description: 'Orden; el guion inicial es descendente.' }) @IsOptional() @IsIn(['name', '-name']) sort: 'name' | '-name' = 'name';
}
