import { Module } from '@nestjs/common';
import { ClientController } from './presentation/client.controller';
import { ClientRepository } from './domain/repositories/client.repository';
import { ClientPrismaRepository } from './infrastructure/repositories/client.prisma.repository';
import { TenantProvisioningService } from './infrastructure/services/tenant-provisioning.service';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { GetAllClientsUseCase } from './application/use-cases/get-all-clients.use-case';
import { GetOneClientUseCase } from './application/use-cases/get-one-client.use-case';

@Module({
  controllers: [ClientController],
  providers: [
    {
      provide: ClientRepository,
      useClass: ClientPrismaRepository,
    },
    TenantProvisioningService,
    CreateClientUseCase,
    GetAllClientsUseCase,
    GetOneClientUseCase,
  ],
})
export class ClientModule {}
