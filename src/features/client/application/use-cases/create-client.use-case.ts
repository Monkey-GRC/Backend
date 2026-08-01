import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { generateToken, hashToken } from 'src/infrastructure/tenancy/fast-token.util';
import { CreateClientDto } from '../dtos/create-client.dto';

const ONBOARDING_CODE_TTL_DAYS = 7;

@Injectable()
export class CreateClientUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: CreateClientDto) {
    const existing = await this.clientRepository.findByDocument(dto.document_type, dto.document_number);
    if (existing) {
      throw new BadRequestException(this.i18n.t('client.DUPLICATE_DOCUMENT'));
    }

    const onboardingCode = generateToken(24);
    const onboardingCodeHash = hashToken(onboardingCode);
    const expiresAt = new Date(Date.now() + ONBOARDING_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);

    const client = await this.clientRepository.create({
      name: dto.name,
      document_type: dto.document_type,
      document_number: dto.document_number,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      onboarding_code_hash: onboardingCodeHash,
      onboarding_code_expires_at: expiresAt,
    });

    return { client, onboarding_code: onboardingCode };
  }
}
