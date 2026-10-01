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
  // Componente 2 (contracts/modules/onboarding-service-context.md).
  ORGANIZATION_NOT_DECLARED: { status: HttpStatus.CONFLICT, messageKey: 'organization.not_declared' },
  SERVICE_NAME_TAKEN: { status: HttpStatus.CONFLICT, messageKey: 'service.name_taken' },
  SERVICE_HAS_EVALUATIONS: { status: HttpStatus.CONFLICT, messageKey: 'service.has_evaluations' },
};
