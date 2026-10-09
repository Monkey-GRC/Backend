import { Inventory } from '../domain/inventory';
import { RunnerApi } from '../domain/ports';
import { EngineRun, RunnerApiError, RunnerJob, RunnerJobKind } from '../domain/runner.types';

type Fetch = typeof fetch;

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
      connection:
        c.method === 'readonly_role'
          ? { method: 'readonly_role', roleArn: c.role_arn, externalId: c.external_id ?? null }
          : { method: 'access_keys', accessKeyId: c.access_key_id, secretAccessKey: c.secret_access_key },
    };
  }

  async submitResults(job: RunnerJob, run: EngineRun, regions: string[]): Promise<void> {
    // La salida de un escaneo pesa megas: tiempo de sobra para subirla.
    const body = { tenant_id: job.tenantId, engine_version: run.engineVersion, regions, started_at: run.startedAt.toISOString(), finished_at: run.finishedAt.toISOString(), findings: run.findings };
    await this.ensureOk(await this.post(`/internal/runner/executions/${job.executionId}/results`, body, 180_000));
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
