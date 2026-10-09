import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, owner, RUN, RUNNER_TOKEN } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// D57, SEG-47: la API real. Lo del cliente va por cookie y rol; lo del trabajador, por un token de servicio, por la red interna y fuera del
// prefijo público. Cada prueba sale por HTTP, como lo haría el frontend o el trabajador.
const ACCOUNT = '123456789012';
const ROLE_ARN = `arn:aws:iam::${ACCOUNT}:role/MonkeyReadOnly`;
const CHECKS = [
  { id: 'iam_root_mfa_enabled', test: 'T-CLD-001' },
  { id: 'ec2_securitygroup_allow_ingress_from_internet_to_tcp_port_22', test: 'T-CLD-002' },
  { id: 'cloudtrail_multi_region_enabled', test: 'T-CLD-003' },
];

let app: INestApplication;
let a: Tenant;
let b: Tenant;
let assetId: string;
const http = () => request(app.getHttpServer());
const runner = () => ({ Authorization: `Bearer ${RUNNER_TOKEN}` });
const drainQueue = () => owner(`update tenant.executions set status = 'failed', finished_at = now(), failure_reason = 'test.cleanup' where status in ('queued', 'running')`);

const row = (checkId: string, over: { status?: string; severity?: string; uid?: string; type?: string } = {}) => ({
  status_code: over.status ?? 'PASS',
  severity: over.severity ?? 'Medium',
  status_detail: 'Texto crudo del motor que NO debe salir al cliente',
  metadata: { event_code: checkId },
  cloud: { region: 'us-east-1' },
  resources: [{ uid: over.uid ?? `arn:aws:test:us-east-1:${ACCOUNT}:${checkId}`, type: over.type ?? 'Other', name: checkId }],
});
const findings = () => [
  row(CHECKS[0].id),
  row(CHECKS[1].id, { status: 'FAIL', severity: 'High', uid: `arn:aws:ec2:us-east-1:${ACCOUNT}:security-group/sg-api`, type: 'AwsEc2SecurityGroup' }),
  row(CHECKS[2].id, { status: 'MANUAL' }),
];

beforeAll(async () => {
  app = await bootApp();
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
  const created = await a.agent.post('/v1/assets').send({ name: `aws-api-${RUN}`, connection_category: 'ac_01', platform: 'AWS', service_ids: [a.serviceId], credentials: { account_id: ACCOUNT, read_only_role: ROLE_ARN, external_id: `mk-${RUN}` } });
  assetId = created.body.data.id;
  await a.agent.post(`/v1/assets/${assetId}/validate`).expect(200);
  await owner('update tenant.asset_provisionings set regions = array[$2] where asset_id = $1', [assetId, 'us-east-1']);
});
afterAll(async () => {
  await drainQueue();
  await app?.close();
});
beforeEach(drainQueue);

