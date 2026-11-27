import { RunnerApi, RunnerLogger } from '../domain/ports';
import { FAILURE, RunnerApiError, RunnerFailure, RunnerJob } from '../domain/runner.types';
import { SondaAgent, SondaApi, SondaScaCheck, SondaScaPolicySummary, SondaSnapshot } from '../domain/sonda';
import { RunSondaExecution } from './run-sonda-execution';

// El grupo de cada empresa en la sonda es su tenant_id (un UUID).
const TENANT = '11111111-1111-4111-8111-111111111111';
const OTHER_TENANT = '22222222-2222-4222-8222-222222222222';

const job = {
  executionId: 'e1', kind: 'assessment', tenantId: TENANT, assetId: 'asset-1', origin: 'manual', platform: 'ubuntu', externalAccountId: null, regions: [],
  connection: { method: 'agent', agentId: '001', group: TENANT },
} as RunnerJob & { connection: { method: 'agent'; agentId: string; group: string } };

const agent: SondaAgent = { id: '001', name: 'asset-1', groups: [TENANT], status: 'active', osName: 'Ubuntu', osVersion: '22.04.5 LTS', agentVersion: 'Wazuh v4.14.6', lastKeepAlive: null };
const policy: SondaScaPolicySummary = { policyId: 'cis_ubuntu22-04', name: 'CIS Ubuntu Linux 22.04 LTS Benchmark v2.0.0.', endScan: '2026-11-12T01:37:33+00:00' };
const checks: SondaScaCheck[] = [
  { id: '28500', result: 'failed', reason: null, compliance: [{ key: 'soc_2', value: 'CC6.3,CC6.6' }] },
  { id: '28501', result: 'not applicable', reason: null, compliance: [] },
];

class FakeApi extends RunnerApi {
  readonly percents: number[] = [];
  async progress(_job: unknown, percent: number): Promise<void> {
    this.percents.push(percent);
  }
  snapshots: SondaSnapshot[] = [];
  failed: { reason: string }[] = [];
  constructor(private readonly submitError?: unknown, private readonly failError?: unknown) { super(); }
  claim() { return Promise.resolve(null); }
  validated() { return Promise.resolve(); }
  submitResults() { return Promise.resolve(); }
  enrolled() { return Promise.resolve(); }
  submitSca(_j: RunnerJob, s: SondaSnapshot) { if (this.submitError) return Promise.reject(this.submitError); this.snapshots.push(s); return Promise.resolve(); }
  removed() { return Promise.resolve(); }
  fail(_j: RunnerJob, reason: string) { if (this.failError) return Promise.reject(this.failError); this.failed.push({ reason }); return Promise.resolve(); }
}

class FakeSonda extends SondaApi {
  calls: string[] = [];
  constructor(private readonly o: { version?: string | Error; agent?: SondaAgent | null | Error; policies?: SondaScaPolicySummary[]; checks?: SondaScaCheck[] } = {}) { super(); }
  private pick<T>(v: T | Error): Promise<T> { return v instanceof Error ? Promise.reject(v) : Promise.resolve(v); }
  version() { this.calls.push('version'); return this.pick(this.o.version ?? '4.14.6'); }
  agent() { this.calls.push('agent'); return this.pick(this.o.agent === undefined ? agent : this.o.agent); }
  scaPolicies() { this.calls.push('scaPolicies'); return Promise.resolve(this.o.policies ?? [policy]); }
  scaChecks() { this.calls.push('scaChecks'); return Promise.resolve(this.o.checks ?? checks); }
}

class Log extends RunnerLogger { lines: string[] = []; info(m: string) { this.lines.push(m); } error(m: string) { this.lines.push(m); } }

const run = (sonda: SondaApi, api = new FakeApi(), log = new Log()) => ({ api, log, sonda, result: new RunSondaExecution(api, sonda, log, ['4.14']).execute(job) });

