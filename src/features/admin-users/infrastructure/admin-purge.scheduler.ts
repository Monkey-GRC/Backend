import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PurgeExpiredAdminsUseCase } from '../application/use-cases/purge-expired-admins.use-case';

// D117 · La tarea programada de la purga de administradores: cada `ADMIN_PURGE_INTERVAL_MINUTES` (1440 = diaria, por defecto) borra las cuentas desactivadas con el plazo vencido.
// `0` la apaga (las pruebas y los scripts).
@Injectable()
export class AdminPurgeScheduler implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AdminPurgeScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private first: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly purge: PurgeExpiredAdminsUseCase,
    private readonly config: ConfigService,
  ) {}

  onApplicationBootstrap(): void {
    const minutes = Number(this.config.get<string>('ADMIN_PURGE_INTERVAL_MINUTES') ?? '1440');
    if (!Number.isFinite(minutes) || minutes <= 0) {
      this.logger.log('Purga de administradores apagada (ADMIN_PURGE_INTERVAL_MINUTES=0).');
      return;
    }
    this.timer = setInterval(() => void this.tick(), minutes * 60_000);
    this.timer.unref();
    // Un reinicio no debe aplazar la purga indefinidamente: la primera pasada sale al minuto de arrancar.
    this.first = setTimeout(() => void this.tick(), 60_000);
    this.first.unref();
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
    if (this.first) clearTimeout(this.first);
  }

  private async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.purge.execute();
    } catch (error) {
      this.logger.error(`Falló la pasada de la purga de administradores: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
