import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { CompanyDetail } from '../../domain/entities/company-overview';
import { CompanyRepository } from '../../domain/repositories/company.repository';

// D103 · Cambiar el cupo de usuarios de una empresa, en cualquier momento. No puede quedar por debajo de las cuentas que ya cuentan (SEG-72):
// la comparación se hace en la transacción que escribe, con la empresa bloqueada, para que un alta simultánea no la esquive.
@Injectable()
export class UpdateMaxUsersUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(principal: Principal, companyId: string, maxUsers: number, meta: RequestMeta): Promise<CompanyDetail> {
    const scope: TenantScope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    await this.companies.updateMaxUsers(scope, companyId, principal.companyId, maxUsers, ({ before, after }) => ({
      tenantId: null,
      userId: principal.userId,
      action: 'company.max_users_update',
      resource: 'company',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: { company_id: companyId, max_users: before },
      afterState: { company_id: companyId, max_users: after },
    }));
    const detail = await this.companies.findById(scope, companyId, principal.companyId);
    if (!detail) throw new DomainError('NOT_FOUND');
    return detail;
  }
}
