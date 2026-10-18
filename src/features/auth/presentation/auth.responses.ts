import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { USER_ROLES, USER_STATUSES } from '../../../common/enums/user-role.enum';

// Formas del `data` de contracts/modules/auth.md, solo para la documentación (las arma auth-response.mapper.ts).

export class AuthUserResponse {
  @ApiProperty({ format: 'uuid', example: 'c4a1f2e8-9b30-4d5a-b7e1-6f8c0d2a3b44' }) id!: string;
  @ApiProperty({ example: 'ana.perez@ejemplo.com', description: 'Correo en minúsculas; es único en todo Monkey.' }) email!: string;
  @ApiProperty({ nullable: true, example: null, description: 'Opcional desde D51: la UI muestra el correo cuando no hay nombre.' }) name!: string | null;
  @ApiProperty({ nullable: true, example: null, description: 'Opcional desde D51.' }) last_name!: string | null;
  @ApiProperty({ enum: USER_ROLES, enumName: 'UserRole', description: 'Rol del usuario; el servidor lo lee de la base en cada petición.' }) role!: string;
  @ApiProperty({ enum: USER_STATUSES, enumName: 'UserStatus', description: 'Solo un usuario `active` puede iniciar sesión.' }) status!: string;
  @ApiProperty({ example: false, description: 'Segundo factor (TOTP). Aplazado a MD-94: hoy siempre `false`.' }) is_mfa_enabled!: boolean;
  @ApiProperty({ format: 'date-time', nullable: true, example: null, description: 'Último inicio de sesión; `null` si nunca ha entrado.' }) last_login_at!: string | null;
  @ApiProperty({ format: 'date-time', example: '2026-10-01T09:12:44.000Z' }) created_at!: string;
}

export class AuthCompanyResponse {
  @ApiProperty({ format: 'uuid', example: '8f14e45f-ceea-467a-9b3c-2a1d7f0e4b12' }) id!: string;
  @ApiProperty({ example: 'Next Audit & Consulting S.A.S.', description: 'Razón social; el onboarding la muestra bloqueada.' }) name!: string;
}

export class OnboardingProgressResponse {
  @ApiProperty({
    enum: ['organizational_context', 'service_context', 'technical_control'],
    enumName: 'OnboardingStep',
    nullable: true,
    description: 'Primer paso sin hacer, para que el frontend sepa dónde continuar. `null` si ya terminó los tres.',
  })
  next_step!: string | null;

  @ApiProperty({ enum: ['organizational_context', 'service_context', 'technical_control'], enumName: 'OnboardingStep', isArray: true, description: 'Pasos ya completos.' })
  completed_steps!: string[];
}

export class AuthSessionResponse {
  @ApiProperty({ type: AuthUserResponse }) user!: AuthUserResponse;
  @ApiProperty({ type: AuthCompanyResponse }) company!: AuthCompanyResponse;
  @ApiPropertyOptional({ type: OnboardingProgressResponse, description: 'Solo viaja para `admin_empresa`, que es quien recorre el onboarding.' }) onboarding?: OnboardingProgressResponse;
}

export class AccessKeyCompanyResponse {
  @ApiProperty({ example: 'Next Audit & Consulting S.A.S.' }) name!: string;
}

export class AccessKeyLookupResponse {
  @ApiProperty({ type: AccessKeyCompanyResponse }) company!: AccessKeyCompanyResponse;
  @ApiProperty({ example: 'ana.perez@ejemplo.com', description: 'Correo administrativo que Monkey registró; es el único con el que se canjea la clave.' }) admin_email!: string;
  @ApiProperty({ format: 'date-time', example: '2026-10-12T09:12:44.000Z', description: 'Hasta cuándo se puede canjear la clave.' }) expires_at!: string;
}