describe('El cliente: evaluar ahora, historial y estado de preparación', () => {
  it('sin sesión no hay nada (401) y una empresa ajena ve 404, no 403', async () => {
    await http().post(`/v1/assets/${assetId}/executions`).expect(401);
    await b.agent.post(`/v1/assets/${assetId}/executions`).expect(404);
    await b.agent.get(`/v1/assets/${assetId}/executions`).expect(404);
    await b.agent.get(`/v1/assets/${assetId}/readiness`).expect(404);
    await a.agent.get('/v1/assets/no-es-un-uuid/readiness').expect(404);
  });

  it('«evaluar ahora» responde 202 en cola y no deja abrir una segunda (409)', async () => {
    const res = await a.agent.post(`/v1/assets/${assetId}/executions`).expect(202);
    expect(res.body).toMatchObject({ statusCode: 202, message: expect.any(String), data: { status: 'queued', origin: 'manual', started_at: null } });
    const dup = await a.agent.post(`/v1/assets/${assetId}/executions`).expect(409);
    expect(dup.body.error.code).toBe('EXECUTION_IN_PROGRESS');
  });

  it('un activo sin validar no se puede evaluar (409 ASSET_NOT_VALIDATED)', async () => {
    const r = await a.agent.post('/v1/assets').send({ name: `aws-nv-${RUN}`, connection_category: 'ac_01', platform: 'AWS', service_ids: [a.serviceId], credentials: { account_id: ACCOUNT, read_only_role: ROLE_ARN } });
    const res = await a.agent.post(`/v1/assets/${r.body.data.id}/executions`).expect(409);
    expect(res.body.error.code).toBe('ASSET_NOT_VALIDATED');
  });

  it('el historial pagina y no trae texto del motor', async () => {
    await a.agent.post(`/v1/assets/${assetId}/executions`).expect(202);
    const res = await a.agent.get(`/v1/assets/${assetId}/executions?page=1&page_size=2`).expect(200);
    expect(res.body.data).toMatchObject({ page: 1, page_size: 2 });
    expect(res.body.data.items[0]).toMatchObject({ status: 'queued', origin: 'manual', started_at: null, failure_reason: null });
    await a.agent.get(`/v1/assets/${assetId}/executions?page_size=1000`).expect(422);
  });

  it('antes de la primera corrida el estado es «Sin medir», no un fallo ni un 404', async () => {
    const fresh = await a.agent.post('/v1/assets').send({ name: `aws-fresh-${RUN}`, connection_category: 'ac_01', platform: 'AWS', service_ids: [a.serviceId], credentials: { account_id: ACCOUNT, read_only_role: ROLE_ARN } });
    const res = await a.agent.get(`/v1/assets/${fresh.body.data.id}/readiness`).expect(200);
    expect(res.body.data).toMatchObject({ readiness: 'not_measured', measured_at: null, coverage: { measured: 0, expected: 0 }, includes_proposed_mappings: false });
    expect(res.body.data.areas.map((x: { area: string }) => x.area).sort()).toEqual(['data_network', 'identity_access', 'logging_backup']);
  });
});

