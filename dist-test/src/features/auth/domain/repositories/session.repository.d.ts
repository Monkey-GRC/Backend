import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Session } from '../entities/session.entity';
export type NewSession = {
    userId: string;
    refreshTokenHash: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    expiresAt: Date;
};
export declare abstract class SessionRepository {
    abstract create(scope: TenantScope, data: NewSession): Promise<Session>;
    abstract findByRefreshTokenHash(hash: string): Promise<Session | null>;
    abstract findById(scope: TenantScope, sessionId: string): Promise<Session | null>;
    abstract rotate(scope: TenantScope, sessionId: string, newHash: string, at: Date): Promise<void>;
    abstract touch(scope: TenantScope, sessionId: string, at: Date): Promise<void>;
    abstract revoke(scope: TenantScope, sessionId: string, at: Date): Promise<void>;
}
