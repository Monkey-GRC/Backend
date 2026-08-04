import { ConflictException, GoneException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { hashToken } from 'src/infrastructure/tenancy/fast-token.util';
import { GetAllMasterTemplatesUseCase } from 'src/features/template/application/use-cases/get-all-master-templates.use-case';

/**
 * Protegido con el onboarding_code (no con sesión — todavía no existe
 * ninguna) para que el catálogo de plantillas maestras no quede expuesto a
 * cualquiera, solo a un cliente real en proceso de alta.
 */
@Injectable()
export class GetOnboardingMasterTemplatesUseCase {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly getAllMasterTemplatesUseCase: GetAllMasterTemplatesUseCase,
    private readonly i18n: I18nService,
  ) {}

  async execute(onboardingCode: string) {
    if (!onboardingCode) {
      throw new BadRequestException(this.i18n.t('onboarding.INVALID_CODE'));
    }

    const client = await this.centralPrisma.client.findUnique({
      where: { onboarding_code_hash: hashToken(onboardingCode) },
    });

    if (!client) {
      throw new UnauthorizedException(this.i18n.t('onboarding.INVALID_CODE'));
    }
    if (client.onboarding_completed_at) {
      throw new ConflictException(this.i18n.t('onboarding.ALREADY_COMPLETED'));
    }
    if (!client.onboarding_code_expires_at || client.onboarding_code_expires_at < new Date()) {
      throw new GoneException(this.i18n.t('onboarding.CODE_EXPIRED'));
    }

    return this.getAllMasterTemplatesUseCase.execute();
  }
}
