import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { RunNextExecution } from '../../src/runner/application/run-next-execution';
import { CredentialBroker, RunnerLogger, ScanEngine } from '../../src/runner/domain/ports';
import { EngineInput, EngineRun, RunnerJob, TemporaryCredentials } from '../../src/runner/domain/runner.types';
import { HttpRunnerApi } from '../../src/runner/infrastructure/http-runner-api';
import { MICROSOFT_365_REQUIRED_ROLES, Microsoft365CredentialBroker, MonkeyMicrosoftApp } from '../../src/runner/infrastructure/providers/microsoft365/microsoft-365-credential-broker';
import { ConsentTickets } from '../../src/features/technical-control/domain/ports/microsoft-consent';
import { ForgeCertificateIssuer } from '../../src/features/technical-control/infrastructure/security/forge-certificate.issuer';
import { Agent, bootApp, owner, RUN, RUNNER_TOKEN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D154: un tenant de Microsoft 365 conectado con una aplicación del cliente y un certificado que genera Monkey, de punta a punta por HTTP. El backend (con su base, su cifrado y
// su RLS), el bucle del trabajador, su cliente HTTP y su BROKER son los REALES: el broker firma la aserción con la clave que el backend le entrega, y solo Microsoft Entra es simulado.
// Que la validación pase prueba que el certificado sobrevive al viaje base → backend → trabajador sin perder un byte.
const TENANT = '3f2a91c4-7b6d-4e0a-9c11-5d8e2f7a0b13';
const CLIENT = '0b8c3e1a-2d4f-4a6b-8c9d-1e2f3a4b5c6d';
const CHECK = 'entra_admin_users_mfa_enabled';

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let monkey: Agent;
let baseUrl: string;
const drainQueue = () => owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);

// Microsoft Entra de mentira: contesta el endpoint de token. Guarda lo que recibió para comprobar que nunca sale un secreto.
type Entra = { status?: number; roles?: string[]; tid?: string };
const entra = (over: Entra = {}) => {
  const calls: { url: string; body: URLSearchParams }[] = [];
  const claims = { tid: over.tid ?? TENANT, roles: over.roles ?? [...MICROSOFT_365_REQUIRED_ROLES, 'Directory.Read.All'] };
  const jwt = `${Buffer.from('{"alg":"RS256"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.firma`;
  const http = ((url: string, init: RequestInit) => {
    calls.push({ url, body: new URLSearchParams(String(init.body)) });
    const status = over.status ?? 200;
    return Promise.resolve(new Response(JSON.stringify(status === 200 ? { access_token: jwt, expires_in: 3599 } : { error: 'invalid_client' }), { status }));
  }) as unknown as typeof fetch;
  return { http, calls };
};

// El broker REAL con Entra simulado; apunta el trabajo que recibió.
class RecordingBroker extends CredentialBroker {
  jobs: RunnerJob[] = [];
  private readonly real: Microsoft365CredentialBroker;
  constructor(http: typeof fetch, monkeyApp: MonkeyMicrosoftApp | null = null) {
    super();
    this.real = new Microsoft365CredentialBroker(http, () => new Date(), monkeyApp);
  }
  obtain(job: RunnerJob): Promise<TemporaryCredentials> {
    this.jobs.push(job);
    return this.real.obtain(job);
  }
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

async function serve(kind: 'validation' | 'assessment', broker: CredentialBroker, engine: ScanEngine = new NoEngine(), attempts = 40): Promise<string> {
  const lane = new RunNextExecution(new HttpRunnerApi(baseUrl, RUNNER_TOKEN), broker, engine, new SilentLog(), kind);
  for (let i = 0; i < attempts; i++) {
    const r = await lane.execute();
    if (r !== 'idle') return r;
    await new Promise((res) => setTimeout(res, 150));
  }
  return 'idle';
}

const body = (over: Record<string, unknown> = {}) => ({
  name: `m365-${RUN}-${Math.random().toString(36).slice(2, 6)}`, connection_category: 'ac_01', connection_method: 'app_certificate', platform: 'microsoft_365',
  external_account_id: TENANT, service_ids: [a.serviceId], ...over,
});
const create = (t: Tenant, b0: Record<string, unknown>) => t.agent.post('/v1/assets').send(b0);
const setClient = (t: Tenant, id: string, client_id: unknown = CLIENT) => t.agent.patch(`/v1/assets/${id}/connection`).send({ client_id });
const validate = (t: Tenant, id: string) => t.agent.post(`/v1/assets/${id}/validate`);
const finding = (status: string) => ({ status_code: status, severity: 'High', status_detail: 'texto crudo', metadata: { event_code: CHECK, product: { version: '5.44.0' } }, cloud: { region: 'global' }, resources: [{ uid: TENANT, type: 'NotDefined', name: 'tenant' }] });

beforeAll(async () => {
  app = await bootApp({ PROBE_MODE: 'runner', VALIDATION_WAIT_SECONDS: '3', M365_APP_CLIENT_ID: CLIENT, M365_CALLBACK_BASE_URL: 'https://api.monkey.test/v1', PLATFORM_APP_URL: 'https://app.monkey.test' });
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  ({ a, b, monkey } = await dosEmpresas(app));
  await owner(
    `insert into catalog.checks (id, platform, policy_id, check_id, title_en, condition, remediation, origin, mapping_provenance, mapping_confidence)
     values (gen_random_uuid(), 'microsoft_365', 'cloud_configuration', $1, 't', 'c', 'r', 'engine_native', 'test', 'low') on conflict do nothing`,
    [CHECK],
  );
});
afterAll(async () => {
  await drainQueue();
  await app?.close();
});
beforeEach(drainQueue);

describe('Alta de un tenant de Microsoft 365 (variante E)', () => {
  it('Monkey genera el certificado y entrega el comando de alta con el certificado PÚBLICO dentro; nada secreto sale', async () => {
    const res = await create(a, body()).expect(201);
    const d = res.body.data;
    expect(d).toMatchObject({ platform: 'microsoft_365', type: 'cloud_service', external_account_id: TENANT, provisioning: { connection_method: 'app_certificate', regions: [], connection_status: 'pending', is_active: false } });
    const s = d.connection_setup;
    expect(s).toMatchObject({ method: 'app_certificate', tenant_id: TENANT, client_id: null, template_path: '/v1/connection-templates/microsoft-365-app' });
    expect(s.certificate.thumbprint).toMatch(/^[0-9A-F]{40}$/);
    const years = (new Date(s.certificate.expires_at).getTime() - Date.now()) / (365 * 24 * 3600_000);
    expect(years).toBeGreaterThan(1.9);
    expect(years).toBeLessThan(2.1);
    expect(s.setup_command).toMatch(new RegExp(`^bash -s -- ${TENANT} [A-Za-z0-9+/=]+ <<'MONKEY_SETUP'\\n`));
    expect(s.setup_command.endsWith('\nMONKEY_SETUP\n')).toBe(true);
    expect(s.steps).toHaveLength(3);
    expect(s.steps[0]).toMatch(/Cloud Shell/);
    // La clave privada y el PFX no salen JAMÁS, ni siquiera dentro del comando; el motor no se nombra.
    const everything = JSON.stringify(res.body);
    expect(everything).not.toMatch(/PRIVATE KEY|private_key|pfx|encrypted|prowler|wazuh/i);
    expect(Buffer.from(s.setup_command.split('\n')[0].split(' ')[4], 'base64').toString('utf8')).toMatch(/^-----BEGIN CERTIFICATE-----/);
  });

  it('en la base: el certificado público y la huella a la vista; la clave privada y el PFX, cifrados', async () => {
    const res = await create(a, body()).expect(201);
    const id = res.body.data.id as string;
    const [row] = await owner<{ certificate_pem: string; certificate_thumbprint: string; certificate_expires_at: Date; app_client_id: string | null; encrypted_credentials: string }>(
      'select certificate_pem, certificate_thumbprint, certificate_expires_at, app_client_id, encrypted_credentials from tenant.asset_provisionings where asset_id = $1',
      [id],
    );
    expect(row.certificate_pem).toMatch(/^-----BEGIN CERTIFICATE-----/);
    expect(row.certificate_thumbprint).toBe(res.body.data.connection_setup.certificate.thumbprint);
    expect(row.app_client_id).toBeNull();
    expect(row.encrypted_credentials).toMatch(/^v1\./);
    expect(row.encrypted_credentials).not.toMatch(/PRIVATE|BEGIN/);
    expect(row.certificate_pem).not.toMatch(/PRIVATE/);
  });

  it('cada conexión recibe su propio certificado (nunca se comparte entre clientes ni entre activos)', async () => {
    const one = (await create(a, body()).expect(201)).body.data.connection_setup;
    const two = (await create(b, body({ service_ids: [b.serviceId] })).expect(201)).body.data.connection_setup;
    expect(one.certificate.thumbprint).not.toBe(two.certificate.thumbprint);
  });

  it('el detalle conserva el comando y el idioma de la petición traduce los pasos', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    const es = (await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data.connection_setup;
    expect(es.setup_command).toContain('MONKEY_SETUP');
    const en = (await a.agent.get(`/v1/assets/${id}`).set('Accept-Language', 'en').expect(200)).body.data.connection_setup;
    expect(en.steps[0]).toMatch(/Open Azure Cloud Shell/);
  });

  it('el tenant se guarda en minúsculas', async () => {
    const res = await create(a, body({ external_account_id: TENANT.toUpperCase() })).expect(201);
    expect(res.body.data.external_account_id).toBe(TENANT);
  });

  it.each([
    ['con regiones', { regions: ['us-east-1'] }, 'regions', 'field.not_allowed'],
    ['con credenciales', { credentials: { access_key_id: 'AKIA' } }, 'credentials', 'field.not_allowed'],
    ['sin tenant', { external_account_id: null }, 'external_account_id', 'required'],
    ['con un número de cuenta de AWS como tenant', { external_account_id: '123456789012' }, 'external_account_id', 'invalid'],
    ['con un dominio en vez del ID', { external_account_id: 'contoso.onmicrosoft.com' }, 'external_account_id', 'invalid'],
    ['con un tenant que intenta inyectar', { external_account_id: `${TENANT.slice(0, 35)};` }, 'external_account_id', 'invalid'],
    ['con un tenant larguísimo', { external_account_id: `${TENANT}; rm -rf /` }, 'external_account_id', 'string.max'],
  ])('rechaza %s (422)', async (_n, over, field, code) => {
    const res = await create(a, body(over)).expect(422);
    expect(res.body.error.fields).toEqual(expect.arrayContaining([expect.objectContaining({ field, code })]));
  });

  it('el canal solo es de Microsoft 365: con otra plataforma es 409, y Microsoft 365 no admite los otros canales', async () => {
    expect((await create(a, body({ platform: 'aws', regions: ['us-east-1'], external_account_id: '123456789012' })).expect(409)).body.error.code).toBe('CONNECTION_METHOD_NOT_APPLICABLE');
    expect((await create(a, body({ connection_method: 'readonly_role' })).expect(409)).body.error.code).toBe('CONNECTION_METHOD_NOT_APPLICABLE');
  });

  it('en el catálogo Microsoft 365 muestra su canal, y el asistente recibe la opción con su etiqueta', async () => {
    const caps = (await a.agent.get('/v1/catalogs/automated-capabilities').expect(200)).body.data.items as { catalog_code: string; platforms: { code: string; availability: string; connection_methods: string[] }[] }[];
    expect(caps.find((c) => c.catalog_code === 'ac_01')!.platforms.find((p) => p.code === 'microsoft_365')).toMatchObject({ availability: 'available', connection_methods: ['admin_consent', 'app_certificate'] });
    expect((await a.agent.get('/v1/catalogs/connection_method').expect(200)).body.data.items.find((m: { value: string }) => m.value === 'admin_consent')).toMatchObject({ availability: 'available', tags: ['recommended', 'fastest'] });
    const methods = (await a.agent.get('/v1/catalogs/connection_method').expect(200)).body.data.items as { value: string; label: string; description: string; availability: string; tags: string[] }[];
    expect(methods.find((m) => m.value === 'app_certificate')).toMatchObject({ availability: 'available', tags: ['advanced'], label: expect.stringMatching(/certificado/i) });
  });
});

describe('El cliente entrega el ID de la aplicación', () => {
  it('lo guarda (en minúsculas), la conexión sigue «pendiente» y el comando se conserva', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    const res = await setClient(a, id, CLIENT.toUpperCase()).expect(200);
    expect(res.body.data.connection_setup).toMatchObject({ method: 'app_certificate', client_id: CLIENT });
    expect(res.body.data.connection_setup.setup_command).toContain('MONKEY_SETUP');
    expect(res.body.data.provisioning.connection_status).toBe('pending');
    const [row] = await owner<{ c: string }>('select app_client_id c from tenant.asset_provisionings where asset_id = $1', [id]);
    expect(row.c).toBe(CLIENT);
  });

  it.each([['con letras raras', 'no-es-un-guid', 'invalid'], ['de 36 caracteres que no son un GUID', 'z'.repeat(36), 'invalid'], ['demasiado largo', 'a'.repeat(37), 'string.max']])('rechaza un ID %s', async (_n, value, code) => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    expect((await setClient(a, id, value).expect(422)).body.error.fields[0]).toMatchObject({ field: 'client_id', code });
  });

  it('exige el ID y no admite role_arn ni project_number en este canal', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    expect((await a.agent.patch(`/v1/assets/${id}/connection`).send({}).expect(422)).body.error.fields[0]).toMatchObject({ field: 'client_id', code: 'required' });
    expect((await a.agent.patch(`/v1/assets/${id}/connection`).send({ role_arn: 'arn:aws:iam::123456789012:role/MonkeyReadOnly' }).expect(422)).body.error.fields[0]).toMatchObject({ field: 'role_arn', code: 'field.not_allowed' });
    expect((await a.agent.patch(`/v1/assets/${id}/connection`).send({ project_number: '407295138461' }).expect(422)).body.error.fields[0]).toMatchObject({ field: 'project_number', code: 'field.not_allowed' });
  });

  it('un activo de AWS no admite el ID de una aplicación', async () => {
    const aws = (await create(a, { name: `aws-${RUN}-m365`, connection_category: 'ac_01', connection_method: 'readonly_role', platform: 'aws', external_account_id: '123456789012', regions: ['us-east-1'], service_ids: [a.serviceId] }).expect(201)).body.data.id;
    expect((await setClient(a, aws).expect(422)).body.error.fields[0]).toMatchObject({ field: 'client_id', code: 'field.not_allowed' });
  });

  it('una empresa ajena ve 404', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    await setClient(b, id).expect(404);
  });
});

