import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';

@Injectable()
export class TenantResolutionGuard implements CanActivate {
  constructor(private readonly tenantConnection: TenantConnectionManager) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest();

    if (!user?.client_id) {
      // Sesión MONKEY_ADMIN u otra ruta central-only — nada que resolver.
      return true;
    }

    await this.tenantConnection.getClientFor(user.client_id);
    return true;
  }
}
