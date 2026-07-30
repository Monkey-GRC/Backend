import { generateSecureToken } from 'src/common/utils/secure-random.util';

const SEPARATOR = '.';

export interface GeneratedApiKey {
  apiKeyId: string;
  secret: string;
  fullKey: string;
}

export function generateApiKey(): GeneratedApiKey {
  const apiKeyId = generateSecureToken(8);
  const secret = generateSecureToken(24);
  return { apiKeyId, secret, fullKey: `${apiKeyId}${SEPARATOR}${secret}` };
}

export function splitApiKey(fullKey: string): { apiKeyId: string; secret: string } {
  const idx = fullKey.indexOf(SEPARATOR);
  if (idx <= 0 || idx === fullKey.length - 1) {
    throw new Error('api_key con formato inválido');
  }
  return { apiKeyId: fullKey.slice(0, idx), secret: fullKey.slice(idx + 1) };
}
