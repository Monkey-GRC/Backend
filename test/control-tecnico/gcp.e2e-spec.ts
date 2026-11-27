import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { RunNextExecution } from '../../src/runner/application/run-next-execution';
import { CredentialBroker, RunnerLogger, ScanEngine } from '../../src/runner/domain/ports';
import { EngineInput, EngineRun, FAILURE, RunnerFailure, RunnerJob, TemporaryCredentials } from '../../src/runner/domain/runner.types';
import { HttpRunnerApi } from '../../src/runner/infrastructure/http-runner-api';
import { Agent, bootApp, MONKEY_GCP_FEDERATION_ROLE_ARN, owner, RUN, RUNNER_TOKEN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D112 (MD-214): un proyecto de GCP conectado por federación de identidad, de punta a punta por HTTP. El backend, el bucle del trabajador y su cliente HTTP
// son los REALES; solo las credenciales de Google y el motor son simulados (el broker se prueba aparte contra un Google de mentira).
// Largo como uno real (hasta 30): uno corto escondió un límite de 20 pensado para AWS.
const PROJECT = 'acme-production-platform-42190';
const NUMBER = '407295138461';
const TOKEN: TemporaryCredentials = { provider: 'gcp', accessToken: 'token-gcp-no-debe-salir', expiresAt: new Date(Date.now() + 3600_000) };
const CHECK = 'iam_organization_essential_contacts_configured';

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let baseUrl: string;
const drainQueue = () => owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);

class FakeBroker extends CredentialBroker {
  jobs: RunnerJob[] = [];
  constructor(private readonly fail?: RunnerFailure) { super(); }
  obtain(job: RunnerJob) { this.jobs.push(job); return this.fail ? Promise.reject(this.fail) : Promise.resolve(TOKEN); }
}
class FakeEngine extends ScanEngine {
  inputs: EngineInput[] = [];
  constructor(private readonly output: () => unknown[]) { super(); }
  run(input: EngineInput): Promise<EngineRun> {
    this.inputs.push(input);
    return Promise.resolve({ engineVersion: '5.44.0', startedAt: new Date(Date.now() - 1000), finishedAt: new Date(), findings: this.output() });
  }
  cleanupOrphans() { return Promise.resolve(0); }
}
class NoEngine extends ScanEngine {
  run(): never { throw new Error('una validación no debe correr el motor'); }
  cleanupOrphans() { return Promise.resolve(0); }
}
class SilentLog extends RunnerLogger { info() {} error() {} }

/** El carril del trabajador, trabajando mientras el cliente espera (validación) o después de encolar (evaluación). */
async function serve(kind: 'validation' | 'assessment', broker: CredentialBroker, engine: ScanEngine = new NoEngine(), attempts = 40): Promise<string> {
  const lane = new RunNextExecution(new HttpRunnerApi(baseUrl, RUNNER_TOKEN), broker, engine, new SilentLog(), kind);
  for (let i = 0; i < attempts; i++) {
    const r = await lane.execute();
    if (r !== 'idle') return r;
    await new Promise((res) => setTimeout(res, 150));
  }
  return 'idle';
}

const gcpBody = (over: Record<string, unknown> = {}) => ({
  name: `gcp-${RUN}-${Math.random().toString(36).slice(2, 6)}`, connection_category: 'ac_01', connection_method: 'identity_federation', platform: 'gcp',
  external_account_id: PROJECT, service_ids: [a.serviceId], ...over,
});
const create = (t: Tenant, body: Record<string, unknown>) => t.agent.post('/v1/assets').send(body);
const setNumber = (t: Tenant, id: string, project_number: unknown = NUMBER) => t.agent.patch(`/v1/assets/${id}/connection`).send({ project_number });
const validate = (t: Tenant, id: string) => t.agent.post(`/v1/assets/${id}/validate`);
const history = (t: Tenant, id: string) => t.agent.get(`/v1/assets/${id}/executions`).expect(200).then((r) => r.body.data.items as { status: string; failure_reason: string | null }[]);
const finding = (status: string, uid = PROJECT) => ({ status_code: status, severity: 'High', status_detail: 'texto crudo', metadata: { event_code: CHECK, product: { version: '5.44.0' } }, cloud: { region: 'global' }, resources: [{ uid, type: 'Project', name: uid }] });

/** Valida un proyecto con el trabajador real; devuelve su id, ya con el número entregado y la conexión validada. */
async function validatedProject(): Promise<string> {
  const id = (await create(a, gcpBody()).expect(201)).body.data.id as string;
  await setNumber(a, id).expect(200);
  const [res] = await Promise.all([validate(a, id), serve('validation', new FakeBroker())]);
  expect(res.status).toBe(200);
  return id;
}

