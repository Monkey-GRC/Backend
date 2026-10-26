import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { UserCredentials } from '../../domain/entities/auth-user.entity';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { MfaRepository } from '../../domain/repositories/mfa.repository';

// Un código del segundo factor que no sirve cuenta como un intento fallido más: suma al mismo contador del bloqueo de la cuenta (5 intentos, 15 min) y al del
// desafío (5 intentos), y deja su rastro. Un solo lugar para los cuatro caminos que piden un código.
@Injectable()
export class MfaAttempts {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly mfa: MfaRepository,
    private readonly audit: AuditLogWriter,
  ) {}

  assertNotLocked(credentials: UserCredentials, now: Date): void {
    if (credentials.isLocked(now)) throw new DomainError('ACCOUNT_LOCKED', { retry_after_seconds: credentials.secondsUntilUnlock(now) });
  }

  // Siempre lanza: `ACCOUNT_LOCKED` si este fallo bloquea la cuenta, `MFA_CODE_INVALID` si no.
  async fail(scope: TenantScope, credentials: UserCredentials, challengeId: string | null, meta: RequestMeta, now: Date, reason: string): Promise<never> {
    const next = credentials.afterFailedAttempt(now);
    await this.users.registerFailedLogin(scope, credentials.id, next);
    if (challengeId) await this.mfa.registerChallengeFailure(scope, challengeId);
    await this.audit.write({
      tenantId: credentials.companyId,
      userId: credentials.id,
      action: 'auth.mfa_failed',
      resource: 'session',
      result: 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { reason: next.lockedUntil ? 'locked_now' : reason },
    });
    if (next.lockedUntil) {
      throw new DomainError('ACCOUNT_LOCKED', { retry_after_seconds: Math.ceil((next.lockedUntil.getTime() - now.getTime()) / 1000) });
    }
    throw new DomainError('MFA_CODE_INVALID');
  }
}