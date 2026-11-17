import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { OsVersionItem } from '../../domain/entities/catalog-item';
import { OsVersionCatalogRepository } from '../../domain/repositories/os-version-catalog.repository';

@Injectable()
export class OsVersionCatalogPrismaRepository extends OsVersionCatalogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findOfferableByOs(osCode: string): Promise<OsVersionItem[]> {
    // Selección explícita: el id de la política en la sonda y su nombre en el catálogo del comité son internos y no se piden nunca.
    const rows = await this.prisma.scaPolicy.findMany({
      where: { osCode, isOfferable: true, versionCode: { not: null }, distribution: { not: null }, distributionName: { not: null }, versionLabel: { not: null } },
      select: { versionCode: true, distribution: true, distributionName: true, versionLabel: true },
      orderBy: { sortOrder: 'asc' },
    });
    // El filtro de arriba garantiza que ninguno es nulo; esto solo lo deja dicho para el tipo.
    return rows.map((r) => ({ code: r.versionCode!, distribution: r.distribution!, distributionName: r.distributionName!, versionLabel: r.versionLabel! }));
  }
}
