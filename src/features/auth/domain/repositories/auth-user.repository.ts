import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AuthUser, UserCredentials } from '../entities/auth-user.entity';

export abstract class AuthUserRepository {
  // Búsqueda previa al tenant (no hay RLS que aplicar todavía): email → credenciales.
  abstract findCredentialsByEmail(email: string): Promise<UserCredentials | null>;

  abstract findById(scope: TenantScope, userId: string): Promise<AuthUser | null>;

  // D94 · Las mismas credenciales, pero ya conociendo el ámbito (el segundo factor llega con el desafío, que trae la empresa y la persona).
  abstract findCredentialsById(scope: TenantScope, userId: string): Promise<UserCredentials | null>;

  abstract registerFailedLogin(
    scope: TenantScope,
    userId: string,
    state: { failedLoginAttempts: number; lockedUntil: Date | null },
  ): Promise<void>;

  abstract registerSuccessfulLogin(scope: TenantScope, userId: string, at: Date): Promise<void>;

  // D111 · Guarda el idioma de la persona y su rastro (`user.language_changed`) en la misma transacción (SEG-36).
  abstract setPreferredLanguage(scope: TenantScope, userId: string, language: 'es' | 'en', audit: AuditIntent<{ from: 'es' | 'en'; to: 'es' | 'en' }>): Promise<void>;
}
