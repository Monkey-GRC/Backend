import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { IntegrationDetail } from '../../domain/entities/integration.entities';
import { contentOf } from '../../domain/integration-content';
import { deriveCoverage } from '../../domain/integration-coverage';
import { summarizeIntegrations } from '../../domain/integration-summary';
import { IntegrationRepository } from '../../domain/repositories/integration.repository';

// GET /v1/integrations/{code}
@Injectable()
export class GetIntegrationUseCase {
  constructor(private readonly integrations: IntegrationRepository) {}

  async execute(principal: Principal, code: string): Promise<IntegrationDetail> {
    const record = await this.integrations.findDetail({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, code);
    const summary = record?.connections ? (summarizeIntegrations([record.connections])[0] ?? null) : null;
    // Para el auditor, una integración que la empresa no tiene conectada es igual de inexistente que un código que no existe.
    if (!record || (principal.role === 'auditor' && !summary)) throw new DomainError('INTEGRATION_NOT_FOUND');
    return { item: record.item, summary, coverage: deriveCoverage(record.coverage), content: contentOf(code) };
  }
}
