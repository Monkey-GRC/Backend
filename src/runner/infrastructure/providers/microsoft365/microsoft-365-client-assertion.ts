import { createPrivateKey, randomUUID, sign } from 'node:crypto';
import { FAILURE, RunnerFailure } from '../../../domain/runner.types';

// La aserción de cliente con la que una aplicación de Microsoft Entra se presenta con un CERTIFICADO en vez de un secreto (D154): un JWT firmado con la clave privada
// del certificado, que Microsoft verifica con el certificado público que el cliente subió a su aplicación. La clave nunca sale del trabajador: solo viaja la firma.
// `x5t` es la huella SHA-1 del certificado en base64url: así Entra sabe con cuál de los certificados de la aplicación se verifica.
const THUMBPRINT = /^[0-9A-F]{40}$/i;
const LIFETIME_SECONDS = 600;
const b64url = (data: Buffer | string): string => Buffer.from(data).toString('base64url');

export function buildClientAssertion(input: { tokenUrl: string; clientId: string; thumbprint: string; privateKeyPem: string; now: Date; lifetimeSeconds?: number }): string {
  if (!THUMBPRINT.test(input.thumbprint)) throw new RunnerFailure(FAILURE.engineFailed, 'huella del certificado inválida');
  const issuedAt = Math.floor(input.now.getTime() / 1000);
  const header = { alg: 'RS256', typ: 'JWT', x5t: b64url(Buffer.from(input.thumbprint, 'hex')) };
  const claims = { aud: input.tokenUrl, iss: input.clientId, sub: input.clientId, jti: randomUUID(), nbf: issuedAt, exp: issuedAt + (input.lifetimeSeconds ?? LIFETIME_SECONDS) };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
  let signature: Buffer;
  try {
    signature = sign('sha256', Buffer.from(signingInput), createPrivateKey(input.privateKeyPem));
  } catch {
    // Nunca se vuelca el error: puede repetir el material de la clave.
    throw new RunnerFailure(FAILURE.engineFailed, 'no se pudo firmar con la clave del certificado');
  }
  return `${signingInput}.${b64url(signature)}`;
}
