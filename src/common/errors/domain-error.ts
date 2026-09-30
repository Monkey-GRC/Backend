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
  | 'DEDICATED_DATABASE_NOT_AVAILABLE';

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(code);
  }
}
