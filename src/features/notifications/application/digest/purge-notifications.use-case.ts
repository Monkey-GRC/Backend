import { Injectable, Logger } from '@nestjs/common';
import { NotificationMaintenanceRepository } from '../../domain/notification.repository';

// D151 · La retención: una pasada diaria borra los avisos de más de 90 días (la API ya no los devuelve aunque esta pasada no haya corrido). Cada empresa en su transacción.
@Injectable()
export class PurgeExpiredNotificationsUseCase {
  private readonly logger = new Logger(PurgeExpiredNotificationsUseCase.name);

  constructor(private readonly maintenance: NotificationMaintenanceRepository) {}

  async execute(): Promise<{ companies: number; deleted: number; failed: number }> {
    const result = { companies: 0, deleted: 0, failed: 0 };
    for (const companyId of await this.maintenance.listCompanyIds()) {
      try {
        result.deleted += await this.maintenance.purgeExpired(companyId);
        result.companies++;
      } catch (error) {
        result.failed++;
        this.logger.error(`Falló el borrado de avisos viejos de la empresa ${companyId}: ${(error as Error).message}`);
      }
    }
    return result;
  }
}
