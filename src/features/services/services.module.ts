import { Module } from '@nestjs/common';
import { ServiceRepository } from './domain/repositories/service.repository';
import { CreateServiceUseCase } from './application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from './application/use-cases/delete-service.use-case';
import { GetServiceUseCase } from './application/use-cases/get-service.use-case';
import { ListServicesUseCase } from './application/use-cases/list-services.use-case';
import { SetSystemDescriptionUseCase } from './application/use-cases/set-system-description.use-case';
import { UpdateServiceUseCase } from './application/use-cases/update-service.use-case';
import { ServicePrismaRepository } from './infrastructure/repositories/service.prisma.repository';
import { ServicesController } from './presentation/services.controller';

@Module({
  controllers: [ServicesController],
  providers: [
    { provide: ServiceRepository, useClass: ServicePrismaRepository },
    CreateServiceUseCase,
    ListServicesUseCase,
    GetServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    SetSystemDescriptionUseCase,
  ],
})
export class ServicesModule {}
