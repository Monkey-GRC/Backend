import { Global, Module } from '@nestjs/common';
import { TenantConnectionManager } from './tenant-connection-manager.service';

@Global()
@Module({
  providers: [TenantConnectionManager],
  exports: [TenantConnectionManager],
})
export class TenancyModule {}