beforeAll(async () => {
  app = await bootApp({ PROBE_MODE: 'runner', VALIDATION_WAIT_SECONDS: '3' });
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  ({ a, b, monkey } = await dosEmpresas(app));
  // El catálogo de GCP en una base nueva (CI) está vacío: la prueba trae un check propio.
  await owner(
    `insert into catalog.checks (id, platform, policy_id, check_id, title_en, condition, remediation, origin, mapping_provenance, mapping_confidence)
     values (gen_random_uuid(), 'gcp', 'cloud_configuration', $1, 't', 'c', 'r', 'engine_native', 'test', 'low') on conflict do nothing`,
    [CHECK],
  );
});
afterAll(async () => {
  await drainQueue();
  await app?.close();
});
beforeEach(drainQueue);

describe('Alta de un proyecto de GCP (variante D)', () => {
  it('Monkey genera el external_id y entrega el comando de alta con el script dentro, sin regiones ni secretos', async () => {
    const res = await create(a, gcpBody()).expect(201);
    const d = res.body.data;
    expect(d).toMatchObject({ platform: 'gcp', type: 'cloud_service', external_account_id: PROJECT, provisioning: { connection_method: 'identity_federation', regions: [], connection_status: 'pending', is_active: false } });
    const s = d.connection_setup;
    expect(s).toMatchObject({ method: 'identity_federation', project_id: PROJECT, project_number: null, template_path: '/v1/connection-templates/gcp-identity-federation' });
    expect(s.external_id).toMatch(/^mk-[0-9a-f]{20}$/);
    expect(s.setup_command.startsWith(`bash -s -- ${PROJECT} ${s.external_id} <<'MONKEY_SETUP'\n`)).toBe(true);
    expect(s.setup_command.endsWith('\nMONKEY_SETUP\n')).toBe(true);
    expect(s.setup_command).toContain('MONKEY_AWS_ACCOUNT="210987654321"');
    expect(s.setup_command).toContain('MONKEY_ROLE_NAME="monkey-gcp-federation"');
    expect(s.steps).toHaveLength(3);
    expect(s.steps[0]).toMatch(/Cloud Shell/);
    expect(JSON.stringify(res.body)).not.toMatch(/prowler|wazuh|encrypted/i);
  });

  it('el detalle conserva el comando y el idioma de la petición traduce los pasos', async () => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    const es = (await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data.connection_setup;
    expect(es.setup_command).toContain('MONKEY_SETUP');
    const en = (await a.agent.get(`/v1/assets/${id}`).set('Accept-Language', 'en').expect(200)).body.data.connection_setup;
    expect(en.steps[0]).toMatch(/Open Cloud Shell/);
  });

  it.each([
    ['con regiones', { regions: ['us-east-1'] }, 'regions', 'field.not_allowed'],
    ['con una lista de regiones vacía', { regions: [] }, 'regions', 'field.not_allowed'],
    ['con credenciales', { credentials: { access_key_id: 'AKIA' } }, 'credentials', 'field.not_allowed'],
    ['sin proyecto', { external_account_id: null }, 'external_account_id', 'required'],
    ['con un número de cuenta de AWS como proyecto', { external_account_id: '123456789012' }, 'external_account_id', 'invalid'],
    ['con un ID de proyecto en mayúsculas', { external_account_id: 'Acme-Prod' }, 'external_account_id', 'invalid'],
    ['con un ID que empieza con número', { external_account_id: '1acme-prod-421905' }, 'external_account_id', 'invalid'],
    ['con un ID que termina en guion', { external_account_id: 'acme-prod-4219-' }, 'external_account_id', 'invalid'],
    ['con un ID de más de 30 caracteres', { external_account_id: 'a'.repeat(31) }, 'external_account_id', 'invalid'],
    ['con un ID de más de 36 caracteres', { external_account_id: 'a'.repeat(37) }, 'external_account_id', 'string.max'],
    ['con un ID con guion bajo', { external_account_id: 'acme_prod_421905' }, 'external_account_id', 'invalid'],
    ['con un ID de proyecto que intenta inyectar', { external_account_id: 'acme-prod; rm -rf /' }, 'external_account_id', 'invalid'],
  ])('rechaza %s (422)', async (_n, over, field, code) => {
    const res = await create(a, gcpBody(over)).expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field, code })]));
  });

  it('la federación solo es de GCP: AWS con ese canal es 409', async () => {
    expect((await create(a, gcpBody({ platform: 'aws' })).expect(409)).body.error.code).toBe('CONNECTION_METHOD_NOT_APPLICABLE');
    expect((await create(a, gcpBody({ connection_method: 'readonly_role' })).expect(409)).body.error.code).toBe('CONNECTION_METHOD_NOT_APPLICABLE');
  });

  it('una plataforma «Próximamente» sigue sin poder declararse', async () => {
    const res = await create(a, gcpBody({ platform: 'azure', connection_method: 'readonly_role', external_account_id: '123456789012', regions: ['us-east-1'] })).expect(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'platform', code: 'connection.provider_not_supported' });
  });

  it('en el catálogo GCP está disponible con su canal', async () => {
    const caps = (await a.agent.get('/v1/catalogs/automated-capabilities').expect(200)).body.data.items as { catalog_code: string; platforms: { code: string; availability: string; connection_methods: string[] }[] }[];
    expect(caps.find((c) => c.catalog_code === 'ac_01')!.platforms.find((p) => p.code === 'gcp')).toMatchObject({ availability: 'available', connection_methods: ['identity_federation'] });
  });
});

