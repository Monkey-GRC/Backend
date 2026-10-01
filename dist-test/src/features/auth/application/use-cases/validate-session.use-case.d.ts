import { Principal } from '../../../../common/auth/principal';
import type { SessionPolicy } from '../../domain/entities/session.entity';
import { AccessTokenService } from '../../domain/ports/access-token.service';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { SessionRepository } from '../../domain/repositories/session.repository';
export declare class ValidateSessionUseCase {
    private readonly users;
    private readonly sessions;
    private readonly accessTokens;
    private readonly policy;
    constructor(users: AuthUserRepository, sessions: SessionRepository, accessTokens: AccessTokenService, policy: SessionPolicy);
    execute(accessToken: string | undefined): Promise<Principal>;
}
