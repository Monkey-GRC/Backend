import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PASSWORD_CHANGES_PER_DAY, PASSWORD_HISTORY_SIZE } from '../../domain/password-rules';
import { PasswordHasher } from '../../domain/ports/password-hasher';
import { PasswordRepository } from '../../domain/repositories/password.repository';

const DAY_MS = 24 * 60 * 60 * 1000;

// D101 · Lo que se exige a una contraseña nueva además de la política de SEG-13 (que se valida en el borde con el DTO): no ser la actual ni una de las 5 anteriores,
// y que no se rote sin límite. Lo comparten el cambio voluntario y la recuperación.
@Injectable()
export class PasswordRules {
  constructor(
    private readonly passwords: PasswordRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async assertWithinDailyLimit(scope: TenantScope, userId: string, now: Date): Promise<void> {
    const changes = await this.passwords.countChangesSince(scope, userId, new Date(now.getTime() - DAY_MS));
    if (changes >= PASSWORD_CHANGES_PER_DAY) throw new DomainError('PASSWORD_CHANGE_LIMIT');
  }

  async assertNotReused(scope: TenantScope, userId: string, currentHash: string, candidate: string): Promise<void> {
    const previous = await this.passwords.recentHashes(scope, userId, PASSWORD_HISTORY_SIZE);
    for (const hash of [currentHash, ...previous]) {
      if (await this.hasher.compare(candidate, hash)) throw new DomainError('PASSWORD_REUSED');
    }
  }
}
