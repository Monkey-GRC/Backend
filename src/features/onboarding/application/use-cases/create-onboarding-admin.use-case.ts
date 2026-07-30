import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { TenantConnectionManager } from 'src/infrastructure/tenancy/tenant-connection-manager.service';
import { resolveClientByApiKey } from 'src/infrastructure/tenancy/resolve-client-by-api-key';
import { Role } from 'src/common/enums/role.enum';
import { CreateOnboardingAdminDto } from '../dtos/create-onboarding-admin.dto';

@Injectable()
export class CreateOnboardingAdminUseCase {
  constructor(
    private readonly centralPrisma: CentralPrismaService,
    private readonly tenantConnection: TenantConnectionManager,
    private readonly i18n: I18nService,
  ) {}

  async execute(dto: CreateOnboardingAdminDto): Promise<{ clientId: string }> {
    const client = await resolveClientByApiKey(this.centralPrisma, dto.api_key);
    const tenantDb = await this.tenantConnection.getClientFor(client.id);

    // Este endpoint solo sirve para crear el PRIMER admin del tenant — si ya
    // hay algún usuario, se rechaza (evita que cualquiera con el api_key
    // pueda seguir creando administradores indefinidamente).
    const existingUsers = await tenantDb.user.count();
    if (existingUsers > 0) {
      throw new ConflictException(this.i18n.t('onboarding.ADMIN_ALREADY_EXISTS'));
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await tenantDb.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username,
        password: passwordHash,
        name: dto.name,
        last_name: dto.last_name,
        role: Role.CLIENT_ADMIN,
      },
    });

    return { clientId: client.id };
  }
}
