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
}
