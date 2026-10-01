import { Session } from '../../domain/entities/session.entity';
import type { SessionPolicy } from '../../domain/entities/session.entity';
import { AccessTokenService } from '../../domain/ports/access-token.service';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { SessionRepository } from '../../domain/repositories/session.repository';
export type RefreshResult = {
    session: Session;
    accessToken: string;
    refreshToken: string;
};
export declare class RefreshSessionUseCase {
    private readonly users;
    private readonly sessions;
    private readonly tokens;
    private readonly accessTokens;
    private readonly policy;
    constructor(users: AuthUserRepository, sessions: SessionRepository, tokens: TokenHasher, accessTokens: AccessTokenService, policy: SessionPolicy);
    execute(refreshToken: string | undefined): Promise<RefreshResult>;
}
