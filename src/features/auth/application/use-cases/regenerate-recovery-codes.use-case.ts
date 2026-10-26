import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { generateRecoveryCodes, normalizeRecoveryCode } from '../../domain/recovery-codes';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { MfaRepository } from '../../domain/repositories/mfa.repository';
import { verifyTotp } from '../../domain/totp';
import { MfaAttempts } from '../services/mfa-attempts.service';

// D94 · «Seguridad de la cuenta»: la persona pide códigos de recuperación nuevos (los anteriores dejan de servir). Para eso demuestra que tiene el celular con un código
// vigente: una sesión robada no basta para quedarse con la salida de emergencia.
@Injectable()
export class RegenerateRecoveryCodesUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly mfa: MfaRepository,
    private readonly attempts: MfaAttempts,
    private readonly cipher: CredentialCipher,
    private readonly tokens: TokenHasher,
  ) {}

  async execute(principal: Principal, code: string, meta: RequestMeta): Promise<string[]> {
    const now = new Date();
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const credentials = await this.users.findCredentialsById(scope, principal.userId);
    if (!credentials?.isMfaEnabled || !credentials.mfaSecretEncrypted) throw new DomainError('MFA_NOT_ENABLED');
    this.attempts.assertNotLocked(credentials, now);

    const secret = String(this.cipher.decrypt(credentials.mfaSecretEncrypted)['secret']);
    const check = verifyTotp(secret, code, now, credentials.mfaLastUsedStep);
    if (!check.ok || !(await this.mfa.recordTotpUse(scope, credentials.id, check.step))) {
      return this.attempts.fail(scope, credentials, null, meta, now, 'wrong_code');
    }

    const codes = generateRecoveryCodes();
    await this.mfa.replaceRecoveryCodes(
      scope,
      credentials.id,
      codes.map((c) => this.tokens.hash(normalizeRecoveryCode(c) as string)),
      () => ({
        tenantId: credentials.companyId,
        userId: credentials.id,
        action: 'auth.mfa_recovery_regenerated',
        resource: 'user',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: { user_id: credentials.id, recovery_codes: codes.length },
      }),
    );
    return codes;
  }
}