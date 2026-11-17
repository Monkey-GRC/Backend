import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ConnectionOptionItem } from '../../domain/entities/catalog-item';
import { ConnectionOptionCatalogRepository } from '../../domain/repositories/connection-option-catalog.repository';

@Injectable()
export class ConnectionOptionCatalogPrismaRepository extends ConnectionOptionCatalogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByCatalog(catalog: string): Promise<ConnectionOptionItem[]> {
    const rows = await this.prisma.connectionOption.findMany({
      where: { catalog },
      orderBy: { sortOrder: 'asc' },
      select: { code: true, availability: true, tags: true },
    });
    return rows;
  }
}
