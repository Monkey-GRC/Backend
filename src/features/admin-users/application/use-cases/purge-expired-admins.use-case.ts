import { Injectable, Logger } from '@nestjs/common';
import { AdminAccountRepository } from '../../domain/repositories/admin-account.repository';

export type AdminPurgeSummary = { purged: string[]; skipped: string[]; failed: Array<{ id: string; error: string }> };

// D117 · Borra las cuentas de admin_monkey desactivadas cuyo plazo (7 días) venció: sello, filas propias y cuenta en UNA transacción por persona, con `admin.purge` hecho por el sistema
// (sin user_id). Idempotente: una cuenta ya purgada o reactivada entre medias se salta. Si una falla, esa queda intacta (sin borrar y con su sello deshecho) y se reintenta en la siguiente pasada.
@Injectable()
export class PurgeExpiredAdminsUseCase {
  private readonly logger = new Logger(PurgeExpiredAdminsUseCase.name);

  constructor(private readonly repo: AdminAccountRepository) {}

  async execute(now = new Date()): Promise<AdminPurgeSummary> {
    const summary: AdminPurgeSummary = { purged: [], skipped: [], failed: [] };
    for (const due of await this.repo.listDueForPurge(now)) {
      try {
        const done = await this.repo.purge(due.companyId, due.id, now, ({ id, role }) => ({
          tenantId: due.companyId,
          userId: null,
          action: 'admin.purge',
          resource: 'user',
          result: 'success',
          ipAddress: '',
          userAgent: 'system',
          // El nombre no va aquí: lo guarda el sello. El id es el mismo que tuvo la cuenta.
          afterState: { admin_id: id, role, purged_at: now.toISOString(), purged_by: 'system' },
        }));
        (done ? summary.purged : summary.skipped).push(due.id);
        if (done) this.logger.log(`Cuenta de administrador ${due.id} borrada definitivamente (D117).`);
      } catch (error) {
        const message = (error as Error).message;
        summary.failed.push({ id: due.id, error: message });
        this.logger.error(`No se pudo purgar la cuenta de administrador ${due.id}: ${message}`);
      }
    }
    return summary;
  }
}
