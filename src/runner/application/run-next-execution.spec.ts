import { CredentialBroker, RunnerApi, RunnerLogger, ScanEngine } from '../domain/ports';
import { EngineInput, EngineRun, FAILURE, RunnerApiError, RunnerFailure, RunnerJob, TemporaryCredentials } from '../domain/runner.types';
import { RunNextExecution } from './run-next-execution';

const job: RunnerJob = {
  executionId: 'e1', tenantId: 't1', assetId: 'a1', origin: 'manual', platform: 'aws', externalAccountId: '123456789012', regions: ['us-east-1'],
  connection: { method: 'readonly_role', roleArn: 'arn:aws:iam::123456789012:role/R', externalId: 'mk-1' },
};
const creds: TemporaryCredentials = { accessKeyId: 'ASIATEMP', secretAccessKey: 'SECRETO-NO-DEBE-SALIR', sessionToken: 'TOKEN-NO-DEBE-SALIR' };
const run: EngineRun = { engineVersion: '5.44.0', startedAt: new Date(), finishedAt: new Date(), findings: [{ a: 1 }, { b: 2 }] };

class FakeApi extends RunnerApi {
  submitted: { job: RunnerJob; run: EngineRun }[] = [];
  failed: { job: RunnerJob; reason: string }[] = [];
  constructor(private readonly next: RunnerJob | null, private readonly submitError?: unknown, private readonly failError?: unknown) { super(); }
  claim() { return Promise.resolve(this.next); }
  submitResults(j: RunnerJob, r: EngineRun) { if (this.submitError) return Promise.reject(this.submitError); this.submitted.push({ job: j, run: r }); return Promise.resolve(); }
  fail(j: RunnerJob, reason: string) { if (this.failError) return Promise.reject(this.failError); this.failed.push({ job: j, reason }); return Promise.resolve(); }
}
const broker = (impl: () => Promise<TemporaryCredentials>): CredentialBroker => ({ obtain: impl });
const engine = (impl: (i: EngineInput) => Promise<EngineRun>): ScanEngine => ({ run: impl, cleanupOrphans: () => Promise.resolve(0) });
class Log extends RunnerLogger { lines: string[] = []; info(m: string) { this.lines.push(m); } error(m: string) { this.lines.push(m); } }

const step = (api: FakeApi, b: CredentialBroker, e: ScanEngine, log = new Log()) => ({ log, result: new RunNextExecution(api, b, e, log).execute() });

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
});
