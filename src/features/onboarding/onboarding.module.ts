import { Module } from '@nestjs/common';
import { OrganizationalContextRepository } from './domain/repositories/organizational-context.repository';
import { GetOrganizationalContextUseCase } from './application/use-cases/get-organizational-context.use-case';
import { SaveOrganizationalContextUseCase } from './application/use-cases/save-organizational-context.use-case';
import { OrganizationalContextPrismaRepository } from './infrastructure/repositories/organizational-context.prisma.repository';
import { OnboardingController } from './presentation/onboarding.controller';

@Module({
  controllers: [OnboardingController],
  providers: [
    { provide: OrganizationalContextRepository, useClass: OrganizationalContextPrismaRepository },
    GetOrganizationalContextUseCase,
    SaveOrganizationalContextUseCase,
  ],
})
export class OnboardingModule {}
