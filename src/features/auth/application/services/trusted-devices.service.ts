import { Injectable } from '@nestjs/common';
import { RequestMeta } from '../../../../common/http/request-meta';
import { TokenHasher } from '../../../../common/security/token-hasher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { TrustedDevice } from '../../domain/entities/trusted-device.entity';
import { GeoIpLookup } from '../../domain/ports/geo-ip.lookup';
import { DeviceEffect, TrustedDeviceRepository } from '../../domain/repositories/trusted-device.repository';
import { summarizeUserAgent } from '../../domain/user-agent';

// D123, SEG-84 · «Recordar este dispositivo por 30 días»: la cookie `mnk_device` lleva un token opaco y aquí solo queda su HMAC.
@Injectable()
export class TrustedDevices {
  constructor(
    private readonly devices: TrustedDeviceRepository,
    private readonly tokens: TokenHasher,
    private readonly geo: GeoIpLookup,
  ) {}

  // El dispositivo de la cookie, solo si está vigente y es de ESA persona. Cualquier otra cosa (ausente, vencido, revocado, manipulado, ajeno) es `null`, nunca un error.
  find(scope: TenantScope, userId: string, token: string | undefined, now: Date): Promise<TrustedDevice | null> {
    return token ? this.devices.findActiveByTokenHash(scope, userId, this.tokens.hash(token), now) : Promise.resolve(null);
  }

  // Un dispositivo nuevo para quien acaba de verificar su segundo factor: el token (que solo viaja en la cookie) y lo que se guarda junto con la sesión.
  async trust(user: AuthUser, meta: RequestMeta, now: Date): Promise<{ token: string; effect: DeviceEffect }> {
    const token = this.tokens.generate();
    const place = await this.geo.lookup(meta.ipAddress);
    const agent = summarizeUserAgent(meta.userAgent);
    return {
      token,
      effect: {
        kind: 'trust',
        device: {
          userId: user.id,
          tokenHash: this.tokens.hash(token),
          browser: agent.browser,
          os: agent.os,
          deviceType: agent.deviceType,
          ipAddress: meta.ipAddress,
          country: place?.country ?? null,
          city: place?.city ?? null,
          createdAt: now,
          expiresAt: TrustedDevice.expiresAtFor(now),
        },
        // Nunca el token ni su huella en el rastro.
        audit: (device) => ({
          tenantId: user.companyId,
          userId: user.id,
          action: 'auth.device_trusted',
          resource: 'trusted_device',
          result: 'success',
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          afterState: { device_id: device.id, browser: device.browser, os: device.os, country: device.country, expires_at: device.expiresAt.toISOString() },
        }),
      },
    };
  }

  // Un ingreso sin código con un dispositivo ya recordado: solo se actualiza su último ingreso.
  async use(device: TrustedDevice, meta: RequestMeta, now: Date): Promise<DeviceEffect> {
    const place = await this.geo.lookup(meta.ipAddress);
    return { kind: 'use', deviceId: device.id, at: now, ipAddress: meta.ipAddress, country: place?.country ?? null, city: place?.city ?? null };
  }
}
