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
  // Componente 3 (contracts/modules/onboarding-technical-control.md).
  | 'DEPLOYMENT_SCENARIO_NOT_SET'
  | 'CAPABILITY_NOT_APPLICABLE'
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