describe('El cliente entrega el número de proyecto', () => {
  it('lo guarda y la conexión sigue «pendiente»', async () => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    const res = await setNumber(a, id).expect(200);
    expect(res.body.data.connection_setup).toMatchObject({ method: 'identity_federation', project_number: NUMBER });
    expect(res.body.data.provisioning.connection_status).toBe('pending');
    const [row] = await owner<{ n: string }>('select project_number n from tenant.asset_provisionings where asset_id = $1', [id]);
    expect(row.n).toBe(NUMBER);
  });

  it.each([['con letras', '98301480633x', 'invalid'], ['muy corto', '12345', 'invalid'], ['de más de 19 dígitos', '12345678901234567890', 'string.max']])('rechaza un número %s', async (_n, value, code) => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    expect((await setNumber(a, id, value).expect(422)).body.error.fields[0]).toMatchObject({ field: 'project_number', code });
  });

  it('exige el número y no admite role_arn en la federación', async () => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    expect((await a.agent.patch(`/v1/assets/${id}/connection`).send({}).expect(422)).body.error.fields[0]).toMatchObject({ field: 'project_number', code: 'required' });
    const res = await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: 'arn:aws:iam::123456789012:role/MonkeyReadOnly' }).expect(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'role_arn', code: 'field.not_allowed' });
  });

  it('un activo de AWS no admite el número de proyecto, y su rol sigue funcionando', async () => {
    const aws = (await create(a, { name: `aws-${RUN}-gcp`, connection_category: 'ac_01', connection_method: 'readonly_role', platform: 'aws', external_account_id: '123456789012', regions: ['us-east-1'], service_ids: [a.serviceId] }).expect(201)).body.data.id;
    expect((await setNumber(a, aws).expect(422)).body.error.fields[0]).toMatchObject({ field: 'project_number', code: 'field.not_allowed' });
    await a.agent.patch(`/v1/assets/${aws}/connection`).send({ role_arn: 'arn:aws:iam::123456789012:role/MonkeyReadOnly' }).expect(200);
  });

  it('una empresa ajena ve 404', async () => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    await setNumber(b, id).expect(404);
  });
});

describe('El script de alta', () => {
  it('se descarga tras la sesión, con la cuenta y el rol de Monkey horneados, y no nombra al motor', async () => {
    const res = await a.agent.get('/v1/connection-templates/gcp-identity-federation').expect(200);
    expect(res.headers['content-type']).toMatch(/text\/x-shellscript/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="monkey-gcp-setup\.sh"/);
    expect(res.text).toContain(`MONKEY_AWS_ACCOUNT="${MONKEY_GCP_FEDERATION_ROLE_ARN.split(':')[4]}"`);
    expect(res.text).toContain('MONKEY_ROLE_NAME="monkey-gcp-federation"');
    expect(res.text).toContain('roles/iam.workloadIdentityUser');
    expect(res.text).not.toMatch(/prowler|wazuh/i);
  });
  it('un rol que no es admin_empresa recibe 403', async () => {
    await monkey.get('/v1/connection-templates/gcp-identity-federation').expect(403);
  });
  it('exige sesión', async () => {
    await request(app.getHttpServer()).get('/v1/connection-templates/gcp-identity-federation').expect(401);
  });
});

