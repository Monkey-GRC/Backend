import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpireExclusionsUseCase } from '../../application/exclusions/exclusion.use-cases';
import { RollEvaluationPeriodsUseCase } from '../../application/periods/evaluation-period.use-cases';

// D145, D148 · La tarea diaria de los períodos auditados: cada `EVALUATION_PERIOD_INTERVAL_MINUTES` (1440 = diaria, por defecto) cierra los períodos terminados, abre el siguiente, deja
// el evento de estado de los controles que cambiaron al cerrar una ventana y registra el vencimiento de las excepciones (D135). `0` la apaga (las pruebas y los scripts).
@Injectable()
export class EvaluationPeriodScheduler implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(EvaluationPeriodScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private first: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly roll: RollEvaluationPeriodsUseCase,
    private readonly expireExclusions: ExpireExclusionsUseCase,
    private readonly config: ConfigService,
  ) {}

  onApplicationBootstrap(): void {
    const minutes = Number(this.config.get<string>('EVALUATION_PERIOD_INTERVAL_MINUTES') ?? '1440');
    if (!Number.isFinite(minutes) || minutes <= 0) {
      this.logger.log('Tarea diaria de períodos auditados apagada (EVALUATION_PERIOD_INTERVAL_MINUTES=0).');
      return;
    }
    this.timer = setInterval(() => void this.tick(), minutes * 60_000);
    this.timer.unref();
    // Un reinicio no debe aplazar la pasada un día entero: la primera sale al minuto de arrancar (es idempotente).
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
      await this.roll.execute();
    } catch (error) {
      this.logger.error(`Falló la pasada de períodos auditados: ${(error as Error).message}`);
    }
    try {
      // D135 · El vencimiento de las excepciones va en la misma pasada, aislado: si una falla no frena a la otra.
      await this.expireExclusions.execute();
    } catch (error) {
      this.logger.error(`Falló el vencimiento de excepciones: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
