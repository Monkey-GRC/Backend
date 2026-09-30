import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { OrganizationalContext } from '../../domain/entities/organizational-context.entity';
import { OrganizationalContextRepository } from '../../domain/repositories/organizational-context.repository';

@Injectable()
export class GetOrganizationalContextUseCase {
  constructor(private readonly contexts: OrganizationalContextRepository) {}

  // Siempre sobre la empresa de la sesión: el cliente no elige de quién es (RLS lo garantiza).
  execute(principal: Principal): Promise<OrganizationalContext> {
    return this.contexts.find({
      companyId: principal.companyId,
      userId: principal.userId,
      role: principal.role,
    });
  }
}
