import { createHash, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Para tokens aleatorios de alta entropía (client_key, onboarding_code, etc.)
 * generados por el servidor — a diferencia de una contraseña humana no
 * necesitan el costo de bcrypt para resistir fuerza bruta, y se validan en
 * cada request, así que un hash rápido y determinístico (SHA-256) es la
 * opción correcta. Las contraseñas de usuario siguen usando bcrypt.
 */
export function generateToken(bytes = 24): string {
  return randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyToken(token: string, hash: string): boolean {
  const candidate = Buffer.from(hashToken(token), 'hex');
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
