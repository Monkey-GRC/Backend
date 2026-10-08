import { CredentialBroker, RunnerApi, RunnerLogger, ScanEngine } from '../domain/ports';
import { FAILURE, RunnerApiError, RunnerFailure, RunnerJob } from '../domain/runner.types';

export type StepResult = 'idle' | 'completed' | 'failed';

// Un paso del trabajador: reclama UNA ejecución, la corre y entrega el resultado (o informa por qué no pudo).
// Es el único lugar con lógica; los puertos (API, credenciales, motor) se sustituyen en las pruebas y, mañana, en la nube.
export class RunNextExecution {
  constructor(
    private readonly api: RunnerApi,
    private readonly broker: CredentialBroker,
    private readonly engine: ScanEngine,
    private readonly log: RunnerLogger,
  ) {}

  async execute(): Promise<StepResult> {
    const job = await this.api.claim();
    if (!job) return 'idle';
    this.log.info(`Ejecución ${job.executionId}: reclamada (${job.regions.length} región(es)).`);

    let reason: string | null = null;
    try {
      const credentials = await this.broker.obtain(job);
      const run = await this.engine.run({ executionId: job.executionId, regions: job.regions, credentials });
      try {
        await this.api.submitResults(job, run, job.regions);
        this.log.info(`Ejecución ${job.executionId}: entregada (${run.findings.length} filas).`);
        return 'completed';
      } catch (e) {
        if (!(e instanceof RunnerApiError)) throw e;
        // 422: el backend no entendió la salida del motor. 409: la ejecución ya no está en curso (se barrió por timeout): nada que cerrar.
        if (e.status === 409) {
          this.log.error(`Ejecución ${job.executionId}: ya no estaba en curso; se descarta el resultado.`);
          return 'failed';
        }
        reason = e.status === 422 ? FAILURE.outputInvalid : FAILURE.engineFailed;
      }
    } catch (e) {
      reason = e instanceof RunnerFailure ? e.reason : FAILURE.engineFailed;
      // El mensaje de una RunnerFailure es nuestro y no lleva secretos; el de un error ajeno puede llevarlos, así que solo se registra su clase.
      this.log.error(`Ejecución ${job.executionId}: falló (${e instanceof RunnerFailure ? e.message : (e as Error)?.constructor?.name ?? 'Error'}).`);
    }
    return this.reportFailure(job, reason ?? FAILURE.engineFailed);
  }

  private async reportFailure(job: RunnerJob, reason: string): Promise<StepResult> {
    try {
      await this.api.fail(job, reason);
    } catch {
      // Si no se puede ni informar, la ejecución se barre sola como `execution.timed_out` (el backend la cierra a los 30 min).
      this.log.error(`Ejecución ${job.executionId}: no se pudo informar el fallo; se cerrará por tiempo.`);
    }
    return 'failed';
  }
}
