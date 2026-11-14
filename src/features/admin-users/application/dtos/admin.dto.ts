import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { USER_ROLES } from '../../../../common/enums/user-role.enum';
import { ADMIN_SORTS } from '../../domain/admin-account';
import type { AdminSort } from '../../domain/admin-account';

const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class InviteAdminDto {
  @ApiProperty({ example: 'ana@monkey.example', description: 'Correo de la persona. Es único en toda la plataforma.' }) @Transform(lower) @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty({ example: 'Ana', description: 'Nombre (máx. 100).' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) name!: string;
  @ApiProperty({ example: 'Ruiz', description: 'Apellido (máx. 100).' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(100) last_name!: string;
  @ApiProperty({ enum: USER_ROLES, enumName: 'UserRole', description: 'Solo `admin_monkey` (D117). Cualquier otro rol es `422 role.not_allowed`.' }) @IsIn([...USER_ROLES]) role!: string;
  @ApiProperty({ example: '123456', description: 'Código del segundo factor de quien invita.' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(32) totp_code!: string;
}

export class DeactivateAdminDto {
  @ApiProperty({ example: '123456', description: 'Código del segundo factor de quien desactiva.' }) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(32) totp_code!: string;
}

export class ListAdminsQuery {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página, desde 1.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100, description: 'Elementos por página.' }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 25;
  @ApiPropertyOptional({ enum: ADMIN_SORTS, enumName: 'AdminSort', default: '-created_at', description: 'Orden; el guion inicial es descendente. `purge_at` deja al final a quien no está en gracia.' })
  @IsOptional() @IsIn([...ADMIN_SORTS]) sort: AdminSort = '-created_at';
  @ApiPropertyOptional({ enum: ['active', 'pending', 'inactive'], enumName: 'AdminStatusFilter', description: 'Solo las cuentas en este estado.' }) @IsOptional() @IsIn(['active', 'pending', 'inactive']) status?: string;
}
