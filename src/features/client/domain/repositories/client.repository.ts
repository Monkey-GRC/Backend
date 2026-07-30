import { ClientEntity, ProvisioningStatus } from '../entities/client.entity';

export type CreateClientRow = {
  tax_id: string;
  name: string;
  api_key_id: string;
  api_key_hash: string;
};

export type FinalizeProvisioningInput = {
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;
  db_password_enc: string;
  db_ssl: boolean;
};

export abstract class ClientRepository {
  abstract findAll(): Promise<ClientEntity[]>;
  abstract findOne(id: string): Promise<ClientEntity | null>;
  abstract findByTaxId(taxId: string): Promise<ClientEntity | null>;
  abstract create(input: CreateClientRow): Promise<ClientEntity & { seq: number }>;
  abstract setStatus(id: string, status: ProvisioningStatus): Promise<void>;
  abstract finalizeProvisioning(id: string, input: FinalizeProvisioningInput): Promise<ClientEntity>;
}
