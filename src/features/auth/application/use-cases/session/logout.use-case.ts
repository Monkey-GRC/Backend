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
  // Devuelve si el controlador debe borrar `mnk_device`: sí cuando el dispositivo era de quien cierra sesión (y se olvidó) o la cookie ya no sirve a nadie;
  // no cuando es el dispositivo vigente de OTRA persona (mismo navegador): esa cookie no es de quien sale y su dispositivo no se toca.
  async execute(refreshToken: string | undefined, deviceToken: string | undefined, meta: RequestMeta): Promise<{ clearDeviceCookie: boolean }> {
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
      return { clearDeviceCookie: true };
    }
    const now = new Date();
    const deviceHash = deviceToken ? this.tokens.hash(deviceToken) : undefined;
    const isOwn = deviceHash ? (await this.devices.findActiveByTokenHash({ companyId: session.companyId, userId: session.userId }, session.userId, deviceHash, now)) !== null : false;
    const clearDeviceCookie = !deviceHash || isOwn || !(await this.devices.existsActiveByTokenHash(deviceHash));
    // D123 · Cerrar sesión también olvida el dispositivo recordado de este navegador, en la misma transacción. Si la sesión ya estaba cerrada, el dispositivo igual se olvida.
    const forget = deviceHash && isOwn
      ? {
          tokenHash: deviceHash,
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
    if (session.revokedAt && !forget) return { clearDeviceCookie };

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
    return { clearDeviceCookie };
  }
}