describe('Editar el tenant de la conexión', () => {
  it('un tenant nuevo vuelve la conexión a «pendiente» y borra el ID de la aplicación anterior (la aplicación era de otro tenant); el certificado se conserva', async () => {
    const created = (await create(a, body()).expect(201)).body.data;
    await setClient(a, created.id).expect(200);
    const other = '11111111-2222-4333-8444-555555555555';
    const res = await a.agent.patch(`/v1/assets/${created.id}`).send({ external_account_id: other }).expect(200);
    expect(res.body.data.external_account_id).toBe(other);
    expect(res.body.data.provisioning.connection_status).toBe('pending');
    expect(res.body.data.connection_setup).toMatchObject({ tenant_id: other, client_id: null });
    expect(res.body.data.connection_setup.certificate.thumbprint).toBe(created.connection_setup.certificate.thumbprint);
  });

  it('no admite regiones, rol ni llaves, y valida el tenant', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    expect((await a.agent.patch(`/v1/assets/${id}`).send({ regions: ['us-east-1'] }).expect(422)).body.error.fields[0]).toMatchObject({ field: 'regions', code: 'field.not_allowed' });
    expect((await a.agent.patch(`/v1/assets/${id}`).send({ external_account_id: 'no-es-un-guid' }).expect(422)).body.error.fields[0]).toMatchObject({ field: 'external_account_id', code: 'invalid' });
  });
});

