import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { RegionItem } from '../../domain/entities/catalog-item';
import { RegionCatalogRepository } from '../../domain/repositories/region-catalog.repository';

@Injectable()
export class RegionCatalogPrismaRepository extends RegionCatalogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByPlatform(platformCode: string): Promise<RegionItem[]> {
    return this.prisma.platformRegion.findMany({
      where: { platform: { code: platformCode } },
      select: { code: true, name: true },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
