import { randomInt } from 'node:crypto';

// Clave de acceso de un solo uso que Monkey Admin entrega al cliente (modelo-datos.md §4.2).
// Formato del contrato: MNK-XXXX-XXXX-XXXX, pensado para dictarse o copiarse a mano (P2a, supuesto
// del contrato). Sin 0/O ni 1/I/L para que no se confundan: 31 símbolos × 12 posiciones ≈ 59 bits.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const PREFIX = 'MNK';

export function generateAccessKeyCode(): string {
  const body = Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
  return `${PREFIX}-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8)}`;
}

// Lo que se hashea y se compara: sin prefijo, guiones, espacios ni diferencia de mayúsculas, para
// que el canje acepte la clave tal como el cliente la escriba.
export function normalizeAccessKeyCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(new RegExp(`^${PREFIX}`), '');
}