describe('El script de alta', () => {
  it('se descarga tras la sesión, no lleva datos de ningún cliente y no nombra al motor', async () => {
    const res = await a.agent.get('/v1/connection-templates/microsoft-365-app').expect(200);
    expect(res.headers['content-type']).toMatch(/text\/x-shellscript/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename="monkey-m365-setup\.sh"/);
    expect(res.text).toContain('Directory.Read.All');
    expect(res.text).not.toContain(TENANT);
    expect(res.text).not.toMatch(/prowler|wazuh/i);
  });
  it('un rol que no es admin_empresa recibe 403', async () => {
    await monkey.get('/v1/connection-templates/microsoft-365-app').expect(403);
  });
  it('exige sesión', async () => {
    await request(app.getHttpServer()).get('/v1/connection-templates/microsoft-365-app').expect(401);
  });
});

describe('Validar y evaluar un tenant de Microsoft 365 con el trabajador real', () => {
  /** Valida con el broker real; devuelve el id, ya con el ID de la aplicación entregado y la conexión validada. */
  async function validatedTenant(): Promise<string> {
    const id = (await create(a, body()).expect(201)).body.data.id as string;
    await setClient(a, id).expect(200);
    const [res] = await Promise.all([validate(a, id), serve('validation', new RecordingBroker(entra().http))]);
    expect(res.status).toBe(200);
    return id;
  }

  it('el trabajo trae la aplicación y el certificado DESCIFRADOS; el broker firma con ellos y Entra recibe solo la aserción', async () => {
    const created = (await create(a, body()).expect(201)).body.data;
    await setClient(a, created.id).expect(200);
    const sim = entra();
    const broker = new RecordingBroker(sim.http);
    const [res] = await Promise.all([validate(a, created.id), serve('validation', broker)]);
    expect(res.status).toBe(200);
    expect(res.body.data.connection_status).toBe('validated');

    const job = broker.jobs[0];
    expect(job).toMatchObject({ platform: 'microsoft_365', kind: 'validation', tenantId: a.companyId, externalAccountId: TENANT, regions: [] });
    expect(job.connection).toMatchObject({ method: 'app_certificate', clientId: CLIENT, certificateThumbprint: created.connection_setup.certificate.thumbprint });
    // El material secreto llegó completo al trabajador (por la red interna).
    if (job.connection.method !== 'app_certificate') throw new Error('método inesperado');
    expect(job.connection.privateKeyPem).toMatch(/^-----BEGIN PRIVATE KEY-----/);
    expect(job.connection).not.toHaveProperty('certificatePfx');
    expect(job.connection.privateKeyPem).toContain('PRIVATE KEY');
    // A Entra solo le llega la aserción firmada y el tenant en la URL.
    expect(sim.calls).toHaveLength(1);
    expect(sim.calls[0].url).toBe(`https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`);
    expect(sim.calls[0].body.get('client_secret')).toBeNull();
    expect(sim.calls[0].body.toString()).not.toMatch(/PRIVATE/);
    // Microsoft 365 no descubre recursos (como GCP, DT-102): ni «cuenta vacía» ni inventario.
    const [p] = await owner<{ inventory_at: string | null }>('select inventory_at from tenant.asset_provisionings where asset_id = $1', [created.id]);
    expect(p.inventory_at).toBeNull();
    // Y la respuesta al cliente no lleva ningún secreto.
    expect(JSON.stringify(res.body)).not.toMatch(/PRIVATE KEY|pfx|private_key/i);
    // El número de comprobaciones sale del catálogo de ESTA plataforma.
    expect(res.body.data.checks_available).toBe(Number((await owner<{ n: string }>(`select count(*) n from catalog.checks where platform = 'microsoft_365' and policy_id = 'cloud_configuration'`))[0].n));
  });

  it('sin el ID de la aplicación la validación se cierra sola: connection.not_configured en el campo client_id', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    const broker = new RecordingBroker(entra().http);
    const [res] = await Promise.all([validate(a, id), serve('validation', broker)]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'client_id', code: 'connection.not_configured' });
    expect(broker.jobs).toHaveLength(0);
  });

  it('que Entra rechace la aplicación o el certificado es del cliente: connection.app_rejected con texto propio, en client_id', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    await setClient(a, id).expect(200);
    const [res] = await Promise.all([validate(a, id), serve('validation', new RecordingBroker(entra({ status: 401 }).http))]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'client_id', code: 'connection.app_rejected', message: expect.stringMatching(/Microsoft/) });
    expect(JSON.stringify(res.body)).not.toMatch(/prowler|wazuh/i);
  });

  it('un token sin los permisos de lectura (falta el consentimiento) es connection.permissions_missing en client_id', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    await setClient(a, id).expect(200);
    const [res] = await Promise.all([validate(a, id), serve('validation', new RecordingBroker(entra({ roles: [] }).http))]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'client_id', code: 'connection.permissions_missing' });
  });

  it('un token de otro tenant es connection.account_mismatch en el ID del tenant', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    await setClient(a, id).expect(200);
    const [res] = await Promise.all([validate(a, id), serve('validation', new RecordingBroker(entra({ tid: '11111111-2222-4333-8444-555555555555' }).http))]);
    expect(res.status).toBe(422);
    expect(res.body.error.fields[0]).toMatchObject({ field: 'external_account_id', code: 'connection.account_mismatch' });
  });

  it('una caída de Microsoft NO se le achaca al cliente: la conexión no cambia y la respuesta es de servicio no disponible', async () => {
    const id = (await create(a, body()).expect(201)).body.data.id;
    await setClient(a, id).expect(200);
    const [res] = await Promise.all([validate(a, id), serve('validation', new RecordingBroker(entra({ status: 503 }).http))]);
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect((await a.agent.get(`/v1/assets/${id}`).expect(200)).body.data.provisioning.connection_status).toBe('pending');
  });

  it('evaluar ahora: el motor recibe el tenant y el certificado (sin regiones) y los resultados se guardan con el catálogo de Microsoft 365', async () => {
    const id = await validatedTenant();
    const executionId = (await a.agent.post(`/v1/assets/${id}/executions`).expect(202)).body.data.id as string;
    const engine = new FakeEngine(() => [finding('FAIL')]);
    const outcome = await serve('assessment', new RecordingBroker(entra().http), engine);
    expect(outcome).toBe('completed');
    expect(engine.inputs[0]).toMatchObject({ executionId, accountId: TENANT, regions: [], credentials: { provider: 'microsoft_365', tenantId: TENANT, clientId: CLIENT } });
    const rows = await owner<{ platform: string; region: string | null; result: string }>('select platform, region, result from tenant.check_results where execution_id = $1', [executionId]);
    expect(rows).toEqual([{ platform: 'microsoft_365', region: 'global', result: 'failed' }]);
    const [ex] = await owner<{ regions: string[] }>('select regions from tenant.executions where id = $1', [executionId]);
    expect(ex.regions).toEqual([]);
  });

  // D159 · El libro: lo que debía medirse y no tiene resultado nunca cuenta como cumplido.
  it('una prueba con un check Directo que no volvió queda pendiente: ni cumple ni «no aplica»', async () => {
    const [t] = await owner<{ test_id: string; code: string; checks: string[] }>(
      `select ct.test_id, t.code, array_agg(c.check_id order by c.check_id) as checks
         from tenant.client_control_tests ct
         join tenant.client_controls cc on cc.id = ct.client_control_id and cc.service_id = $1 and cc.is_active
         join catalog.tests t on t.id = ct.test_id and t.dimension = 'cloud'
         join catalog.test_checks tc on tc.test_id = t.id and tc.role = 'direct'
         join catalog.checks c on c.id = tc.check_id and c.platform = 'microsoft_365'
        group by ct.test_id, t.code order by t.code limit 1`,
      [a.serviceId],
    );
    // Con varios Directos y solo algunos de vuelta, la regla se prueba en `unmeasured.spec.ts`: en el catálogo, la única prueba de nube con Directos de Microsoft 365 tiene uno.
    expect(t.checks.length).toBeGreaterThanOrEqual(1);
    const passed = (check: string) => ({ ...finding('PASS'), metadata: { event_code: check, product: { version: '5.44.0' } } });
    const id = await validatedTenant();
    const resultAfter = async (rows: unknown[]) => {
      await a.agent.post(`/v1/assets/${id}/executions`).expect(202);
      expect(await serve('assessment', new RecordingBroker(entra().http), new FakeEngine(() => rows as never))).toBe('completed');
      const [e] = await owner<{ result: string }>('select result from tenant.evaluations where asset_id = $1 and test_id = $2 order by evaluated_at desc limit 1', [id, t.test_id]);
      return e.result;
    };

    // Vuelve otra verificación que no es de esta prueba, y también el caso sin ninguna fila.
    expect(await resultAfter([finding('PASS')])).toBe('pending');
    expect(await resultAfter([])).toBe('pending');
    expect(await resultAfter(t.checks.map(passed))).toBe('compliant');
    expect(await resultAfter([{ ...passed(t.checks[0]), status_code: 'FAIL' }])).toBe('non_compliant');
  });

  // D160 · El libro vincula checks de Microsoft 365 a pruebas de «Aplicación»: decide la plataforma conectada, no la dimensión. El resultado llega a Cumplimiento.
  it('una prueba de aplicación con Directos de Microsoft 365 la decide la organización conectada, y Cumplimiento la muestra', async () => {
    const [t] = await owner<{ control_id: string; test_id: string; checks: string[] }>(
      `select ct.client_control_id as control_id, ct.test_id, array_agg(c.check_id order by c.check_id) as checks
         from tenant.client_control_tests ct
         join tenant.client_controls cc on cc.id = ct.client_control_id and cc.service_id = $1 and cc.is_active
         join catalog.tests t on t.id = ct.test_id and t.dimension = 'app' and t.automation = 'automated'
         join catalog.test_checks tc on tc.test_id = t.id and tc.role = 'direct'
         join catalog.checks c on c.id = tc.check_id and c.platform = 'microsoft_365'
        group by ct.client_control_id, ct.test_id, t.code order by t.code limit 1`,
      [a.serviceId],
    );
    expect(t.checks.length).toBeGreaterThanOrEqual(1);
    const row = (check: string, status: 'PASS' | 'FAIL') => ({ ...finding(status), metadata: { event_code: check, product: { version: '5.44.0' } } });
    const id = await validatedTenant();
    const after = async (rows: unknown[]) => {
      await a.agent.post(`/v1/assets/${id}/executions`).expect(202);
      expect(await serve('assessment', new RecordingBroker(entra().http), new FakeEngine(() => rows as never))).toBe('completed');
      const [e] = await owner<{ result: string; dimension: string }>('select result, dimension from tenant.evaluations where asset_id = $1 and test_id = $2 order by evaluated_at desc limit 1', [id, t.test_id]);
      const technical = (await a.agent.get(`/v1/controls/${t.control_id}?view=technical`).expect(200)).body.data.technical;
      const test = technical.requirements.flatMap((r: { tests: Array<{ test_id: string }> }) => r.tests).find((x: { test_id: string }) => x.test_id === t.test_id);
      return { evaluation: e, test };
    };

    // El servicio de esta suite ya tiene otras organizaciones evaluadas (las pruebas de arriba): también cuentan como activos de esta prueba, sin resultado decidido.
    const failed = await after(t.checks.map((c, i) => row(c, i === 0 ? 'FAIL' : 'PASS')));
    expect(failed.evaluation).toEqual({ result: 'non_compliant', dimension: 'app' });
    expect(failed.test).toMatchObject({ status: 'exception', checks: { direct_fail: 1, direct_pass: 0 } });
    expect(failed.test.asset_coverage.in_scope).toBeGreaterThanOrEqual(1);
    const detail = (await a.agent.get(`/v1/controls/${t.control_id}`).expect(200)).body.data;
    expect(detail.failing).toEqual(expect.arrayContaining([{ dimension: 'app', affected: expect.arrayContaining([expect.objectContaining({ kind: 'asset', id })]) }]));

    const passed = await after(t.checks.map((c) => row(c, 'PASS')));
    expect(passed.evaluation.result).toBe('compliant');
    expect(passed.test).toMatchObject({ checks: { direct_fail: 0, direct_pass: 1 } });
    expect(passed.test.status).not.toBe('exception');

    // D159 sigue valiendo fuera de la dimensión nube: si un Directo no vuelve, la prueba queda pendiente.
    const missing = await after([]);
    expect(missing.evaluation.result).toBe('pending');
    expect(missing.test).toMatchObject({ status: 'pending', checks: { direct_pass: 0, direct_fail: 0 } });
  });

  // La pantalla deja de pedir el acceso al correo solo cuando una evaluación de verdad lo leyó.
  it('el historial dice si la evaluación leyó el correo, y otra empresa no puede preguntarlo', async () => {
    const mail = 'exchange_organization_mailbox_auditing_enabled';
    await owner(
      `insert into catalog.checks (id, platform, policy_id, check_id, title_en, condition, remediation, origin, mapping_provenance, mapping_confidence)
       values (gen_random_uuid(), 'microsoft_365', 'cloud_configuration', $1, 't', 'c', 'r', 'engine_native', 'test', 'low') on conflict do nothing`,
      [mail],
    );
    const id = await validatedTenant();
    const history = () => a.agent.get(`/v1/assets/${id}/executions?page_size=1`).expect(200).then((r) => r.body.data.items[0]);
    const run = async (rows: unknown[]) => {
      await a.agent.post(`/v1/assets/${id}/executions`).expect(202);
      expect(await serve('assessment', new RecordingBroker(entra().http), new FakeEngine(() => rows as never))).toBe('completed');
    };

    await run([finding('FAIL')]);
    expect(await history()).toMatchObject({ status: 'completed', mail_reviewed: false });

    await run([finding('FAIL'), { ...finding('PASS'), metadata: { event_code: mail, product: { version: '5.44.0' } } }]);
    expect(await history()).toMatchObject({ status: 'completed', mail_reviewed: true });

    await b.agent.get(`/v1/assets/${id}/executions`).expect(404);
  });
});

