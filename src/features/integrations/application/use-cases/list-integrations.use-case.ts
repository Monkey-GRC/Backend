import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { IntegrationSummary } from '../../domain/entities/integration.entities';
import { summarizeIntegrations } from '../../domain/integration-summary';
import { IntegrationRepository } from '../../domain/repositories/integration.repository';

// GET /v1/integrations
@Injectable()
export class ListIntegrationsUseCase {
  constructor(private readonly integrations: IntegrationRepository) {}

  async execute(principal: Principal): Promise<IntegrationSummary[]> {
    const rows = await this.integrations.findConnections({ companyId: principal.companyId, userId: principal.userId, role: principal.role });
    return summarizeIntegrations(rows);
  }
}
