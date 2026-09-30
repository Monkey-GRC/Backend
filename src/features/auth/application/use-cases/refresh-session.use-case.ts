import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Session } from '../../domain/entities/session.entity';
import type { SessionPolicy } from '../../domain/entities/session.entity';
import { AccessTokenService } from '../../domain/ports/access-token.service';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { SESSION_POLICY } from '../session-policy.token';

export type RefreshResult = {
  session: Session;
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenHasher,
    private readonly accessTokens: AccessTokenService,
    @Inject(SESSION_POLICY) private readonly policy: SessionPolicy,
  ) {}

  async execute(refreshToken: string | undefined): Promise<RefreshResult> {
    if (!refreshToken) throw new DomainError('SESSION_EXPIRED');
    const now = new Date();

    const session = await this.sessions.findByRefreshTokenHash(this.tokens.hash(refreshToken));
    if (!session) throw new DomainError('SESSION_EXPIRED');

    const scope: TenantScope = { companyId: session.companyId, userId: session.userId };
    const state = session.stateAt(now, this.policy);
    if (state !== 'active') {
      // Inactiva 30 min o pasadas las 8 h: se cierra para que el token no vuelva a servir.
      if (state !== 'revoked') await this.sessions.revoke(scope, session.id, now);
      throw new DomainError('SESSION_EXPIRED');
    }

    // El usuario pudo pasar a inactive/suspended con la sesión abierta (CC6.3).
    const user = await this.users.findById(scope, session.userId);
    if (!user || !user.isActive()) {
      await this.sessions.revoke(scope, session.id, now);
      throw new DomainError('ACCOUNT_INACTIVE');
    }

    // Rotación: el refresh token anterior deja de servir desde este momento.
    const newRefreshToken = this.tokens.generate();
    await this.sessions.rotate(scope, session.id, this.tokens.hash(newRefreshToken), now);

    const accessToken = await this.accessTokens.sign({
      sub: user.id,
      cid: user.companyId,
      role: user.role,
      sid: session.id,
    });

    return { session, accessToken, refreshToken: newRefreshToken };
  }
}
