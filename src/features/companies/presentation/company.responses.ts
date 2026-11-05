import { ApiProperty } from '@nestjs/swagger';

// Formas del `data` de contracts/modules/monkey-admin.md, solo para la documentación (las arma company-response.mapper.ts).

const ISOLATION = ['shared', 'dedicated'] as const;
const COMPANY_STATUS = ['active', 'suspended', 'deactivated'] as const;
const DEACTIVATION_REASON = ['non_payment', 'client_request', 'other'] as const;
const ACCESS_KEY_STATUS = ['pending', 'used', 'expired', 'revoked'] as const;

export class ContractedFrameworkResponse {
  @ApiProperty({ example: 'soc2', description: 'Código del marco (`GET /v1/catalogs/frameworks`).' }) code!: string;
  @ApiProperty({ example: 'SOC 2' }) name!: string;
  @ApiProperty({ example: '2026-10-01', description: 'Fecha en que se contrató (YYYY-MM-DD).' }) contracted_at!: string;
}

export class RegisteredAccessKeyResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ACCESS_KEY_STATUS, enumName: 'AccessKeyStatus', description: '`pending` canjeable · `used` ya canjeada · `expired` venció · `revoked` anulada.' }) status!: string;
  @ApiProperty({ format: 'date-time', description: 'Hasta cuándo se puede canjear.' }) expires_at!: string;
  @ApiProperty({ enum: ['sent', 'failed'], enumName: 'AccessKeyDeliveryStatus', description: 'D99 · `sent`: el servicio de correo aceptó el mensaje (no garantiza que llegue). `failed`: no salió; se puede reenviar. **La clave nunca viaja en la respuesta.**' }) delivery_status!: string;
}

export class CompanyResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'Next Audit & Consulting S.A.S.', description: 'Razón social.' }) name!: string;
  @ApiProperty({ example: 'contacto@ejemplo.com', description: 'Correo del administrador de la empresa; con él se canjea la clave de acceso.' }) admin_email!: string;
  @ApiProperty({ enum: ISOLATION, enumName: 'IsolationStrategy', description: '`shared` base compartida con aislamiento por empresa · `dedicated` base propia.' }) isolation_strategy!: string;
  @ApiProperty({ enum: COMPANY_STATUS, enumName: 'CompanyStatus', description: '`deactivated`: archivada (D97), sin acceso ni motores hasta `archive_until`.' }) status!: string;
  @ApiProperty({ example: 10, nullable: true, description: 'D103 · Cupo de usuarios contratado. `null`: empresa anterior al cupo, sin tope hasta que se le fije uno.' }) max_users!: number | null;
  @ApiProperty({ example: 3, description: 'D103 · Cuentas que cuentan para el cupo (`active`, `pending` y `suspended`, de cualquier rol).' }) users_count!: number;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Cuándo se archivó; `null` si no está archivada.' }) deactivated_at!: string | null;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Cuándo se borra definitivamente con todos sus datos; `null` si no está archivada.' }) archive_until!: string | null;
  @ApiProperty({ enum: DEACTIVATION_REASON, enumName: 'CompanyDeactivationReason', nullable: true }) deactivation_reason_code!: string | null;
  @ApiProperty({ nullable: true, description: 'Motivo escrito al archivar.' }) deactivation_reason!: string | null;
}

export class PendingPurgeCompanyResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ format: 'date-time', description: 'Cuándo se borra definitivamente la empresa con todos sus datos.' }) archive_until!: string;
  @ApiProperty({ example: 12, description: 'Días que faltan para el borrado definitivo (0 si es hoy o ya venció).' }) days_left!: number;
  @ApiProperty({ enum: DEACTIVATION_REASON, enumName: 'CompanyDeactivationReason', nullable: true }) deactivation_reason_code!: string | null;
}

export class RegisteredCompanyResponse extends CompanyResponse {
  @ApiProperty({ type: ContractedFrameworkResponse, isArray: true, description: 'Marcos contratados al registrar la empresa.' }) frameworks!: ContractedFrameworkResponse[];
  @ApiProperty({ format: 'date-time' }) updated_at!: string;
  @ApiProperty({ type: RegisteredAccessKeyResponse, description: 'Clave de acceso del primer administrador (enviada por correo).' }) access_key!: RegisteredAccessKeyResponse;
}

export class CompanyListItemResponse extends CompanyResponse {
  @ApiProperty({ type: ContractedFrameworkResponse, isArray: true, description: 'Marcos contratados por la empresa.' }) frameworks!: ContractedFrameworkResponse[];
  @ApiProperty({ enum: ACCESS_KEY_STATUS, enumName: 'AccessKeyStatus', nullable: true, description: 'Estado de la clave más reciente; `null` si la empresa no tiene ninguna.' }) access_key_status!: string | null;
  @ApiProperty({ format: 'date-time', nullable: true }) access_key_expires_at!: string | null;
  @ApiProperty({ example: false, description: 'Si el cliente ya terminó los tres componentes del onboarding.' }) onboarding_completed!: boolean;
}

export class AccessKeyHistoryItemResponse {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: ACCESS_KEY_STATUS, enumName: 'AccessKeyStatus' }) status!: string;
  @ApiProperty({ format: 'date-time' }) expires_at!: string;
  @ApiProperty({ format: 'date-time', nullable: true, description: 'Cuándo se canjeó; `null` si no se ha canjeado.' }) used_at!: string | null;
}

export class CompanyDetailResponse extends CompanyListItemResponse {
  @ApiProperty({ format: 'date-time' }) updated_at!: string;
  @ApiProperty({ type: AccessKeyHistoryItemResponse, isArray: true, description: 'Historial de claves de acceso, sin el código.' }) access_keys!: AccessKeyHistoryItemResponse[];
}
