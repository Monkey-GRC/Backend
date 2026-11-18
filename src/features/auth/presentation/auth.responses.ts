import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { USER_ROLES, USER_STATUSES } from '../../../common/enums/user-role.enum';

// Formas del `data` de contracts/modules/auth.md, solo para la documentación (las arma auth-response.mapper.ts).

export class AuthGroupResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Responsables' }) name!: string;
}

export class AuthResponsibleResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) last_name!: string | null;
}

export class AuthUserResponse {
  @ApiProperty({ format: 'uuid', example: 'c4a1f2e8-9b30-4d5a-b7e1-6f8c0d2a3b44' }) id!: string;
  @ApiProperty({ example: 'ana.perez@ejemplo.com', description: 'Correo en minúsculas; es único en todo Monkey.' }) email!: string;
  @ApiProperty({ nullable: true, example: null, description: 'Opcional desde D51: la UI muestra el correo cuando no hay nombre.' }) name!: string | null;
  @ApiProperty({ nullable: true, example: null, description: 'Opcional desde D51.' }) last_name!: string | null;
  @ApiProperty({ enum: USER_ROLES, enumName: 'UserRole', description: 'Rol del usuario; el servidor lo lee de la base en cada petición.' }) role!: string;
  @ApiProperty({ enum: USER_STATUSES, enumName: 'UserStatus', description: 'Solo un usuario `active` puede iniciar sesión.' }) status!: string;
  @ApiProperty({ example: true, description: 'Si la persona ya activó el segundo factor (TOTP, D94). Es obligatorio para los 4 roles: lo configura en su primer ingreso.' }) is_mfa_enabled!: boolean;
  @ApiProperty({ enum: ['es', 'en'], enumName: 'Language', example: 'es', description: 'D111 · El idioma en el que la persona usa Monkey; con él salen sus correos. Se cambia con `PATCH /v1/auth/me/language`.' }) preferred_language!: string;
  @ApiProperty({ type: AuthGroupResponse, nullable: true, description: 'D104 · El grupo de la persona. `null` en `admin_empresa`, `auditor` y `admin_monkey`.' }) group!: AuthGroupResponse | null;
  @ApiPropertyOptional({ type: AuthResponsibleResponse, nullable: true, description: 'D104 · Solo el `delegado`: a quién pertenece (el líder de su grupo).' }) responsible?: AuthResponsibleResponse | null;
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

// D94 · Con el segundo factor, la contraseña correcta no abre la sesión: devuelve esto y deja la cookie `mnk_mfa` (el desafío, 5 minutos).
export class MfaStepResponse {
  @ApiProperty({ enum: ['mfa_verify', 'mfa_setup'], enumName: 'MfaStep', description: '`mfa_verify`: falta el código de su app. `mfa_setup`: primero debe configurar el segundo factor.' }) next_step!: string;
  @ApiProperty({ format: 'date-time', example: '2026-10-26T14:05:00.000Z', description: 'Hasta cuándo sirve el desafío (5 minutos).' }) expires_at!: string;
}

export class MfaSetupStartResponse {
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP', description: 'El secreto en base32, para quien no puede escanear el QR.' }) secret!: string;
  @ApiProperty({ example: 'otpauth://totp/Monkey:ana.perez%40ejemplo.com?secret=JBSWY3DPEHPK3PXP&issuer=Monkey&algorithm=SHA1&digits=6&period=30', description: 'La dirección que codifica el QR. El QR se dibuja en el navegador: el secreto no pasa por ningún servicio externo.' }) otpauth_uri!: string;
  @ApiProperty({ example: 'Monkey', description: 'El nombre con el que la app de códigos muestra la cuenta.' }) issuer!: string;
  @ApiProperty({ example: 'ana.perez@ejemplo.com', description: 'El correo de la persona: la etiqueta de la cuenta en la app de códigos.' }) account!: string;
}

export class AuthSessionWithRecoveryResponse extends AuthSessionResponse {
  @ApiPropertyOptional({ type: String, isArray: true, example: ['K7QWM-3PZ9T'], description: 'Solo al activar el segundo factor: 10 códigos de recuperación de un solo uso. **Se muestran una sola vez.**' }) recovery_codes?: string[];
  @ApiPropertyOptional({ nullable: true, example: 7, description: 'Solo si entró con un código de recuperación: cuántos le quedan.' }) recovery_codes_left?: number | null;
}

export class RecoveryCodesResponse {
  @ApiProperty({ type: String, isArray: true, example: ['K7QWM-3PZ9T'], description: 'Los 10 códigos nuevos. Los anteriores ya no sirven. **Se muestran una sola vez.**' }) recovery_codes!: string[];
}

export class AccessKeyCompanyResponse {
  @ApiProperty({ example: 'Next Audit & Consulting S.A.S.' }) name!: string;
}

export class AccessKeyLookupResponse {
  @ApiProperty({ type: AccessKeyCompanyResponse }) company!: AccessKeyCompanyResponse;
  @ApiProperty({ example: 'ana.perez@ejemplo.com', description: 'Correo administrativo que Monkey registró; es el único con el que se canjea la clave.' }) admin_email!: string;
  @ApiProperty({ format: 'date-time', example: '2026-10-12T09:12:44.000Z', description: 'Hasta cuándo se puede canjear la clave.' }) expires_at!: string;
}

export class ActivationLookupResponse {
  @ApiProperty({ example: 'juan@acme.co', description: 'Correo con el que la empresa creó la cuenta; es el único con el que se activa. La pantalla lo muestra bloqueado.' }) email!: string;
  @ApiProperty({ format: 'date-time', example: '2026-11-03T15:04:02.000Z', description: 'Hasta cuándo se puede usar el código.' }) expires_at!: string;
}

export class TrustedDeviceResponse {
  @ApiProperty({ format: 'uuid', description: 'Identificador del dispositivo recordado.' }) id!: string;
  @ApiProperty({ nullable: true, example: 'Chrome', description: 'Navegador resumido del user agent al recordar el dispositivo; `null` si no se reconoce.' }) browser!: string | null;
  @ApiProperty({ nullable: true, example: 'Windows', description: 'Sistema operativo resumido del user agent; `null` si no se reconoce.' }) os!: string | null;
  @ApiProperty({ nullable: true, enum: ['computer', 'mobile', 'tablet'], example: 'computer', description: 'Tipo de dispositivo deducido del user agent: `computer`, `mobile` o `tablet`; `null` si no se reconoce.' }) device_type!: 'computer' | 'mobile' | 'tablet' | null;
  @ApiProperty({ example: '181.49.12.7', description: 'IP del último ingreso con este dispositivo (al recordarlo o al entrar sin código).' }) ip_address!: string;
  @ApiProperty({ nullable: true, example: 'CO', description: 'País (ISO 3166-1 alfa-2) del último ingreso, aproximado; `null` si la IP es privada o no se encuentra.' }) country!: string | null;
  @ApiProperty({ nullable: true, example: 'Bogotá', description: 'Ciudad del último ingreso en el idioma de la petición (`Accept-Language`), aproximada; `null` si no se encuentra.' }) city!: string | null;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se recordó el dispositivo.' }) created_at!: string;
  @ApiProperty({ format: 'date-time', description: 'Cuándo deja de valer: 30 días después de recordarlo; el uso no lo renueva.' }) expires_at!: string;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Último ingreso sin código con este dispositivo; `null` si nunca se usó.' }) last_used_at!: string | null;
  @ApiProperty({ example: true, description: '`true` para el dispositivo de la cookie `mnk_device` de esta petición.' }) is_current!: boolean;
}
