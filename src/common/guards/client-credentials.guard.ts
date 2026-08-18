import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { verifyToken } from 'src/infrastructure/tenancy/fast-token.util';

/**
 * Reemplaza a TenantResolutionGuard. Resuelve el tenant a partir de los
 * headers mnk-client-identifier/mnk-client-key (modelo access-key/secret-key
 * tipo AWS) SOLO cuando vienen presentes — pensado para integraciones
 * directas a la API sin sesión de usuario (servidor a servidor).
 *
 * Para una sesión de usuario ya autenticada (cookie/JWT validado por
 * AuthGuard('jwt') antes que este guard), el client_id firmado dentro del
 * propio token ya es prueba suficiente de a qué tenant pertenece la
 * petición — UserContextInterceptor lo toma de ahí
 * (`req.resolvedClientId ?? req.user?.client_id`) sin que este guard tenga
 * que exigir las keys de nuevo en cada request. Exigirlas ahí no sumaba
 * seguridad real (la cookie httpOnly ya es la prueba, y si alguien la roba
 * probablemente ya tiene también las keys del mismo localStorage) y sí
 * rompía el login/uso desde cualquier dispositivo que no las tuviera
 * guardadas.
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
      // Sesión de usuario ya autenticada, o /auth/login sin headers (se
      // resuelve por directorio de identifiers dentro de AuthService) — en
      // ninguno de los dos casos hay nada que este guard deba validar.
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
