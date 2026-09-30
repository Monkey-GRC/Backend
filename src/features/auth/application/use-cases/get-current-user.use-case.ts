import { Injectable } from '@nestjs/common';
import { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private readonly users: AuthUserRepository) {}

  async execute(principal: Principal): Promise<AuthUser> {
    const user = await this.users.findById(
      { companyId: principal.companyId, userId: principal.userId, role: principal.role },
      principal.userId,
    );
    if (!user) throw new DomainError('UNAUTHENTICATED');
    return user;
  }
}
