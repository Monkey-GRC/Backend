import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { SessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenHasher,
    private readonly audit: AuditLogWriter,
  ) {}

  // Idempotente: sin token o con una sesión ya cerrada, el logout igual "funciona" (204).
  async execute(refreshToken: string | undefined, meta: RequestMeta): Promise<void> {
    if (!refreshToken) return;
    const session = await this.sessions.findByRefreshTokenHash(this.tokens.hash(refreshToken));
    if (!session || session.revokedAt) return;

    await this.sessions.revoke(
      { companyId: session.companyId, userId: session.userId },
      session.id,
      new Date(),
    );
    await this.audit.write({
      tenantId: session.companyId,
      userId: session.userId,
      action: 'auth.logout',
      resource: 'session',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { session_id: session.id },
    });
  }
}
