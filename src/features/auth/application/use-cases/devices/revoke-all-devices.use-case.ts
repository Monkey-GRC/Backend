import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../../common/auth/principal';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { TrustedDeviceRepository } from '../../../domain/repositories/trusted-device.repository';

// D123 · Olvidar todos mis dispositivos. Idempotente: sin ninguno no escribe rastro.
@Injectable()
export class RevokeAllDevicesUseCase {
  constructor(private readonly devices: TrustedDeviceRepository) {}

  async execute(principal: Principal, meta: RequestMeta): Promise<void> {
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    await this.devices.revokeAll(scope, principal.userId, new Date(), ({ count }) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'auth.device_revoked',
      resource: 'trusted_device',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { scope: 'all', count },
    }));
  }
}
