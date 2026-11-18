import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../../common/auth/principal';
import { DomainError } from '../../../../../common/errors/domain-error';
import { RequestMeta } from '../../../../../common/http/request-meta';
import { TrustedDeviceRepository } from '../../../domain/repositories/trusted-device.repository';
import { TrustedDevices } from '../../services/trusted-devices.service';

// D123 · Olvidar uno de mis dispositivos. `wasCurrent` dice si era el de esta petición (el controlador entonces borra la cookie).
@Injectable()
export class RevokeDeviceUseCase {
  constructor(
    private readonly devices: TrustedDeviceRepository,
    private readonly trusted: TrustedDevices,
  ) {}

  async execute(principal: Principal, deviceId: string, currentToken: string | undefined, meta: RequestMeta): Promise<{ wasCurrent: boolean }> {
    const now = new Date();
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const current = await this.trusted.find(scope, principal.userId, currentToken, now);
    // No existe, ya no está vigente o es de otra persona: no se dice cuál.
    const revoked = await this.devices.revokeOne(scope, principal.userId, deviceId, now, (device) => ({
      tenantId: principal.companyId,
      userId: principal.userId,
      action: 'auth.device_revoked',
      resource: 'trusted_device',
      result: 'success',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      afterState: { device_id: device.id, scope: 'one' },
    }));
    if (!revoked) throw new DomainError('DEVICE_NOT_FOUND');
    return { wasCurrent: current?.id === revoked.id };
  }
}
