import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { verifyToken } from 'src/infrastructure/tenancy/fast-token.util';

/**
 * Reemplaza a TenantResolutionGuard. Resuelve el tenant a partir de los
 * headers mnk-client-identifier/mnk-client-key (modelo access-key/secret-key
 * tipo AWS), obligatorios en TODAS las peticiones de un tenant, no solo en
 * el login — pensado para que el propio cliente pueda integrar la API
 * directamente a futuro.
 */
@Injectable()
export class ClientCredentialsGuard implements CanActivate {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly tenantConnection: TenantConnectionManager,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const identifier = req.headers['mnk-client-identifier'];
    const key = req.headers['mnk-client-key'];

    if (!identifier || !key) {
      if (req.user?.client_id) {
        throw new UnauthorizedException('Se requieren los headers mnk-client-identifier y mnk-client-key');
      }
      // Sesión MONKEY_ADMIN (o /auth/login sin headers) — nada que resolver.
      return true;
    }

    const client = await this.centralPrisma.client.findUnique({ where: { client_identifier: identifier } });
    if (!client || !client.is_active || client.provisioning_status !== 'READY' || !client.client_key_hash) {
      throw new UnauthorizedException('Credenciales de tenant inválidas');
    }
    if (!verifyToken(key, client.client_key_hash)) {
      throw new UnauthorizedException('Credenciales de tenant inválidas');
    }
    if (req.user?.client_id && req.user.client_id !== client.id) {
      throw new UnauthorizedException('Las credenciales de tenant no coinciden con la sesión');
    }

    req.resolvedClientId = client.id;
    await this.tenantConnection.getClientFor(client.id);
    return true;
  }
}