describe('Validar y evaluar un proyecto de GCP con el trabajador real', () => {
  it('el trabajo llega con la federación, sin regiones, y la validación deja la conexión «validated» sin inventario', async () => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    const external = (await setNumber(a, id).expect(200)).body.data.connection_setup.external_id;
    const broker = new FakeBroker();
    const [res] = await Promise.all([validate(a, id), serve('validation', broker)]);
    expect(res.status).toBe(200);
    expect(res.body.data.connection_status).toBe('validated');
    expect(broker.jobs[0]).toMatchObject({ platform: 'gcp', kind: 'validation', tenantId: a.companyId, externalAccountId: PROJECT, regions: [], connection: { method: 'identity_federation', externalId: external, projectNumber: NUMBER } });
    // GCP no descubre recursos (DT-102): ni «cuenta vacía» ni inventario
    const [p] = await owner<{ inventory_at: string | null }>('select inventory_at from tenant.asset_provisionings where asset_id = $1', [id]);
    expect(p.inventory_at).toBeNull();
    // el número de comprobaciones disponibles sale del catálogo de GCP, no del de AWS
    expect(res.body.data.checks_available).toBe(Number((await owner<{ n: string }>(`select count(*) n from catalog.checks where platform = 'gcp' and policy_id = 'cloud_configuration'`))[0].n));
  });

  it('sin el número de proyecto la validación se cierra sola: connection.not_configured en el campo del número', async () => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    const broker = new FakeBroker();
    const [res] = await Promise.all([validate(a, id), serve('validation', broker)]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'project_number', code: 'connection.not_configured' });
    expect(broker.jobs).toHaveLength(0);
    const [ex] = await owner<{ status: string; failure_reason: string }>('select status, failure_reason from tenant.executions where asset_id = $1', [id]);
    expect(ex).toEqual({ status: 'failed', failure_reason: 'connection.not_configured' });
  });

  it('que GCP rechace la federación es del cliente: connection.federation_rejected con texto propio', async () => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    await setNumber(a, id).expect(200);
    const [res] = await Promise.all([validate(a, id), serve('validation', new FakeBroker(new RunnerFailure(FAILURE.federationRejected)))]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'project_number', code: 'connection.federation_rejected', message: expect.stringMatching(/Google Cloud/) });
    expect(JSON.stringify(res.body)).not.toMatch(/prowler|wazuh/i);
  });

  it('un proyecto distinto del declarado es connection.account_mismatch en el ID del proyecto', async () => {
    const id = (await create(a, gcpBody()).expect(201)).body.data.id;
    await setNumber(a, id).expect(200);
    const [res] = await Promise.all([validate(a, id), serve('validation', new FakeBroker(new RunnerFailure(FAILURE.accountMismatch)))]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'external_account_id', code: 'connection.account_mismatch' });
  });

  it('evaluar ahora: el motor recibe el proyecto y credenciales de GCP, y los resultados (región global) se guardan con el catálogo de GCP', async () => {
    const id = await validatedProject();
    const executionId = (await a.agent.post(`/v1/assets/${id}/executions`).expect(202)).body.data.id as string;
    const engine = new FakeEngine(() => [finding('FAIL')]);
    const outcome = await serve('assessment', new FakeBroker(), engine);
    expect(outcome).toBe('completed');
    expect(engine.inputs[0]).toEqual({ executionId, accountId: PROJECT, regions: [], credentials: TOKEN, onProgress: expect.any(Function) });
    expect((await history(a, id))[0]).toMatchObject({ status: 'completed' });
    const rows = await owner<{ platform: string; region: string | null; result: string }>(
      'select platform, region, result from tenant.check_results where execution_id = $1', [executionId],
    );
    expect(rows).toEqual([{ platform: 'gcp', region: 'global', result: 'failed' }]);
    const [ex] = await owner<{ regions: string[] }>('select regions from tenant.executions where id = $1', [executionId]);
    expect(ex.regions).toEqual([]);
  });

  it('un trabajador sin el rol de federación de Monkey falla con connection.method_not_supported_by_runner', async () => {
    const id = await validatedProject();
    await a.agent.post(`/v1/assets/${id}/executions`).expect(202);
    const broker = new FakeBroker(new RunnerFailure(FAILURE.methodNotSupportedByRunner));
    expect(await serve('assessment', broker)).toBe('failed');
    expect((await history(a, id))[0]).toMatchObject({ status: 'failed', failure_reason: 'connection.method_not_supported_by_runner' });
  });
});
