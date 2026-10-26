import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// D94 · Códigos de un solo uso por tiempo (TOTP, RFC 6238) sobre HOTP (RFC 4226): HMAC-SHA1, 6 dígitos, pasos de 30 s. Son los valores por defecto que entienden
// Google Authenticator, Microsoft Authenticator, Authy y 1Password. Funciones puras, sin base de datos ni reloj propio (la hora entra por parámetro), así que se prueban
// con los vectores del propio RFC. Sin dependencias: lo único que hace falta es `node:crypto`.

export const TOTP_PERIOD_SECONDS = 30;
export const TOTP_DIGITS = 6;
// Se aceptan el paso anterior y el siguiente además del actual: absorbe un reloj del celular desfasado unos segundos.
export const TOTP_WINDOW_STEPS = 1;

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(text: string): Buffer {
  const clean = text.replace(/[\s=-]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) throw new Error('Clave base32 inválida');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Un secreto nuevo de 160 bits (lo que recomienda el RFC 4226), en base32 como lo piden las apps. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** El HOTP de un contador (RFC 4226, sección 5.3). */
export function hotp(secret: Buffer, counter: number, digits = TOTP_DIGITS): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', secret).update(message).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  return String(binary % 10 ** digits).padStart(digits, '0');
}

/** El número del paso de 30 s en el que cae un instante. */
export function totpStep(at: Date, period = TOTP_PERIOD_SECONDS): number {
  return Math.floor(at.getTime() / 1000 / period);
}

export function totpAt(secretBase32: string, at: Date): string {
  return hotp(base32Decode(secretBase32), totpStep(at));
}

const sameCode = (a: string, b: string): boolean => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Lo que la persona teclea: se aceptan espacios («123 456») y nada más que seis dígitos. */
export function normalizeTotpCode(input: string): string | null {
  const compact = input.replace(/\s/g, '');
  return /^\d{6}$/.test(compact) ? compact : null;
}

export type TotpCheck = { ok: true; step: number } | { ok: false };

// Un código vale una sola vez: si `lastUsedStep` ya cubre ese paso (o uno posterior), no se acepta aunque coincida. Así un código visto por encima del hombro, o
// reenviado dos veces, no sirve de nuevo dentro de su ventana de 30 s.
export function verifyTotp(secretBase32: string, input: string, now: Date, lastUsedStep: number | null): TotpCheck {
  const code = normalizeTotpCode(input);
  if (!code) return { ok: false };
  const secret = base32Decode(secretBase32);
  const current = totpStep(now);
  for (let offset = -TOTP_WINDOW_STEPS; offset <= TOTP_WINDOW_STEPS; offset++) {
    const step = current + offset;
    if (lastUsedStep !== null && step <= lastUsedStep) continue;
    if (sameCode(hotp(secret, step), code)) return { ok: true, step };
  }
  return { ok: false };
}

/** La dirección `otpauth://` que lee el código QR de las apps de códigos. */
export function buildOtpauthUri(input: { issuer: string; account: string; secret: string }): string {
  const label = `${encodeURIComponent(input.issuer)}:${encodeURIComponent(input.account)}`;
  const query = new URLSearchParams({
    secret: input.secret,
    issuer: input.issuer,
    algorithm: 'SHA1',
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${query.toString()}`;
}
