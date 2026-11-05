import { ApiProperty } from '@nestjs/swagger';

// Forma del `data` de contracts/gestion-usuarios.md, solo para la documentación (la arman team.mapper.ts).

export class TeamMemberResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'juan@acme.co', description: 'Correo de la cuenta.' }) email!: string;
  @ApiProperty({ nullable: true, description: 'Se completa en el perfil; la cuenta se identifica por el correo.' }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
  @ApiProperty({ enum: ['admin_empresa', 'responsable', 'delegado', 'auditor'], enumName: 'TeamRoleFilter' }) role!: string;
  @ApiProperty({ enum: ['active', 'inactive', 'pending'], enumName: 'TeamStatusFilter', description: '`pending` es una cuenta que aún no activó su código y no puede iniciar sesión.' }) status!: string;
  @ApiProperty({ description: 'Si ya configuró el segundo factor.' }) is_mfa_enabled!: boolean;
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
