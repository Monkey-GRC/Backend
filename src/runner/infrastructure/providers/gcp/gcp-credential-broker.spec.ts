import { AssumeRoleCommand } from '@aws-sdk/client-sts';
import { RunnerJob } from '../../../domain/runner.types';
import { GcpCredentialBroker } from './gcp-credential-broker';

const ROLE = 'arn:aws:iam::210987654321:role/monkey-gcp-federation';
const job = (over: Partial<RunnerJob> = {}): RunnerJob => ({
  executionId: 'abcdef12-0000', kind: 'validation', tenantId: 't', assetId: 'a', origin: 'manual', platform: 'gcp', externalAccountId: 'acme-prod-421905', regions: [],
  connection: { method: 'identity_federation', externalId: 'mk-3f9a1c7e2b', projectNumber: '407295138461' }, ...over,
});
const AUDIENCE = '//iam.googleapis.com/projects/407295138461/locations/global/workloadIdentityPools/monkey-access/providers/monkey-aws';
const awsSession = { Credentials: { AccessKeyId: 'ASIA', SecretAccessKey: 'secreto-aws', SessionToken: 'tok-aws' } };
const named = (name: string) => Object.assign(new Error('x'), { name });
const json = (status: number, body: unknown = {}) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

type Call = { url: string; init: RequestInit };
// Un Google de mentira: cada URL tiene su respuesta, y todo lo enviado queda anotado.
function fakeGoogle(over: { sts?: () => Response | Promise<Response>; iam?: () => Response | Promise<Response>; project?: () => Response | Promise<Response> } = {}) {
  const calls: Call[] = [];
  const http = ((url: string, init: RequestInit) => {
    calls.push({ url, init });
    if (url.startsWith('https://sts.googleapis.com/v1/token')) return Promise.resolve((over.sts ?? (() => json(200, { access_token: 'federado-xyz' })))());
    if (url.includes(':generateAccessToken')) return Promise.resolve((over.iam ?? (() => json(200, { accessToken: 'acceso-xyz', expireTime: '2026-11-12T11:00:00Z' })))());
    if (url.startsWith('https://cloudresourcemanager.googleapis.com/v1/projects/')) return Promise.resolve((over.project ?? (() => json(200, { projectId: 'acme-prod-421905', projectNumber: '407295138461' })))());
    return Promise.reject(new Error(`URL inesperada ${url}`));
  }) as unknown as typeof fetch;
  return { http, calls };
}
const sts = (sent: unknown[] = []) => ({ send: (c: unknown) => { sent.push(c); return Promise.resolve(awsSession); } }) as never;
const broker = (http: typeof fetch, base = sts()) => new GcpCredentialBroker(ROLE, base, http, () => new Date('2026-11-12T10:00:00Z'));

