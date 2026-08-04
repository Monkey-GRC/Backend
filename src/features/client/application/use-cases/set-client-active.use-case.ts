import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';

@Injectable()
export class SetClientActiveUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly tenantConnection: TenantConnectionManager,
    private readonly i18n: I18nService,
  ) {}

  async execute(id: string, isActive: boolean) {
    const existing = await this.clientRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException(this.i18n.t('client.NOT_FOUND'));
    }

    const client = await this.clientRepository.setActive(id, isActive);

    if (!isActive) {
      // Corta de inmediato cualquier conexión ya cacheada a la DB del
      // tenant — si no, seguiría funcionando hasta el próximo reinicio.
      await this.tenantConnection.evict(id);
    }

    return client;
  }
}
