import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { FrameworkItem } from '../../domain/entities/catalog-item';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';

@Injectable()
export class FrameworkCatalogPrismaRepository extends FrameworkCatalogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<FrameworkItem[]> {
    // catalog.* tiene política de lectura libre (SELECT USING true): no necesita tenant.
    const rows = await this.prisma.framework.findMany({
      select: { code: true, name: true, scopeDescription: true },
      orderBy: [{ code: 'asc' }, { version: 'desc' }],
    });
    // Un código puede tener varias versiones del marco; al cliente se le ofrece una sola vez.
    const seen = new Set<string>();
    return rows
      .filter((r) => (seen.has(r.code) ? false : (seen.add(r.code), true)))
      .map((r) => ({ code: r.code, name: r.name, description: r.scopeDescription }));
  }
}
