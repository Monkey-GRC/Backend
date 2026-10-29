import { Injectable, Logger } from '@nestjs/common';
import { FileStorage } from '../../../../common/storage/file-storage';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { CompanyRepository } from '../../domain/repositories/company.repository';

// Quien ejecuta el borrado es el sistema, no una persona. Se usa el rol que ya tiene permiso sobre las empresas; la base valida de todos modos que la empresa
// esté archivada y con el plazo vencido (`platform.purge_company`).
const SYSTEM_SCOPE: TenantScope = { companyId: '', role: 'admin_monkey' };

export type PurgeSummary = { purged: string[]; failed: Array<{ id: string; error: string }> };

// D95 · Borrado definitivo de las empresas archivadas cuyo plazo venció: primero sus archivos, después todo lo de la base. Si algo falla, esa empresa queda archivada y se
// reintenta en la siguiente pasada: nunca queda a medias en la base (es una sola transacción).
@Injectable()
export class PurgeExpiredCompaniesUseCase {
  private readonly logger = new Logger(PurgeExpiredCompaniesUseCase.name);

  constructor(
    private readonly companies: CompanyRepository,
    private readonly storage: FileStorage,
  ) {}

  async execute(now = new Date()): Promise<PurgeSummary> {
    const due = await this.companies.listArchived(SYSTEM_SCOPE, now);
    const summary: PurgeSummary = { purged: [], failed: [] };
    for (const company of due) {
      try {
        await this.storage.removePrefix(`${company.id}/`);
        await this.companies.purge(SYSTEM_SCOPE, company.id, ({ name }) => ({
          tenantId: null,
          userId: null,
          action: 'company.purge',
          resource: 'company',
          result: 'success',
          ipAddress: '',
          userAgent: 'system',
          // Solo el rastro mínimo: el nombre y cuándo. Sin `company_id` para que la propia purga no lo borre.
          afterState: { company_name: name, purged_at: now.toISOString(), purged_by: 'system' },
        }));
        summary.purged.push(company.id);
        this.logger.log(`Empresa ${company.id} borrada definitivamente (D95).`);
      } catch (error) {
        const message = (error as Error).message;
        summary.failed.push({ id: company.id, error: message });
        this.logger.error(`No se pudo borrar la empresa ${company.id}: ${message}`);
      }
    }
    return summary;
  }
}
