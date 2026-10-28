import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { normalizeAccessKeyCode } from '../../../../common/security/access-key-code';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import { ActivationRepository } from '../../domain/repositories/activation.repository';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { AccessKeyAttemptLimiter } from '../services/access-key-attempt-limiter.service';
import { assertActivationAllowed } from '../services/activation-attempts';
import { MfaChallengeService, OpenedChallenge } from '../services/mfa-challenge.service';
import { MfaPolicy } from '../services/mfa-policy.service';
import { IssuedSession, SessionIssuer } from '../services/session-issuer.service';

export type ActivateInput = { code: string; email: string; password: string };

// Igual que el canje de la clave (D94): con el segundo factor obligatorio, la cuenta recién activada no abre sesión, primero lo configura.
export type ActivateResult = ({ kind: 'session'; user: AuthUser } & IssuedSession) | { kind: 'mfa'; challenge: OpenedChallenge };

// Segundo paso de la activación (D95): canjea el código de un solo uso, pone la contraseña de la persona y pasa su cuenta de `pending` a `active`. Desde ahí entra
// siempre con correo, contraseña y segundo factor; el código ya no vuelve a servir.
@Injectable()
export class ActivateAccountUseCase {
  constructor(
    private readonly activations: ActivationRepository,
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordHasher,
    private readonly tokens: TokenHasher,
    private readonly sessionIssuer: SessionIssuer,
    private readonly limiter: AccessKeyAttemptLimiter,
    private readonly audit: AuditLogWriter,
    private readonly mfaPolicy: MfaPolicy,
    private readonly challenges: MfaChallengeService,
  ) {}

  async execute(input: ActivateInput, meta: RequestMeta): Promise<ActivateResult> {
    assertActivationAllowed(this.limiter, meta.ipAddress);
    const now = new Date();
    const email = input.email.trim().toLowerCase();
    const code = normalizeAccessKeyCode(input.code);

    const found = code ? await this.activations.findByCodeHash(this.tokens.hash(code)) : null;
    if (!found) {
      await this.logFailure(meta, null, { reason: 'unknown_code' }, email);
      throw new DomainError('ACTIVATION_CODE_INVALID');
    }

    // Primero el estado del código (usado y vencido tienen su propio mensaje, como la clave de acceso); después, que la cuenta siga esperando su activación.
    const state = found.stateAt(now);
    if (state !== 'redeemable') {
      await this.logFailure(meta, found.companyId, { reason: `code_${state}` }, email);
      if (state === 'used') throw new DomainError('ACTIVATION_CODE_ALREADY_USED');
      if (state === 'expired') throw new DomainError('ACTIVATION_CODE_EXPIRED');
      throw new DomainError('ACTIVATION_CODE_INVALID');
    }

    // La cuenta existe desde el alta: se actúa sobre la empresa del código, con el rol que va a tener.
    const account = await this.activations.findAccount({ companyId: found.companyId }, found.userId);
    if (!account || account.status !== 'pending') {
      await this.logFailure(meta, found.companyId, { reason: 'account_not_pending' }, email);
      throw new DomainError('ACTIVATION_CODE_INVALID');
    }
    const scope: TenantScope = { companyId: found.companyId, userId: account.id, role: account.role };

    // El código se emitió para el correo de la cuenta que creó Monkey (como el `admin_email` de una clave, D43): con otro correo no sirve aunque alguien lo intercepte.
    if (email !== account.email.toLowerCase()) {
      await this.logFailure(meta, found.companyId, { reason: 'email_mismatch' }, email);
      throw new DomainError('ACTIVATION_CODE_EMAIL_MISMATCH');
    }

    // La política de contraseña (§5.3) la impone ActivateAccountDto: llega aquí ya validada.
    const outcome = await this.activations.activate(
      scope,
      found.id,
      account.id,
      await this.passwords.hash(input.password),
      now,
      ({ userId }) => ({
        tenantId: found.companyId,
        userId,
        action: 'user.activate',
        resource: 'user',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: { user_id: userId, role: account.role, activation_code_id: found.id },
      }),
    );
    if (outcome.kind === 'already_used') {
      await this.logFailure(meta, found.companyId, { reason: 'code_used_concurrently' }, email);
      throw new DomainError('ACTIVATION_CODE_ALREADY_USED');
    }

    if (this.mfaPolicy.isRequired()) {
      const challenge = await this.challenges.open(scope, account.id, 'setup', meta, now);
      this.limiter.clear(meta.ipAddress);
      return { kind: 'mfa', challenge };
    }
    await this.users.registerSuccessfulLogin(scope, account.id, now);
    const user = await this.users.findById(scope, account.id);
    if (!user) throw new DomainError('ACTIVATION_CODE_INVALID');

    // La sesión no lleva rastro propio aquí: ya quedó auditada la activación que la origina.
    const issued = await this.sessionIssuer.issue(user, meta, null, now);
    this.limiter.clear(meta.ipAddress);
    return { kind: 'session', user, ...issued };
  }

  // Solo intentos FALLIDOS: no hay efecto con el que ser atómico, así que se escriben aparte (de mejor esfuerzo) y cuentan para el freno por dirección.
  private logFailure(meta: RequestMeta, tenantId: string | null, afterState: Record<string, unknown>, attemptedEmail: string): Promise<void> {
    this.limiter.recordFailure(meta.ipAddress);
    return this.audit.write({
      tenantId,
      userId: null,
      attemptedEmail,
      action: 'user.activate',
      resource: 'user',
      result: 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState,
    });
  }
}