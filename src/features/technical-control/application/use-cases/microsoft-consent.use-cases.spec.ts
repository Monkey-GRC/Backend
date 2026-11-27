import { createSign, generateKeyPairSync } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Principal } from '../../../../common/auth/principal';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';
import { HmacConsentTickets, JwksMicrosoftIdentityVerifier } from '../../infrastructure/security/microsoft-consent.adapters';
import { CompleteMicrosoftConsentUseCase, MICROSOFT_APPROVER_ROLES, MicrosoftConsentedUseCase, MicrosoftSignedInUseCase, StartMicrosoftConsentUseCase } from './microsoft-consent.use-cases';

// D157: «Conectar Microsoft 365». Lo que importa probar es que nadie pueda enlazar a su cuenta la organización de OTRO.
const APP = '0b8c3e1a-2d4f-4a6b-8c9d-1e2f3a4b5c6d';
const TENANT = '3f2a91c4-7b6d-4e0a-9c11-5d8e2f7a0b13';
const OTHER_TENANT = '11111111-2222-4333-8444-555555555555';
const GLOBAL_ADMIN = MICROSOFT_APPROVER_ROLES[0];
const NOW = Date.parse('2026-11-26T12:00:00.000Z');

const env: Record<string, string> = { JWT_SECRET: 'secreto-de-prueba-largo-y-aleatorio', M365_APP_CLIENT_ID: APP, M365_CALLBACK_BASE_URL: 'https://api.monkey.test/v1/', PLATFORM_APP_URL: 'https://app.monkey.test' };
const config = (over: Record<string, string> = {}) => {
  const values: Record<string, string> = { ...env, ...over };
  return { get: (k: string) => values[k], getOrThrow: (k: string) => values[k] } as unknown as ConfigService;
};

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const stranger = generateKeyPairSync('rsa', { modulusLength: 2048 });
const b64 = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
function idToken(claims: Record<string, unknown>, opts: { key?: typeof privateKey; alg?: string; kid?: string } = {}): string {
  const head = b64({ alg: opts.alg ?? 'RS256', kid: opts.kid ?? 'k1' });
  const body = b64({ tid: TENANT, iss: `https://login.microsoftonline.com/${(claims['tid'] as string) ?? TENANT}/v2.0`, aud: APP, exp: NOW / 1000 + 600, nbf: NOW / 1000 - 10, wids: [GLOBAL_ADMIN], ...claims });
  const signature = createSign('RSA-SHA256').update(`${head}.${body}`).sign(opts.key ?? privateKey).toString('base64url');
  return `${head}.${body}.${opts.alg === 'none' ? '' : signature}`;
}
const jwks = (() => Promise.resolve(new Response(JSON.stringify({ keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'k1' }] }), { status: 200 }))) as unknown as typeof fetch;

describe('HmacConsentTickets (los recibos que viajan por el navegador)', () => {
  const ticket = { step: 'complete' as const, companyId: 'c1', userId: 'u1', assetId: 'a1', tenantId: TENANT };

  it('firma y verifica; cada paso tiene su recibo y uno no sirve para otro', () => {
    const tickets = new HmacConsentTickets(config(), () => NOW);
    const value = tickets.sign(ticket, 60);
    expect(tickets.verify(value, 'complete')).toEqual(ticket);
    expect(tickets.verify(value, 'consent')).toBeNull();
    expect(tickets.verify(value, 'signin')).toBeNull();
  });

  it('rechaza uno vencido, alterado, de otro servidor o mal formado', () => {
    let now = NOW;
    const tickets = new HmacConsentTickets(config(), () => now);
    const value = tickets.sign(ticket, 60);
    const [body, mac] = value.split('.');
    const forged = b64({ ...JSON.parse(Buffer.from(body, 'base64url').toString()), tenantId: OTHER_TENANT });
    expect(tickets.verify(`${forged}.${mac}`, 'complete')).toBeNull();
    expect(new HmacConsentTickets(config({ JWT_SECRET: 'otro-secreto-distinto-y-largo' }), () => NOW).verify(value, 'complete')).toBeNull();
    for (const bad of ['', 'x', 'a.b.c', `${body}.`, `.${mac}`]) expect(tickets.verify(bad, 'complete')).toBeNull();
    now = NOW + 61_000;
    expect(tickets.verify(value, 'complete')).toBeNull();
  });
});

