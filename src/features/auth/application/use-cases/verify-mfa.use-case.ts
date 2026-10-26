import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { normalizeRecoveryCode } from '../../domain/recovery-codes';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { MfaRepository } from '../../domain/repositories/mfa.repository';
import { verifyTotp } from '../../domain/totp';
import { MfaAttempts } from '../services/mfa-attempts.service';
import { MfaChallengeService } from '../services/mfa-challenge.service';
import { IssuedSession, SessionIssuer } from '../services/session-issuer.service';

export type VerifyMfaInput = { challengeToken: string | undefined; code?: string; recoveryCode?: string };
export type VerifyMfaResult = IssuedSession & { user: AuthUser; method: 'totp' | 'recovery'; recoveryCodesLeft: number | null };

// D94 · Segundo paso del ingreso de quien ya tiene el segundo factor: con el código de su app (o uno de recuperación) se abre la sesión.
@Injectable()
export class VerifyMfaUseCase {
  constructor(
    private readonly challenges: MfaChallengeService,
    private readonly users: AuthUserRepository,
    private readonly mfa: MfaRepository,
    private readonly attempts: MfaAttempts,
    private readonly cipher: CredentialCipher,
    private readonly tokens: TokenHasher,
    private readonly sessionIssuer: SessionIssuer,
  ) {}

  async execute(input: VerifyMfaInput, meta: RequestMeta): Promise<VerifyMfaResult> {
    const now = new Date();
    const { scope, challenge } = await this.challenges.resolve(input.challengeToken, 'verify', now);
    const credentials = await this.users.findCredentialsById(scope, challenge.userId);
    if (!credentials || !credentials.isMfaEnabled || !credentials.mfaSecretEncrypted) throw new DomainError('MFA_CHALLENGE_INVALID');
    if (credentials.status !== 'active') throw new DomainError('ACCOUNT_INACTIVE');
    this.attempts.assertNotLocked(credentials, now);

    let method: 'totp' | 'recovery';
    let recoveryCodesLeft: number | null = null;
    if (input.recoveryCode) {
      method = 'recovery';
      const normalized = normalizeRecoveryCode(input.recoveryCode);
      const spent = normalized ? await this.mfa.useRecoveryCode(scope, credentials.id, this.tokens.hash(normalized), now) : { used: false, remaining: 0 };
      if (!spent.used) return this.attempts.fail(scope, credentials, challenge.id, meta, now, 'wrong_recovery_code');
      recoveryCodesLeft = spent.remaining;
    } else {
      method = 'totp';
      const secret = String(this.cipher.decrypt(credentials.mfaSecretEncrypted)['secret']);
      const check = input.code ? verifyTotp(secret, input.code, now, credentials.mfaLastUsedStep) : ({ ok: false } as const);
      // El paso se gasta con una escritura condicional: de dos peticiones con el mismo código, una sola pasa.
      if (!check.ok || !(await this.mfa.recordTotpUse(scope, credentials.id, check.step))) {
        return this.attempts.fail(scope, credentials, challenge.id, meta, now, 'wrong_code');
      }
    }

    await this.mfa.consumeChallenge(scope, challenge.id, now);
    await this.users.registerSuccessfulLogin(scope, credentials.id, now);
    const user = await this.users.findById(scope, credentials.id);
    if (!user) throw new DomainError('INVALID_CREDENTIALS');

    // La sesión y su rastro `auth.login` se confirman en la misma transacción (SEG-36); el rastro dice con qué segundo factor entró.
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
        afterState: { session_id: session.id, mfa: method },
      }),
      now,
    );
    return { user, ...issued, method, recoveryCodesLeft };
  }
}