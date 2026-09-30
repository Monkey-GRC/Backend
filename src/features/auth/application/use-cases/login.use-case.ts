import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { IssuedSession, SessionIssuer } from '../services/session-issuer.service';

export type LoginResult = IssuedSession & { user: AuthUser };

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordHasher,
    private readonly sessionIssuer: SessionIssuer,
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(email: string, password: string, meta: RequestMeta): Promise<LoginResult> {
    const now = new Date();
    const normalizedEmail = email.trim().toLowerCase();
    const credentials = await this.users.findCredentialsByEmail(normalizedEmail);

    // Email inexistente: mismo error y mismo costo que una contraseña mala (nunca se dice cuál
    // de los dos falló), y queda el intento con el email tecleado (CC7.2).
    if (!credentials) {
      await this.passwords.compareAgainstDummy(password);
      await this.log(meta, null, null, 'error', { reason: 'unknown_email' }, normalizedEmail);
      throw new DomainError('INVALID_CREDENTIALS');
    }

    const scope: TenantScope = {
      companyId: credentials.companyId,
      userId: credentials.id,
      role: credentials.role,
    };

    if (credentials.isLocked(now)) {
      await this.log(meta, credentials.companyId, credentials.id, 'error', { reason: 'locked' });
      throw new DomainError('ACCOUNT_LOCKED', {
        retry_after_seconds: credentials.secondsUntilUnlock(now),
      });
    }

    if (!(await this.passwords.compare(password, credentials.passwordHash))) {
      const next = credentials.afterFailedAttempt(now);
      await this.users.registerFailedLogin(scope, credentials.id, next);
      await this.log(meta, credentials.companyId, credentials.id, 'error', {
        reason: next.lockedUntil ? 'locked_now' : 'wrong_password',
      });
      if (next.lockedUntil) {
        throw new DomainError('ACCOUNT_LOCKED', {
          retry_after_seconds: Math.ceil((next.lockedUntil.getTime() - now.getTime()) / 1000),
        });
      }
      throw new DomainError('INVALID_CREDENTIALS');
    }

    // Se comprueba después de la contraseña: a quien no la sabe no se le revela el estado.
    if (credentials.status !== 'active') {
      await this.log(meta, credentials.companyId, credentials.id, 'error', {
        reason: `status_${credentials.status}`,
      });
      throw new DomainError('ACCOUNT_INACTIVE');
    }

    await this.users.registerSuccessfulLogin(scope, credentials.id, now);
    const user = await this.users.findById(scope, credentials.id);
    if (!user) throw new DomainError('INVALID_CREDENTIALS');

    const issued = await this.sessionIssuer.issue(user, meta, now);
    await this.log(meta, user.companyId, user.id, 'success', { session_id: issued.session.id });
    return { user, ...issued };
  }

  private log(
    meta: RequestMeta,
    tenantId: string | null,
    userId: string | null,
    result: 'success' | 'error',
    afterState: Record<string, unknown>,
    attemptedEmail?: string,
  ): Promise<void> {
    return this.audit.write({
      tenantId,
      userId,
      attemptedEmail,
      action: 'auth.login',
      resource: 'session',
      result,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState,
    });
  }
}