describe('GcpCredentialBroker', () => {
  it('asume el rol de Monkey con el external_id como nombre de sesión, intercambia y entrega un token de 1 h', async () => {
    const sent: unknown[] = [];
    const g = fakeGoogle();
    const out = await broker(g.http, sts(sent)).obtain(job());
    expect(out).toEqual({ provider: 'gcp', accessToken: 'acceso-xyz', expiresAt: new Date('2026-11-12T11:00:00Z') });
    expect((sent[0] as AssumeRoleCommand).input).toMatchObject({ RoleArn: ROLE, RoleSessionName: 'mk-3f9a1c7e2b', DurationSeconds: 3600 });
    expect(g.calls.map((c) => c.url.split('?')[0])).toEqual([
      'https://sts.googleapis.com/v1/token',
      'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/monkey-reader%40acme-prod-421905.iam.gserviceaccount.com:generateAccessToken',
      'https://cloudresourcemanager.googleapis.com/v1/projects/acme-prod-421905',
    ]);
  });

  it('el intercambio de STS lleva la audiencia del proyecto y un subject token de AWS bien formado', async () => {
    const g = fakeGoogle();
    await broker(g.http).obtain(job());
    const form = new URLSearchParams(g.calls[0].init.body as string);
    expect(Object.fromEntries(form)).toMatchObject({
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange', audience: AUDIENCE, scope: 'https://www.googleapis.com/auth/cloud-platform',
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token', subject_token_type: 'urn:ietf:params:aws:token-type:aws4_request',
    });
    const req = JSON.parse(decodeURIComponent(form.get('subject_token')!)) as { url: string; method: string; headers: { key: string; value: string }[] };
    expect(req).toMatchObject({ method: 'POST', url: 'https://sts.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15' });
    const h = Object.fromEntries(req.headers.map((x) => [x.key, x.value]));
    expect(h['x-goog-cloud-target-resource']).toBe(AUDIENCE);
    expect(h['x-amz-security-token']).toBe('tok-aws');
    expect(h['Authorization']).toContain('SignedHeaders=host;x-amz-date;x-amz-security-token;x-goog-cloud-target-resource');
  });

  it('generateAccessToken pide la cuenta monkey-reader del proyecto, 3600 s y el token federado', async () => {
    const g = fakeGoogle();
    await broker(g.http).obtain(job());
    expect((g.calls[1].init.headers as Record<string, string>)['Authorization']).toBe('Bearer federado-xyz');
    expect(JSON.parse(g.calls[1].init.body as string)).toEqual({ scope: ['https://www.googleapis.com/auth/cloud-platform'], lifetime: '3600s' });
    expect((g.calls[2].init.headers as Record<string, string>)['Authorization']).toBe('Bearer acceso-xyz');
  });

  it.each([400, 401, 403, 404])('STS de Google responde %i → connection.federation_rejected', async (status) => {
    const g = fakeGoogle({ sts: () => json(status, { error: 'invalid_grant', secreto: 'tok-aws' }) });
    const e = await broker(g.http).obtain(job()).catch((x: Error) => x);
    expect(e).toMatchObject({ reason: 'connection.federation_rejected' });
    expect((e as Error).message).not.toMatch(/tok-aws|secreto/);
  });

  it.each([403, 404])('generateAccessToken responde %i → connection.federation_rejected', async (status) => {
    const g = fakeGoogle({ iam: () => json(status) });
    await expect(broker(g.http).obtain(job())).rejects.toMatchObject({ reason: 'connection.federation_rejected' });
  });

  it.each([500, 503, 429])('un %i de Google no es del cliente → execution.engine_failed', async (status) => {
    await expect(broker(fakeGoogle({ sts: () => json(status) }).http).obtain(job())).rejects.toMatchObject({ reason: 'execution.engine_failed' });
    await expect(broker(fakeGoogle({ iam: () => json(status) }).http).obtain(job())).rejects.toMatchObject({ reason: 'execution.engine_failed' });
  });

  it('un fallo de red → execution.engine_failed', async () => {
    const http = (() => Promise.reject(new TypeError('fetch failed'))) as unknown as typeof fetch;
    await expect(broker(http).obtain(job())).rejects.toMatchObject({ reason: 'execution.engine_failed' });
  });

  it('un proyecto distinto del declarado → connection.account_mismatch', async () => {
    await expect(broker(fakeGoogle({ project: () => json(200, { projectId: 'otro-proyecto-1', projectNumber: '407295138461' }) }).http).obtain(job())).rejects.toMatchObject({ reason: 'connection.account_mismatch' });
    await expect(broker(fakeGoogle({ project: () => json(200, { projectId: 'acme-prod-421905', projectNumber: '111111111111' }) }).http).obtain(job())).rejects.toMatchObject({ reason: 'connection.account_mismatch' });
  });

  it('el rol de Monkey que no se asume es un fallo nuestro, no del cliente', async () => {
    const base = { send: () => Promise.reject(named('AccessDenied')) } as never;
    await expect(broker(fakeGoogle().http, base).obtain(job())).rejects.toMatchObject({ reason: 'execution.engine_failed' });
  });

  it('un trabajo que no es de federación no se atiende', async () => {
    await expect(broker(fakeGoogle().http).obtain(job({ connection: { method: 'readonly_role', roleArn: 'arn:r', externalId: null } }))).rejects.toMatchObject({ reason: 'connection.method_not_supported_by_runner' });
  });

  it('nunca deja un token ni una credencial en el mensaje de error', async () => {
    const g = fakeGoogle({ iam: () => json(403, { message: 'federado-xyz secreto-aws' }) });
    const e = (await broker(g.http).obtain(job()).catch((x: Error) => x)) as Error;
    expect(e.message).not.toMatch(/federado-xyz|secreto-aws|tok-aws/);
  });
});
