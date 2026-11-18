import { Injectable } from '@nestjs/common';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { TokenHasher } from '../../../../../common/security/token-hasher';
import { TrustedDeviceRepository } from '../../../domain/repositories/trusted-device.repository';
import { SessionRepository } from '../../../domain/repositories/session.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly tokens: TokenHasher,
    private readonly devices: TrustedDeviceRepository,
  ) {}

  // Idempotente: sin token o con una sesión ya cerrada, el logout igual "funciona" (204).
  async execute(refreshToken: string | undefined, deviceToken: string | undefined, meta: RequestMeta): Promise<void> {
    const session = refreshToken ? await this.sessions.findByRefreshTokenHash(this.tokens.hash(refreshToken)) : null;
    if (!session) {
      // D123 · Sin sesión (venció, o no hay cookie de sesión) el dispositivo de la cookie igual se olvida: se halla por su huella.
      if (deviceToken) {
        await this.devices.revokeByTokenHash(this.tokens.hash(deviceToken), new Date(), (device) => ({
          tenantId: device.companyId,
          userId: device.userId,
          action: 'auth.device_revoked',
          resource: 'trusted_device',
          result: 'success',
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          afterState: { device_id: device.id, scope: 'logout' },
        }));
      }
      return;
    }
    // D123 · Cerrar sesión también olvida el dispositivo recordado de este navegador, en la misma transacción. Si la sesión ya estaba cerrada, el dispositivo igual se olvida.
    const forget = deviceToken
      ? {
          tokenHash: this.tokens.hash(deviceToken),
          audit: (device: { id: string }) => ({
            tenantId: session.companyId,
            userId: session.userId,
            action: 'auth.device_revoked',
            resource: 'trusted_device',
            result: 'success' as const,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
            afterState: { device_id: device.id, scope: 'logout' },
          }),
        }
      : undefined;
    if (session.revokedAt && !forget) return;

    // El cierre y su rastro se confirman juntos (SEG-36).
    await this.sessions.revoke(
      { companyId: session.companyId, userId: session.userId },
      session.id,
      new Date(),
      () => ({
        tenantId: session.companyId,
        userId: session.userId,
        action: 'auth.logout',
        resource: 'session',
        result: 'success',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        afterState: { session_id: session.id },
      }),
      forget,
    );
  }
}
