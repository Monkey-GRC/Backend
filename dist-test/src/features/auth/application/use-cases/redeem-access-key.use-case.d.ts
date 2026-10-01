import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import { AccessKeyRedemptionRepository } from '../../domain/repositories/access-key-redemption.repository';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { IssuedSession, SessionIssuer } from '../services/session-issuer.service';
export type RedeemInput = {
    code: string;
    email: string;
    password: string;
    name: string;
    lastName: string;
};
export type RedeemResult = IssuedSession & {
    user: AuthUser;
};
export declare class RedeemAccessKeyUseCase {
    private readonly redemptions;
    private readonly users;
    private readonly passwords;
    private readonly tokens;
    private readonly sessionIssuer;
    private readonly audit;
    constructor(redemptions: AccessKeyRedemptionRepository, users: AuthUserRepository, passwords: PasswordHasher, tokens: TokenHasher, sessionIssuer: SessionIssuer, audit: AuditLogWriter);
    execute(input: RedeemInput, meta: RequestMeta): Promise<RedeemResult>;
    private log;
}
