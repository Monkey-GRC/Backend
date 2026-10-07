import { Inject, Injectable } from '@nestjs/common';
import { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { SessionPolicy } from '../../domain/entities/session.entity';
import { AccessTokenService } from '../../domain/ports/access-token.service';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { SESSION_POLICY } from '../session-policy.token';

// No se reescribe last_activity_at en cada request: basta con saber que hubo actividad en el
// último minuto para medir los 30 min de inactividad.
const TOUCH_THROTTLE_MS = 60_000;

@Injectable()
export class ValidateSessionUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly sessions: SessionRepository,
    private readonly accessTokens: AccessTokenService,
    @Inject(SESSION_POLICY) private readonly policy: SessionPolicy,
  ) {}

  // Autorización verificada en cada request contra la base (§5.3): un JWT válido no basta si
  // la sesión se cerró, quedó inactiva o el usuario fue desactivado después de emitirlo.
  async execute(accessToken: string | undefined): Promise<Principal> {
    if (!accessToken) throw new DomainError('UNAUTHENTICATED');
    const claims = await this.accessTokens.verify(accessToken);
    if (!claims) throw new DomainError('UNAUTHENTICATED');

    const now = new Date();
    const scope: TenantScope = { companyId: claims.cid, userId: claims.sub };

    const session = await this.sessions.findById(scope, claims.sid);
    if (!session || session.userId !== claims.sub) throw new DomainError('UNAUTHENTICATED');

    const state = session.stateAt(now, this.policy);
    if (state !== 'active') {
      if (state !== 'revoked') await this.sessions.revoke(scope, session.id, now, null);
      throw new DomainError('SESSION_EXPIRED');
    }

    const user = await this.users.findById(scope, claims.sub);
    if (!user || !user.isActive()) {
      await this.sessions.revoke(scope, session.id, now, null);
      throw new DomainError('ACCOUNT_INACTIVE');
    }

    if (now.getTime() - session.lastActivityAt.getTime() > TOUCH_THROTTLE_MS) {
      await this.sessions.touch(scope, session.id, now);
    }

    // El rol sale de la base, no del token: si cambió, manda el de la base.
    return { userId: user.id, companyId: user.companyId, role: user.role, sessionId: session.id };
  }
}
