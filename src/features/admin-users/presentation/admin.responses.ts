import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Forma del `data` de contracts/gestion-usuarios/administradores.md, solo para la documentación (la arma admin.mapper.ts).

export class AdminInviterResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
  @ApiPropertyOptional({ description: 'Solo en el sello de quien ya no existe.' }) role?: string;
  @ApiPropertyOptional({ description: '`true` solo en el sello: la cuenta ya no existe y la pantalla dice «Administrador eliminado».' }) purged?: boolean;
}

export class AdminAccountResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'ana@monkey.example', description: 'Correo de la cuenta.' }) email!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
  @ApiProperty({ enum: ['admin_monkey'], enumName: 'AdminRole', description: 'Hoy siempre `admin_monkey`.' }) role!: string;
  @ApiProperty({ enum: ['active', 'pending', 'inactive'], enumName: 'AdminStatusFilter', description: '`pending` invitado sin activar · `inactive` en gracia.' }) status!: string;
  @ApiProperty({ description: 'Si ya configuró el segundo factor.' }) is_mfa_enabled!: boolean;
  @ApiProperty({ format: 'date-time', nullable: true }) last_login_at!: string | null;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ type: AdminInviterResponse, nullable: true, description: 'Quién lo invitó; su sello si ya se purgó; `null` si lo creó la consola.' }) invited_by!: AdminInviterResponse | null;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Solo con `status: "inactive"`: cuándo se borra la cuenta.' }) purge_at!: string | null;
}

export class AdminInvitationResponse {
  @ApiProperty({ enum: ['sent', 'failed'], enumName: 'InvitationDeliveryStatus', description: '`failed`: la cuenta existe y se reenvía con `POST /v1/admins/{id}/activation-code`. El código nunca viaja en esta respuesta.' }) delivery_status!: string;
  @ApiProperty({ format: 'date-time' }) expires_at!: string;
}

export class AdminInvitedResponse extends AdminAccountResponse {
  @ApiProperty({ type: AdminInvitationResponse }) invitation!: AdminInvitationResponse;
}

export class AdminReissuedResponse {
  @ApiProperty({ type: AdminInvitationResponse }) invitation!: AdminInvitationResponse;
}
