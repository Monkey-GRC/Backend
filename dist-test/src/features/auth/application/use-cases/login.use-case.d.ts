import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../common/http/request-meta';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { IssuedSession, SessionIssuer } from '../services/session-issuer.service';
export type LoginResult = IssuedSession & {
    user: AuthUser;
};
export declare class LoginUseCase {
    private readonly users;
    private readonly passwords;
    private readonly sessionIssuer;
    private readonly audit;
    constructor(users: AuthUserRepository, passwords: PasswordHasher, sessionIssuer: SessionIssuer, audit: AuditLogWriter);
    execute(email: string, password: string, meta: RequestMeta): Promise<LoginResult>;
    private log;
}
