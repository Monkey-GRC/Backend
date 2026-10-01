import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { SessionRepository } from '../../domain/repositories/session.repository';
export declare class LogoutUseCase {
    private readonly sessions;
    private readonly tokens;
    private readonly audit;
    constructor(sessions: SessionRepository, tokens: TokenHasher, audit: AuditLogWriter);
    execute(refreshToken: string | undefined, meta: RequestMeta): Promise<void>;
}