describe('JwksMicrosoftIdentityVerifier (la identidad firmada por Microsoft)', () => {
  const verifier = () => new JwksMicrosoftIdentityVerifier(jwks, () => NOW);
  const expected = { clientId: APP, nonce: 'n-1' };

  it('acepta una identidad válida y entrega la organización y los roles', async () => {
    await expect(verifier().verify(idToken({ nonce: 'n-1' }), expected)).resolves.toEqual({ tenantId: TENANT, directoryRoles: [GLOBAL_ADMIN] });
  });

  it.each([
    ['firmada por otro', () => idToken({ nonce: 'n-1' }, { key: stranger.privateKey })],
    ['sin firma (alg none)', () => idToken({ nonce: 'n-1' }, { alg: 'none' })],
    ['con otro algoritmo', () => idToken({ nonce: 'n-1' }, { alg: 'HS256' })],
    ['con una llave que Microsoft no publica', () => idToken({ nonce: 'n-1' }, { kid: 'otra' })],
    ['para otra aplicación', () => idToken({ nonce: 'n-1', aud: OTHER_TENANT })],
    ['de otra petición (nonce)', () => idToken({ nonce: 'n-2' })],
    ['vencida', () => idToken({ nonce: 'n-1', exp: NOW / 1000 - 600 })],
    ['aún no vigente', () => idToken({ nonce: 'n-1', nbf: NOW / 1000 + 600 })],
    ['cuyo emisor no es el de su organización', () => idToken({ nonce: 'n-1', iss: `https://login.microsoftonline.com/${OTHER_TENANT}/v2.0` })],
    ['mal formada', () => 'no-es-un-token'],
  ])('rechaza una identidad %s', async (_name, make) => {
    await expect(verifier().verify(make(), expected)).resolves.toBeNull();
  });
});

