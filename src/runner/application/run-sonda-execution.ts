import { RunnerApi, RunnerLogger } from '../domain/ports';
import { FAILURE, RunnerApiError, RunnerFailure, RunnerJob } from '../domain/runner.types';
import { agentGroupsMatchTenant, isSupportedSondaVersion, SondaApi, SondaScaPolicy } from '../domain/sonda';
import type { StepResult } from './run-next-execution';

type AgentJob = RunnerJob & { connection: { method: 'agent'; agentId: string; group: string } };

// Una ejecución de un servidor con agente (D113): lee la configuración (SCA) de SU agente en la sonda y la entrega al backend.
// Solo lee. No interpreta ni decide qué cuenta: eso es del backend con el catálogo del comité.
//
// Por qué comprueba el grupo AQUÍ además del backend: es barato y evita bajar cientos de checks de un agente que no es de la empresa. Pero el
// que manda es el backend (SEG-45): este control no sustituye al suyo.
export class RunSondaExecution {
  constructor(
    private readonly api: RunnerApi,
    private readonly sonda: SondaApi,
    private readonly log: RunnerLogger,
    // Prefijos de versión que sabemos leer (`4.14`). Una versión fuera de esta lista no se lee (D113).
    private readonly supportedVersions: readonly string[],
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(job: AgentJob): Promise<StepResult> {
    this.log.info(`Ejecución ${job.executionId}: servidor con agente, se lee la sonda.`);
    try {
      const snapshot = await this.read(job);
      try {
        await this.api.submitSca(job, snapshot);
      } catch (e) {
        if (!(e instanceof RunnerApiError)) throw e;
        // 409: la ejecución ya no está en curso (se barrió por tiempo): nada que cerrar. 422: el backend rechazó lo entregado (agente no enlazado,
        // grupo distinto de la empresa, formato): la razón concreta la guarda el propio backend al rechazar; aquí solo se cierra si él no lo hizo.
        if (e.status === 409) {
          this.log.error(`Ejecución ${job.executionId}: ya no estaba en curso; se descarta el resultado.`);
          return 'failed';
        }
        throw new RunnerFailure(e.code === 'AGENT_GROUP_MISMATCH' ? FAILURE.agentGroupMismatch : e.status === 422 ? FAILURE.outputInvalid : FAILURE.engineFailed);
      }
      const checks = snapshot.policies.reduce((n, p) => n + p.checks.length, 0);
      this.log.info(`Ejecución ${job.executionId}: entregada (${snapshot.policies.length} política(s), ${checks} checks).`);
      return 'completed';
    } catch (e) {
      const reason = e instanceof RunnerFailure ? e.reason : FAILURE.engineFailed;
      // El mensaje de una RunnerFailure es nuestro y no lleva secretos; el de un error ajeno puede llevarlos: solo su clase.
      this.log.error(`Ejecución ${job.executionId}: falló (${e instanceof RunnerFailure ? e.message : (e as Error)?.constructor?.name ?? 'Error'}).`);
      return this.reportFailure(job, reason);
    }
  }

  private async read(job: AgentJob) {
    const startedAt = this.now();
    const { agentId, group } = job.connection;

    const sondaVersion = await this.sonda.version();
    if (!isSupportedSondaVersion(sondaVersion, this.supportedVersions)) {
      // Se nombra la versión (no es un secreto) para que quien opere el trabajador sepa qué probar antes de ampliar la lista.
      throw new RunnerFailure(FAILURE.probeVersionUnsupported, `versión ${sondaVersion}`);
    }

    const agent = await this.sonda.agent(agentId);
    if (!agent) throw new RunnerFailure(FAILURE.agentNotFound);
    // El nombre del agente es el ID del activo (D113): si no coincide, el vínculo está mal y no se lee. Igual si el grupo no es el de la empresa.
    if (agent.name !== job.assetId || !agentGroupsMatchTenant(agent.groups, group)) throw new RunnerFailure(FAILURE.agentGroupMismatch);
    if (agent.status === 'never_connected' || agent.status === 'pending') throw new RunnerFailure(FAILURE.agentNoScanYet);
    // Un agente desconectado conserva su último estado en la sonda, pero eso NO es una medición de hoy: no se presenta como una.
    if (agent.status === 'disconnected') throw new RunnerFailure(FAILURE.agentDisconnected);

    const summaries = await this.sonda.scaPolicies(agentId);
    if (summaries.length === 0) throw new RunnerFailure(FAILURE.agentNoScanYet);

    const policies: SondaScaPolicy[] = [];
    for (const s of summaries) policies.push({ ...s, checks: await this.sonda.scaChecks(agentId, s.policyId) });
    // La sonda publica la política al EMPEZAR el escaneo y sus checks llegan después, de golpe (en una prueba real, unos 40 s más tarde). Una política sin ningún check
    // es un escaneo a medias, no un servidor sin nada que medir: entregarla daría un «completado» vacío y el cliente no vería resultados hasta la siguiente lectura.
    if (policies.some((p) => p.checks.length === 0)) throw new RunnerFailure(FAILURE.agentNoScanYet);

    return { sondaVersion, startedAt, finishedAt: this.now(), agent: { id: agent.id, name: agent.name, groups: agent.groups }, policies };
  }

  private async reportFailure(job: RunnerJob, reason: string): Promise<StepResult> {
    try {
      await this.api.fail(job, reason);
    } catch {
      // Si no se puede ni informar, el backend barre la ejecución solo a los 30 min (`execution.timed_out`).
      this.log.error(`Ejecución ${job.executionId}: no se pudo informar el fallo; se cerrará por tiempo.`);
    }
    return 'failed';
  }
}
