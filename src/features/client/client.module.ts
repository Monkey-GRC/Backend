import { Module } from '@nestjs/common';
import { ClientController } from './presentation/client.controller';
import { ClientRepository } from './domain/repositories/client.repository';
import { ClientPrismaRepository } from './infrastructure/repositories/client.prisma.repository';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { GetAllClientsUseCase } from './application/use-cases/get-all-clients.use-case';
import { GetOneClientUseCase } from './application/use-cases/get-one-client.use-case';
import { RegenerateOnboardingCodeUseCase } from './application/use-cases/regenerate-onboarding-code.use-case';
import { SetClientActiveUseCase } from './application/use-cases/set-client-active.use-case';

@Module({
  controllers: [ClientController],
  providers: [
    {
      provide: ClientRepository,
      useClass: ClientPrismaRepository,
    },
    CreateClientUseCase,
    GetAllClientsUseCase,
    GetOneClientUseCase,
    RegenerateOnboardingCodeUseCase,
    SetClientActiveUseCase,
  ],
})
export class ClientModule {}
