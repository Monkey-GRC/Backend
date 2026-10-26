import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { AuthUserRepository } from '../../domain/repositories/auth-user.repository';
import { MfaRepository } from '../../domain/repositories/mfa.repository';

// D94 · La persona perdió el celular y los códigos de recuperación. El administrador de la empresa le quita el segundo factor a un integrante de su equipo
// (funcional, consultor o auditor de su empresa); en su próximo ingreso lo configura de nuevo. Se cierran todas sus sesiones y queda el rastro. Nadie se lo quita
// a sí mismo por aquí (para eso están los códigos de recuperación), ni a otro administrador: el administrador de la empresa lo restablece Monkey (`npm run mfa:reset`).
const RESETTABLE_ROLES = new Set(['funcional', 'consultor', 'auditor']);

@Injectable()
export class ResetMfaUseCase {
  constructor(
    private readonly users: AuthUserRepository,
    private readonly mfa: MfaRepository,
  ) {}

  async execute(principal: Principal, targetUserId: string, meta: RequestMeta): Promise<{ sessionsClosed: number }> {
    if (targetUserId === principal.userId) throw new DomainError('FORBIDDEN');
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    // Con RLS, un usuario de otra empresa simplemente no existe: 404, no 403 (no se revela que existe).
    const target = await this.users.findCredentialsById(scope, targetUserId);
    if (!target) throw new DomainError('NOT_FOUND');
    if (!RESETTABLE_ROLES.has(target.role)) throw new DomainError('FORBIDDEN');

    const closed = await this.mfa.reset(scope, targetUserId, new Date(), ({ userId, sessionsClosed }) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'auth.mfa_reset',
      resource: 'user',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { user_id: userId, sessions_closed: sessionsClosed },
    }));
    if (closed === null) throw new DomainError('NOT_FOUND');
    return { sessionsClosed: closed };
  }
}