import { Global, Module } from '@nestjs/common';
import { CredentialCipher } from '../../common/security/credential-cipher';
import { TokenHasher } from '../../common/security/token-hasher';
import { AesCredentialCipher } from './aes-credential.cipher';
import { HmacTokenHasher } from './hmac-token.hasher';

@Global()
@Module({
  providers: [
    { provide: TokenHasher, useClass: HmacTokenHasher },
    { provide: CredentialCipher, useClass: AesCredentialCipher },
  ],
  exports: [TokenHasher, CredentialCipher],
})
export class SecurityModule {}
