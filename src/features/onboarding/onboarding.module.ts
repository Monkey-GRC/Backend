import { Module } from '@nestjs/common';
import { CloneCatalogService } from './application/clone-catalog.service';
import { OrganizationalContextRepository } from './domain/repositories/organizational-context.repository';
import { GetOrganizationalContextUseCase } from './application/use-cases/get-organizational-context.use-case';
import { SaveOrganizationalContextUseCase } from './application/use-cases/save-organizational-context.use-case';
import { OrganizationalContextPrismaRepository } from './infrastructure/repositories/organizational-context.prisma.repository';
import { OnboardingController } from './presentation/onboarding.controller';

// Componente 1 (contexto organizacional) y el clonado del catálogo (MD-80). El Componente 2 (feature
// `services`) importa este módulo para clonar el catálogo al contratar un marco.
@Module({
  controllers: [OnboardingController],
  providers: [
    { provide: OrganizationalContextRepository, useClass: OrganizationalContextPrismaRepository },
    GetOrganizationalContextUseCase,
    SaveOrganizationalContextUseCase,
    CloneCatalogService,
  ],
  exports: [CloneCatalogService],
})
export class OnboardingModule {}
