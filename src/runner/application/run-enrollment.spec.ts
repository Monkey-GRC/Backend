import { RunnerApi, RunnerLogger } from '../domain/ports';
import { FAILURE, RunnerApiError, RunnerFailure, RunnerJob } from '../domain/runner.types';
import { SondaEnrollApi } from '../domain/sonda';
import { RunEnrollment } from './run-enrollment';

const NAME = '78778a4a-6fef-45b0-ade1-2ad12b457c22';
const GROUP = '11111111-1111-4111-8111-111111111111';
const KEY = Buffer.from(`007 ${NAME} any ${'a1'.repeat(32)}`).toString('base64');

const job = {
  executionId: 'e1', kind: 'enrollment', tenantId: GROUP, assetId: NAME, origin: 'manual', platform: 'linux', externalAccountId: null, regions: [],
  connection: { method: 'agent', agentId: '', group: GROUP }, enrollment: { name: NAME, group: GROUP },
} as RunnerJob & { enrollment: { name: string; group: string } };

class FakeApi extends RunnerApi {
  readonly percents: number[] = [];
  async progress(_job: unknown, percent: number): Promise<void> {
    this.percents.push(percent);
  }
  enrolledWith: { agentId: string; key: string }[] = [];
  failed: string[] = [];
  removedCount = 0;
  constructor(private readonly enrolledError?: unknown, private readonly failError?: unknown) { super(); }
  removed() { this.removedCount += 1; return Promise.resolve(); }
  claim() { return Promise.resolve(null); } validated() { return Promise.resolve(); } submitResults() { return Promise.resolve(); } submitSca() { return Promise.resolve(); }
  enrolled(_j: RunnerJob, a: { agentId: string; key: string }) { if (this.enrolledError) return Promise.reject(this.enrolledError); this.enrolledWith.push(a); return Promise.resolve(); }
  fail(_j: RunnerJob, reason: string) { if (this.failError) return Promise.reject(this.failError); this.failed.push(reason); return Promise.resolve(); }
}

class FakeSonda extends SondaEnrollApi {
  calls: string[] = [];
  constructor(private readonly o: { version?: string; hadAgent?: boolean; fail?: Partial<Record<'version' | 'group' | 'remove' | 'create', Error>>; removeFailsAfterCreate?: boolean } = {}) { super(); }
  private step<T>(name: 'version' | 'group' | 'remove' | 'create', value: T): Promise<T> { this.calls.push(name); return this.o.fail?.[name] ? Promise.reject(this.o.fail[name]) : Promise.resolve(value); }
  version() { return this.step('version', this.o.version ?? '4.14.6'); }
  ensureGroup() { return this.step('group', undefined); }
  removeAgentByName() {
    if (this.calls.includes('create') && this.o.removeFailsAfterCreate) { this.calls.push('remove'); return Promise.reject(new RunnerFailure(FAILURE.probeUnreachable)); }
    return this.step('remove', this.calls.includes('create') ? true : Boolean(this.o.hadAgent));
  }
  createAgent() { return this.step('create', { agentId: '007', key: KEY }); }
}

class Log extends RunnerLogger { lines: string[] = []; info(m: string) { this.lines.push(m); } error(m: string) { this.lines.push(m); } }

const run = (sonda: FakeSonda, api = new FakeApi(), log = new Log()) => ({ api, sonda, log, result: new RunEnrollment(api, sonda, log, ['4.14']).execute(job) });

