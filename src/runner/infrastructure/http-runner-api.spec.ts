import { createServer, IncomingMessage, Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { RunnerApiError, RunnerJob } from '../domain/runner.types';
import { HttpRunnerApi } from './http-runner-api';

// Contra un servidor HTTP real (no un mock de fetch): lo que viaja por el cable es lo que cuenta.
type Seen = { method?: string; url?: string; auth?: string; body: any };
let server: Server;
let base: string;
let seen: Seen[] = [];
let reply: { status: number; body?: unknown } = { status: 204 };

const readBody = (req: IncomingMessage) => new Promise<string>((resolve) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => resolve(b)); });

beforeAll(async () => {
  server = createServer(async (req, res) => {
    const raw = await readBody(req);
    seen.push({ method: req.method, url: req.url, auth: req.headers.authorization, body: raw ? JSON.parse(raw) : null });
    res.statusCode = reply.status;
    if (reply.body !== undefined) { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(reply.body)); } else res.end();
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));
beforeEach(() => { seen = []; reply = { status: 204 }; });

const job: RunnerJob = { executionId: 'e1', kind: 'assessment', tenantId: 't1', assetId: 'a1', origin: 'manual', platform: 'aws', externalAccountId: '1', regions: ['us-east-1'], connection: { method: 'readonly_role', roleArn: 'arn', externalId: 'x' } };
const api = () => new HttpRunnerApi(base, 'secreto-del-trabajador');

describe('HttpRunnerApi', () => {
  it('claim: 204 es «nada pendiente», lleva el token y pide solo el tipo de su carril', async () => {
    expect(await api().claim()).toBeNull();
    expect(seen[0]).toMatchObject({ method: 'POST', url: '/internal/runner/claim', auth: 'Bearer secreto-del-trabajador', body: null });
    await api().claim('validation');
    expect(seen[1].body).toEqual({ kind: 'validation' });
  });

  it('validated: avisa que la conexión se comprobó, con el tenant', async () => {
    reply = { status: 200, body: { data: {} } };
    await api().validated({ ...job, kind: 'validation' });
    expect(seen[0]).toMatchObject({ url: '/internal/runner/executions/e1/validated', body: { tenant_id: 't1' } });
  });

  it('claim: traduce el trabajo de GCP (federación, sin regiones)', async () => {
    reply = { status: 200, body: { data: { execution_id: 'e1', kind: 'validation', tenant_id: 't1', asset_id: 'a1', origin: 'manual', platform: 'gcp', external_account_id: 'acme-prod-421905', regions: [], connection: { method: 'identity_federation', external_id: 'mk-3f9a1c7e2b', project_number: '407295138461' } } } };
    expect(await api().claim()).toEqual({
      executionId: 'e1', kind: 'validation', tenantId: 't1', assetId: 'a1', origin: 'manual', platform: 'gcp', externalAccountId: 'acme-prod-421905', regions: [],
      connection: { method: 'identity_federation', externalId: 'mk-3f9a1c7e2b', projectNumber: '407295138461' },
    });
  });

  it('claim: traduce el trabajo del contrato (rol y llaves)', async () => {
    reply = { status: 200, body: { data: { execution_id: 'e1', kind: 'assessment', tenant_id: 't1', asset_id: 'a1', origin: 'manual', platform: 'aws', external_account_id: '123', regions: ['us-east-1'], connection: { method: 'readonly_role', role_arn: 'arn:r', external_id: 'mk-1' } } } };
    expect(await api().claim()).toEqual({ ...job, externalAccountId: '123', connection: { method: 'readonly_role', roleArn: 'arn:r', externalId: 'mk-1' } });
    reply = { status: 200, body: { data: { execution_id: 'e2', tenant_id: 't1', asset_id: 'a1', origin: 'manual', platform: 'aws', external_account_id: null, regions: ['us-east-1'], connection: { method: 'access_keys', access_key_id: 'AKIA', secret_access_key: 's' } } } };
    expect((await api().claim())!.connection).toEqual({ method: 'access_keys', accessKeyId: 'AKIA', secretAccessKey: 's' });
  });

  it('results: manda el tenant, la versión, las regiones y la salida SIN tocar', async () => {
    reply = { status: 200, body: { data: {} } };
    const findings = [{ raro: { anidado: [1, 2] } }];
    await api().submitResults(job, { engineVersion: '5.44.0', startedAt: new Date('2026-10-09T10:00:00Z'), finishedAt: new Date('2026-10-09T10:02:00Z'), findings }, ['us-east-1']);
    expect(seen[0].url).toBe('/internal/runner/executions/e1/results');
    expect(seen[0].body).toEqual({ tenant_id: 't1', engine_version: '5.44.0', regions: ['us-east-1'], started_at: '2026-10-09T10:00:00.000Z', finished_at: '2026-10-09T10:02:00.000Z', findings });
  });

  it('fail: manda el tenant y la razón', async () => {
    reply = { status: 200, body: { data: {} } };
    await api().fail(job, 'connection.role_not_found');
    expect(seen[0]).toMatchObject({ url: '/internal/runner/executions/e1/fail', body: { tenant_id: 't1', reason: 'connection.role_not_found' } });
  });

  it('un error del backend se vuelve RunnerApiError con su código, sin volcar el cuerpo', async () => {
    reply = { status: 422, body: { error: { code: 'ENGINE_OUTPUT_INVALID', details: 'algo sensible' } } };
    const err = await api().submitResults(job, { engineVersion: 'x', startedAt: new Date(), finishedAt: new Date(), findings: [] }, ['us-east-1']).catch((e) => e);
    expect(err).toBeInstanceOf(RunnerApiError);
    expect(err).toMatchObject({ status: 422, code: 'ENGINE_OUTPUT_INVALID' });
    expect(String(err.message)).not.toContain('sensible');
  });

  it('un 401 (token equivocado) también es un error explícito', async () => {
    reply = { status: 401, body: { error: { code: 'UNAUTHENTICATED' } } };
    await expect(api().claim()).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
  });
});
