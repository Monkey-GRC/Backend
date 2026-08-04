import { Injectable } from '@nestjs/common';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import {
  ClientRepository,
  CreateClientRow,
} from '../../domain/repositories/client.repository';

const SAFE_CLIENT_SELECT = {
  id: true,
  name: true,
  document_type: true,
  document_number: true,
  email: true,
  phone: true,
  address: true,
  seq: true,
  is_active: true,
  client_identifier: true,
  provisioning_status: true,
  onboarding_code_expires_at: true,
  onboarding_completed_at: true,
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

  findByDocument(documentType: string, documentNumber: string) {
    return this.prisma.client.findUnique({
      where: {
        document_type_document_number: {
          document_type: documentType as any,
          document_number: documentNumber,
        },
      },
      select: SAFE_CLIENT_SELECT,
    }) as any;
  }

  async create(input: CreateClientRow) {
    return this.prisma.client.create({
      data: {
        name: input.name,
        document_type: input.document_type as any,
        document_number: input.document_number,
        email: input.email,
        phone: input.phone,
        address: input.address,
        onboarding_code_hash: input.onboarding_code_hash,
        onboarding_code_expires_at: input.onboarding_code_expires_at,
        provisioning_status: 'PENDING',
        is_active: true,
      },
      select: { ...SAFE_CLIENT_SELECT, seq: true },
    }) as any;
  }

  async setActive(id: string, isActive: boolean) {
    return this.prisma.client.update({
      where: { id },
      data: { is_active: isActive },
      select: SAFE_CLIENT_SELECT,
    }) as any;
  }

  async regenerateOnboardingCode(id: string, onboardingCodeHash: string, expiresAt: Date) {
    return this.prisma.client.update({
      where: { id },
      data: {
        onboarding_code_hash: onboardingCodeHash,
        onboarding_code_expires_at: expiresAt,
      },
      select: SAFE_CLIENT_SELECT,
    }) as any;
  }
}