describe('RunEnrollment (D113)', () => {
  it('camino feliz: versión → grupo → retirar un agente anterior → crear → entregar id y clave al backend', async () => {
    const { api, sonda, result } = run(new FakeSonda());
    expect(await result).toBe('completed');
    expect(sonda.calls).toEqual(['version', 'group', 'remove', 'create']);
    expect(api.enrolledWith).toEqual([{ agentId: '007', key: KEY }]);
    expect(api.failed).toEqual([]);
  });

  it('un agente anterior con ese nombre se retira ANTES de crear el nuevo (la sonda exige nombres únicos)', async () => {
    const { log, sonda, result } = run(new FakeSonda({ hadAgent: true }));
    expect(await result).toBe('completed');
    expect(sonda.calls.indexOf('remove')).toBeLessThan(sonda.calls.indexOf('create'));
    expect(log.lines.join('\n')).toMatch(/retiró el agente anterior/);
  });

  it('una versión de la sonda que no conocemos NO se toca: no crea nada y lo informa', async () => {
    const { api, sonda, result } = run(new FakeSonda({ version: '5.0.0' }));
    expect(await result).toBe('failed');
    expect(sonda.calls).toEqual(['version']);
    expect(api.failed).toEqual(['execution.probe_version_unsupported']);
  });

  it.each([
    ['la sonda no responde al preguntar la versión', { version: new RunnerFailure(FAILURE.probeUnreachable) }, 'connection.probe_unreachable'],
    ['la credencial no autoriza', { group: new RunnerFailure(FAILURE.probeUnauthorized) }, 'connection.probe_unauthorized'],
    ['no se pudo crear el agente', { create: new RunnerFailure(FAILURE.agentEnrollFailed) }, 'connection.agent_enroll_failed'],
    ['un error inesperado', { create: new Error('algo raro') }, 'execution.engine_failed'],
  ])('si %s: informa SU razón', async (_n, fail, reason) => {
    const { api, result } = run(new FakeSonda({ fail: fail as never }));
    expect(await result).toBe('failed');
    expect(api.failed).toEqual([reason]);
  });

  it('el mensaje de un error inesperado (que podría llevar una clave) no llega al registro', async () => {
    const { log, result } = run(new FakeSonda({ fail: { create: new Error(`falló con ${KEY}`) } }));
    await result;
    expect(log.lines.join('\n')).not.toContain(KEY);
  });

  describe('si el backend no puede guardar el agente recién creado, NO queda suelto en la sonda', () => {
    it('422 → lo retira y falla con output_invalid', async () => {
      const { api, sonda, result } = run(new FakeSonda(), new FakeApi(new RunnerApiError(422, 'ENGINE_OUTPUT_INVALID')));
      expect(await result).toBe('failed');
      expect(api.failed).toEqual(['execution.output_invalid']);
      expect(sonda.calls.filter((c) => c === 'remove')).toHaveLength(2); // uno antes de crear, otro para retirar el agente que no se alcanzó a entregar
    });

    it('409 AGENT_ALREADY_LINKED (ese agente ya es de otro activo) → lo retira y falla con agent_enroll_failed', async () => {
      const { api, result } = run(new FakeSonda(), new FakeApi(new RunnerApiError(409, 'AGENT_ALREADY_LINKED')));
      expect(await result).toBe('failed');
      expect(api.failed).toEqual(['connection.agent_enroll_failed']);
    });

    it('409 (la ejecución ya no estaba en curso) → lo retira y NO intenta cerrar la ejecución', async () => {
      const { api, sonda, result } = run(new FakeSonda(), new FakeApi(new RunnerApiError(409, 'EXECUTION_NOT_RUNNING')));
      expect(await result).toBe('failed');
      expect(api.failed).toEqual([]);
      expect(sonda.calls.filter((c) => c === 'remove')).toHaveLength(2);
    });

    it('un fallo de red al entregar también lo retira', async () => {
      const { api, sonda, result } = run(new FakeSonda(), new FakeApi(new Error('ECONNRESET')));
      expect(await result).toBe('failed');
      expect(api.failed).toEqual(['execution.engine_failed']);
      expect(sonda.calls.filter((c) => c === 'remove')).toHaveLength(2);
    });

    it('si ni retirarlo se puede, lo dice y el siguiente intento lo retirará por su nombre', async () => {
      const { log, result } = run(new FakeSonda({ removeFailsAfterCreate: true }), new FakeApi(new RunnerApiError(500, null)));
      expect(await result).toBe('failed');
      expect(log.lines.join('\n')).toMatch(/siguiente intento lo retirará/);
    });
  });

  describe('servidor dado de baja (D113 punto 8): se retira su agente de la sonda y no se crea otro', () => {
    const retired = { ...job, enrollment: { name: NAME, group: GROUP, remove: true } } as RunnerJob & { enrollment: { name: string; group: string; remove: boolean } };

    it('retira el agente por su nombre y cierra la ejecución, sin tocar grupos ni crear nada', async () => {
      const api = new FakeApi();
      const sonda = new FakeSonda({ hadAgent: true });
      expect(await new RunEnrollment(api, sonda, new Log(), ['4.14']).execute(retired)).toBe('completed');
      expect(sonda.calls).toEqual(['remove']);
      expect(api.removedCount).toBe(1);
      expect(api.enrolledWith).toEqual([]);
    });

    it('si el agente ya no estaba, también termina bien (el objetivo es que no exista)', async () => {
      const api = new FakeApi();
      expect(await new RunEnrollment(api, new FakeSonda({ hadAgent: false }), new Log(), ['4.14']).execute(retired)).toBe('completed');
      expect(api.removedCount).toBe(1);
    });

    it('si la sonda no responde, informa SU razón y no cierra la ejecución como lograda', async () => {
      const api = new FakeApi();
      const sonda = new FakeSonda({ fail: { remove: new RunnerFailure(FAILURE.probeUnreachable) } });
      expect(await new RunEnrollment(api, sonda, new Log(), ['4.14']).execute(retired)).toBe('failed');
      expect(api.removedCount).toBe(0);
      expect(api.failed).toEqual(['connection.probe_unreachable']);
    });
  });

  it('si ni siquiera se puede informar el fallo, no revienta: el backend la cerrará por tiempo', async () => {
    const { log, result } = run(new FakeSonda({ fail: { group: new RunnerFailure(FAILURE.probeUnreachable) } }), new FakeApi(undefined, new RunnerApiError(500, null)));
    expect(await result).toBe('failed');
    expect(log.lines.join('\n')).toMatch(/se cerrará por tiempo/);
  });
});
