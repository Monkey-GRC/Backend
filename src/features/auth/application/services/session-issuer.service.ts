import { Inject, Injectable } from '@nestjs/common';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { Session } from '../../domain/entities/session.entity';
import type { SessionPolicy } from '../../domain/entities/session.entity';
import { AccessTokenService } from '../../domain/ports/access-token.service';
import { SessionRepository } from '../../domain/repositories/session.repository';
import type { DeviceEffect } from '../../domain/repositories/trusted-device.repository';
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

  // `audit` viaja hasta la transacción que crea la sesión (SEG-36). `null` solo si otra acción ya audita este hecho.
  async issue(
    user: AuthUser,
    meta: RequestMeta,
    audit: AuditIntent<Session> | null,
    now = new Date(),
    // D123 · Recordar o anotar el dispositivo, en la misma transacción que la sesión.
    device?: DeviceEffect,
  ): Promise<IssuedSession> {
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
      audit,
      device,
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
