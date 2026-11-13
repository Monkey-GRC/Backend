import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { AgentReadingConfig } from '../application/agent-reading-config';
import { QueueAgentReadingsUseCase } from '../application/use-cases/agent-reading.use-cases';

// D113 · La tarea programada de la lectura de la sonda: cada minuto revisa qué servidores con agente necesitan una lectura (los que aún no se conectan, los desconectados y los
// conectados que ya toca releer) y las deja en cola. Los intervalos reales (3 minutos, 24 horas…) los decide `reading-plan.ts` con `AgentReadingConfig`; el minuto de esta tarea solo es
// la resolución con la que se evalúan. `AGENT_WATCH_INTERVAL_MINUTES=0` la apaga (las pruebas y los scripts).
const TICK_MS = 60_000;

@Injectable()
export class AgentReadingScheduler implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AgentReadingScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly readings: QueueAgentReadingsUseCase,
    private readonly config: AgentReadingConfig,
  ) {}

  onApplicationBootstrap(): void {
    if (!this.config.get().enabled) {
      this.logger.log('Lectura automática de servidores apagada (AGENT_WATCH_INTERVAL_MINUTES=0).');
      return;
    }
    this.timer = setInterval(() => void this.tick(), TICK_MS);
    this.timer.unref();
  }

  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    // Una pasada que tarda más de un minuto no se pisa a sí misma.
    if (this.running) return;
    this.running = true;
    try {
      const pass = await this.readings.execute();
      if (pass.queued > 0) this.logger.log(`Lecturas en cola: ${pass.queued} (de ${pass.due} que tocaban, ${pass.considered} revisados).`);
    } catch (error) {
      this.logger.error(`Falló la pasada de lectura de servidores: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
