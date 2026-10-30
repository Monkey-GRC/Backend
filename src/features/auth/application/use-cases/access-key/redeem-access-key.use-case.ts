import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { normalizeAccessKeyCode } from '../../../../../common/security/access-key-code';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { TenantScope } from '../../../../../common/tenancy/tenant-scope';
import { AuthUser } from '../../../domain/entities/auth-user.entity';
import { PasswordHasher } from '../../../domain/ports/password-hasher';
import { AccessKeyRedemptionRepository } from '../../../domain/repositories/access-key-redemption.repository';
import { AuthUserRepository } from '../../../domain/repositories/auth-user.repository';
import { AccessKeyAttemptLimiter } from '../../services/access-key-attempt-limiter.service';
import { MfaChallengeService, OpenedChallenge } from '../../services/mfa-challenge.service';
import { MfaPolicy } from '../../services/mfa-policy.service';
import { IssuedSession, SessionIssuer } from '../../services/session-issuer.service';

export type RedeemInput = {
  code: string;
  email: string;
  password: string;
};

// D94 · Con el segundo factor obligatorio, la cuenta recién creada no abre sesión: primero configura el segundo factor (un desafío de configuración).
export type RedeemResult = ({ kind: 'session'; user: AuthUser } & IssuedSession) | { kind: 'mfa'; challenge: OpenedChallenge };

// Primer acceso del cliente (modelo-datos.md §4.2 paso 4, contrato de auth): canjea la clave de un
// solo uso, crea la cuenta admin_empresa de su empresa y deja la sesión abierta. Desde ahí, el
// cliente entra siempre con correo y contraseña; la clave ya no vuelve a servir.
@Injectable()
export class RedeemAccessKeyUseCase {
  constructor(
    private readonly redemptions: AccessKeyRedemptionRepository,
    private readonly users: AuthUserRepository,
    private readonly passwords: PasswordHasher,
    private readonly tokens: TokenHasher,
    private readonly sessionIssuer: SessionIssuer,
    private readonly limiter: AccessKeyAttemptLimiter,
    private readonly audit: AuditLogWriter,
    private readonly mfaPolicy: MfaPolicy,
    private readonly challenges: MfaChallengeService,
  ) {}

  async execute(input: RedeemInput, meta: RequestMeta): Promise<RedeemResult> {
    this.limiter.assertAllowed(meta.ipAddress);
    const now = new Date();
    const email = input.email.trim().toLowerCase();
    const code = normalizeAccessKeyCode(input.code);

    const key = code ? await this.redemptions.findByCodeHash(this.tokens.hash(code)) : null;
    if (!key) {
      await this.logFailure(meta, null, null, { reason: 'unknown_key' }, email);
      throw new DomainError('ACCESS_KEY_INVALID');
    }

    // Todavía no hay usuario: se actúa sobre la empresa dueña de la clave, con el rol que va a nacer.
    const scope: TenantScope = { companyId: key.companyId, role: 'admin_empresa' };
    const company = await this.redemptions.findCompany(scope);

    // Una empresa suspendida no puede estrenar cuenta; se responde como clave inválida para no
    // revelar el estado de la empresa a quien solo tiene la clave.
    if (!company || company.status !== 'active') {
      await this.logFailure(meta, key.companyId, null, { reason: 'company_not_active' }, email);
      throw new DomainError('ACCESS_KEY_INVALID');
    }

    const state = key.stateAt(now);
    if (state !== 'redeemable') {
      await this.logFailure(meta, key.companyId, null, { reason: `key_${state}` }, email);
      if (state === 'used') throw new DomainError('ACCESS_KEY_ALREADY_USED');
      if (state === 'expired') throw new DomainError('ACCESS_KEY_EXPIRED');
      throw new DomainError('ACCESS_KEY_INVALID');
    }

    // La clave se emitió para el correo administrativo que registró Monkey (D24): solo con ese
    // correo se crea el admin_empresa. Así una clave interceptada no sirve con otro correo.
    if (email !== company.adminEmail.toLowerCase()) {
      await this.logFailure(meta, key.companyId, null, { reason: 'email_mismatch' }, email);
      throw new DomainError('ACCESS_KEY_EMAIL_MISMATCH');
    }

    // La política de contraseña (§5.3) la impone RedeemAccessKeyDto: llega aquí ya validada.
    const outcome = await this.redemptions.redeem(
      scope,
      key.id,
      {
        email,
        passwordHash: await this.passwords.hash(input.password),
      },
      now,
      // Dos hechos auditables, un solo commit con la clave consumida y la cuenta creada (contrato de auth, SEG-36):
      // el canje y la creación del usuario.
      ({ userId }) => [
        {
          tenantId: key.companyId,
          userId,
          action: 'access_key.redeem',
          resource: 'access_key',
          result: 'success',
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          afterState: { access_key_id: key.id },
        },
        {
          tenantId: key.companyId,
          userId,
          action: 'user.create',
          resource: 'user',
          result: 'success',
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          afterState: { user_id: userId, email, role: 'admin_empresa', via: 'access_key' },
        },
      ],
    );
    if (outcome.kind === 'already_used') {
      await this.logFailure(meta, key.companyId, null, { reason: 'key_used_concurrently' }, email);
      throw new DomainError('ACCESS_KEY_ALREADY_USED');
    }
    if (outcome.kind === 'email_taken') {
      await this.logFailure(meta, key.companyId, null, { reason: 'email_taken' }, email);
      throw new DomainError('EMAIL_TAKEN');
    }

    const userScope: TenantScope = { ...scope, userId: outcome.userId };
    if (this.mfaPolicy.isRequired()) {
      const challenge = await this.challenges.open(userScope, outcome.userId, 'setup', meta, now);
      this.limiter.clear(meta.ipAddress);
      return { kind: 'mfa', challenge };
    }
    await this.users.registerSuccessfulLogin(userScope, outcome.userId, now);
    const user = await this.users.findById(userScope, outcome.userId);
    if (!user) throw new DomainError('ACCESS_KEY_INVALID');

    // La sesión no lleva rastro propio aquí: ya quedó auditado el canje que la origina.
    const issued = await this.sessionIssuer.issue(user, meta, null, now);
    this.limiter.clear(meta.ipAddress);

    return { kind: 'session', user, ...issued };
  }

  // Solo intentos FALLIDOS: no hay efecto con el que ser atómico, así que se escriben aparte (de mejor esfuerzo) y
  // cuentan para el freno por dirección. El canje correcto se audita dentro de su transacción (SEG-36).
  private logFailure(
    meta: RequestMeta,
    tenantId: string | null,
    userId: string | null,
    afterState: Record<string, unknown>,
    attemptedEmail?: string,
  ): Promise<void> {
    this.limiter.recordFailure(meta.ipAddress);
    return this.audit.write({
      tenantId,
      userId,
      attemptedEmail,
      action: 'access_key.redeem',
      resource: 'access_key',
      result: 'error',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState,
    });
  }
}
