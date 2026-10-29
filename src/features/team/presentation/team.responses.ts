import { ApiProperty } from '@nestjs/swagger';
import { DIMENSIONS } from '../domain/team.types';

// Forma del `data` de contracts/modules/users-team.md, solo para la documentación (la arman team.mapper.ts).

export class TeamMemberResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'juan@acme.co', description: 'Correo de la cuenta.' }) email!: string;
  @ApiProperty({ nullable: true, description: 'Se completa en el perfil; la cuenta se identifica por el correo.' }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
  @ApiProperty({ enum: ['admin_empresa', 'funcional', 'auditor'], enumName: 'TeamRoleFilter' }) role!: string;
  @ApiProperty({ enum: ['active', 'inactive', 'pending'], enumName: 'TeamStatusFilter', description: '`pending` es una cuenta que aún no activó su código y no puede iniciar sesión.' }) status!: string;
  @ApiProperty({ description: 'Si ya configuró el segundo factor.' }) is_mfa_enabled!: boolean;
  @ApiProperty({ format: 'date-time', nullable: true }) last_login_at!: string | null;
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension', isArray: true, description: 'Las especialidades de un `funcional`; vacío en los demás roles.' }) dimensions!: string[];
  @ApiProperty({ format: 'date-time' }) created_at!: string;
}

export class ActivationCodeResponse {
  @ApiProperty({ example: 'MNK-7F3A-92KD-5QXB', description: 'El código de un solo uso. **Viaja en claro solo en esta respuesta**: no se guarda ni se puede volver a ver.' }) code!: string;
  @ApiProperty({ enum: ['pending'], enumName: 'ActivationCodeStatus' }) status!: string;
  @ApiProperty({ format: 'date-time' }) expires_at!: string;
}

export class TeamMemberCreatedResponse extends TeamMemberResponse {
  @ApiProperty({ type: ActivationCodeResponse, description: 'Hay que entregárselo a la persona: el correo está aplazado.' }) activation_code!: ActivationCodeResponse;
}

export class ResponsiblePersonResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'juan@acme.co', description: 'Correo de la cuenta.' }) email!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
}

export class DimensionOwnerResponse {
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension' }) dimension!: string;
  @ApiProperty({ type: ResponsiblePersonResponse, nullable: true, description: 'El responsable principal del servicio en esta dimensión; `null` si no hay.' }) owner!: ResponsiblePersonResponse | null;
  @ApiProperty({ description: 'Controles del servicio que tienen pruebas de esta dimensión.' }) controls_total!: number;
  @ApiProperty({ description: 'De ellos, los que tienen una excepción: otro responsable puesto a mano.' }) controls_with_exception!: number;
  @ApiProperty({ description: 'De ellos, los que no tienen a nadie a cargo.' }) controls_without_owner!: number;
}

export class DimensionOwnerListResponse {
  @ApiProperty({ type: DimensionOwnerResponse, isArray: true, description: 'Siempre las cinco dimensiones, en el orden de `enums.md`.' }) items!: DimensionOwnerResponse[];
}

export class ControlResponsibleResponse {
  @ApiProperty({ enum: DIMENSIONS, enumName: 'Dimension' }) dimension!: string;
  @ApiProperty({ description: 'Pruebas de esta dimensión que lleva el control.' }) tests_count!: number;
  @ApiProperty({ type: ResponsiblePersonResponse, nullable: true, description: 'El responsable efectivo.' }) owner!: ResponsiblePersonResponse | null;
  @ApiProperty({ enum: ['control', 'service'], enumName: 'ResponsibleSource', nullable: true, description: '`control` es la excepción de este control; `service` el principal del servicio; `null` si nadie.' }) source!: string | null;
}

export class ControlResponsibleListResponse {
  @ApiProperty({ type: ControlResponsibleResponse, isArray: true, description: 'Una fila por cada dimensión en la que el control tiene pruebas.' }) items!: ControlResponsibleResponse[];
}
