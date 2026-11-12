import { Module } from '@nestjs/common';
import { GetIntegrationCatalogUseCase } from './application/use-cases/get-integration-catalog.use-case';
import { GetIntegrationUseCase } from './application/use-cases/get-integration.use-case';
import { ListIntegrationsUseCase } from './application/use-cases/list-integrations.use-case';
import { IntegrationRepository } from './domain/repositories/integration.repository';
import { IntegrationPrismaRepository } from './infrastructure/repositories/integration.prisma.repository';
import { IntegrationsController } from './presentation/integrations.controller';

@Module({
  controllers: [IntegrationsController],
  providers: [{ provide: IntegrationRepository, useClass: IntegrationPrismaRepository }, GetIntegrationCatalogUseCase, ListIntegrationsUseCase, GetIntegrationUseCase],
})
export class IntegrationsModule {}
