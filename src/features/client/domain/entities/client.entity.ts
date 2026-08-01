export type ProvisioningStatus = 'PENDING' | 'PROVISIONING' | 'READY' | 'FAILED';
export type DocumentType = 'NIT' | 'RUC' | 'CEDULA' | 'PASAPORTE' | 'OTRO';

export interface ClientEntity {
  id: string;
  name: string;
  document_type: DocumentType;
  document_number: string;
  email: string;
  phone: string;
  address: string;
  seq: number;
  is_active: boolean;
  client_identifier: string | null;
  provisioning_status: ProvisioningStatus;
  onboarding_code_expires_at: Date | null;
  onboarding_completed_at: Date | null;
  provisioned_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
