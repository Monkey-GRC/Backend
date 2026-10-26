import { randomInt } from 'node:crypto';

// D94 · Códigos de recuperación del segundo factor: la salida cuando se pierde el celular. 10 por persona, de un solo uso. Se muestran una sola vez y en la base
// solo queda su huella. Sin 0/O ni 1/I/L: se leen y se copian a mano sin confundirse.
export const RECOVERY_CODE_COUNT = 10;
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const GROUP = 5;

const randomGroup = (): string => Array.from({ length: GROUP }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

/** `XXXXX-XXXXX`: 10 caracteres de un alfabeto de 31 (unos 50 bits). */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => `${randomGroup()}-${randomGroup()}`);
}

/** Lo que se compara: sin guiones ni espacios y en mayúsculas, para que `abcde fghjk` y `ABCDE-FGHJK` sean el mismo código. `null` si no tiene la forma. */
export function normalizeRecoveryCode(input: string): string | null {
  const compact = input.replace(/[\s-]/g, '').toUpperCase();
  return new RegExp(`^[${ALPHABET}]{${GROUP * 2}}$`).test(compact) ? compact : null;
}
