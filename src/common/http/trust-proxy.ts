import { isIP } from 'node:net';

export type TrustProxySetting = boolean | number | string | string[];

const KEYWORDS = new Set(['loopback', 'linklocal', 'uniquelocal']);

const isAddressOrCidr = (entry: string): boolean => {
  const [address, prefix, ...rest] = entry.split('/');
  const family = isIP(address);
  if (rest.length > 0 || !family) return false;
  if (prefix === undefined) return true;
  if (!/^\d{1,3}$/.test(prefix)) return false;
  return Number(prefix) <= (family === 4 ? 32 : 128);
};

// MD-485 (DT-37 / I9) · TRUST_PROXY, con lo que acepta Express: saltos (`2`), palabras clave (`loopback`, `uniquelocal`),
// IP o CIDR, separados por coma. Vacío o `false` = apagado. Un valor inválido hace fallar el arranque.
export function parseTrustProxy(raw: string | undefined): TrustProxySetting {
  const value = (raw ?? '').trim();
  if (value === '' || value.toLowerCase() === 'false') return false;
  if (value.toLowerCase() === 'true') {
    throw new Error('TRUST_PROXY=true confía en todo X-Forwarded-For y permite falsificar la IP: usa un número de saltos, una lista de CIDR o palabras clave.');
  }
  if (/^\d+$/.test(value)) {
    const hops = Number(value);
    if (hops < 1 || hops > 10) throw new Error(`TRUST_PROXY inválido: ${value} (saltos entre 1 y 10).`);
    return hops;
  }
  const entries = value.split(',').map((e) => e.trim());
  for (const entry of entries) {
    if (!KEYWORDS.has(entry.toLowerCase()) && !isAddressOrCidr(entry)) {
      throw new Error(`TRUST_PROXY inválido: "${entry}" (saltos, loopback, linklocal, uniquelocal, IP o CIDR).`);
    }
  }
  return entries.length === 1 ? entries[0] : entries;
}