// D157 · «Conectar Microsoft 365» con el botón, por HTTP real: la vuelta del navegador desde Microsoft (pública), la sesión que termina y el trabajador. Solo la identidad firmada de
// Microsoft no se puede fabricar aquí (se prueba con llaves propias en `microsoft-consent.use-cases.spec.ts`): el recibo del segundo paso lo firma el propio backend.
describe('«Conectar Microsoft 365» con el botón', () => {
  const CONSENT_TENANT = '9a1b2c3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d';
  const buttonBody = (over: object = {}) => ({ ...body(), connection_method: 'admin_consent', external_account_id: undefined, name: `m365-boton-${RUN}-${Math.random().toString(36).slice(2, 7)}`, ...over });
  const callbacks = () => request(app.getHttpServer());
  const params = (location: string) => new URL(location).searchParams;

  it('al declararlo no se pide nada: sin tenant, sin certificado y sin comando; escribir un tenant a mano no se admite', async () => {
    const created = (await create(a, buttonBody()).expect(201)).body.data;
    expect(created.connection_setup).toMatchObject({ method: 'admin_consent', tenant_id: null });
    expect(created.connection_setup.steps).toHaveLength(3);
    expect(JSON.stringify(created)).not.toMatch(/PRIVATE KEY|setup_command|certificate/i);
    await create(a, buttonBody({ external_account_id: CONSENT_TENANT })).expect(422);
    await a.agent.patch(`/v1/assets/${created.id}/connection`).send({ client_id: CLIENT }).expect(409);
    await a.agent.patch(`/v1/assets/${created.id}`).send({ external_account_id: CONSENT_TENANT }).expect(422);
  });

  it('empezar devuelve la dirección de Microsoft; otra empresa ve 404 y sin sesión 401', async () => {
    const id = (await create(a, buttonBody()).expect(201)).body.data.id;
    const started = await a.agent.post(`/v1/assets/${id}/connection/microsoft/start`).expect(200);
    const url = new URL(started.body.data.authorize_url);
    expect(url.origin + url.pathname).toBe('https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize');
    expect(url.searchParams.get('redirect_uri')).toBe('https://api.monkey.test/v1/integrations/microsoft/signin');
    await b.agent.post(`/v1/assets/${id}/connection/microsoft/start`).expect(404);
    await callbacks().post(`/v1/assets/${id}/connection/microsoft/start`).expect(401);
  });

  it('las vueltas de Microsoft son públicas, leen el formulario y, sin un recibo válido, solo regresan a Monkey con el motivo', async () => {
    const signin = await callbacks().post('/v1/integrations/microsoft/signin').set('Origin', 'https://login.microsoftonline.com').type('form').send({ state: 'inventado', id_token: 'x.y.z', session_state: 'extra' }).expect(303);
    expect(signin.headers['location']).toBe('https://app.monkey.test/integraciones/microsoft?m365_error=expired');
    expect(signin.headers['referrer-policy']).toBe('no-referrer');
    const consent = await callbacks().get('/v1/integrations/microsoft/consent').query({ state: 'inventado', tenant: CONSENT_TENANT, admin_consent: 'True' }).expect(303);
    expect(params(consent.headers['location']).get('m365_error')).toBe('expired');
  });

  it('de punta a punta: autorizar, terminar con la misma sesión y comprobar; al trabajador no le llega ninguna credencial', async () => {
    const created = (await create(a, buttonBody()).expect(201)).body.data;
    // Lo que Monkey entregaría tras verificar la identidad firmada (paso 1).
    const [user] = await owner<{ id: string }>(`select user_id as id from audit.audit_logs where tenant_id = $1 and action = 'asset.create' and user_id is not null order by created_at desc limit 1`, [a.companyId]);
    const state = app.get(ConsentTickets).sign({ step: 'consent', companyId: a.companyId, userId: user.id, assetId: created.id, tenantId: CONSENT_TENANT }, 60);
    const back = await callbacks().get('/v1/integrations/microsoft/consent').query({ state, tenant: CONSENT_TENANT, admin_consent: 'True' }).expect(303);
    const handle = params(back.headers['location']).get('m365')!;
    expect(handle).toBeTruthy();

    await b.agent.post(`/v1/assets/${created.id}/connection/microsoft/complete`).send({ handle }).expect(422);
    await a.agent.post(`/v1/assets/${created.id}/connection/microsoft/complete`).send({ handle: `${handle}x` }).expect(422);
    const done = await a.agent.post(`/v1/assets/${created.id}/connection/microsoft/complete`).send({ handle }).expect(200);
    expect(done.body.data.connection_setup).toMatchObject({ method: 'admin_consent', tenant_id: CONSENT_TENANT });
    expect(done.body.data.provisioning.connection_status).toBe('pending');

    const monkeyApp = new ForgeCertificateIssuer().issue('monkey');
    const sim = entra({ tid: CONSENT_TENANT });
    const broker = new RecordingBroker(sim.http, { clientId: CLIENT, certificateThumbprint: monkeyApp.thumbprint, privateKeyPem: monkeyApp.privateKeyPem });
    const [res] = await Promise.all([validate(a, created.id), serve('validation', broker)]);
    expect(res.status).toBe(200);
    expect(res.body.data.connection_status).toBe('validated');
    expect(broker.jobs[0].connection).toEqual({ method: 'admin_consent' });
    expect(broker.jobs[0].externalAccountId).toBe(CONSENT_TENANT);
    expect(sim.calls[0].url).toBe(`https://login.microsoftonline.com/${CONSENT_TENANT}/oauth2/v2.0/token`);
  });

  it('un trabajador sin la aplicación de Monkey no evalúa estas conexiones: lo dice con su razón', async () => {
    const created = (await create(a, buttonBody()).expect(201)).body.data;
    await owner('update tenant.assets set external_account_id = $2 where id = $1', [created.id, CONSENT_TENANT]);
    const [res] = await Promise.all([validate(a, created.id), serve('validation', new RecordingBroker(entra().http))]);
    expect(res.status).toBe(503);
  });
});
