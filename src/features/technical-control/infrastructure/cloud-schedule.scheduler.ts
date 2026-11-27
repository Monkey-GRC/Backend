import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { CloudScheduleConfig } from '../application/cloud-schedule-config';
import { QueueScheduledAssessmentsUseCase } from '../application/use-cases/cloud-schedule.use-cases';

// D158 · La tarea programada de las evaluaciones de nube. El intervalo es solo cada cuánto se mira; cuándo toca evaluar lo decide la frecuencia que eligió cada cliente.
@Injectable()
export class CloudScheduleScheduler implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(CloudScheduleScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly scheduled: QueueScheduledAssessmentsUseCase,
    private readonly config: CloudScheduleConfig,
  ) {}

  onApplicationBootstrap(): void {
    const settings = this.config.get();
    if (!settings.enabled) {
      this.logger.log('Evaluación programada de nube apagada en esta instalación.');
      return;
    }
    this.logger.log(`Evaluación programada de nube encendida: revisa cada ${settings.intervalMinutes} min.`);
    this.timer = setInterval(() => void this.tick(), settings.intervalMinutes * 60_000);
    this.timer.unref();
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    // Una pasada lenta no se pisa a sí misma.
    if (this.running) return;
    this.running = true;
    try {
      const pass = await this.scheduled.execute();
      if (pass.queued > 0) this.logger.log(`Evaluaciones programadas en cola: ${pass.queued}.`);
    } catch (error) {
      this.logger.error(`Falló la pasada de evaluaciones programadas: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
