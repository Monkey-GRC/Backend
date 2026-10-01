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
  // Componente 3 (contracts/modules/onboarding-technical-control.md).
  | 'DEPLOYMENT_SCENARIO_NOT_SET'
  | 'CAPABILITY_NOT_APPLICABLE'
  | 'ASSET_NOT_VALIDATED'
  | 'ASSET_ALREADY_ACTIVE'
  | 'ASSET_NOT_ACTIVE'
  | 'FREQUENCY_NOT_SUPPORTED'
  | 'CONNECTION_UNAVAILABLE';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(code);
  }
}