describe('Recorrido «Conectar Microsoft 365»', () => {
  const principal = { companyId: 'c1', userId: 'u1', role: 'admin_empresa' } as unknown as Principal;
  const meta = { ipAddress: '1.1.1.1', userAgent: 'jest' };
  const asset = (over: object = {}) => ({ id: 'a1', provisioning: { connectionMethod: 'admin_consent', isActive: false, ...over } });
  const tickets = new HmacConsentTickets(config(), () => NOW);
  const repoWith = (found: unknown) => {
    const linked: string[] = [];
    const repo = { findAsset: async () => found, linkMicrosoftTenant: async (_s: unknown, _id: string, tenant: string) => (linked.push(tenant), { after: { id: 'a1' } }) } as unknown as TechnicalControlRepository;
    return { repo, linked };
  };
  const signedIn = new MicrosoftSignedInUseCase(tickets, new JwksMicrosoftIdentityVerifier(jwks, () => NOW), config());
  const consented = new MicrosoftConsentedUseCase(tickets, config());
  const params = (url: string) => new URL(url).searchParams;

  async function startedFlow() {
    const { repo } = repoWith(asset());
    const { authorizeUrl } = await new StartMicrosoftConsentUseCase(repo, tickets, config()).execute(principal, 'a1');
    return { authorizeUrl, state: params(authorizeUrl).get('state')!, nonce: params(authorizeUrl).get('nonce')! };
  }

  it('camino feliz: identidad → autorización de la MISMA organización → la misma sesión termina y enlaza', async () => {
    const start = await startedFlow();
    expect(start.authorizeUrl).toContain('https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?');
    expect(Object.fromEntries(params(start.authorizeUrl))).toMatchObject({ client_id: APP, response_type: 'id_token', response_mode: 'form_post', redirect_uri: 'https://api.monkey.test/v1/integrations/microsoft/signin', scope: 'openid profile' });

    const consentUrl = await signedIn.execute({ state: start.state, idToken: idToken({ nonce: start.nonce }), error: '' });
    expect(consentUrl).toContain(`https://login.microsoftonline.com/${TENANT}/v2.0/adminconsent?`);
    expect(params(consentUrl).get('redirect_uri')).toBe('https://api.monkey.test/v1/integrations/microsoft/consent');

    const back = consented.execute({ state: params(consentUrl).get('state')!, tenant: TENANT.toUpperCase(), adminConsent: 'True', error: '' });
    expect(back.startsWith('https://app.monkey.test/integraciones/microsoft?')).toBe(true);

    const { repo, linked } = repoWith(asset());
    await new CompleteMicrosoftConsentUseCase(repo, tickets).execute(principal, 'a1', params(back).get('m365')!, meta);
    expect(linked).toEqual([TENANT]);
  });

  it('ATAQUE: cambiar la organización en la dirección de vuelta no enlaza nada', async () => {
    const start = await startedFlow();
    const consentUrl = await signedIn.execute({ state: start.state, idToken: idToken({ nonce: start.nonce }), error: '' });
    const back = consented.execute({ state: params(consentUrl).get('state')!, tenant: OTHER_TENANT, adminConsent: 'True', error: '' });
    expect(params(back).get('m365')).toBeNull();
    expect(params(back).get('m365_error')).toBe('identity_rejected');
  });

  it('ATAQUE: saltarse la identidad y llamar directo a la vuelta de la autorización no sirve', async () => {
    const start = await startedFlow();
    // Ni con un recibo inventado ni reutilizando el del primer paso.
    for (const state of ['inventado', start.state]) expect(params(consented.execute({ state, tenant: OTHER_TENANT, adminConsent: 'True', error: '' })).get('m365_error')).toBe('expired');
  });

  it('ATAQUE: el recibo final solo lo puede usar la misma empresa, la misma persona y para el mismo activo', async () => {
    const handle = tickets.sign({ step: 'complete', companyId: 'c1', userId: 'u1', assetId: 'a1', tenantId: TENANT }, 60);
    const attempts: [Principal, string, string][] = [
      [{ ...principal, companyId: 'otra' } as Principal, 'a1', handle],
      [{ ...principal, userId: 'otra-persona' } as Principal, 'a1', handle],
      [principal, 'otro-activo', handle],
      [principal, 'a1', tickets.sign({ step: 'consent', companyId: 'c1', userId: 'u1', assetId: 'a1', tenantId: TENANT }, 60)],
    ];
    for (const [who, assetId, value] of attempts) {
      const { repo, linked } = repoWith(asset());
      await expect(new CompleteMicrosoftConsentUseCase(repo, tickets).execute(who, assetId, value, meta)).rejects.toBeInstanceOf(ValidationException);
      expect(linked).toEqual([]);
    }
  });

  it.each([
    ['quien no administra la organización', { wids: [] }, 'not_admin'],
    ['quien no trae roles', { wids: undefined }, 'not_admin'],
    ['una cuenta personal', { tid: '9188040d-6c67-4c5b-b112-36a304b66dad' }, 'personal_account'],
  ])('no deja autorizar a %s', async (_n, claims, error) => {
    const start = await startedFlow();
    const back = await signedIn.execute({ state: start.state, idToken: idToken({ nonce: start.nonce, ...claims }), error: '' });
    expect(params(back).get('m365_error')).toBe(error);
    expect(back).not.toContain('adminconsent');
  });

  it('cancelar, una identidad falsa o Microsoft caído vuelven a Monkey con su razón, sin avanzar', async () => {
    const start = await startedFlow();
    expect(params(await signedIn.execute({ state: start.state, idToken: '', error: 'access_denied' })).get('m365_error')).toBe('cancelled');
    expect(params(await signedIn.execute({ state: start.state, idToken: idToken({ nonce: start.nonce }, { key: stranger.privateKey }), error: '' })).get('m365_error')).toBe('identity_rejected');
    const down = new MicrosoftSignedInUseCase(tickets, new JwksMicrosoftIdentityVerifier((() => Promise.reject(new Error('sin red'))) as unknown as typeof fetch, () => NOW), config());
    expect(params(await down.execute({ state: start.state, idToken: idToken({ nonce: start.nonce }), error: '' })).get('m365_error')).toBe('unavailable');
    const consentUrl = await signedIn.execute({ state: start.state, idToken: idToken({ nonce: start.nonce }), error: '' });
    expect(params(consented.execute({ state: params(consentUrl).get('state')!, tenant: '', adminConsent: '', error: 'access_denied' })).get('m365_error')).toBe('cancelled');
  });

  it('empezar exige el canal del botón, un activo sin activar y la aplicación de Monkey configurada', async () => {
    const start = (found: unknown, cfg = config()) => new StartMicrosoftConsentUseCase(repoWith(found).repo, tickets, cfg).execute(principal, 'a1');
    await expect(start(null)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(start(asset({ connectionMethod: 'app_certificate' }))).rejects.toMatchObject({ code: 'CONNECTION_METHOD_NOT_APPLICABLE' });
    await expect(start(asset({ isActive: true }))).rejects.toMatchObject({ code: 'ASSET_ALREADY_ACTIVE' });
    await expect(start(asset(), config({ M365_APP_CLIENT_ID: '' }))).rejects.toMatchObject({ code: 'CONNECTION_UNAVAILABLE' });
  });
});
