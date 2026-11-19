import { Injectable } from '@nestjs/common';
import { Principal } from '../../../../../common/auth/principal';
import { DomainError } from '../../../../../common/errors/domain-error';
import { AuthUser } from '../../../domain/entities/auth-user.entity';
import { CurrentUserReader } from '../../../domain/ports/current-user.reader';
import { OnboardingProgress, progressFromFlags } from './get-onboarding-progress.use-case';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private readonly reader: CurrentUserReader) {}

  // Perfil y onboarding (solo admin_empresa) en una sola transacción.
  async execute(principal: Principal): Promise<{ user: AuthUser; onboarding: OnboardingProgress | null }> {
    const found = await this.reader.read(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      principal.userId,
      principal.role === 'admin_empresa',
    );
    if (!found) throw new DomainError('UNAUTHENTICATED');
    return { user: found.user, onboarding: found.onboarding ? progressFromFlags(found.onboarding) : null };
  }
}
