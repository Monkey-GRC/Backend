import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CapabilityItem } from '../../domain/entities/catalog-item';
import { CapabilityCatalogRepository } from '../../domain/repositories/capability-catalog.repository';

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

@Injectable()
export class CapabilityCatalogPrismaRepository extends CapabilityCatalogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<CapabilityItem[]> {
    // Selección explícita: `provider` NO se pide nunca, así no puede salir ni por descuido.
    const rows = await this.prisma.automatedCapability.findMany({
      select: {
        catalogCode: true,
        category: true,
        supportedPlatforms: true,
        method: true,
        requiredPermissions: true,
        baseFrequency: true,
        generatedEvidence: true,
      },
      orderBy: { catalogCode: 'asc' },
    });
    return rows.map((r) => ({
      ...r,
      supportedPlatforms: asStrings(r.supportedPlatforms),
      requiredPermissions: asStrings(r.requiredPermissions),
    }));
  }
}
