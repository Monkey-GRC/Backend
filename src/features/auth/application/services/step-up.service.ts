import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { MfaRepository } from '../../domain/repositories/mfa.repository';
import { verifyTotp } from '../../domain/totp';
import { MfaAttempts } from './mfa-attempts.service';
import { MfaPolicy } from './mfa-policy.service';

// Pide un código vigente de la app de la PROPIA persona antes de una acción grave (D97: archivar y reactivar una empresa). Es el mismo código y las mismas
// reglas del ingreso (D94): un paso ya usado no sirve otra vez y un código equivocado suma al bloqueo de la cuenta.
@Injectable()
export class StepUp {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly mfa: MfaRepository,
    private readonly attempts: MfaAttempts,
    private readonly cipher: CredentialCipher,
    private readonly policy: MfaPolicy,
  ) {}

  async assert(scope: TenantScope, userId: string, code: string | undefined, meta: RequestMeta): Promise<void> {
    const now = new Date();
    const credentials = await this.users.findCredentialsById(scope, userId);
    if (!credentials) throw new DomainError('UNAUTHENTICATED');
    if (!credentials.isMfaEnabled || !credentials.mfaSecretEncrypted) {
      // Sin segundo factor solo se llega con MFA_REQUIRED=false (desarrollo): en producción todo admin_monkey lo tiene.
      if (this.policy.isRequired()) throw new DomainError('MFA_NOT_ENABLED');
      return;
    }
    this.attempts.assertNotLocked(credentials, now);
    const secret = String(this.cipher.decrypt(credentials.mfaSecretEncrypted)['secret']);
    const check = code ? verifyTotp(secret, code, now, credentials.mfaLastUsedStep) : ({ ok: false } as const);
    if (!check.ok || !(await this.mfa.recordTotpUse(scope, credentials.id, check.step))) {
      await this.attempts.fail(scope, credentials, null, meta, now, 'wrong_code');
    }
  }
}
