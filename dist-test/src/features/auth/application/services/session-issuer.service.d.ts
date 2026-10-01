import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { Session } from '../../domain/entities/session.entity';
import type { SessionPolicy } from '../../domain/entities/session.entity';
import { AccessTokenService } from '../../domain/ports/access-token.service';
import { SessionRepository } from '../../domain/repositories/session.repository';
export type IssuedSession = {
    session: Session;
    accessToken: string;
    refreshToken: string;
};
export declare class SessionIssuer {
    private readonly sessions;
    private readonly tokens;
    private readonly accessTokens;
    private readonly policy;
    constructor(sessions: SessionRepository, tokens: TokenHasher, accessTokens: AccessTokenService, policy: SessionPolicy);
    issue(user: AuthUser, meta: RequestMeta, now?: Date): Promise<IssuedSession>;
}
