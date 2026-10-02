import { Module } from '@nestjs/common';
import { CloneCatalogService } from './application/clone-catalog.service';

// El Componente 2 del onboarding (MD-77, MD-78) importará este módulo para clonar el catálogo al contratar un marco.
@Module({
  providers: [CloneCatalogService],
  exports: [CloneCatalogService],
})
export class OnboardingModule {}
