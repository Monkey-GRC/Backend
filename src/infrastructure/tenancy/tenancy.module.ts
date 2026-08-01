import { Global, Module } from '@nestjs/common';
import { TenantConnectionManager } from './tenant-connection-manager.service';
import { TenantProvisioningService } from './tenant-provisioning.service';

@Global()
@Module({
  providers: [TenantConnectionManager, TenantProvisioningService],
  exports: [TenantConnectionManager, TenantProvisioningService],
})
export class TenancyModule {}
