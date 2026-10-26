import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { MfaRepository } from '../../domain/repositories/mfa.repository';
import { buildOtpauthUri, generateTotpSecret } from '../../domain/totp';
import { MfaChallengeService } from '../services/mfa-challenge.service';

export const MFA_ISSUER = 'Monkey';

export type MfaSetupStart = { secret: string; otpauthUri: string; issuer: string; account: string };

// D94 · Primer ingreso: la persona pide el QR. El secreto nuevo se guarda cifrado en el desafío (no en el usuario) hasta que lo confirme con un código; si recarga
// la página recibe el mismo, para que el QR que ya escaneó siga sirviendo.
@Injectable()
export class StartMfaSetupUseCase {
  constructor(
    private readonly challenges: MfaChallengeService,
    private readonly users: AuthUserRepository,
    private readonly mfa: MfaRepository,
    private readonly cipher: CredentialCipher,
  ) {}

  async execute(challengeToken: string | undefined): Promise<MfaSetupStart> {
    const { scope, challenge } = await this.challenges.resolve(challengeToken, 'setup');
    const user = await this.users.findById(scope, challenge.userId);
    if (!user) throw new DomainError('MFA_CHALLENGE_INVALID');

    let secret: string;
    if (challenge.pendingSecretEncrypted) {
      secret = String(this.cipher.decrypt(challenge.pendingSecretEncrypted)['secret']);
    } else {
      secret = generateTotpSecret();
      await this.mfa.setPendingSecret(scope, challenge.id, this.cipher.encrypt({ secret }));
    }
    return { secret, otpauthUri: buildOtpauthUri({ issuer: MFA_ISSUER, account: user.email, secret }), issuer: MFA_ISSUER, account: user.email };
  }
}