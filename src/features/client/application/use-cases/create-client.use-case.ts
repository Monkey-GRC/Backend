import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { TenantProvisioningService } from '../../infrastructure/services/tenant-provisioning.service';
import { generateApiKey } from 'src/infrastructure/tenancy/api-key.util';
import { encryptSecret } from 'src/infrastructure/tenancy/tenant-crypto.util';
import { CreateClientDto } from '../dtos/create-client.dto';

@Injectable()
export class CreateClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly tenantProvisioningService: TenantProvisioningService,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: CreateClientDto) {
    const existing = await this.clientRepository.findByTaxId(dto.tax_id);
    if (existing) {
      throw new BadRequestException(this.i18n.t('client.DUPLICATE_TAX_ID'));
    }

    const { apiKeyId, secret, fullKey } = generateApiKey();
    const apiKeyHash = await bcrypt.hash(secret, 10);

    const client = await this.clientRepository.create({
      tax_id: dto.tax_id,
      name: dto.name,
      api_key_id: apiKeyId,
      api_key_hash: apiKeyHash,
    });

    let provisioned;
    try {
      provisioned = await this.tenantProvisioningService.provision(client.seq);
    } catch (err) {
      await this.clientRepository.setStatus(client.id, 'FAILED');
      throw new InternalServerErrorException(this.i18n.t('client.PROVISIONING_FAILED'));
    }

    const finalClient = await this.clientRepository.finalizeProvisioning(client.id, {
      db_host: provisioned.dbHost,
      db_port: provisioned.dbPort,
      db_name: provisioned.dbName,
      db_user: provisioned.dbUser,
      db_password_enc: encryptSecret(provisioned.dbPassword),
      db_ssl: provisioned.dbSsl,
    });

    return {
      client: finalClient,
      api_key: fullKey,
    };
  }
}
