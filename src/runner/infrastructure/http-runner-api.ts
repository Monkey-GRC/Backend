import { Inventory } from '../domain/inventory';
import { RunnerApi } from '../domain/ports';
import { EngineRun, RunnerApiError, RunnerJob, RunnerJobKind } from '../domain/runner.types';
import { SondaSnapshot } from '../domain/sonda';

type Fetch = typeof fetch;

function toConnection(c: Record<string, any>): RunnerJob['connection'] {
  if (c['method'] === 'readonly_role') return { method: 'readonly_role', roleArn: c['role_arn'], externalId: c['external_id'] ?? null };
  if (c['method'] === 'identity_federation') return { method: 'identity_federation', externalId: c['external_id'], projectNumber: c['project_number'] };
  if (c['method'] === 'admin_consent') return { method: 'admin_consent' };
  if (c['method'] === 'app_certificate') {
    return { method: 'app_certificate', clientId: c['client_id'], certificateThumbprint: c['certificate_thumbprint'], privateKeyPem: c['private_key_pem'] };
  }
  return { method: 'access_keys', accessKeyId: c['access_key_id'], secretAccessKey: c['secret_access_key'] };
}

// Habla con `/internal/runner` (contracts/modules/control-tecnico.md). La llamada va por la red interna de Docker, sin pasar por el proxy.
export class HttpRunnerApi extends RunnerApi {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly http: Fetch = fetch,
  ) {
    super();
  }

  async claim(kind?: RunnerJobKind): Promise<RunnerJob | null> {
    const res = await this.post('/internal/runner/claim', kind ? { kind } : undefined, 30_000);
    if (res.status === 204) return null;
    await this.ensureOk(res);
    const { data } = (await res.json()) as { data: Record<string, any> };
    const c = data['connection'];
    return {
      executionId: data['execution_id'],
      kind: data['kind'] ?? 'assessment',
      tenantId: data['tenant_id'],
      assetId: data['asset_id'],
      origin: data['origin'],
      platform: data['platform'],
      externalAccountId: data['external_account_id'] ?? null,
      regions: data['regions'],
      // Crear el agente de un servidor (D113): el backend dice cómo se llama en la sonda y a qué grupo va.
      ...(data['kind'] === 'enrollment' ? { enrollment: { name: String(data['agent']?.name ?? ''), group: String(data['agent']?.group ?? ''), ...(data['agent']?.remove === true ? { remove: true } : {}) } } : {}),
      connection: c['method'] === 'agent' ? { method: 'agent', agentId: String(data['agent']?.agent_id ?? ''), group: String(data['agent']?.group ?? '') } : toConnection(c),
    };
  }

  async submitSca(job: RunnerJob, s: SondaSnapshot): Promise<void> {
    const body = {
      tenant_id: job.tenantId,
      source: 'sca',
      sonda_version: s.sondaVersion,
      started_at: s.startedAt.toISOString(),
      finished_at: s.finishedAt.toISOString(),
      agent: { agent_id: s.agent.id, name: s.agent.name, groups: s.agent.groups },
      policies: s.policies.map((p) => ({
        policy_id: p.policyId,
        name: p.name,
        scan_ended_at: p.endScan,
        checks: p.checks.map((c) => ({ id: c.id, result: c.result, reason: c.reason, compliance: c.compliance })),
      })),
    };
    // Un servidor tiene cientos de checks por política: pesa poco, pero se le da el mismo plazo que a una evaluación.
    await this.ensureOk(await this.post(`/internal/runner/executions/${job.executionId}/results`, body, 180_000));
  }

  async submitResults(job: RunnerJob, run: EngineRun, regions: string[]): Promise<void> {
    // La salida de un escaneo pesa megas: tiempo de sobra para subirla.
    const body = { tenant_id: job.tenantId, engine_version: run.engineVersion, regions, started_at: run.startedAt.toISOString(), finished_at: run.finishedAt.toISOString(), findings: run.findings };
    await this.ensureOk(await this.post(`/internal/runner/executions/${job.executionId}/results`, body, 180_000));
  }

  async progress(job: RunnerJob, percent: number): Promise<void> {
    await this.ensureOk(await this.post(`/internal/runner/executions/${job.executionId}/progress`, { tenant_id: job.tenantId, percent }, 10_000));
  }

  async enrolled(job: RunnerJob, agent: { agentId: string; key: string }): Promise<void> {
    // La clave viaja SOLO aquí, por la red interna, y no se registra en ninguna parte.
    await this.ensureOk(await this.post(`/internal/runner/executions/${job.executionId}/enrolled`, { tenant_id: job.tenantId, agent_id: agent.agentId, key: agent.key }, 30_000));
  }

  async removed(job: RunnerJob): Promise<void> {
    await this.ensureOk(await this.post(`/internal/runner/executions/${job.executionId}/removed`, { tenant_id: job.tenantId }, 30_000));
  }

  async validated(job: RunnerJob, inventory?: Inventory | null): Promise<void> {
    const body = { tenant_id: job.tenantId, ...(inventory ? { inventory } : {}) };
    await this.ensureOk(await this.post(`/internal/runner/executions/${job.executionId}/validated`, body, 30_000));
  }

  async fail(job: RunnerJob, reason: string): Promise<void> {
    await this.ensureOk(await this.post(`/internal/runner/executions/${job.executionId}/fail`, { tenant_id: job.tenantId, reason }, 30_000));
  }

  private post(path: string, body: unknown, timeoutMs: number): Promise<Response> {
    return this.http(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  }

  // Un error del backend se traduce a RunnerApiError con su código estable; nunca se vuelca el cuerpo (podría eco de algo sensible).
  private async ensureOk(res: Response): Promise<void> {
    if (res.ok) return;
    let code: string | null = null;
    try {
      code = ((await res.json()) as { error?: { code?: string } }).error?.code ?? null;
    } catch {
      /* sin cuerpo JSON */
    }
    throw new RunnerApiError(res.status, code);
  }
}
