import { Inventory } from '../domain/inventory';
import { CredentialBroker, InventoryScanner, RunnerApi, RunnerLogger, ScanEngine } from '../domain/ports';
import { EngineInput, EngineRun, FAILURE, RunnerApiError, RunnerFailure, RunnerJob, TemporaryCredentials } from '../domain/runner.types';
import { RunNextExecution } from './run-next-execution';
import { RunEnrollment } from './run-enrollment';
import { RunSondaExecution } from './run-sonda-execution';

const job: RunnerJob = {
  executionId: 'e1', kind: 'assessment', tenantId: 't1', assetId: 'a1', origin: 'manual', platform: 'aws', externalAccountId: '123456789012', regions: ['us-east-1'],
  connection: { method: 'readonly_role', roleArn: 'arn:aws:iam::123456789012:role/R', externalId: 'mk-1' },
};
const creds: TemporaryCredentials = { accessKeyId: 'ASIATEMP', secretAccessKey: 'SECRETO-NO-DEBE-SALIR', sessionToken: 'TOKEN-NO-DEBE-SALIR' };
const run: EngineRun = { engineVersion: '5.44.0', startedAt: new Date(), finishedAt: new Date(), findings: [{ a: 1 }, { b: 2 }] };

class FakeApi extends RunnerApi {
  submitted: { job: RunnerJob; run: EngineRun }[] = [];
  failed: { job: RunnerJob; reason: string }[] = [];
  validatedJobs: RunnerJob[] = [];
  claimedKinds: (string | undefined)[] = [];
  constructor(private readonly next: RunnerJob | null, private readonly submitError?: unknown, private readonly failError?: unknown) { super(); }
  claim(kind?: string) { this.claimedKinds.push(kind); return Promise.resolve(this.next); }
  inventories: (Inventory | null | undefined)[] = [];
  validated(j: RunnerJob, inventory?: Inventory | null) { this.validatedJobs.push(j); this.inventories.push(inventory); return Promise.resolve(); }
  submitResults(j: RunnerJob, r: EngineRun) { if (this.submitError) return Promise.reject(this.submitError); this.submitted.push({ job: j, run: r }); return Promise.resolve(); }
  scaSubmitted: RunnerJob[] = [];
  submitSca(j: RunnerJob) { this.scaSubmitted.push(j); return Promise.resolve(); }
  enrolledJobs: RunnerJob[] = [];
  enrolled(j: RunnerJob) { this.enrolledJobs.push(j); return Promise.resolve(); }
  removed() { return Promise.resolve(); }
  fail(j: RunnerJob, reason: string) { if (this.failError) return Promise.reject(this.failError); this.failed.push({ job: j, reason }); return Promise.resolve(); }
}
const broker = (impl: () => Promise<TemporaryCredentials>): CredentialBroker => ({ obtain: impl });
const engine = (impl: (i: EngineInput) => Promise<EngineRun>): ScanEngine => ({ run: impl, cleanupOrphans: () => Promise.resolve(0) });
class Log extends RunnerLogger { lines: string[] = []; info(m: string) { this.lines.push(m); } error(m: string) { this.lines.push(m); } }

const step = (api: FakeApi, b: CredentialBroker, e: ScanEngine, log = new Log(), kind?: 'assessment' | 'validation') => ({ log, result: new RunNextExecution(api, b, e, log, kind).execute() });

