import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../common/http/request-meta';
import { FileStorage } from '../../../../common/storage/file-storage';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { StepUp } from '../../../auth/application/services/step-up.service';
import { CompanyDetail } from '../../domain/entities/company-overview';
import { CompanyRepository } from '../../domain/repositories/company.repository';

// D95 · Reactivar una empresa archivada, solo dentro del plazo. El plazo deja de existir: si se vuelve a archivar, se elige uno nuevo.
@Injectable()
export class ReactivateCompanyUseCase {
  constructor(
    private readonly companies: CompanyRepository,
    private readonly stepUp: StepUp,
    private readonly storage: FileStorage,
  ) {}

  async execute(principal: Principal, companyId: string, input: { reason: string; totpCode?: string }, meta: RequestMeta): Promise<CompanyDetail> {
    const scope: TenantScope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const detail = await this.companies.findById(scope, companyId, principal.companyId);
    if (!detail) throw new DomainError('NOT_FOUND');
    const { company } = detail;
    if (company.status !== 'deactivated' || !company.archive) throw new DomainError('COMPANY_NOT_DEACTIVATED');
    const now = new Date();
    if (company.archive.archiveUntil <= now) throw new DomainError('COMPANY_ARCHIVE_EXPIRED');

    await this.stepUp.assert(scope, principal.userId, input.totpCode, meta);

    const snapshotKey = await this.companies.reactivate(scope, companyId, () => ({
      tenantId: null,
      userId: principal.userId,
      action: 'company.reactivate',
      resource: 'company',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      beforeState: { status: 'deactivated', archive_until: company.archive!.archiveUntil.toISOString() },
      afterState: { company_id: companyId, name: company.name, status: 'active' },
    }));
    // La copia ya no hace falta (los datos nunca se movieron). De mejor esfuerzo: si falla, se borra con la empresa algún día.
    if (snapshotKey) await this.storage.remove(snapshotKey);

    return (await this.companies.findById(scope, companyId, principal.companyId))!;
  }
}
