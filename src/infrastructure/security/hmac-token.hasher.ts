import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'node:crypto';
import { TokenHasher } from '../../common/security/token-hasher';

// HMAC-SHA256 con un secreto de servidor (TOKEN_HASH_PEPPER): si alguien lee sessions o
// access_keys, sin el pepper no puede ni usar ni recalcular las huellas.
@Injectable()
export class HmacTokenHasher extends TokenHasher {
  private readonly pepper: string;

  constructor(config: ConfigService) {
    super();
    this.pepper = config.getOrThrow<string>('TOKEN_HASH_PEPPER');
  }

  generate(): string {
    return randomBytes(32).toString('base64url');
  }

  hash(token: string): string {
    return createHmac('sha256', this.pepper).update(token).digest('hex');
  }
}
