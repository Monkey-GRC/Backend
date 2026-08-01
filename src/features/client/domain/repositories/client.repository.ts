import { ClientEntity, DocumentType } from '../entities/client.entity';

export type CreateClientRow = {
  name: string;
  document_type: DocumentType;
  document_number: string;
  email: string;
  phone: string;
  address: string;
  onboarding_code_hash: string;
  onboarding_code_expires_at: Date;
};

export abstract class ClientRepository {
  abstract findAll(): Promise<ClientEntity[]>;
  abstract findOne(id: string): Promise<ClientEntity | null>;
  abstract findByDocument(documentType: string, documentNumber: string): Promise<ClientEntity | null>;
  abstract create(input: CreateClientRow): Promise<ClientEntity & { seq: number }>;
  abstract setActive(id: string, isActive: boolean): Promise<ClientEntity>;
  abstract regenerateOnboardingCode(id: string, onboardingCodeHash: string, expiresAt: Date): Promise<ClientEntity>;
}
