export type ProvisioningStatus = 'PENDING' | 'PROVISIONING' | 'READY' | 'FAILED';

export interface ClientEntity {
  id: string;
  tax_id: string;
  name: string;
  seq: number;
  is_active: boolean;
  api_key_id: string;
  provisioning_status: ProvisioningStatus;
  provisioned_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
