import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { CatalogIntegration } from '../../domain/entities/integration.entities';
import { IntegrationRepository } from '../../domain/repositories/integration.repository';

// GET /v1/integrations/catalog
@Injectable()
export class GetIntegrationCatalogUseCase {
  constructor(private readonly integrations: IntegrationRepository) {}

  execute(principal: Principal): Promise<CatalogIntegration[]> {
    return this.integrations.findCatalog({ companyId: principal.companyId, userId: principal.userId, role: principal.role });
  }
}
