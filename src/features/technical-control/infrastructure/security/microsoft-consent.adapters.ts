import { createHmac, createPublicKey, hkdfSync, JsonWebKey, timingSafeEqual, verify } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsentStep, ConsentTicket, ConsentTickets, MicrosoftIdentity, MicrosoftIdentityVerifier } from '../../domain/ports/microsoft-consent';

const json = (part: string): Record<string, unknown> | null => {
  try {
    const value: unknown = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

// Recibos firmados con HMAC-SHA256. La clave se DERIVA del secreto del servidor con un propósito propio: un recibo no sirve como token de sesión ni al revés.
@Injectable()
export class HmacConsentTickets extends ConsentTickets {
  private key: Buffer | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly now: () => number = () => Date.now(),
  ) {
    super();
  }

  sign(ticket: ConsentTicket, ttlSeconds: number): string {
    const body = Buffer.from(JSON.stringify({ ...ticket, exp: Math.floor(this.now() / 1000) + ttlSeconds })).toString('base64url');
    return `${body}.${this.mac(body).toString('base64url')}`;
  }

  verify(value: string, step: ConsentStep): ConsentTicket | null {
    const [body, signature, extra] = value.split('.');
    if (!body || !signature || extra !== undefined) return null;
    const expected = this.mac(body);
    const received = Buffer.from(signature, 'base64url');
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
    const data = json(body);
    if (!data || data['step'] !== step || typeof data['exp'] !== 'number' || data['exp'] <= Math.floor(this.now() / 1000)) return null;
    const { exp: _exp, ...ticket } = data;
    return ticket as ConsentTicket;
  }

  private mac(body: string): Buffer {
    this.key ??= Buffer.from(hkdfSync('sha256', this.config.getOrThrow<string>('JWT_SECRET'), 'monkey', 'microsoft-consent', 32));
    return createHmac('sha256', this.key).update(body).digest();
  }
}

const KEYS_URL = 'https://login.microsoftonline.com/common/discovery/v2.0/keys';
const KEYS_TTL_MS = 60 * 60_000;
const CLOCK_SKEW_SECONDS = 120;
const HTTP_TIMEOUT_MS = 10_000;

type SigningKey = JsonWebKey & { kid?: string };

// Verifica una identidad (`id_token`) de Microsoft Entra: firma RS256 con las llaves publicadas por Microsoft, emisor de ESA organización, destinatario nuestra aplicación,
// vigencia y `nonce`. Cualquier duda es `null`.
@Injectable()
export class JwksMicrosoftIdentityVerifier extends MicrosoftIdentityVerifier {
  private cache: { keys: SigningKey[]; at: number } | null = null;

  constructor(
    private readonly http: typeof fetch = fetch,
    private readonly now: () => number = () => Date.now(),
  ) {
    super();
  }

  async verify(idToken: string, expected: { clientId: string; nonce: string }): Promise<MicrosoftIdentity | null> {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    const header = json(parts[0]);
    const claims = json(parts[1]);
    // Solo RS256: nunca `none` ni un algoritmo que elija quien envía.
    if (!header || !claims || header['alg'] !== 'RS256' || typeof header['kid'] !== 'string') return null;
    const key = await this.keyFor(header['kid']);
    if (!key) return null;
    let signed = false;
    try {
      signed = verify('sha256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
    } catch {
      return null;
    }
    if (!signed) return null;
    const seconds = Math.floor(this.now() / 1000);
    const tid = claims['tid'];
    if (typeof tid !== 'string' || claims['iss'] !== `https://login.microsoftonline.com/${tid}/v2.0`) return null;
    if (claims['aud'] !== expected.clientId || claims['nonce'] !== expected.nonce) return null;
    if (typeof claims['exp'] !== 'number' || claims['exp'] + CLOCK_SKEW_SECONDS <= seconds) return null;
    if (typeof claims['nbf'] === 'number' && claims['nbf'] - CLOCK_SKEW_SECONDS > seconds) return null;
    const wids = Array.isArray(claims['wids']) ? (claims['wids'] as unknown[]).filter((w): w is string => typeof w === 'string') : [];
    return { tenantId: tid, directoryRoles: wids };
  }

  // Microsoft rota sus llaves: si no aparece la del `kid`, se vuelven a pedir (como mucho una vez por minuto).
  private async keyFor(kid: string): Promise<SigningKey | null> {
    const age = this.cache ? this.now() - this.cache.at : Infinity;
    const found = age < KEYS_TTL_MS ? this.cache?.keys.find((k) => k.kid === kid) : undefined;
    if (found) return found;
    if (age < 60_000) return null;
    const res = await this.http(KEYS_URL, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`Microsoft no entregó sus llaves (${res.status})`);
    const body = (await res.json()) as { keys?: SigningKey[] };
    this.cache = { keys: body.keys ?? [], at: this.now() };
    return this.cache.keys.find((k) => k.kid === kid) ?? null;
  }
}
