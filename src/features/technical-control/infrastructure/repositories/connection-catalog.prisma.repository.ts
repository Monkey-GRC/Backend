import { Injectable } from '@nestjs/common';
import { ConnectionCategory, ConnectionMethodValue } from '../../../../common/catalogs/technical-catalogs';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { OsVersionRule, PlatformRule } from '../../domain/entities/technical-control.entities';
import { ConnectionCatalogRepository } from '../../domain/repositories/connection-catalog.repository';

const PLATFORM_INCLUDE = {
  automatedCapability: { select: { catalogCode: true } },
  connectionMethods: { orderBy: { sortOrder: 'asc' as const } },
  regions: { orderBy: { sortOrder: 'asc' as const } },
};

type PlatformRow = {
  id: string;
  code: string;
  name: string;
  logoKey: string;
  availability: 'available' | 'coming_soon';
  automatedCapability: { catalogCode: string };
  connectionMethods: { connectionMethod: string }[];
  regions: { code: string }[];
};

const toRule = (p: PlatformRow): PlatformRule => ({
  id: p.id,
  code: p.code,
  name: p.name,
  logoKey: p.logoKey,
  availability: p.availability,
  capabilityCode: p.automatedCapability.catalogCode as ConnectionCategory,
  connectionMethods: p.connectionMethods.map((m) => m.connectionMethod as ConnectionMethodValue),
  regionCodes: p.regions.map((r) => r.code),
});

@Injectable()
export class ConnectionCatalogPrismaRepository extends ConnectionCatalogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findPlatform(category: ConnectionCategory, code: string): Promise<PlatformRule | null> {
    const row = await this.prisma.capabilityPlatform.findFirst({
      where: { code, automatedCapability: { catalogCode: category } },
      include: PLATFORM_INCLUDE,
    });
    return row ? toRule(row) : null;
  }

  async findPlatformById(id: string): Promise<PlatformRule | null> {
    const row = await this.prisma.capabilityPlatform.findUnique({ where: { id }, include: PLATFORM_INCLUDE });
    return row ? toRule(row) : null;
  }

  async findOsVersion(code: string): Promise<OsVersionRule | null> {
    // Selección explícita: el id de la política en la sonda y su nombre en el catálogo del comité son internos y no se piden nunca.
    const row = await this.prisma.scaPolicy.findFirst({
      where: { versionCode: code, isOfferable: true, osCode: { not: null }, distribution: { not: null }, distributionName: { not: null }, versionLabel: { not: null } },
      select: { id: true, osCode: true, versionCode: true, distribution: true, distributionName: true, versionLabel: true },
    });
    // El filtro garantiza que ninguno es nulo; esto solo lo deja dicho para el tipo.
    return row ? { id: row.id, osCode: row.osCode!, code: row.versionCode!, distribution: row.distribution!, distributionName: row.distributionName!, versionLabel: row.versionLabel! } : null;
  }
}
