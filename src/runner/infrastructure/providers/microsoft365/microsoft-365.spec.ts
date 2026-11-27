import { createHash, createPublicKey, verify, X509Certificate } from 'node:crypto';
import { ForgeCertificateIssuer } from '../../../../features/technical-control/infrastructure/security/forge-certificate.issuer';
import { FAILURE, RunnerFailure, RunnerJob } from '../../../domain/runner.types';
import { buildClientAssertion } from './microsoft-365-client-assertion';
import { MICROSOFT_365_REQUIRED_ROLES, Microsoft365CredentialBroker } from './microsoft-365-credential-broker';
import { prowlerMicrosoft365Profile } from './microsoft-365-engine-profile';

const TENANT = '3f2a91c4-7b6d-4e0a-9c11-5d8e2f7a0b13';
const CLIENT = '0b8c3e1a-2d4f-4a6b-8c9d-1e2f3a4b5c6d';
const NOW = new Date('2026-11-22T12:00:00.000Z');
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`;

const cert = new ForgeCertificateIssuer().issue('prueba');
const job = (over: Partial<RunnerJob> = {}): RunnerJob => ({
  executionId: 'e', kind: 'validation', tenantId: 't', assetId: 'a', origin: 'manual', platform: 'microsoft_365', externalAccountId: TENANT, regions: [],
  connection: { method: 'app_certificate', clientId: CLIENT, certificateThumbprint: cert.thumbprint, privateKeyPem: cert.privateKeyPem },
  ...over,
});
const jwt = (claims: Record<string, unknown>) => `${Buffer.from('{"alg":"RS256"}').toString('base64url')}.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.firma`;
const reply = (status: number, body: unknown = {}) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
const failure = async (p: Promise<unknown>) => (await p.then(() => null, (e: unknown) => e)) as RunnerFailure;

describe('buildClientAssertion (aserción firmada con el certificado, D154)', () => {
  const assertion = buildClientAssertion({ tokenUrl: TOKEN_URL, clientId: CLIENT, thumbprint: cert.thumbprint, privateKeyPem: cert.privateKeyPem, now: NOW });
  const [h, p, s] = assertion.split('.');
  const json = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as Record<string, unknown>;

  it('lleva la huella del certificado en la cabecera (x5t = SHA-1 en base64url) para que Entra sepa con cuál verificar', () => {
    expect(json(h)).toEqual({ alg: 'RS256', typ: 'JWT', x5t: Buffer.from(cert.thumbprint, 'hex').toString('base64url') });
    expect(createHash('sha1').update(new X509Certificate(cert.certificatePem).raw).digest('hex').toUpperCase()).toBe(cert.thumbprint);
  });

  it('dice quién es (la aplicación), ante quién (el endpoint de token de ESE tenant) y por cuánto tiempo (10 min)', () => {
    const c = json(p);
    expect(c).toMatchObject({ aud: TOKEN_URL, iss: CLIENT, sub: CLIENT, nbf: 1795348800, exp: 1795348800 + 600 });
    expect(c['jti']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('la firma se verifica con el certificado PÚBLICO: es lo que hará Entra con el que el cliente subió', () => {
    const ok = verify('sha256', Buffer.from(`${h}.${p}`), createPublicKey(cert.certificatePem), Buffer.from(s, 'base64url'));
    expect(ok).toBe(true);
    // Y no se verifica con la de otro cliente.
    expect(verify('sha256', Buffer.from(`${h}.${p}`), createPublicKey(new ForgeCertificateIssuer().issue('otro').certificatePem), Buffer.from(s, 'base64url'))).toBe(false);
  });

  it('cada aserción trae un jti distinto', () => {
    const again = buildClientAssertion({ tokenUrl: TOKEN_URL, clientId: CLIENT, thumbprint: cert.thumbprint, privateKeyPem: cert.privateKeyPem, now: NOW });
    expect(json(again.split('.')[1])['jti']).not.toBe(json(p)['jti']);
  });

  it('una huella o una clave que no sirven fallan sin volcar nada de la clave', () => {
    const bad = (over: object) => () => buildClientAssertion({ tokenUrl: TOKEN_URL, clientId: CLIENT, thumbprint: cert.thumbprint, privateKeyPem: cert.privateKeyPem, now: NOW, ...over });
    expect(bad({ thumbprint: 'no-es-una-huella' })).toThrow(RunnerFailure);
    let thrown: RunnerFailure | null = null;
    try {
      bad({ privateKeyPem: '-----BEGIN PRIVATE KEY-----\nSECRETO\n-----END PRIVATE KEY-----' })();
    } catch (e) {
      thrown = e as RunnerFailure;
    }
    expect(thrown?.reason).toBe(FAILURE.engineFailed);
    expect(thrown?.message).not.toContain('SECRETO');
  });
});

describe('Microsoft365CredentialBroker (validar una conexión, D154)', () => {
  const okToken = (over: Record<string, unknown> = {}) => reply(200, { access_token: jwt({ tid: TENANT, roles: [...MICROSOFT_365_REQUIRED_ROLES, 'Policy.Read.All', 'AuditLog.Read.All'], ...over }), expires_in: 3599 });
  const broker = (http: typeof fetch) => new Microsoft365CredentialBroker(http, () => NOW);

  it('camino feliz: pide el token al endpoint de ESE tenant con una aserción firmada (sin secretos) y entrega solo permisos temporales', async () => {
    const calls: { url: string; body: URLSearchParams }[] = [];
    const http = ((url: string, init: RequestInit) => (calls.push({ url, body: new URLSearchParams(String(init.body)) }), okToken())) as unknown as typeof fetch;
    const creds = await broker(http).obtain(job());
    expect(creds).toEqual({ provider: 'microsoft_365', tenantId: TENANT, clientId: CLIENT, tokens: { graph: expect.stringMatching(/\./), exchange: null, teams: null } });
    // Validar solo necesita el directorio. Y en lo que se entrega no hay nada de la llave.
    expect(calls).toHaveLength(1);
    expect(JSON.stringify(creds)).not.toContain('PRIVATE');
    expect(calls[0].url).toBe(TOKEN_URL);
    expect(Object.fromEntries(calls[0].body)).toMatchObject({
      grant_type: 'client_credentials',
      client_id: CLIENT,
      scope: 'https://graph.microsoft.com/.default',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    });
    expect(calls[0].body.get('client_secret')).toBeNull();
    // Lo que sale a la red es la aserción firmada: nunca la clave privada.
    expect(calls[0].body.toString()).not.toContain('PRIVATE');
  });

  it('al evaluar pide además correo y reuniones, cada uno con su propia aserción; si Microsoft no entrega uno, la evaluación sigue sin él', async () => {
    const bodies: URLSearchParams[] = [];
    const http = ((_url: string, init: RequestInit) => {
      const body = new URLSearchParams(String(init.body));
      bodies.push(body);
      return body.get('scope')?.startsWith('48ac35b8') ? reply(400, { error: 'invalid_resource' }) : okToken();
    }) as unknown as typeof fetch;
    const creds = await broker(http).obtain(job({ kind: 'assessment' }));
    expect(creds).toMatchObject({ tokens: { graph: expect.any(String), exchange: expect.any(String), teams: null } });
    expect(bodies.map((b) => b.get('scope'))).toEqual(['https://graph.microsoft.com/.default', 'https://outlook.office365.com/.default', '48ac35b8-9aa8-4d74-927d-1f4a14a0b239/.default']);
    expect(new Set(bodies.map((b) => b.get('client_assertion'))).size).toBe(3);
  });

  it('el tenant se compara sin importar la caja', async () => {
    const http = (() => okToken({ tid: TENANT.toUpperCase() })) as unknown as typeof fetch;
    await expect(broker(http).obtain(job({ externalAccountId: TENANT.toUpperCase() }))).resolves.toMatchObject({ tenantId: TENANT });
  });

  it.each([400, 401, 403, 404])('Entra rechaza la aplicación o el certificado (HTTP %i) → app_rejected: es de la conexión del cliente', async (status) => {
    const e = await failure(broker((() => reply(status, { error: 'invalid_client', error_description: 'AADSTS700027: SECRETO-DE-LA-RESPUESTA' })) as unknown as typeof fetch).obtain(job()));
    expect(e.reason).toBe(FAILURE.appRejected);
    // Nunca se vuelca el cuerpo de la respuesta.
    expect(e.message).not.toContain('SECRETO-DE-LA-RESPUESTA');
  });

  it.each([429, 500, 503])('un fallo de Microsoft (HTTP %i) NO se le achaca al cliente: engine_failed', async (status) => {
    const e = await failure(broker((() => reply(status)) as unknown as typeof fetch).obtain(job()));
    expect(e.reason).toBe(FAILURE.engineFailed);
  });

  it('sin red o con el tiempo agotado: engine_failed, nombrando solo la clase del error', async () => {
    const e = await failure(broker((() => Promise.reject(new TypeError('fetch failed: clave=ABC'))) as unknown as typeof fetch).obtain(job()));
    expect(e.reason).toBe(FAILURE.engineFailed);
    expect(e.message).toContain('TypeError');
    expect(e.message).not.toContain('clave=ABC');
  });

  it('una respuesta sin token, o con un token ilegible, es engine_failed', async () => {
    expect((await failure(broker((() => reply(200, {})) as unknown as typeof fetch).obtain(job()))).reason).toBe(FAILURE.engineFailed);
    expect((await failure(broker((() => reply(200, { access_token: 'no-es-un-jwt' })) as unknown as typeof fetch).obtain(job()))).reason).toBe(FAILURE.engineFailed);
  });

  it('un token de OTRO tenant jamás se evalúa → account_mismatch', async () => {
    const e = await failure(broker((() => okToken({ tid: '11111111-2222-4333-8444-555555555555' })) as unknown as typeof fetch).obtain(job()));
    expect(e.reason).toBe(FAILURE.accountMismatch);
  });

  it.each([
    ['sin ninguno (falta el consentimiento del administrador)', { roles: undefined }],
    ['con una lista vacía', { roles: [] }],
    ['sin Directory.Read.All', { roles: ['Policy.Read.All', 'AuditLog.Read.All'] }],
    ['sin Policy.Read.All', { roles: ['Directory.Read.All', 'AuditLog.Read.All'] }],
    ['sin AuditLog.Read.All', { roles: ['Directory.Read.All', 'Policy.Read.All'] }],
    ['con un formato raro', { roles: 'Directory.Read.All' }],
  ])('un token %s → permissions_missing', async (_n, claims) => {
    const e = await failure(broker((() => okToken(claims)) as unknown as typeof fetch).obtain(job()));
    expect(e.reason).toBe(FAILURE.permissionsMissing);
  });

  describe('con el botón (admin_consent): un rechazo pasajero de Microsoft no tumba la evaluación', () => {
    const app = { clientId: CLIENT, certificateThumbprint: cert.thumbprint, privateKeyPem: cert.privateKeyPem };
    const consentJob = (kind: 'validation' | 'assessment') => job({ kind, connection: { method: 'admin_consent' } });
    const make = (answers: (() => Promise<Response>)[]) => {
      const waits: number[] = [];
      let graph = 0;
      const http = ((_u: string, init: RequestInit) => {
        const scope = new URLSearchParams(String(init.body)).get('scope') ?? '';
        if (!scope.startsWith('https://graph')) return okToken();
        return answers[Math.min(graph++, answers.length - 1)]();
      }) as unknown as typeof fetch;
      return { waits, calls: () => graph, broker: new Microsoft365CredentialBroker(http, () => NOW, app, async (ms) => void waits.push(ms)) };
    };
    const rejected = () => reply(401, { error: 'invalid_client', error_codes: [7000215], error_description: 'SECRETO-DE-LA-RESPUESTA' });

    it('al evaluar reintenta y, si Microsoft ya concede el acceso, sigue', async () => {
      const m = make([rejected, () => okToken({ roles: [] }), () => okToken()]);
      await expect(m.broker.obtain(consentJob('assessment'))).resolves.toMatchObject({ provider: 'microsoft_365' });
      expect(m.waits).toEqual([5_000, 15_000]);
    });

    it('si el rechazo se mantiene, pide la autorización y conserva la causa para el registro, sin el cuerpo de la respuesta', async () => {
      const m = make([rejected]);
      const e = await failure(m.broker.obtain(consentJob('assessment')));
      expect(e.reason).toBe(FAILURE.consentRequired);
      expect(e.message).toContain('token: 401 (AADSTS7000215)');
      expect(e.message).not.toContain('SECRETO-DE-LA-RESPUESTA');
      expect(m.calls()).toBe(3);
      const missing = await failure(make([() => okToken({ roles: ['Directory.Read.All'] })]).broker.obtain(consentJob('assessment')));
      expect(missing.message).toContain('faltan AuditLog.Read.All, Policy.Read.All');
    });

    it('al comprobar no espera aquí (la pantalla ya reintenta), y una caída de Microsoft no se reintenta como falta de autorización', async () => {
      const check = make([rejected]);
      expect((await failure(check.broker.obtain(consentJob('validation')))).reason).toBe(FAILURE.consentRequired);
      expect(check.calls()).toBe(1);
      const down = make([() => reply(503)]);
      expect((await failure(down.broker.obtain(consentJob('assessment')))).reason).toBe(FAILURE.engineFailed);
      expect(down.waits).toEqual([]);
    });
  });

  it('con permisos de más no pasa nada: solo se exigen los necesarios', async () => {
    const http = (() => okToken({ roles: [...MICROSOFT_365_REQUIRED_ROLES, 'ThreatHunting.Read.All', 'Mail.Read'] })) as unknown as typeof fetch;
    await expect(broker(http).obtain(job())).resolves.toMatchObject({ provider: 'microsoft_365' });
  });

  it('otro canal, o un tenant o aplicación que no son GUID, no llegan a pedir un token', async () => {
    let called = 0;
    const http = (() => (called++, okToken())) as unknown as typeof fetch;
    expect((await failure(broker(http).obtain(job({ connection: { method: 'readonly_role', roleArn: 'x', externalId: null } })))).reason).toBe(FAILURE.methodNotSupportedByRunner);
    expect((await failure(broker(http).obtain(job({ externalAccountId: null })))).reason).toBe(FAILURE.methodNotSupportedByRunner);
    expect((await failure(broker(http).obtain(job({ externalAccountId: 'contoso.onmicrosoft.com' })))).reason).toBe(FAILURE.engineFailed);
    expect((await failure(broker(http).obtain(job({ connection: { method: 'app_certificate', clientId: '../x', certificateThumbprint: cert.thumbprint, privateKeyPem: cert.privateKeyPem } })))).reason).toBe(FAILURE.engineFailed);
    expect(called).toBe(0);
  });
});

describe('prowlerMicrosoft365Profile (cómo se invoca el motor, D154)', () => {
  const profile = prowlerMicrosoft365Profile('motor@sha256:abc');
  const credentials = { provider: 'microsoft_365' as const, tenantId: TENANT, clientId: CLIENT, tokens: { graph: 'aa.bb.cc', exchange: 'dd.ee.ff' as string | null, teams: null as string | null } };
  const input = (c: Parameters<typeof profile.env>[0]['credentials'] = credentials) => ({ executionId: 'e', accountId: TENANT, regions: [], credentials: c });

  it('arranca el motor con nuestro entry, y los permisos NO van en la línea de comandos ni en el archivo que se copia', () => {
    const cmd = profile.command(input());
    expect(cmd.slice(0, 2)).toEqual(['m365', '--certificate-auth']);
    expect(cmd.join(' ')).not.toContain('aa.bb.cc');
    expect(profile.entrypoint).toEqual(['/home/prowler/.venv/bin/python', '/tmp/monkey-entry.py']);
    expect(profile.files?.map((f) => f.path)).toEqual(['/tmp/monkey-entry.py']);
    expect(profile.files?.[0].content).not.toContain('aa.bb.cc');
    expect(profile.reportsProgress).toBe(true);
    expect(cmd).toContain('--ignore-exit-code-3');
    expect(cmd).not.toContain('--region'); // sin regiones: se evalúa el tenant completo
  });

  it('al contenedor solo le llegan la aplicación, el tenant y los permisos temporales que haya: ni certificado ni llave (SEG-46)', () => {
    const env = profile.env(input());
    expect(env).toEqual([`AZURE_CLIENT_ID=${CLIENT}`, `AZURE_TENANT_ID=${TENANT}`, 'MONKEY_TOKEN_GRAPH=aa.bb.cc', 'MONKEY_TOKEN_EXCHANGE=dd.ee.ff']);
    expect(env.join('\n')).not.toMatch(/CERTIFICATE|PRIVATE/);
  });

  it('nada raro llega al entorno del motor', () => {
    const bad = (over: Partial<typeof credentials>) => () => profile.env(input({ ...credentials, ...over }));
    expect(bad({ tenantId: `${TENANT}\nX=1` })).toThrow(RunnerFailure);
    expect(bad({ clientId: 'no-guid' })).toThrow(RunnerFailure);
    expect(bad({ tokens: { graph: 'aa.bb.cc\nAZURE_CLIENT_SECRET=x', exchange: null, teams: null } })).toThrow(RunnerFailure);
    expect(bad({ tokens: { graph: 'aa.bb.cc', exchange: "'; rm -rf /", teams: null } })).toThrow(RunnerFailure);
    expect(() => profile.env(input({ provider: 'gcp', accessToken: 't', expiresAt: NOW }))).toThrow(RunnerFailure);
  });
});
