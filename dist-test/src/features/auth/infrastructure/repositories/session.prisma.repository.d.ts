import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { Session } from '../../domain/entities/session.entity';
import { NewSession, SessionRepository } from '../../domain/repositories/session.repository';
export declare class SessionPrismaRepository extends SessionRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(scope: TenantScope, data: NewSession): Promise<Session>;
    findByRefreshTokenHash(hash: string): Promise<Session | null>;
    findById(scope: TenantScope, sessionId: string): Promise<Session | null>;
    rotate(scope: TenantScope, sessionId: string, newHash: string, at: Date): Promise<void>;
    touch(scope: TenantScope, sessionId: string, at: Date): Promise<void>;
    revoke(scope: TenantScope, sessionId: string, at: Date): Promise<void>;
}
