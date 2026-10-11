import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import { RunNextExecution } from '../../src/runner/application/run-next-execution';
import { CredentialBroker, RunnerLogger, ScanEngine } from '../../src/runner/domain/ports';
import { EngineInput, EngineRun, FAILURE, RunnerFailure, RunnerJob, TemporaryCredentials } from '../../src/runner/domain/runner.types';
import { HttpRunnerApi } from '../../src/runner/infrastructure/http-runner-api';
import { bootApp, owner, RUN, RUNNER_TOKEN } from '../support/app';
import { awsBody, dosEmpresas, Tenant } from '../support/escenario';

// D57: el trabajador de punta a punta. El bucle, el cliente HTTP y el backend son los REALES; solo el motor y las credenciales de AWS son
// simulados (el adaptador de Docker se prueba aparte). Es lo más cercano a lo que pasa en la VPS sin gastar una llamada a AWS.
const ACCOUNT = '123456789012';
const ROLE_ARN = `arn:aws:iam::${ACCOUNT}:role/MonkeyReadOnly`;
const CHECKS = [
  { id: 'iam_root_mfa_enabled', test: 'T-CLD-001' },
  { id: 'ec2_securitygroup_allow_ingress_from_internet_to_tcp_port_22', test: 'T-CLD-002' },
  { id: 'cloudtrail_multi_region_enabled', test: 'T-CLD-003' },
];
const TEMP: TemporaryCredentials = { accessKeyId: 'ASIATEMP', secretAccessKey: 'secreto-temporal', sessionToken: 'token' };

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let baseUrl: string;
const drainQueue = () => owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);

const row = (checkId: string, over: { status?: string; severity?: string; uid?: string; type?: string } = {}) => ({
  status_code: over.status ?? 'PASS', severity: over.severity ?? 'Medium', status_detail: 'texto crudo', metadata: { event_code: checkId, product: { version: '5.44.0' } },
  cloud: { region: 'us-east-1' }, resources: [{ uid: over.uid ?? `arn:aws:test:us-east-1:${ACCOUNT}:${checkId}`, type: over.type ?? 'Other', name: checkId }],
});
const findings = () => [
  row(CHECKS[0].id),
  row(CHECKS[1].id, { status: 'FAIL', severity: 'High', uid: `arn:aws:ec2:us-east-1:${ACCOUNT}:security-group/sg-runner`, type: 'AwsEc2SecurityGroup' }),
  row(CHECKS[2].id, { status: 'MANUAL' }),
];

class FakeEngine extends ScanEngine {
  inputs: EngineInput[] = [];
  constructor(private readonly output: () => unknown[] | Error) { super(); }
  run(input: EngineInput): Promise<EngineRun> {
    this.inputs.push(input);
    const out = this.output();
    if (out instanceof Error) return Promise.reject(out);
    return Promise.resolve({ engineVersion: '5.44.0', startedAt: new Date(Date.now() - 1000), finishedAt: new Date(), findings: out });
  }
  cleanupOrphans() { return Promise.resolve(0); }
}
class FakeBroker extends CredentialBroker {
  jobs: RunnerJob[] = [];
  constructor(private readonly fail?: RunnerFailure) { super(); }
  obtain(job: RunnerJob) { this.jobs.push(job); return this.fail ? Promise.reject(this.fail) : Promise.resolve(TEMP); }
}
class SilentLog extends RunnerLogger { lines: string[] = []; info(m: string) { this.lines.push(m); } error(m: string) { this.lines.push(m); } }

const runner = (engine: ScanEngine, broker: CredentialBroker, token = RUNNER_TOKEN, log = new SilentLog()) => new RunNextExecution(new HttpRunnerApi(baseUrl, token), broker, engine, log);

