import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Forma del `data` de contracts/gestion-usuarios.md, solo para la documentación (la arman team.mapper.ts).

export class TeamGroupResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Equipo de María' }) name!: string;
}

export class TeamResponsibleResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
}

export class TeamMemberResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'juan@acme.co', description: 'Correo de la cuenta.' }) email!: string;
  @ApiProperty({ nullable: true, description: 'Se completa en el perfil; la cuenta se identifica por el correo.' }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
  @ApiProperty({ enum: ['admin_empresa', 'responsable', 'delegado', 'auditor'], enumName: 'TeamRoleFilter' }) role!: string;
  @ApiProperty({ enum: ['active', 'inactive', 'pending'], enumName: 'TeamStatusFilter', description: '`pending` es una cuenta que aún no activó su código y no puede iniciar sesión.' }) status!: string;
  @ApiProperty({ description: 'Si ya configuró el segundo factor.' }) is_mfa_enabled!: boolean;
  @ApiProperty({ nullable: true, description: 'Solo el `delegado`: si es de la compañía (`true`) o externo (`false`). Nulo en los demás roles.' }) is_internal!: boolean | null;
  @ApiProperty({ type: TeamGroupResponse, nullable: true, description: 'El grupo al que pertenece. Nulo para `admin_empresa` y `auditor`.' }) group!: TeamGroupResponse | null;
  @ApiPropertyOptional({ type: TeamResponsibleResponse, nullable: true, description: 'Solo el `delegado`: el líder de su grupo (no se guarda aparte).' }) responsible?: TeamResponsibleResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true }) last_login_at!: string | null;
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

export class InvitationResponse {
  @ApiProperty({ enum: ['sent', 'failed', 'pending'], enumName: 'InvitationDeliveryStatus', description: '`pending` mientras el envío por correo no exista; el código nunca viaja en esta respuesta.' }) delivery_status!: string;
  @ApiProperty({ format: 'date-time', description: 'Hasta cuándo sirve el código de activación.' }) expires_at!: string;
}

export class TeamMemberInvitedResponse extends TeamMemberResponse {
  @ApiProperty({ type: InvitationResponse }) invitation!: InvitationResponse;
}

export class GroupLeaderResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
  @ApiProperty({ enum: ['admin_empresa', 'responsable'], enumName: 'GroupLeaderRole' }) role!: string;
}

export class GroupResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Equipo de María' }) name!: string;
  @ApiProperty({ enum: ['responsables', 'team'], enumName: 'GroupKind', description: '`responsables` lo lidera el administrador; `team` es el equipo de delegados de un responsable.' }) kind!: string;
  @ApiProperty({ type: GroupLeaderResponse, description: 'El líder del grupo.' }) leader!: GroupLeaderResponse;
  @ApiProperty({ description: 'Cuántas cuentas pertenecen al grupo (de cualquier estado).' }) members_count!: number;
}
