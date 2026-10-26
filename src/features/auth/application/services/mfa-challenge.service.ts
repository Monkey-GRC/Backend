import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { MFA_CHALLENGE_MINUTES, MfaChallenge, MfaChallengePurpose } from '../../domain/entities/mfa-challenge.entity';
import { MfaRepository } from '../../domain/repositories/mfa.repository';

export type OpenedChallenge = { token: string; purpose: MfaChallengePurpose; expiresAt: Date };

// Abre y resuelve los desafíos del segundo factor. El token solo existe en una cookie httpOnly; en la base queda su huella.
@Injectable()
export class MfaChallengeService {
  constructor(
    private readonly mfa: MfaRepository,
    private readonly tokens: TokenHasher,
  ) {}

  async open(scope: TenantScope, userId: string, purpose: MfaChallengePurpose, meta: RequestMeta, now = new Date()): Promise<OpenedChallenge> {
    const token = this.tokens.generate();
    const expiresAt = new Date(now.getTime() + MFA_CHALLENGE_MINUTES * 60_000);
    await this.mfa.createChallenge(scope, { userId, tokenHash: this.tokens.hash(token), purpose, ipAddress: meta.ipAddress, expiresAt });
    return { token, purpose, expiresAt };
  }

  // Un token que no existe, que venció, que ya se usó o que agotó sus intentos responde igual: no se dice cuál (no es información que le sirva a nadie).
  async resolve(token: string | undefined, purpose: MfaChallengePurpose, now = new Date()): Promise<{ scope: TenantScope; challenge: MfaChallenge }> {
    const found = token ? await this.mfa.findChallengeByTokenHash(this.tokens.hash(token)) : null;
    if (!found || found.challenge.purpose !== purpose || !found.challenge.isUsable(now)) throw new DomainError('MFA_CHALLENGE_INVALID');
    return found;
  }
}