/** Un activo de nube con conexión validada y regiones declaradas. */
async function cloudAsset(t: Tenant, name: string): Promise<string> {
  const res = await t.agent.post('/v1/assets').send(awsBody(t, name));
  if (res.status !== 201) throw new Error(`activo: ${res.status} ${JSON.stringify(res.body)}`);
  await t.agent.patch(`/v1/assets/${res.body.data.id}/connection`).send({ role_arn: ROLE_ARN }).expect(200);
  await owner('update tenant.asset_provisionings set external_id = $2 where asset_id = $1', [res.body.data.id, `mk-${RUN}`]);
  await t.agent.post(`/v1/assets/${res.body.data.id}/validate`).expect(200);
  await owner('update tenant.asset_provisionings set regions = array[$2] where asset_id = $1', [res.body.data.id, 'us-east-1']);
  return res.body.data.id;
}
const evaluate = (t: Tenant, assetId: string) => t.agent.post(`/v1/assets/${assetId}/executions`).expect(202).then((r) => r.body.data.id as string);
const history = (t: Tenant, assetId: string) => t.agent.get(`/v1/assets/${assetId}/executions`).expect(200).then((r) => r.body.data.items as { id: string; status: string; failure_reason: string | null }[]);

beforeAll(async () => {
  app = await bootApp();
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  ({ a, b } = await dosEmpresas(app));
  for (const c of CHECKS) {
    await owner(
      `insert into catalog.checks (id, platform, policy_id, check_id, title_en, condition, remediation, origin, mapping_provenance, mapping_confidence)
       values (gen_random_uuid(), 'aws', 'cloud_configuration', $1, 't', 'c', 'r', 'engine_native', 'test', 'low') on conflict do nothing`,
      [c.id],
    );
    await owner(
      `insert into catalog.test_checks (id, test_id, check_id)
       select gen_random_uuid(), t.id, ch.id from catalog.tests t, catalog.checks ch
       where t.code = $1 and ch.platform = 'aws' and ch.policy_id = 'cloud_configuration' and ch.check_id = $2 on conflict do nothing`,
      [c.test, c.id],
    );
  }
});
afterAll(async () => {
  await drainQueue();
  await app?.close();
});
beforeEach(drainQueue);

