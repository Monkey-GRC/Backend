import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import {
  ClientRepository,
  CreateClientRow,
  FinalizeProvisioningInput,
} from '../../domain/repositories/client.repository';

const SAFE_CLIENT_SELECT = {
  id: true,
  tax_id: true,
  name: true,
  seq: true,
  is_active: true,
  api_key_id: true,
  provisioning_status: true,
  provisioned_at: true,
  created_at: true,
  updated_at: true,
};

@Injectable()
export class ClientPrismaRepository extends ClientRepository {
  constructor(private readonly prisma: CentralPrismaService) {
    super();
  }

  findAll() {
    return this.prisma.client.findMany({ select: SAFE_CLIENT_SELECT, orderBy: { seq: 'asc' } }) as any;
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({ where: { id }, select: SAFE_CLIENT_SELECT }) as any;
  }

  findByTaxId(taxId: string) {
    return this.prisma.client.findUnique({ where: { tax_id: taxId }, select: SAFE_CLIENT_SELECT }) as any;
  }

  async create(input: CreateClientRow) {
    return this.prisma.client.create({
      data: {
        tax_id: input.tax_id,
        name: input.name,
        is_active: false,
        provisioning_status: 'PROVISIONING',
        api_key_id: input.api_key_id,
        api_key_hash: input.api_key_hash,
        // Placeholders temporales de conexión — se completan en
        // finalizeProvisioning() una vez que la DB física existe. No pueden
        // quedar NULL porque el schema los exige.
        db_host: '',
        db_port: 0,
        db_name: '',
        db_user: '',
        db_password_enc: '',
      },
      select: { ...SAFE_CLIENT_SELECT, seq: true },
    }) as any;
  }

  async setStatus(id: string, status: 'PENDING' | 'PROVISIONING' | 'READY' | 'FAILED') {
    await this.prisma.client.update({ where: { id }, data: { provisioning_status: status } });
  }

  async finalizeProvisioning(id: string, input: FinalizeProvisioningInput) {
    return this.prisma.client.update({
      where: { id },
      data: {
        db_host: input.db_host,
        db_port: input.db_port,
        db_name: input.db_name,
        db_user: input.db_user,
        db_password_enc: input.db_password_enc,
        db_ssl: input.db_ssl,
        provisioning_status: 'READY',
        is_active: true,
        provisioned_at: new Date(),
      },
      select: SAFE_CLIENT_SELECT,
    }) as any;
  }
}
