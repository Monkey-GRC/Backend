// Error de negocio sin dependencia de HTTP: los casos de uso lo lanzan y el filtro global
// lo traduce a status + error.code del contrato (ver domain-error.catalog.ts).
export type DomainErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_CREDENTIALS'
  | 'SESSION_EXPIRED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_INACTIVE'
  | 'MFA_CHALLENGE_INVALID'
  | 'MFA_CODE_INVALID'
  | 'MFA_SETUP_NOT_STARTED'
  | 'MFA_NOT_ENABLED'
  | 'ACCESS_KEY_INVALID'
  | 'ACCESS_KEY_ALREADY_USED'
  | 'ACCESS_KEY_EXPIRED'
  | 'ACCESS_KEY_EMAIL_MISMATCH'
  | 'EMAIL_TAKEN'
  | 'COMPANY_NAME_TAKEN'
  | 'ADMIN_EMAIL_TAKEN'
  | 'DEDICATED_DATABASE_NOT_AVAILABLE'
  // Componente 2 (contracts/modules/onboarding-service-context.md).
  | 'ORGANIZATION_NOT_DECLARED'
  | 'SERVICE_NAME_TAKEN'
  | 'SERVICE_HAS_EVALUATIONS'
  | 'CONTROL_RETIRED'
  | 'RESPONSIBLE_ALREADY_EXISTS'
  | 'RESPONSIBLE_IN_USE'
  | 'CODE_ALREADY_EXISTS'
  | 'LINK_ALREADY_EXISTS'
  // Monkey Admin, catálogo maestro (contracts/modules/monkey-admin-catalog.md): lo que se quiere dar de baja o desvincular lo necesita otro elemento activo.
  | 'CATALOG_ITEM_IN_USE'
  | 'RISK_INACTIVE'
  | 'CAUSE_INACTIVE'
  // Exclusiones (contracts/modules/compliance-audit.md, MD-144).
  | 'EXCLUSION_ALREADY_EXISTS'
  | 'EVALUATION_NOT_DEFINED'
  // Veredictos y evaluaciones del servicio (contracts/modules/compliance-audit.md y compliance-overview.md, MD-155).
  | 'TEST_NOT_MANUAL'
  | 'TEST_DECIDED_BY_EVIDENCE'
  | 'TEST_HAS_NO_ASSETS'
  // Evidencias (contracts/modules/compliance-evidence.md, MD-126): dos subidas a la vez pidieron la misma versión; se reintenta.
  | 'EVIDENCE_VERSION_CONFLICT'
  // D47: el marco no está entre los que Monkey Admin contrató para la empresa.
  | 'FRAMEWORK_NOT_CONTRACTED'
  // D50: el marco existe en el catálogo pero aún no está construido (`coming_soon`): no se contrata.
  | 'FRAMEWORK_NOT_AVAILABLE'
  // Descripción del Sistema como archivo (DT-12).
  | 'FILE_REQUIRED'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'STORAGE_UNAVAILABLE'
  | 'SYSTEM_DESCRIPTION_NOT_A_FILE'
  // Activación de cuenta: demasiados intentos con la clave desde una misma dirección.
  | 'ACCESS_KEY_RATE_LIMITED'
  // Activación de cuentas que crea el administrador (contracts/modules/users-team.md, D95, D96).
  | 'ACTIVATION_CODE_INVALID'
  | 'ACTIVATION_CODE_ALREADY_USED'
  | 'ACTIVATION_CODE_EXPIRED'
  | 'ACTIVATION_CODE_EMAIL_MISMATCH'
  | 'ACTIVATION_CODE_RATE_LIMITED'
  // Componente 3 (contracts/modules/onboarding-technical-control.md).
  | 'ASSET_NOT_VALIDATED'
  | 'ASSET_ALREADY_ACTIVE'
  | 'ASSET_NOT_ACTIVE'
  | 'FREQUENCY_NOT_SUPPORTED'
  // Operación continua (contracts/modules/control-tecnico.md, D57).
  | 'EXECUTION_IN_PROGRESS'
  | 'EXECUTION_NOT_RUNNING'
  | 'ENGINE_OUTPUT_INVALID'
  | 'CONNECTION_METHOD_NOT_APPLICABLE'
  | 'CONNECTION_UNAVAILABLE';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(code);
  }
}
