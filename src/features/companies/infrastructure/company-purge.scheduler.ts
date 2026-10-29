import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PurgeExpiredCompaniesUseCase } from '../application/use-cases/purge-expired-companies.use-case';

// D95 · La tarea programada del borrado definitivo: cada `COMPANY_PURGE_INTERVAL_MINUTES` (60 por defecto) borra las empresas archivadas cuyo plazo venció.
// `0` la apaga (las pruebas y los scripts). El aviso previo a los admin_monkey es informativo y no condiciona el borrado (DT-83).
@Injectable()
export class CompanyPurgeScheduler implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(CompanyPurgeScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly purge: PurgeExpiredCompaniesUseCase,
    private readonly config: ConfigService,
  ) {}

  onApplicationBootstrap(): void {
    const minutes = Number(this.config.get<string>('COMPANY_PURGE_INTERVAL_MINUTES') ?? '60');
    if (!Number.isFinite(minutes) || minutes <= 0) {
      this.logger.log('Borrado definitivo de empresas apagado (COMPANY_PURGE_INTERVAL_MINUTES=0).');
      return;
    }
    this.timer = setInterval(() => void this.tick(), minutes * 60_000);
    this.timer.unref();
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.purge.execute();
    } catch (error) {
      this.logger.error(`Falló la pasada del borrado definitivo: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
