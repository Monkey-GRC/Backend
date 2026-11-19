import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AuthUser } from '../../domain/entities/auth-user.entity';
import { CurrentUserReader, OnboardingFlags } from '../../domain/ports/current-user.reader';
import { loadAuthUser } from './auth-user.prisma.repository';
import { loadOnboardingFlags } from './onboarding-progress.prisma.reader';

@Injectable()
export class CurrentUserPrismaReader extends CurrentUserReader {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  read(scope: TenantScope, userId: string, withOnboarding: boolean): Promise<{ user: AuthUser; onboarding: OnboardingFlags | null } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const user = await loadAuthUser(tx, userId);
      if (!user) return null;
      return { user, onboarding: withOnboarding ? await loadOnboardingFlags(tx, user.companyId) : null };
    });
  }
}
