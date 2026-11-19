import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import type { OnboardingFlags } from '../../domain/ports/current-user.reader';
import { OnboardingProgressReader } from '../../domain/ports/onboarding-progress.reader';

@Injectable()
export class OnboardingProgressPrismaReader extends OnboardingProgressReader {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async hasOrganizationalContext(scope: TenantScope): Promise<boolean> {
    const count = await this.prisma.withScope(scope, (tx) =>
      tx.organization.count({ where: { companyId: scope.companyId } }),
    );
    return count > 0;
  }

  async hasDeclaredService(scope: TenantScope): Promise<boolean> {
    const count = await this.prisma.withScope(scope, (tx) =>
      tx.service.count({
        where: {
          organization: { companyId: scope.companyId },
          frameworks: { some: { status: 'active' } },
          systemDescription: { isNot: null },
        },
      }),
    );
    return count > 0;
  }

  async hasTechnicalControl(scope: TenantScope): Promise<boolean> {
    const count = await this.prisma.withScope(scope, (tx) =>
      tx.service.count({
        where: {
          organization: { companyId: scope.companyId },
          serviceAssets: { some: {} },
        },
      }),
    );
    return count > 0;
  }
}

// Los tres pasos leídos con la transacción de quien llama (GET /auth/me: una sola transacción).
export async function loadOnboardingFlags(tx: TransactionClient, companyId: string): Promise<OnboardingFlags> {
  const organizations = await tx.organization.count({ where: { companyId } });
  const declared = await tx.service.count({ where: { organization: { companyId }, frameworks: { some: { status: 'active' } }, systemDescription: { isNot: null } } });
  const technical = await tx.service.count({ where: { organization: { companyId }, serviceAssets: { some: {} } } });
  return { organizationalContext: organizations > 0, declaredService: declared > 0, technicalControl: technical > 0 };
}
