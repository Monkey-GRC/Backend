import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AuthUser, UserCredentials } from '../entities/auth-user.entity';
export declare abstract class AuthUserRepository {
    abstract findCredentialsByEmail(email: string): Promise<UserCredentials | null>;
    abstract findById(scope: TenantScope, userId: string): Promise<AuthUser | null>;
    abstract registerFailedLogin(scope: TenantScope, userId: string, state: {
        failedLoginAttempts: number;
        lockedUntil: Date | null;
    }): Promise<void>;
    abstract registerSuccessfulLogin(scope: TenantScope, userId: string, at: Date): Promise<void>;
}
