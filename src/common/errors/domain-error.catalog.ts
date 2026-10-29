import { HttpStatus } from '@nestjs/common';
import { DomainErrorCode } from './domain-error';

// error.code → status HTTP y clave i18n (tablas de errores de contracts/modules/*.md).
export const DOMAIN_ERROR_CATALOG: Record<
  DomainErrorCode,
  { status: HttpStatus; messageKey: string }
> = {
  UNAUTHENTICATED: { status: HttpStatus.UNAUTHORIZED, messageKey: 'common.unauthenticated' },
  FORBIDDEN: { status: HttpStatus.FORBIDDEN, messageKey: 'common.forbidden' },
  NOT_FOUND: { status: HttpStatus.NOT_FOUND, messageKey: 'common.not_found' },
  INVALID_CREDENTIALS: { status: HttpStatus.UNAUTHORIZED, messageKey: 'auth.invalid_credentials' },
  SESSION_EXPIRED: { status: HttpStatus.UNAUTHORIZED, messageKey: 'auth.session_expired' },
  ACCOUNT_LOCKED: { status: HttpStatus.FORBIDDEN, messageKey: 'auth.account_locked' },
  ACCOUNT_INACTIVE: { status: HttpStatus.FORBIDDEN, messageKey: 'auth.account_inactive' },
  // D94 · Segundo factor. Un desafío que no sirve (no existe, venció, se usó o se agotó) y un código equivocado responden 401: hay que volver a empezar o volver a escribirlo.
  MFA_CHALLENGE_INVALID: { status: HttpStatus.UNAUTHORIZED, messageKey: 'auth.mfa_challenge_invalid' },
  MFA_CODE_INVALID: { status: HttpStatus.UNAUTHORIZED, messageKey: 'auth.mfa_code_invalid' },
  MFA_SETUP_NOT_STARTED: { status: HttpStatus.CONFLICT, messageKey: 'auth.mfa_setup_not_started' },
  MFA_NOT_ENABLED: { status: HttpStatus.CONFLICT, messageKey: 'auth.mfa_not_enabled' },
  // Canje de la clave (contracts/modules/auth.md, POST /v1/auth/redeem).
  ACCESS_KEY_INVALID: { status: HttpStatus.NOT_FOUND, messageKey: 'auth.access_key_invalid' },
  ACCESS_KEY_ALREADY_USED: { status: HttpStatus.CONFLICT, messageKey: 'auth.access_key_already_used' },
  ACCESS_KEY_EXPIRED: { status: HttpStatus.CONFLICT, messageKey: 'auth.access_key_expired' },
  ACCESS_KEY_EMAIL_MISMATCH: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    messageKey: 'auth.access_key_email_mismatch',
  },
  EMAIL_TAKEN: { status: HttpStatus.CONFLICT, messageKey: 'auth.email_taken' },
  COMPANY_NAME_TAKEN: { status: HttpStatus.CONFLICT, messageKey: 'company.name_taken' },
  ADMIN_EMAIL_TAKEN: { status: HttpStatus.CONFLICT, messageKey: 'company.admin_email_taken' },
  // Temporal: el aprovisionamiento dedicated no está reconstruido y P2(d) sigue abierta.
  DEDICATED_DATABASE_NOT_AVAILABLE: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    messageKey: 'company.dedicated_not_available',
  },
  // D97 · Archivar y reactivar una empresa.
  CONFIRMATION_MISMATCH: { status: HttpStatus.UNPROCESSABLE_ENTITY, messageKey: 'company.confirmation_mismatch' },
  COMPANY_ALREADY_DEACTIVATED: { status: HttpStatus.CONFLICT, messageKey: 'company.already_deactivated' },
  COMPANY_NOT_DEACTIVATED: { status: HttpStatus.CONFLICT, messageKey: 'company.not_deactivated' },
  COMPANY_ARCHIVE_EXPIRED: { status: HttpStatus.CONFLICT, messageKey: 'company.archive_expired' },
  // Componente 2 (contracts/modules/onboarding-service-context.md).
  ORGANIZATION_NOT_DECLARED: { status: HttpStatus.CONFLICT, messageKey: 'organization.not_declared' },
  SERVICE_NAME_TAKEN: { status: HttpStatus.CONFLICT, messageKey: 'service.name_taken' },
  SERVICE_HAS_EVALUATIONS: { status: HttpStatus.CONFLICT, messageKey: 'service.has_evaluations' },
  // Acciones de protección (contracts/modules/compliance-controls.md).
  CONTROL_RETIRED: { status: HttpStatus.CONFLICT, messageKey: 'control.retired' },
  RESPONSIBLE_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, messageKey: 'responsible.already_exists' },
  RESPONSIBLE_IN_USE: { status: HttpStatus.CONFLICT, messageKey: 'responsible.in_use' },
  CODE_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, messageKey: 'risk.code_already_exists' },
  LINK_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, messageKey: 'risk.link_already_exists' },
  CATALOG_ITEM_IN_USE: { status: HttpStatus.CONFLICT, messageKey: 'catalog_admin.item_in_use' },
  RISK_INACTIVE: { status: HttpStatus.CONFLICT, messageKey: 'risk.inactive' },
  CAUSE_INACTIVE: { status: HttpStatus.CONFLICT, messageKey: 'cause.inactive' },
  // Exclusiones (contracts/modules/compliance-audit.md).
  EXCLUSION_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, messageKey: 'exclusion.already_exists' },
  EVALUATION_NOT_DEFINED: { status: HttpStatus.CONFLICT, messageKey: 'exclusion.evaluation_not_defined' },
  // Veredictos y evaluaciones del servicio (MD-155).
  TEST_NOT_MANUAL: { status: HttpStatus.CONFLICT, messageKey: 'verdict.test_not_manual' },
  TEST_DECIDED_BY_EVIDENCE: { status: HttpStatus.CONFLICT, messageKey: 'verdict.decided_by_evidence' },
  TEST_HAS_NO_ASSETS: { status: HttpStatus.CONFLICT, messageKey: 'verdict.test_has_no_assets' },
  EVIDENCE_VERSION_CONFLICT: { status: HttpStatus.CONFLICT, messageKey: 'evidence.version_conflict' },
  FRAMEWORK_NOT_CONTRACTED: { status: HttpStatus.CONFLICT, messageKey: 'framework.not_contracted' },
  FRAMEWORK_NOT_AVAILABLE: { status: HttpStatus.CONFLICT, messageKey: 'framework.not_available' },
  FILE_REQUIRED: { status: HttpStatus.UNPROCESSABLE_ENTITY, messageKey: 'file.required' },
  FILE_TOO_LARGE: { status: HttpStatus.PAYLOAD_TOO_LARGE, messageKey: 'file.too_large' },
  UNSUPPORTED_MEDIA_TYPE: { status: HttpStatus.UNSUPPORTED_MEDIA_TYPE, messageKey: 'file.unsupported_type' },
  // No es un fallo del cliente: esta instalación no tiene dónde guardar archivos.
  STORAGE_UNAVAILABLE: { status: HttpStatus.SERVICE_UNAVAILABLE, messageKey: 'file.storage_unavailable' },
  SYSTEM_DESCRIPTION_NOT_A_FILE: { status: HttpStatus.NOT_FOUND, messageKey: 'file.not_a_file' },
  ACCESS_KEY_RATE_LIMITED: { status: HttpStatus.TOO_MANY_REQUESTS, messageKey: 'auth.access_key_rate_limited' },
  ACTIVATION_CODE_INVALID: { status: HttpStatus.NOT_FOUND, messageKey: 'auth.activation_code_invalid' },
  ACTIVATION_CODE_ALREADY_USED: { status: HttpStatus.CONFLICT, messageKey: 'auth.activation_code_already_used' },
  ACTIVATION_CODE_EXPIRED: { status: HttpStatus.CONFLICT, messageKey: 'auth.activation_code_expired' },
  ACTIVATION_CODE_EMAIL_MISMATCH: { status: HttpStatus.UNPROCESSABLE_ENTITY, messageKey: 'auth.activation_code_email_mismatch' },
  ACTIVATION_CODE_RATE_LIMITED: { status: HttpStatus.TOO_MANY_REQUESTS, messageKey: 'auth.activation_code_rate_limited' },
  // Componente 3 (contracts/modules/onboarding-technical-control.md).
  ASSET_NOT_VALIDATED: { status: HttpStatus.CONFLICT, messageKey: 'asset.not_validated' },
  ASSET_ALREADY_ACTIVE: { status: HttpStatus.CONFLICT, messageKey: 'asset.already_active' },
  ASSET_NOT_ACTIVE: { status: HttpStatus.CONFLICT, messageKey: 'asset.not_active' },
  EXECUTION_IN_PROGRESS: { status: HttpStatus.CONFLICT, messageKey: 'execution.in_progress' },
  EXECUTION_NOT_RUNNING: { status: HttpStatus.CONFLICT, messageKey: 'execution.not_running' },
  CONNECTION_METHOD_NOT_APPLICABLE: { status: HttpStatus.CONFLICT, messageKey: 'connection.method_not_applicable' },
  ENGINE_OUTPUT_INVALID: { status: HttpStatus.UNPROCESSABLE_ENTITY, messageKey: 'execution.output_invalid' },
  FREQUENCY_NOT_SUPPORTED: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    messageKey: 'frequency.not_supported',
  },
  // Esta instalación aún no puede comprobar conexiones (sin sonda). No es un fallo del cliente.
  CONNECTION_UNAVAILABLE: { status: HttpStatus.SERVICE_UNAVAILABLE, messageKey: 'connection.unavailable' },
};
