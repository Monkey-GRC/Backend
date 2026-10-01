import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
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
}
