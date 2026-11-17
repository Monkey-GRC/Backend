import { CredentialBroker, InventoryScanner, RunnerApi, RunnerLogger, ScanEngine } from '../domain/ports';
import { Inventory } from '../domain/inventory';
import { FAILURE, RunnerApiError, RunnerFailure, RunnerJob, RunnerJobKind, TemporaryCredentials } from '../domain/runner.types';
import { RunEnrollment } from './run-enrollment';
import { RunSondaExecution } from './run-sonda-execution';

export type StepResult = 'idle' | 'completed' | 'failed';

// Un paso del trabajador: reclama UNA ejecución, la corre y entrega el resultado (o informa por qué no pudo).
// Es el único lugar con lógica; los puertos (API, credenciales, motor) se sustituyen en las pruebas y, mañana, en la nube.
export class RunNextExecution {
  constructor(
    private readonly api: RunnerApi,
    private readonly broker: CredentialBroker,
    private readonly engine: ScanEngine,
    private readonly log: RunnerLogger,
    // El carril: solo reclama este tipo. Sin él, reclama de cualquiera.
    private readonly kind?: RunnerJobKind,
    // Opcional: sin él, la validación solo comprueba el acceso (no descubre activos).
    private readonly inventory?: InventoryScanner,
    // Servidores con agente (D113). Sin él, el trabajador no lee la sonda y esas ejecuciones se cierran con una razón clara, sin tocarlas a mano.
    private readonly sonda?: RunSondaExecution,
    // Crear el agente de un servidor en la sonda (D113). Lleva la credencial de ALTA, aparte de la de lectura: sin ella, el trabajador no crea agentes.
    private readonly enrollment?: RunEnrollment,
  ) {}

  async execute(): Promise<StepResult> {
    const job = await this.api.claim(this.kind);
    if (!job) return 'idle';
    // Crear el agente de un servidor: no hay credenciales del cliente ni motor, y es otra credencial de la sonda.
    if (job.kind === 'enrollment') {
      if (this.enrollment && job.enrollment) return this.enrollment.execute(job as RunnerJob & { enrollment: { name: string; group: string } });
      this.log.error(`Ejecución ${job.executionId}: este trabajador no tiene configurada la creación de agentes.`);
      return this.reportFailure(job, FAILURE.methodNotSupported);
    }
    // Un servidor con agente no tiene credenciales del cliente ni motor en contenedor: otro camino (D113).
    if (job.connection.method === 'agent') {
      if (this.sonda) return this.sonda.execute(job as RunnerJob & { connection: { method: 'agent'; agentId: string; group: string } });
      this.log.error(`Ejecución ${job.executionId}: este trabajador no tiene configurada la lectura de la sonda.`);
      return this.reportFailure(job, FAILURE.methodNotSupported);
    }
    this.log.info(`Ejecución ${job.executionId}: reclamada (${job.kind}, ${job.regions.length} región(es)).`);

    let reason: string | null = null;
    try {
      const credentials = await this.broker.obtain(job);
      // Una validación termina aquí: obtener las credenciales (asumir el rol y comprobar que la cuenta es la declarada) YA es la comprobación.
      if (job.kind === 'validation') {
        const inventory = await this.discover(job, credentials);
        await this.api.validated(job, inventory);
        this.log.info(`Ejecución ${job.executionId}: conexión validada${inventory ? ` (${inventory.resources.length} activos encontrados)` : ''}.`);
        return 'completed';
      }
      const run = await this.engine.run({ executionId: job.executionId, accountId: job.externalAccountId, regions: job.regions, credentials });
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

  // El descubrimiento es un extra de la validación: si falla, la conexión sigue siendo válida (el cliente verá «no pudimos listar tus activos»).
  private async discover(job: RunnerJob, credentials: TemporaryCredentials): Promise<Inventory | null> {
    if (!this.inventory) return null;
    try {
      return await this.inventory.discover({ accountId: job.externalAccountId, regions: job.regions, credentials });
    } catch (e) {
      this.log.error(`Ejecución ${job.executionId}: no se pudo descubrir los activos (${(e as Error)?.constructor?.name ?? 'Error'}).`);
      return null;
    }
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
