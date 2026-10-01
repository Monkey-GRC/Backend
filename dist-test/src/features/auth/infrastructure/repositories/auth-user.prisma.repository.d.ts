import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AuthUser, UserCredentials } from '../../domain/entities/auth-user.entity';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
export declare class AuthUserPrismaRepository extends AuthUserRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findCredentialsByEmail(email: string): Promise<UserCredentials | null>;
    findById(scope: TenantScope, userId: string): Promise<AuthUser | null>;
    registerFailedLogin(scope: TenantScope, userId: string, state: {
        failedLoginAttempts: number;
        lockedUntil: Date | null;
    }): Promise<void>;
    registerSuccessfulLogin(scope: TenantScope, userId: string, at: Date): Promise<void>;
}