describe('El trabajador: API interna', () => {
  it('sin token o con uno equivocado, 401; con la cookie de un cliente tampoco entra', async () => {
    await http().post('/internal/runner/claim').expect(401);
    await http().post('/internal/runner/claim').set('Authorization', 'Bearer otro-token').expect(401);
    await a.agent.post('/internal/runner/claim').expect(401);
  });

  it('no existe bajo el prefijo público, y una petición que llegó por el proxy se trata como inexistente', async () => {
    await http().post('/v1/internal/runner/claim').set(runner()).expect(404);
    await http().post('/internal/runner/claim').set(runner()).set('X-Forwarded-For', '203.0.113.9').expect(404);
    await http().post('/internal/runner/claim').set(runner()).set('X-Real-IP', '203.0.113.9').expect(404);
  });

  it('claim sin trabajo pendiente responde 204', async () => {
    await http().post('/internal/runner/claim').set(runner()).expect(204);
  });

  it('flujo completo: evaluar ahora → reclamar → entregar un resultado grande → ver el estado de preparación', async () => {
    const queued = await a.agent.post(`/v1/assets/${assetId}/executions`).expect(202);
    const executionId = queued.body.data.id;

    const claim = await http().post('/internal/runner/claim').set(runner()).expect(200);
    expect(claim.body.data).toMatchObject({
      execution_id: executionId,
      tenant_id: a.companyId,
      asset_id: assetId,
      platform: 'aws',
      external_account_id: ACCOUNT,
      regions: ['us-east-1'],
      connection: { method: 'readonly_role', role_arn: ROLE_ARN, external_id: `mk-${RUN}` },
    });
    expect(JSON.stringify(claim.body)).not.toMatch(/secret|encrypted|password/i);

    // Un escaneo real pesa megas: más de los 100 kb que Express admite por defecto.
    const big = [...findings(), ...Array.from({ length: 900 }, (_, i) => row('iam_root_mfa_enabled', { uid: `arn:aws:test:us-east-1:${ACCOUNT}:relleno-${i}` }))];
    expect(JSON.stringify(big).length).toBeGreaterThan(150_000);
    const body = { tenant_id: a.companyId, engine_version: '5.44.0', regions: ['us-east-1'], started_at: '2026-10-09T10:00:00Z', finished_at: '2026-10-09T10:02:00Z', findings: big };
    const done = await http().post(`/internal/runner/executions/${executionId}/results`).set(runner()).send(body).expect(200);
    expect(done.body.data).toMatchObject({ execution_id: executionId, status: 'completed' });
    await http().post(`/internal/runner/executions/${executionId}/results`).set(runner()).send(body).expect(409);

    const ready = await a.agent.get(`/v1/assets/${assetId}/readiness`).expect(200);
    expect(ready.body.data).toMatchObject({ readiness: 'needs_work', includes_proposed_mappings: true, needs_manual_review: 1 });
    // Lo que ve el cliente por defecto: sin jerga de control, ni códigos de prueba, ni el proveedor, ni el texto crudo del motor.
    // Los códigos de control van en mayúsculas y sin distinguir no sirve: un UUID (minúsculas) puede contener «cc6» por azar (la prueba fallaba de forma intermitente).
    const visible = JSON.stringify(ready.body);
    expect(visible).not.toMatch(/CC\d|T-CLD/);
    expect(visible).not.toMatch(/prowler|wazuh|Texto crudo/i);

    const hist = await a.agent.get(`/v1/assets/${assetId}/executions`).expect(200);
    expect(hist.body.data.items[0]).toMatchObject({ id: executionId, status: 'completed' });
  });

  it('una salida mal formada se rechaza (422) diciendo qué fila, y la ejecución sigue en curso', async () => {
    const executionId = (await a.agent.post(`/v1/assets/${assetId}/executions`).expect(202)).body.data.id;
    await http().post('/internal/runner/claim').set(runner()).expect(200);
    const res = await http()
      .post(`/internal/runner/executions/${executionId}/results`)
      .set(runner())
      .send({ tenant_id: a.companyId, engine_version: '5.44.0', regions: ['us-east-1'], started_at: '2026-10-09T10:00:00Z', finished_at: '2026-10-09T10:02:00Z', findings: [row(CHECKS[0].id), { metadata: {} }] })
      .expect(422);
    expect(res.body.error.code).toBe('ENGINE_OUTPUT_INVALID');
    const [ex] = await owner<{ status: string }>('select status from tenant.executions where id = $1', [executionId]);
    expect(ex.status).toBe('running');
  });

  it('fail cierra la ejecución como fallida con su razón; con el tenant de otra empresa no puede tocarla', async () => {
    const executionId = (await a.agent.post(`/v1/assets/${assetId}/executions`).expect(202)).body.data.id;
    await http().post('/internal/runner/claim').set(runner()).expect(200);
    await http().post(`/internal/runner/executions/${executionId}/fail`).set(runner()).send({ tenant_id: b.companyId, reason: 'connection.role_not_found' }).expect(409);
    await http().post(`/internal/runner/executions/${executionId}/fail`).set(runner()).send({ tenant_id: a.companyId, reason: 'connection.role_not_found' }).expect(200);
    const hist = await a.agent.get(`/v1/assets/${assetId}/executions`).expect(200);
    expect(hist.body.data.items[0]).toMatchObject({ id: executionId, status: 'failed', failure_reason: 'connection.role_not_found', failure_message: expect.stringMatching(/rol/i) });
    await http().post(`/internal/runner/executions/${executionId}/fail`).set(runner()).send({ tenant_id: a.companyId }).expect(422);
  });

  it('la empresa B jamás recibe ni ve la ejecución de A', async () => {
    await a.agent.post(`/v1/assets/${assetId}/executions`).expect(202);
    const claim = await http().post('/internal/runner/claim').set(runner()).expect(200);
    expect(claim.body.data.tenant_id).toBe(a.companyId);
    const hist = await b.agent.get(`/v1/assets/${assetId}/executions`).expect(404);
    expect(JSON.stringify(hist.body)).not.toContain(claim.body.data.execution_id);
  });
});
