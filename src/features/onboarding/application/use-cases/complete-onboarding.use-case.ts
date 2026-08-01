import {
  ConflictException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantProvisioningService } from 'src/infrastructure/tenancy/tenant-provisioning.service';
import { createTenantPrismaClient } from 'src/infrastructure/tenancy/tenant-prisma-client.factory';
import { buildPostgresUrl } from 'src/infrastructure/tenancy/tenant-db.util';
import { encryptSecret } from 'src/infrastructure/tenancy/tenant-crypto.util';
import { generateToken, hashToken } from 'src/infrastructure/tenancy/fast-token.util';
import { Role } from 'src/common/enums/role.enum';
import { AuthService } from 'src/features/auth/application/auth.service';
import { cloneMasterTemplateIntoTenant } from 'src/features/template/application/use-cases/adopt-template.use-case';
import { CompleteOnboardingDto } from '../dtos/complete-onboarding.dto';

@Injectable()
export class CompleteOnboardingUseCase {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly tenantProvisioningService: TenantProvisioningService,
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: CompleteOnboardingDto) {
    const onboardingCodeHash = hashToken(dto.onboarding_code);
    const client = await this.centralPrisma.client.findUnique({
      where: { onboarding_code_hash: onboardingCodeHash },
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

    const masterTemplate = await this.centralPrisma.template.findUnique({
      where: { id: dto.template_id },
      select: { id: true },
    });
    if (!masterTemplate) {
      throw new NotFoundException(this.i18n.t('onboarding.TEMPLATE_NOT_FOUND'));
    }

    await this.centralPrisma.client.update({
      where: { id: client.id },
      data: { provisioning_status: 'PROVISIONING' },
    });

    let provisioned;
    try {
      provisioned = await this.tenantProvisioningService.provision(client.seq);
    } catch (err) {
      await this.centralPrisma.client.update({
        where: { id: client.id },
        data: { provisioning_status: 'FAILED' },
      });
      throw new InternalServerErrorException(this.i18n.t('onboarding.PROVISIONING_FAILED'));
    }

    const clientIdentifier = generateToken(16);
    const clientKey = generateToken(24);
    const clientKeyHash = hashToken(clientKey);

    const databaseUrl = buildPostgresUrl({
      host: provisioned.dbHost,
      port: provisioned.dbPort,
      database: provisioned.dbName,
      user: provisioned.dbUser,
      password: provisioned.dbPassword,
      ssl: provisioned.dbSsl,
    });
    const tenantDb = createTenantPrismaClient(databaseUrl);

    let createdUser: any;
    try {
      await tenantDb.$connect();
      const passwordHash = await bcrypt.hash(dto.password, 10);
      createdUser = await tenantDb.user.create({
        data: {
          email: dto.email.toLowerCase(),
          username: dto.username,
          password: passwordHash,
          name: dto.name,
          last_name: dto.last_name,
          role: Role.CLIENT_ADMIN,
        },
      });

      if (dto.business_type || dto.server_count) {
        await tenantDb.companyProfile.create({
          data: { business_type: dto.business_type, server_count: dto.server_count },
        });
      }

      await cloneMasterTemplateIntoTenant(this.centralPrisma, tenantDb, dto.template_id, this.i18n);
    } catch (err) {
      await tenantDb.$disconnect();
      await this.tenantProvisioningService.deprovision(provisioned.dbName, provisioned.dbUser);
      await this.centralPrisma.client.update({
        where: { id: client.id },
        data: { provisioning_status: 'FAILED' },
      });
      if (err instanceof NotFoundException) {
        throw new NotFoundException(this.i18n.t('onboarding.TEMPLATE_NOT_FOUND'));
      }
      throw new InternalServerErrorException(this.i18n.t('onboarding.ADMIN_CREATE_FAILED'));
    }

    await this.centralPrisma.client.update({
      where: { id: client.id },
      data: {
        client_identifier: clientIdentifier,
        client_key_hash: clientKeyHash,
        db_host: provisioned.dbHost,
        db_port: provisioned.dbPort,
        db_name: provisioned.dbName,
        db_user: provisioned.dbUser,
        db_password_enc: encryptSecret(provisioned.dbPassword),
        db_ssl: provisioned.dbSsl,
        provisioning_status: 'READY',
        provisioned_at: new Date(),
        onboarding_completed_at: new Date(),
        onboarding_code_hash: null,
      },
    });

    const session = await this.authService.issueTokens(createdUser, client.id, tenantDb);
    await tenantDb.$disconnect();

    return {
      ...session,
      client_identifier: clientIdentifier,
      client_key: clientKey,
    };
  }
}
