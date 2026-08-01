import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { generateToken, hashToken } from 'src/infrastructure/tenancy/fast-token.util';

const ONBOARDING_CODE_TTL_DAYS = 7;

@Injectable()
export class RegenerateOnboardingCodeUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly i18n: I18nService,
  ) {}

  async execute(id: string) {
    const client = await this.clientRepository.findOne(id);
    if (!client) {
      throw new NotFoundException(this.i18n.t('client.NOT_FOUND'));
    }
    if (client.provisioning_status !== 'PENDING') {
      throw new BadRequestException(this.i18n.t('client.ONBOARDING_ALREADY_DONE'));
    }

    const onboardingCode = generateToken(24);
    const onboardingCodeHash = hashToken(onboardingCode);
    const expiresAt = new Date(Date.now() + ONBOARDING_CODE_TTL_DAYS * 24 * 60 * 60 * 1000);

    const updated = await this.clientRepository.regenerateOnboardingCode(id, onboardingCodeHash, expiresAt);

    return { client: updated, onboarding_code: onboardingCode };
  }
}
