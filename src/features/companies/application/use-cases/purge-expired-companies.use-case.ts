import { Injectable, Logger } from '@nestjs/common';
import { FileStorage } from '../../../../common/storage/file-storage';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { CompanyRepository } from '../../domain/repositories/company.repository';

// Quien ejecuta el borrado es el sistema, no una persona. Se usa el rol que ya tiene permiso sobre las empresas; la base valida de todos modos que la empresa
// esté archivada y con el plazo vencido (`platform.purge_company`).
const SYSTEM_SCOPE: TenantScope = { companyId: '', role: 'admin_monkey' };

// `skipped`: otra réplica ya la está borrando, o ya la borró.
export type PurgeSummary = { purged: string[]; skipped: string[]; failed: Array<{ id: string; error: string }> };

// D97 · Borrado definitivo de las empresas archivadas cuyo plazo venció: primero sus archivos, después todo lo de la base, con el candado de esa empresa tomado
// (varias réplicas pueden correr la tarea a la vez; cada empresa la borra una sola). Si algo falla, esa empresa queda archivada y se
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
    const summary: PurgeSummary = { purged: [], skipped: [], failed: [] };
    for (const company of due) {
      try {
        const name = await this.companies.purge(
          SYSTEM_SCOPE,
          company.id,
          () => this.storage.removePrefix(`${company.id}/`),
          ({ name }) => ({
            tenantId: null,
            userId: null,
            action: 'company.purge',
            resource: 'company',
            result: 'success',
            ipAddress: '',
            userAgent: 'system',
            // Solo el rastro mínimo: el nombre y cuándo. Sin `company_id` para que la propia purga no lo borre.
            afterState: { company_name: name, purged_at: now.toISOString(), purged_by: 'system' },
          }),
        );
        if (name === null) {
          summary.skipped.push(company.id);
          continue;
        }
        summary.purged.push(company.id);
        this.logger.log(`Empresa ${company.id} borrada definitivamente (D97).`);
      } catch (error) {
        const message = (error as Error).message;
        summary.failed.push({ id: company.id, error: message });
        this.logger.error(`No se pudo borrar la empresa ${company.id}: ${message}`);
      }
    }
    return summary;
  }
}
