import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { CredentialCipher } from '../../common/security/credential-cipher';

const VERSION = 'v1';
const KEY_BYTES = 32;
const IV_BYTES = 12;

// AES-256-GCM: cifra y además detecta cualquier alteración del texto guardado. Formato:
// `v1.<iv>.<etiqueta>.<cifrado>` (base64url). La versión deja espacio para rotar la llave sin
// perder lo ya guardado. Sin CREDENTIALS_ENCRYPTION_KEY (32 bytes en base64) la app no arranca.
@Injectable()
export class AesCredentialCipher extends CredentialCipher {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    super();
    this.key = Buffer.from(config.getOrThrow<string>('CREDENTIALS_ENCRYPTION_KEY'), 'base64');
    if (this.key.length !== KEY_BYTES) {
      throw new Error('CREDENTIALS_ENCRYPTION_KEY debe ser de 32 bytes en base64');
    }
  }

  encrypt(credentials: Record<string, unknown>): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const body = Buffer.concat([cipher.update(JSON.stringify(credentials), 'utf8'), cipher.final()]);
    return [VERSION, iv, cipher.getAuthTag(), body].map((p) => (typeof p === 'string' ? p : p.toString('base64url'))).join('.');
  }

  decrypt(payload: string): Record<string, unknown> {
    const [version, iv, tag, body] = payload.split('.');
    if (version !== VERSION || !iv || !tag || !body) throw new Error('Credenciales con formato desconocido');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    const plain = Buffer.concat([decipher.update(Buffer.from(body, 'base64url')), decipher.final()]);
    return JSON.parse(plain.toString('utf8')) as Record<string, unknown>;
  }
}