describe('RunNextExecution', () => {
  it('sin nada pendiente no hace nada', async () => {
    expect(await step(new FakeApi(null), broker(() => Promise.reject(new Error('no debe llamarse'))), engine(() => Promise.reject(new Error('no')))).result).toBe('idle');
  });

  it('camino feliz: credenciales → motor → resultado entregado, con las regiones del trabajo', async () => {
    const api = new FakeApi(job);
    let seen: EngineInput | null = null;
    const out = await step(api, broker(() => Promise.resolve(creds)), engine((i) => { seen = i; return Promise.resolve(run); })).result;
    expect(out).toBe('completed');
    expect(seen).toEqual({ executionId: 'e1', regions: ['us-east-1'], credentials: creds });
    expect(api.submitted).toHaveLength(1);
    expect(api.failed).toHaveLength(0);
  });

  it('si no se pueden obtener credenciales, informa SU razón (clave i18n) y no ejecuta el motor', async () => {
    const api = new FakeApi(job);
    let ran = false;
    const out = await step(api, broker(() => Promise.reject(new RunnerFailure(FAILURE.roleNotFound))), engine(() => { ran = true; return Promise.resolve(run); })).result;
    expect(out).toBe('failed');
    expect(ran).toBe(false);
    expect(api.failed).toEqual([{ job, reason: 'connection.role_not_found' }]);
  });

  it('un error inesperado del motor se informa como engine_failed y nunca filtra el mensaje ni las credenciales al registro', async () => {
    const api = new FakeApi(job);
    const { log, result } = step(api, broker(() => Promise.resolve(creds)), engine(() => Promise.reject(new Error(`falló con ${creds.secretAccessKey} y ${creds.sessionToken}`))));
    expect(await result).toBe('failed');
    expect(api.failed[0].reason).toBe('execution.engine_failed');
    const all = log.lines.join('\n');
    expect(all).not.toContain('SECRETO-NO-DEBE-SALIR');
    expect(all).not.toContain('TOKEN-NO-DEBE-SALIR');
  });

  it('si el backend rechaza el resultado por mal formado (422), cierra la ejecución como output_invalid', async () => {
    const api = new FakeApi(job, new RunnerApiError(422, 'ENGINE_OUTPUT_INVALID'));
    expect(await step(api, broker(() => Promise.resolve(creds)), engine(() => Promise.resolve(run))).result).toBe('failed');
    expect(api.failed[0].reason).toBe('execution.output_invalid');
  });

  it('si la ejecución ya no estaba en curso (409), no intenta cerrarla otra vez', async () => {
    const api = new FakeApi(job, new RunnerApiError(409, 'EXECUTION_NOT_RUNNING'));
    expect(await step(api, broker(() => Promise.resolve(creds)), engine(() => Promise.resolve(run))).result).toBe('failed');
    expect(api.failed).toHaveLength(0);
  });

  it('si ni siquiera puede informar el fallo, no revienta: el backend la cerrará por tiempo', async () => {
    const api = new FakeApi(job, undefined, new Error('backend caído'));
    const { log, result } = step(api, broker(() => Promise.reject(new RunnerFailure(FAILURE.credentialsInvalid))), engine(() => Promise.resolve(run)));
    expect(await result).toBe('failed');
    expect(log.lines.join('\n')).toContain('se cerrará por tiempo');
  });

  describe('una validación (D58)', () => {
    const validation: RunnerJob = { ...job, kind: 'validation' };
    it('obtener las credenciales YA es la comprobación: no corre el motor y cierra la validación', async () => {
      const api = new FakeApi(validation);
      let ran = false;
      const out = await step(api, broker(() => Promise.resolve(creds)), engine(() => { ran = true; return Promise.resolve(run); })).result;
      expect(out).toBe('completed');
      expect(ran).toBe(false);
      expect(api.validatedJobs).toEqual([validation]);
      expect(api.submitted).toHaveLength(0);
    });
    it('si no se puede asumir el rol, la validación falla con su razón y no se marca validada', async () => {
      const api = new FakeApi(validation);
      expect(await step(api, broker(() => Promise.reject(new RunnerFailure(FAILURE.roleNotFound))), engine(() => Promise.resolve(run))).result).toBe('failed');
      expect(api.failed).toEqual([{ job: validation, reason: 'connection.role_not_found' }]);
      expect(api.validatedJobs).toHaveLength(0);
    });
  });

  it('cada carril reclama solo su tipo', async () => {
    const api = new FakeApi(null);
    await step(api, broker(() => Promise.resolve(creds)), engine(() => Promise.resolve(run)), new Log(), 'validation').result;
    await step(api, broker(() => Promise.resolve(creds)), engine(() => Promise.resolve(run)), new Log(), 'assessment').result;
    expect(api.claimedKinds).toEqual(['validation', 'assessment']);
  });

  describe('descubrimiento de activos al validar (D59)', () => {
    const validation: RunnerJob = { ...job, kind: 'validation' };
    const found: Inventory = { resources: [{ uid: 'arn:aws:ec2:us-east-1:123456789012:instance/i-1', type: 'AwsEc2Instance', kind: 'server', name: 'api', region: 'us-east-1', attributes: { os: 'Ubuntu 22.04' }, tags: [] }], warnings: [] };
    const scanner = (impl: () => Promise<Inventory>): InventoryScanner => ({ discover: impl });
    const validate = (api: FakeApi, s?: InventoryScanner, log = new Log()) => new RunNextExecution(api, broker(() => Promise.resolve(creds)), engine(() => Promise.reject(new Error('no'))), log, 'validation', s).execute();

    it('entrega lo descubierto junto con la validación, con las regiones y la cuenta del trabajo', async () => {
      const api = new FakeApi(validation);
      let seen: unknown;
      expect(await validate(api, scanner(() => { seen = 1; return Promise.resolve(found); }))).toBe('completed');
      expect(seen).toBe(1);
      expect(api.inventories).toEqual([found]);
    });

    it('si el descubrimiento falla, la conexión sigue siendo válida (y no se registra el error del proveedor)', async () => {
      const api = new FakeApi(validation);
      const log = new Log();
      expect(await validate(api, scanner(() => Promise.reject(new Error(`boom ${creds.secretAccessKey}`))), log)).toBe('completed');
      expect(api.inventories).toEqual([null]);
      expect(log.lines.join('\n')).not.toContain('SECRETO-NO-DEBE-SALIR');
    });

    it('sin descubridor, la validación solo comprueba el acceso', async () => {
      const api = new FakeApi(validation);
      expect(await validate(api)).toBe('completed');
      expect(api.inventories).toEqual([null]);
    });

    it('una evaluación no descubre nada', async () => {
      const api = new FakeApi(job);
      let called = false;
      await new RunNextExecution(api, broker(() => Promise.resolve(creds)), engine(() => Promise.resolve(run)), new Log(), 'assessment', scanner(() => { called = true; return Promise.resolve(found); })).execute();
      expect(called).toBe(false);
    });
  });

  describe('crear el agente de un servidor (D112)', () => {
    const enrollJob: RunnerJob = { ...job, kind: 'enrollment', platform: 'linux', externalAccountId: null, regions: [], connection: { method: 'agent', agentId: '', group: 't1' }, enrollment: { name: 'a1', group: 't1' } };
    const noBroker = broker(() => Promise.reject(new Error('crear un agente no pide credenciales del cliente')));
    const noEngine = engine(() => Promise.reject(new Error('crear un agente no corre el motor de nube')));

    it('se entrega a su caso de uso y no toca credenciales ni motor', async () => {
      const api = new FakeApi(enrollJob);
      const delegated: RunnerJob[] = [];
      const enrollment = { execute: (j: RunnerJob) => { delegated.push(j); return Promise.resolve('completed' as const); } } as unknown as RunEnrollment;
      const out = await new RunNextExecution(api, noBroker, noEngine, new Log(), 'enrollment', undefined, undefined, enrollment).execute();
      expect(out).toBe('completed');
      expect(delegated).toEqual([enrollJob]);
    });

    it('si el trabajador no tiene la credencial de alta, cierra la ejecución con una razón clara (no la deja colgada)', async () => {
      const api = new FakeApi(enrollJob);
      const out = await new RunNextExecution(api, noBroker, noEngine, new Log(), 'enrollment').execute();
      expect(out).toBe('failed');
      expect(api.failed).toEqual([{ job: enrollJob, reason: 'connection.method_not_supported_by_runner' }]);
    });
  });

  // Servidores con agente (D112): no hay credenciales del cliente ni motor; otro camino.
  describe('servidor con agente', () => {
    const agentJob: RunnerJob = { ...job, platform: 'ubuntu', externalAccountId: null, regions: [], connection: { method: 'agent', agentId: '001', group: 't1' } };
    const noBroker = broker(() => Promise.reject(new Error('un servidor con agente no pide credenciales del cliente')));
    const noEngine = engine(() => Promise.reject(new Error('un servidor con agente no corre el motor de nube')));

    it('se entrega a la lectura de la sonda y no toca credenciales ni motor', async () => {
      const api = new FakeApi(agentJob);
      const delegated: RunnerJob[] = [];
      const sonda = { execute: (j: RunnerJob) => { delegated.push(j); return Promise.resolve('completed' as const); } } as unknown as RunSondaExecution;
      const out = await new RunNextExecution(api, noBroker, noEngine, new Log(), 'assessment', undefined, sonda).execute();
      expect(out).toBe('completed');
      expect(delegated).toEqual([agentJob]);
      expect(api.failed).toHaveLength(0);
    });

    it('si el trabajador no tiene configurada la sonda, cierra la ejecución con una razón clara (no la deja colgada)', async () => {
      const api = new FakeApi(agentJob);
      const log = new Log();
      const out = await new RunNextExecution(api, noBroker, noEngine, log, 'assessment').execute();
      expect(out).toBe('failed');
      expect(api.failed).toEqual([{ job: agentJob, reason: 'connection.method_not_supported_by_runner' }]);
    });
  });
});
