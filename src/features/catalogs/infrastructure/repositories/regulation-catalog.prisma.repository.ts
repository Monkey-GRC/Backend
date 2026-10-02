import { Injectable } from '@nestjs/common';
import { REGULATION_CODES } from '../../../../common/catalogs/onboarding-catalogs';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { RegulationItem } from '../../domain/entities/catalog-item';
import { RegulationCatalogRepository } from '../../domain/repositories/regulation-catalog.repository';

@Injectable()
export class RegulationCatalogPrismaRepository extends RegulationCatalogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<RegulationItem[]> {
    // catalog.* tiene política de lectura libre (SELECT USING true): no necesita tenant.
    const rows = await this.prisma.regulation.findMany({
      select: { code: true, name: true, jurisdiction: true },
    });
    // Orden estable y el del contrato (enums.md), con "Ninguna" y "Otra" al final.
    const order = new Map<string, number>(REGULATION_CODES.map((c, i) => [c, i]));
    return rows.sort((a, b) => (order.get(a.code) ?? 99) - (order.get(b.code) ?? 99));
  }
}