describe('RunSondaExecution', () => {
  it('camino feliz: lee SU agente, trae los checks de cada política y entrega todo tal cual', async () => {
    const { api, result } = run(new FakeSonda());
    expect(await result).toBe('completed');
    expect(api.failed).toEqual([]);
    expect(api.snapshots).toHaveLength(1);
    const s = api.snapshots[0];
    expect(s.sondaVersion).toBe('4.14.6');
    expect(s.agent).toEqual({ id: '001', name: 'asset-1', groups: [TENANT] });
    expect(s.policies).toEqual([{ ...policy, checks }]);
    // El resultado se entrega SIN normalizar: esa decisión es del backend.
    expect(s.policies[0].checks[1].result).toBe('not applicable');
  });

  it('un grupo extra que no es de ninguna empresa (p. ej. de configuración por sistema operativo) no estorba', async () => {
    const { api, result } = run(new FakeSonda({ agent: { ...agent, groups: [TENANT, 'linux'] } }));
    expect(await result).toBe('completed');
    expect(api.failed).toEqual([]);
  });

  it('una versión de la sonda que no conocemos NO se lee: informa la razón y no toca al agente', async () => {
    for (const v of ['4.15.0', '5.0.0', '4.140.1', 'dev']) {
      const sonda = new FakeSonda({ version: v });
      const { api, result } = run(sonda);
      expect(await result).toBe('failed');
      expect(api.failed).toEqual([{ reason: 'execution.probe_version_unsupported' }]);
      expect(sonda.calls).toEqual(['version']);
    }
  });

  it('un agente que no existe → agent_not_found', async () => {
    const { api, result } = run(new FakeSonda({ agent: null }));
    expect(await result).toBe('failed');
    expect(api.failed).toEqual([{ reason: 'connection.agent_not_found' }]);
  });

  it.each([
    ['el grupo de OTRA empresa', { ...agent, groups: [OTHER_TENANT] }],
    ['un grupo cualquiera que no es el de la empresa', { ...agent, groups: ['default'] }],
    ['el grupo de la empresa MÁS el de otra', { ...agent, groups: [TENANT, OTHER_TENANT] }],
    ['sin ningún grupo', { ...agent, groups: [] }],
    ['un nombre que no es el del activo', { ...agent, name: 'asset-de-otra-empresa' }],
  ])('aislamiento: %s → agent_group_mismatch y NO se lee ningún check', async (_n, a) => {
    const sonda = new FakeSonda({ agent: a });
    const { api, result } = run(sonda);
    expect(await result).toBe('failed');
    expect(api.failed).toEqual([{ reason: 'connection.agent_group_mismatch' }]);
    expect(sonda.calls).not.toContain('scaPolicies');
    expect(sonda.calls).not.toContain('scaChecks');
    expect(api.snapshots).toHaveLength(0);
  });

  it.each([
    ['never_connected', 'connection.agent_no_scan_yet'],
    ['pending', 'connection.agent_no_scan_yet'],
    ['disconnected', 'connection.agent_disconnected'],
  ])('un agente %s no se presenta como una medición de hoy: %s', async (status, reason) => {
    const { api, result } = run(new FakeSonda({ agent: { ...agent, status: status as SondaAgent['status'] } }));
    expect(await result).toBe('failed');
    expect(api.failed).toEqual([{ reason }]);
  });

  it('un agente conectado sin ninguna política todavía → agent_no_scan_yet', async () => {
    const { api, result } = run(new FakeSonda({ policies: [] }));
    expect(await result).toBe('failed');
    expect(api.failed).toEqual([{ reason: 'connection.agent_no_scan_yet' }]);
  });

  it('una política que ya figura pero aún sin checks (escaneo a medias) → agent_no_scan_yet, no un «completado» vacío', async () => {
    const { api, result } = run(new FakeSonda({ checks: [] }));
    expect(await result).toBe('failed');
    expect(api.failed).toEqual([{ reason: 'connection.agent_no_scan_yet' }]);
    expect(api.snapshots).toEqual([]);
  });

  it('si la sonda no responde o no autoriza, informa SU razón', async () => {
    for (const reason of [FAILURE.probeUnreachable, FAILURE.probeUnauthorized]) {
      const { api, result } = run(new FakeSonda({ version: new RunnerFailure(reason) }));
      expect(await result).toBe('failed');
      expect(api.failed).toEqual([{ reason }]);
    }
  });

  it('un error inesperado se informa como engine_failed y su mensaje (que podría llevar una clave) no llega al registro', async () => {
    const { api, log, result } = run(new FakeSonda({ version: new Error('falló con la clave SECRETO-123') }));
    expect(await result).toBe('failed');
    expect(api.failed).toEqual([{ reason: 'execution.engine_failed' }]);
    expect(log.lines.join('\n')).not.toContain('SECRETO-123');
  });

  describe('lo que responde el backend', () => {
    it('409: la ejecución ya no estaba en curso → se descarta sin intentar cerrarla', async () => {
      const { api, result } = run(new FakeSonda(), new FakeApi(new RunnerApiError(409, 'EXECUTION_NOT_RUNNING')));
      expect(await result).toBe('failed');
      expect(api.failed).toEqual([]);
    });

    it('422 AGENT_GROUP_MISMATCH: el backend manda, y la razón es la del aislamiento', async () => {
      const { api, result } = run(new FakeSonda(), new FakeApi(new RunnerApiError(422, 'AGENT_GROUP_MISMATCH')));
      expect(await result).toBe('failed');
      expect(api.failed).toEqual([{ reason: 'connection.agent_group_mismatch' }]);
    });

    it('422 con otro código → output_invalid; un 500 → engine_failed', async () => {
      const a = run(new FakeSonda(), new FakeApi(new RunnerApiError(422, 'AGENT_NOT_LINKED')));
      expect(await a.result).toBe('failed');
      expect(a.api.failed).toEqual([{ reason: 'execution.output_invalid' }]);
      const b = run(new FakeSonda(), new FakeApi(new RunnerApiError(500, null)));
      expect(await b.result).toBe('failed');
      expect(b.api.failed).toEqual([{ reason: 'execution.engine_failed' }]);
    });
  });

  it('si ni siquiera se puede informar el fallo, no revienta: el backend la cerrará por tiempo', async () => {
    const { log, result } = run(new FakeSonda({ agent: null }), new FakeApi(undefined, new RunnerApiError(500, null)));
    expect(await result).toBe('failed');
    expect(log.lines.join('\n')).toMatch(/se cerrará por tiempo/);
  });
});
