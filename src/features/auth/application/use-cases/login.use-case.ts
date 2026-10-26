import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { MfaChallengeService, OpenedChallenge } from '../services/mfa-challenge.service';
import { MfaPolicy } from '../services/mfa-policy.service';
import { IssuedSession, SessionIssuer } from '../services/session-issuer.service';

// D94 · La contraseña correcta ya no siempre abre la sesión: si la persona tiene el segundo factor (o está obligada a configurarlo) lo que sigue es un desafío.
export type LoginResult =
  | ({ kind: 'session'; user: AuthUser } & IssuedSession)
  | { kind: 'mfa'; challenge: OpenedChallenge };

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordHasher,
    private readonly sessionIssuer: SessionIssuer,
    private readonly audit: AuditLogWriter,
    private readonly mfaPolicy: MfaPolicy,
    private readonly challenges: MfaChallengeService,
  ) {}

  async execute(email: string, password: string, meta: RequestMeta): Promise<LoginResult> {
    const now = new Date();
    const normalizedEmail = email.trim().toLowerCase();
    const credentials = await this.users.findCredentialsByEmail(normalizedEmail);

    // Email inexistente: mismo error y mismo costo que una contraseña mala (nunca se dice cuál
    // de los dos falló), y queda el intento con el email tecleado (CC7.2).
    if (!credentials) {
      await this.passwords.compareAgainstDummy(password);
      await this.logFailure(meta, null, { reason: 'unknown_email' }, normalizedEmail);
      throw new DomainError('INVALID_CREDENTIALS');
    }

    const scope: TenantScope = {
      companyId: credentials.companyId,
      userId: credentials.id,
      role: credentials.role,
    };

    if (credentials.isLocked(now)) {
      await this.logFailure(meta, credentials.id, { reason: 'locked' });
      throw new DomainError('ACCOUNT_LOCKED', {
        retry_after_seconds: credentials.secondsUntilUnlock(now),
      });
    }

    if (!(await this.passwords.compare(password, credentials.passwordHash))) {
      const next = credentials.afterFailedAttempt(now);
      await this.users.registerFailedLogin(scope, credentials.id, next);
      await this.logFailure(meta, credentials.id, {
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
      await this.logFailure(meta, credentials.id, {
        reason: `status_${credentials.status}`,
      });
      throw new DomainError('ACCOUNT_INACTIVE');
    }

    // Segundo factor (D94, SEG-16): quien ya lo tiene pasa por la verificación; quien no, por la configuración si es obligatoria. La sesión se abre después,
    // y el contador de intentos fallidos solo se limpia cuando la persona termina de entrar.
    if (credentials.isMfaEnabled || this.mfaPolicy.isRequired()) {
      const challenge = await this.challenges.open(scope, credentials.id, credentials.isMfaEnabled ? 'verify' : 'setup', meta, now);
      return { kind: 'mfa', challenge };
    }

    await this.users.registerSuccessfulLogin(scope, credentials.id, now);
    const user = await this.users.findById(scope, credentials.id);
    if (!user) throw new DomainError('INVALID_CREDENTIALS');

    // La sesión y su rastro `auth.login` se confirman en la misma transacción (SEG-36): no hay sesión sin rastro.
    const issued = await this.sessionIssuer.issue(
      user,
      meta,
      (session) => ({
        tenantId: user.companyId,
        userId: user.id,
        action: 'auth.login',
        resource: 'session',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: { session_id: session.id },
      }),
      now,
    );
    return { kind: 'session', user, ...issued };
  }

  // Solo intentos FALLIDOS: no hay efecto con el que ser atómico, así que se escriben aparte (de mejor esfuerzo). El
  // acceso correcto se audita junto con la sesión (SEG-36). Convención (contracts/conventions.md):
  // `auth.login_failed` sin tenant (CC7.2), porque el correo puede no existir.
  private logFailure(
    meta: RequestMeta,
    userId: string | null,
    afterState: Record<string, unknown>,
    attemptedEmail?: string,
  ): Promise<void> {
    return this.audit.write({
      tenantId: null,
      userId,
      attemptedEmail,
      action: 'auth.login_failed',
      resource: 'session',
      result: 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState,
    });
  }
}
