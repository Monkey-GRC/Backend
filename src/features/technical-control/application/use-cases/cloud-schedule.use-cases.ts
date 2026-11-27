import { Injectable, Logger } from '@nestjs/common';
import { ScanRepository } from '../../domain/repositories/scan.repository';

// Cuántas evaluaciones programadas pueden estar esperando a la vez: un atraso se atiende poco a poco y quien pulsa «Evaluar ahora» no queda detrás de una fila larga.
export const MAX_SCHEDULED_WAITING = 2;
// Una evaluación que falló se reintenta una vez pasado este tiempo.
export const RETRY_AFTER_SECONDS = 3600;

export type SchedulePass = { due: number; queued: number };

// D158 · Una pasada: deja en cola las evaluaciones de nube que vencieron. No evalúa ni espera al trabajador. Es segura de repetir y de correr en dos instancias a la vez: un activo no
// puede tener dos ejecuciones abiertas (índice único).
@Injectable()
export class QueueScheduledAssessmentsUseCase {
  private readonly logger = new Logger(QueueScheduledAssessmentsUseCase.name);

  constructor(private readonly repo: ScanRepository) {}

  async execute(): Promise<SchedulePass> {
    const due = await this.repo.listDueCloudAssessments({ maxWaiting: MAX_SCHEDULED_WAITING, retrySeconds: RETRY_AFTER_SECONDS });
    let queued = 0;
    for (const d of due) {
      try {
        if (await this.repo.queueScheduledAssessment({ companyId: d.tenantId }, d.assetId)) queued += 1;
      } catch (error) {
        // Una conexión que falla no detiene a las demás. Se registra el identificador, nunca datos del cliente.
        this.logger.error(`No se pudo programar la evaluación del activo ${d.assetId}: ${(error as Error).message}`);
      }
    }
    return { due: due.length, queued };
  }
}
