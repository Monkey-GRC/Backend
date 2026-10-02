import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { FrameworkItem } from '../../domain/entities/catalog-item';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';

// GET /v1/catalogs/contracted-frameworks: los marcos entre los que el cliente puede elegir al declarar
// un servicio, es decir, los que Monkey Admin contrató para su empresa (D43).
@Injectable()
export class GetContractedFrameworksUseCase {
  constructor(private readonly frameworks: FrameworkCatalogRepository) {}

  execute(principal: Principal): Promise<FrameworkItem[]> {
    return this.frameworks.findContracted({
      companyId: principal.companyId,
      userId: principal.userId,
      role: principal.role,
    });
  }
}
