import { Module } from '@nestjs/common';
import { OnboardingModule } from '../onboarding/onboarding.module';
import { ServiceRepository } from './domain/repositories/service.repository';
import { CreateServiceUseCase } from './application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from './application/use-cases/delete-service.use-case';
import { GetServiceUseCase } from './application/use-cases/get-service.use-case';
import { ListServicesUseCase } from './application/use-cases/list-services.use-case';
import { GetSystemDescriptionFileUrlUseCase } from './application/use-cases/get-system-description-file-url.use-case';
import { UploadSystemDescriptionFileUseCase } from './application/use-cases/upload-system-description-file.use-case';
import { SetSystemDescriptionUseCase } from './application/use-cases/set-system-description.use-case';
import { UpdateServiceUseCase } from './application/use-cases/update-service.use-case';
import { ServicePrismaRepository } from './infrastructure/repositories/service.prisma.repository';
import { ServicesController } from './presentation/services.controller';

@Module({
  // OnboardingModule exporta el clonado del catálogo (CloneCatalogService, D40).
  imports: [OnboardingModule],
  controllers: [ServicesController],
  providers: [
    { provide: ServiceRepository, useClass: ServicePrismaRepository },
    CreateServiceUseCase,
    ListServicesUseCase,
    GetServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    SetSystemDescriptionUseCase,
    UploadSystemDescriptionFileUseCase,
    GetSystemDescriptionFileUrlUseCase,
  ],
})
export class ServicesModule {}
