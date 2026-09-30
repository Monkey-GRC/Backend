import { Global, Module } from '@nestjs/common';
import { TokenHasher } from '../../common/security/token-hasher';
import { HmacTokenHasher } from './hmac-token.hasher';

@Global()
@Module({
  providers: [{ provide: TokenHasher, useClass: HmacTokenHasher }],
  exports: [TokenHasher],
})
export class SecurityModule {}
