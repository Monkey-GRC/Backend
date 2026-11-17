import { HttpStatus } from '@nestjs/common';
import { DomainErrorCode } from './domain-error';

// error.code → status HTTP y clave i18n (tablas de errores de contracts/modules/*.md).
export const DOMAIN_ERROR_CATALOG: Record<
  DomainErrorCode,
  { status: HttpStatus; messageKey: string }
> = {
  UNAUTHENTICATED: { status: HttpStatus.UNAUTHORIZED, messageKey: 'common.unauthenticated' },
  FORBIDDEN: { status: HttpStatus.FORBIDDEN, messageKey: 'common.forbidden' },
  RATE_LIMITED: { status: HttpStatus.TOO_MANY_REQUESTS, messageKey: 'common.rate_limited' },
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
  // D101 · Contraseña actual equivocada (403, no 401: el cliente no debe tomarlo por sesión caída), una repetida, demasiados cambios y un enlace de recuperación que no sirve.
  CURRENT_PASSWORD_INVALID: { status: HttpStatus.FORBIDDEN, messageKey: 'auth.current_password_invalid' },
  PASSWORD_REUSED: { status: HttpStatus.UNPROCESSABLE_ENTITY, messageKey: 'auth.password_reused' },
  PASSWORD_CHANGE_LIMIT: { status: HttpStatus.TOO_MANY_REQUESTS, messageKey: 'auth.password_change_limit' },
  PASSWORD_RESET_INVALID: { status: HttpStatus.UNAUTHORIZED, messageKey: 'auth.password_reset_invalid' },
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
  // D99 · Reenviar la clave de una empresa que ya la canjeó.
  ACCESS_KEY_NOT_PENDING: { status: HttpStatus.CONFLICT, messageKey: 'access_key.not_pending' },
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
  OBSERVATION_CLOSED: { status: HttpStatus.CONFLICT, messageKey: 'observation.closed_locked' },
  OBSERVATION_NOT_OPEN: { status: HttpStatus.CONFLICT, messageKey: 'observation.not_open' },
  INVALID_TRANSITION: { status: HttpStatus.CONFLICT, messageKey: 'observation.invalid_transition' },
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
  LAST_ADMIN: { status: HttpStatus.CONFLICT, messageKey: 'user.last_admin' },
  RESPONSIBLE_HAS_NO_TEAM: { status: HttpStatus.CONFLICT, messageKey: 'user.responsible_has_no_team' },
  RESPONSIBLES_GROUP_INVALID: { status: HttpStatus.CONFLICT, messageKey: 'user.responsibles_group_invalid' },
  TEAM_ALREADY_EXISTS: { status: HttpStatus.CONFLICT, messageKey: 'group.team_already_exists' },
  GROUP_NAME_TAKEN: { status: HttpStatus.CONFLICT, messageKey: 'group.name_taken' },
  GROUP_RESERVED: { status: HttpStatus.CONFLICT, messageKey: 'group.reserved' },
  USER_HAS_ASSIGNMENTS: { status: HttpStatus.CONFLICT, messageKey: 'user.has_assignments' },
  RESPONSIBLE_HAS_DELEGATES: { status: HttpStatus.CONFLICT, messageKey: 'user.responsible_has_delegates' },
  TEAM_LEADER_INACTIVE: { status: HttpStatus.CONFLICT, messageKey: 'user.team_leader_inactive' },
  OWNER_NOT_ELIGIBLE: { status: HttpStatus.CONFLICT, messageKey: 'assignment.owner_not_eligible' },
  EXECUTOR_NOT_IN_TEAM: { status: HttpStatus.CONFLICT, messageKey: 'assignment.executor_not_in_team' },
  USER_NOT_ACTIVATED: { status: HttpStatus.CONFLICT, messageKey: 'user.not_activated' },
  USER_LIMIT_REACHED: { status: HttpStatus.CONFLICT, messageKey: 'user.limit_reached' },
  MAX_USERS_BELOW_CURRENT: { status: HttpStatus.CONFLICT, messageKey: 'company.max_users_below_current' },
  USER_ALREADY_ACTIVE: { status: HttpStatus.CONFLICT, messageKey: 'user.already_active' },
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
  INTEGRATION_NOT_FOUND: { status: HttpStatus.NOT_FOUND, messageKey: 'integration.not_found' },
  // La instalación de la sonda en un servidor (D113).
  ASSET_NOT_AGENT: { status: HttpStatus.CONFLICT, messageKey: 'agent_install.not_agent' },
  AGENT_INSTALL_NOT_READY: { status: HttpStatus.CONFLICT, messageKey: 'agent_install.not_ready' },
  AGENT_ALREADY_LINKED: { status: HttpStatus.CONFLICT, messageKey: 'agent_install.already_linked' },
  // Lo que el trabajador entrega de la sonda de un servidor no es de ESE servidor o de ESA empresa (SEG-45): se rechaza y no se guarda nada.
  AGENT_NOT_LINKED: { status: HttpStatus.UNPROCESSABLE_ENTITY, messageKey: 'agent_install.not_linked' },
  AGENT_GROUP_MISMATCH: { status: HttpStatus.UNPROCESSABLE_ENTITY, messageKey: 'agent_install.group_mismatch' },
  // Esta instalación aún no está configurada para instalar la sonda (sin dirección ni versión). No es un fallo del cliente.
  AGENT_INSTALL_UNAVAILABLE: { status: HttpStatus.SERVICE_UNAVAILABLE, messageKey: 'agent_install.unavailable' },
  CANNOT_DEACTIVATE_SELF: { status: HttpStatus.CONFLICT, messageKey: 'admin.cannot_deactivate_self' },
  ADMIN_ALREADY_INACTIVE: { status: HttpStatus.CONFLICT, messageKey: 'admin.already_inactive' },
  ADMIN_NOT_INACTIVE: { status: HttpStatus.CONFLICT, messageKey: 'admin.not_inactive' },
};
