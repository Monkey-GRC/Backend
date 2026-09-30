import { Inject, Injectable } from '@nestjs/common';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { Session } from '../../domain/entities/session.entity';
import type { SessionPolicy } from '../../domain/entities/session.entity';
import { AccessTokenService } from '../../domain/ports/access-token.service';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { SESSION_POLICY } from '../session-policy.token';

export type IssuedSession = {
  session: Session;
  accessToken: string;
  refreshToken: string;
};

// Abre una sesión nueva para un usuario ya verificado: la usan el login (contraseña) y el canje
// de la clave de acceso (primer ingreso). Un solo lugar define cómo nace una sesión (§5.3).
@Injectable()
export class SessionIssuer {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenHasher,
    private readonly accessTokens: AccessTokenService,
    @Inject(SESSION_POLICY) private readonly policy: SessionPolicy,
  ) {}

  async issue(user: AuthUser, meta: RequestMeta, now = new Date()): Promise<IssuedSession> {
    const refreshToken = this.tokens.generate();
    const session = await this.sessions.create(
      { companyId: user.companyId, userId: user.id, role: user.role },
      {
        userId: user.id,
        refreshTokenHash: this.tokens.hash(refreshToken),
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        createdAt: now,
        expiresAt: Session.expiresAtFor(now, this.policy),
      },
    );
    const accessToken = await this.accessTokens.sign({
      sub: user.id,
      cid: user.companyId,
      role: user.role,
      sid: session.id,
    });
    return { session, accessToken, refreshToken };
  }
}
