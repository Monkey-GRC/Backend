import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { CredentialCipher } from '../../../../../common/security/credential-cipher';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { AuthUser } from '../../../domain/entities/auth-user.entity';
import { generateRecoveryCodes, normalizeRecoveryCode } from '../../../domain/recovery-codes';
import { AuthUserRepository } from '../../../domain/repositories/auth-user.repository';
import { MfaRepository } from '../../../domain/repositories/mfa.repository';
import { verifyTotp } from '../../../domain/totp';
import { MfaAttempts } from '../../services/mfa-attempts.service';
import { MfaChallengeService } from '../../services/mfa-challenge.service';
import { IssuedSession, SessionIssuer } from '../../services/session-issuer.service';
import { TrustedDevices } from '../../services/trusted-devices.service';

export type ConfirmMfaSetupResult = IssuedSession & { user: AuthUser; recoveryCodes: string[]; deviceToken: string | null };

// D94 · La persona escribe el primer código de su app: se activa el segundo factor, se le entregan los 10 códigos de recuperación (la única vez que se ven) y entra.
@Injectable()
export class ConfirmMfaSetupUseCase {
  constructor(
    private readonly challenges: MfaChallengeService,
    private readonly users: AuthUserRepository,
    private readonly mfa: MfaRepository,
    private readonly attempts: MfaAttempts,
    private readonly cipher: CredentialCipher,
    private readonly tokens: TokenHasher,
    private readonly sessionIssuer: SessionIssuer,
    private readonly trustedDevices: TrustedDevices,
  ) {}

  async execute(input: { challengeToken: string | undefined; code: string; rememberDevice?: boolean }, meta: RequestMeta): Promise<ConfirmMfaSetupResult> {
    const now = new Date();
    const { scope, challenge } = await this.challenges.resolve(input.challengeToken, 'setup', now);
    // Sin haber pedido el QR no hay nada que confirmar.
    if (!challenge.pendingSecretEncrypted) throw new DomainError('MFA_SETUP_NOT_STARTED');
    const credentials = await this.users.findCredentialsById(scope, challenge.userId);
    if (!credentials) throw new DomainError('MFA_CHALLENGE_INVALID');
    if (credentials.status !== 'active') throw new DomainError('ACCOUNT_INACTIVE');
    // D123 · Antes de mirar el código: no lo gasta ni suma un intento.
    if (input.rememberDevice && credentials.role === 'admin_monkey') throw new DomainError('REMEMBER_DEVICE_NOT_ALLOWED');
    this.attempts.assertNotLocked(credentials, now);

    const secret = String(this.cipher.decrypt(challenge.pendingSecretEncrypted)['secret']);
    const check = verifyTotp(secret, input.code, now, null);
    if (!check.ok) return this.attempts.fail(scope, credentials, challenge.id, meta, now, 'wrong_code');

    const recoveryCodes = generateRecoveryCodes();
    await this.mfa.activate(
      scope,
      credentials.id,
      {
        challengeId: challenge.id,
        secretEncrypted: challenge.pendingSecretEncrypted,
        step: check.step,
        recoveryCodeHashes: recoveryCodes.map((code) => this.tokens.hash(normalizeRecoveryCode(code) as string)),
        at: now,
      },
      () => ({
        tenantId: credentials.companyId,
        userId: credentials.id,
        action: 'auth.mfa_enabled',
        resource: 'user',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: { user_id: credentials.id, recovery_codes: recoveryCodes.length },
      }),
    );

    await this.users.registerSuccessfulLogin(scope, credentials.id, now);
    const user = await this.users.findById(scope, credentials.id);
    if (!user) throw new DomainError('INVALID_CREDENTIALS');
    const trusted = input.rememberDevice ? await this.trustedDevices.trust(user, meta, now) : null;
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
        afterState: { session_id: session.id, mfa: 'setup' },
      }),
      now,
      trusted?.effect,
    );
    return { user, ...issued, recoveryCodes, deviceToken: trusted?.token ?? null };
  }
}