describe('El trabajador contra el backend real', () => {
  it('sin nada en cola, no hace nada', async () => {
    expect(await runner(new FakeEngine(() => []), new FakeBroker()).execute()).toBe('idle');
  });

  it('evaluar ahora → el trabajador reclama, obtiene credenciales, corre el motor y el cliente ve su estado de preparación', async () => {
    const assetId = await cloudAsset(a, `aws-run-${RUN}`);
    const executionId = await evaluate(a, assetId);
    const engine = new FakeEngine(findings);
    const broker = new FakeBroker();
    expect(await runner(engine, broker).execute()).toBe('completed');

    // lo que recibió el motor: las regiones declaradas y credenciales temporales, nunca el formulario del cliente
    expect(broker.jobs[0]).toMatchObject({ executionId, tenantId: a.companyId, externalAccountId: ACCOUNT, regions: ['us-east-1'], connection: { method: 'readonly_role', roleArn: ROLE_ARN, externalId: `mk-${RUN}` } });
    expect(engine.inputs[0]).toEqual({ executionId, regions: ['us-east-1'], credentials: TEMP });

    expect((await history(a, assetId))[0]).toMatchObject({ id: executionId, status: 'completed' });
    const ready = await a.agent.get(`/v1/assets/${assetId}/readiness`).expect(200);
    expect(ready.body.data).toMatchObject({ readiness: 'needs_work', needs_manual_review: 1, includes_proposed_mappings: true });
    // Los códigos de control en mayúsculas: sin distinguir, un UUID con «cc6» por azar daría un falso positivo.
    expect(JSON.stringify(ready.body)).not.toMatch(/CC\d|T-CLD/);
    expect(JSON.stringify(ready.body)).not.toMatch(/prowler|wazuh|texto crudo|secreto-temporal|token/i);
    // y en la base: la versión del motor y las regiones evaluadas quedaron registradas
    const [ex] = await owner<{ engine_version: string; regions: string[] }>('select engine_version, regions from tenant.executions where id = $1', [executionId]);
    expect(ex).toEqual({ engine_version: '5.44.0', regions: ['us-east-1'] });
  });

  it('si no se puede asumir el rol, la ejecución queda fallida con su razón y no se corre el motor', async () => {
    const assetId = await cloudAsset(a, `aws-sinrol-${RUN}`);
    await evaluate(a, assetId);
    const engine = new FakeEngine(findings);
    expect(await runner(engine, new FakeBroker(new RunnerFailure(FAILURE.roleNotFound))).execute()).toBe('failed');
    expect(engine.inputs).toHaveLength(0);
    expect((await history(a, assetId))[0]).toMatchObject({ status: 'failed', failure_reason: 'connection.role_not_found' });
    // una conexión caída no cambia la preparación: sigue sin medir
    expect((await a.agent.get(`/v1/assets/${assetId}/readiness`).expect(200)).body.data.readiness).toBe('not_measured');
    // y el activo queda libre para evaluar de nuevo
    await expect(evaluate(a, assetId)).resolves.toBeDefined();
  });

  it('un motor que revienta se informa como engine_failed y no filtra su mensaje', async () => {
    const assetId = await cloudAsset(a, `aws-boom-${RUN}`);
    await evaluate(a, assetId);
    const log = new SilentLog();
    expect(await runner(new FakeEngine(() => new Error('boom con secreto-temporal')), new FakeBroker(), RUNNER_TOKEN, log).execute()).toBe('failed');
    expect((await history(a, assetId))[0]).toMatchObject({ status: 'failed', failure_reason: 'execution.engine_failed' });
    expect(log.lines.join('\n')).not.toContain('secreto-temporal');
  });

  it('una salida que el backend no entiende se cierra como output_invalid', async () => {
    const assetId = await cloudAsset(a, `aws-malo-${RUN}`);
    await evaluate(a, assetId);
    expect(await runner(new FakeEngine(() => [row(CHECKS[0].id), { metadata: {} }]), new FakeBroker()).execute()).toBe('failed');
    expect((await history(a, assetId))[0]).toMatchObject({ status: 'failed', failure_reason: 'execution.output_invalid' });
  });

  it('con un token equivocado el trabajador no puede ni reclamar (401), y la ejecución sigue en cola', async () => {
    const assetId = await cloudAsset(a, `aws-token-${RUN}`);
    await evaluate(a, assetId);
    await expect(runner(new FakeEngine(findings), new FakeBroker(), 'token-equivocado').execute()).rejects.toMatchObject({ status: 401 });
    expect((await history(a, assetId))[0].status).toBe('queued');
  });

  it('dos trabajadores a la vez nunca toman la misma ejecución, y cada empresa recibe la suya', async () => {
    const assetA = await cloudAsset(a, `aws-par-a-${RUN}`);
    const assetB = await cloudAsset(b, `aws-par-b-${RUN}`);
    const idA = await evaluate(a, assetA);
    const idB = await evaluate(b, assetB);
    const brokerA = new FakeBroker();
    const brokerB = new FakeBroker();
    const results = await Promise.all([runner(new FakeEngine(findings), brokerA).execute(), runner(new FakeEngine(findings), brokerB).execute()]);
    expect(results).toEqual(['completed', 'completed']);
    const claimed = [...brokerA.jobs, ...brokerB.jobs].map((j) => j.executionId).sort();
    expect(claimed).toEqual([idA, idB].sort());
    expect((await history(a, assetA))[0]).toMatchObject({ id: idA, status: 'completed' });
    expect((await history(b, assetB))[0]).toMatchObject({ id: idB, status: 'completed' });
    // y una empresa nunca ve la corrida de la otra
    await b.agent.get(`/v1/assets/${assetA}/readiness`).expect(404);
  });
});
