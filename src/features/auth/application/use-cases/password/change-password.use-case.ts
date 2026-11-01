import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../../common/auth/principal';
import { DomainError } from '../../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { AuthUserRepository } from '../../../domain/repositories/auth-user.repository';
import { PasswordRepository } from '../../../domain/repositories/password.repository';
import { MfaAttempts } from '../../services/mfa-attempts.service';
import { PasswordNotifier } from '../../services/password-notifier.service';
import { PasswordRules } from '../../services/password-rules.service';
import { StepUp } from '../../services/step-up.service';

export type ChangePasswordInput = { currentPassword: string; newPassword: string; code?: string; recoveryCode?: string };

// D101 · Cambio voluntario, con la sesión abierta: contraseña actual y un código vigente del segundo factor. La sesión desde la que se cambia sigue; las demás se cierran.
@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordRepository,
    private readonly hasher: PasswordHasher,
    private readonly rules: PasswordRules,
    private readonly stepUp: StepUp,
    private readonly attempts: MfaAttempts,
    private readonly notifier: PasswordNotifier,
    private readonly audit: AuditLogWriter,
  ) {}

  async execute(principal: Principal, input: ChangePasswordInput, meta: RequestMeta): Promise<void> {
    const now = new Date();
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const credentials = await this.users.findCredentialsById(scope, principal.userId);
    const user = await this.users.findById(scope, principal.userId);
    if (!credentials || !user) throw new DomainError('UNAUTHENTICATED');
    this.attempts.assertNotLocked(credentials, now);

    // Contraseña actual equivocada: cuenta como un intento fallido más (SEG-15), como en el ingreso.
    if (!(await this.hasher.compare(input.currentPassword, credentials.passwordHash))) {
      const next = credentials.afterFailedAttempt(now);
      await this.users.registerFailedLogin(scope, credentials.id, next);
      await this.audit.write({
        tenantId: credentials.companyId,
        userId: credentials.id,
        action: 'auth.password_change_failed',
        resource: 'user',
        result: 'error',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: { reason: next.lockedUntil ? 'locked_now' : 'wrong_current_password' },
      });
      if (next.lockedUntil) {
        throw new DomainError('ACCOUNT_LOCKED', { retry_after_seconds: Math.ceil((next.lockedUntil.getTime() - now.getTime()) / 1000) });
      }
      throw new DomainError('CURRENT_PASSWORD_INVALID');
    }

    await this.stepUp.assert(scope, credentials.id, input.code, meta, input.recoveryCode);
    // Después de identificar a la persona: a quien no lo es no se le dice cuántas veces ha cambiado la contraseña.
    await this.rules.assertWithinDailyLimit(scope, credentials.id, now);
    await this.rules.assertNotReused(scope, credentials.id, credentials.passwordHash, input.newPassword);

    const newHash = await this.hasher.hash(input.newPassword);
    await this.passwords.change(
      scope,
      { userId: credentials.id, previousHash: credentials.passwordHash, newHash, at: now, keepSessionId: principal.sessionId, resetTokenId: null },
      ({ sessionsClosed }) => ({
        tenantId: credentials.companyId,
        userId: credentials.id,
        action: 'auth.password_changed',
        resource: 'user',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: { user_id: credentials.id, via: 'change', sessions_closed: sessionsClosed },
      }),
    );
    await this.notifier.sendChanged(user.email, 'changed');
  }
}
