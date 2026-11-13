import { RunnerApi, RunnerLogger } from '../domain/ports';
import { FAILURE, RunnerApiError, RunnerFailure, RunnerJob } from '../domain/runner.types';
import { isSupportedSondaVersion, SondaEnrollApi } from '../domain/sonda';
import type { StepResult } from './run-next-execution';

type EnrollJob = RunnerJob & { enrollment: { name: string; group: string; remove?: boolean } };

// Crear el agente de un servidor en la sonda (D112). Lo espera un cliente en pantalla: son segundos, en su propio carril.
//
// Qué hace, en orden: comprueba la versión de la sonda, asegura el grupo de la empresa, retira un agente anterior con ese nombre (un reintento, o «generar de nuevo»: el nombre es el id del
// activo y la sonda exige nombres únicos), crea el agente con su grupo y entrega su id y su clave al backend. NUNCA toca la clave más que para entregarla: no la registra.
export class RunEnrollment {
  constructor(
    private readonly api: RunnerApi,
    private readonly sonda: SondaEnrollApi,
    private readonly log: RunnerLogger,
    // Prefijos de versión que sabemos manejar (`4.14`): con una versión desconocida no se crea nada (D112).
    private readonly supportedVersions: readonly string[],
  ) {}

  async execute(job: EnrollJob): Promise<StepResult> {
    if (job.enrollment.remove) return this.remove(job);
    this.log.info(`Ejecución ${job.executionId}: crear el agente de un servidor.`);
    let created: { agentId: string; key: string } | null = null;
    try {
      const version = await this.sonda.version();
      if (!isSupportedSondaVersion(version, this.supportedVersions)) throw new RunnerFailure(FAILURE.probeVersionUnsupported, `versión ${version}`);
      const { name, group } = job.enrollment;
      await this.sonda.ensureGroup(group);
      if (await this.sonda.removeAgentByName(name)) this.log.info(`Ejecución ${job.executionId}: se retiró el agente anterior de este servidor.`);
      created = await this.sonda.createAgent(name, group);
      try {
        await this.api.enrolled(job, created);
      } catch (e) {
        if (!(e instanceof RunnerApiError)) throw e;
        // 409: la ejecución ya no estaba en curso (se barrió por tiempo): nada que cerrar. Otro error: el backend no pudo guardar el agente.
        await this.discard(job, created);
        created = null;
        if (e.status === 409 && e.code !== 'AGENT_ALREADY_LINKED') {
          this.log.error(`Ejecución ${job.executionId}: ya no estaba en curso; se descarta el agente creado.`);
          return 'failed';
        }
        throw new RunnerFailure(e.code === 'AGENT_ALREADY_LINKED' ? FAILURE.agentEnrollFailed : e.status === 422 ? FAILURE.outputInvalid : FAILURE.engineFailed);
      }
      this.log.info(`Ejecución ${job.executionId}: agente creado y entregado.`);
      return 'completed';
    } catch (e) {
      // Si el agente se creó y no llegó a entregarse, no se deja suelto en la sonda.
      if (created) await this.discard(job, created);
      const reason = e instanceof RunnerFailure ? e.reason : FAILURE.engineFailed;
      // El mensaje de una RunnerFailure es nuestro y no lleva secretos; el de un error ajeno puede llevarlos: solo su clase.
      this.log.error(`Ejecución ${job.executionId}: falló (${e instanceof RunnerFailure ? e.message : (e as Error)?.constructor?.name ?? 'Error'}).`);
      return this.reportFailure(job, reason);
    }
  }

  // El servidor se dio de baja (D112 punto 8): se retira su agente de la sonda por su nombre (el id del activo). Si ya no estaba, también está bien: el objetivo es que no exista.
  private async remove(job: EnrollJob): Promise<StepResult> {
    this.log.info(`Ejecución ${job.executionId}: retirar de la sonda el agente de un servidor dado de baja.`);
    try {
      const removed = await this.sonda.removeAgentByName(job.enrollment.name);
      await this.api.removed(job);
      this.log.info(`Ejecución ${job.executionId}: ${removed ? 'agente retirado' : 'el agente ya no estaba'}.`);
      return 'completed';
    } catch (e) {
      this.log.error(`Ejecución ${job.executionId}: no se pudo retirar el agente (${e instanceof RunnerFailure ? e.message : (e as Error)?.constructor?.name ?? 'Error'}).`);
      return this.reportFailure(job, e instanceof RunnerFailure ? e.reason : FAILURE.engineFailed);
    }
  }

  // Retira el agente recién creado que el backend no pudo guardar. Si ni esto se puede, el siguiente intento lo retira por su nombre.
  private async discard(job: EnrollJob, _created: { agentId: string }): Promise<void> {
    try {
      await this.sonda.removeAgentByName(job.enrollment.name);
    } catch {
      this.log.error(`Ejecución ${job.executionId}: no se pudo retirar el agente que no se alcanzó a entregar; el siguiente intento lo retirará.`);
    }
  }

  private async reportFailure(job: RunnerJob, reason: string): Promise<StepResult> {
    try {
      await this.api.fail(job, reason);
    } catch {
      // Si no se puede ni informar, el backend barre la ejecución solo a los 2 minutos (`execution.timed_out`).
      this.log.error(`Ejecución ${job.executionId}: no se pudo informar el fallo; se cerrará por tiempo.`);
    }
    return 'failed';
  }
}
