import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../../common/auth/principal';
import { TrustedDevice } from '../../../domain/entities/trusted-device.entity';
import { TrustedDeviceRepository } from '../../../domain/repositories/trusted-device.repository';
import { TrustedDevices } from '../../services/trusted-devices.service';

export type ListedDevice = { device: TrustedDevice; isCurrent: boolean };

// D123 · Mis dispositivos recordados vigentes, del más reciente al más antiguo; `isCurrent` marca el de la cookie de esta petición.
@Injectable()
export class ListDevicesUseCase {
  constructor(
    private readonly devices: TrustedDeviceRepository,
    private readonly trusted: TrustedDevices,
  ) {}

  async execute(principal: Principal, currentToken: string | undefined): Promise<ListedDevice[]> {
    const now = new Date();
    const scope = { companyId: principal.companyId, userId: principal.userId, role: principal.role };
    const [list, current] = await Promise.all([this.devices.listActive(scope, principal.userId, now), this.trusted.find(scope, principal.userId, currentToken, now)]);
    return list.map((device) => ({ device, isCurrent: device.id === current?.id }));
  }
}
