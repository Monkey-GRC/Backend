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
        method: true,
        requiredPermissions: true,
        baseFrequency: true,
        generatedEvidence: true,
        // Las plataformas que el cliente elige (D67), en el orden del catálogo; el primer canal es el recomendado.
        platforms: {
          orderBy: { sortOrder: 'asc' },
          select: {
            code: true,
            name: true,
            logoKey: true,
            availability: true,
            connectionMethods: { orderBy: { sortOrder: 'asc' }, select: { connectionMethod: true } },
          },
        },
      },
      orderBy: { catalogCode: 'asc' },
    });
    return rows.map(({ platforms, ...r }) => ({
      ...r,
      requiredPermissions: asStrings(r.requiredPermissions),
      platforms: platforms.map((p) => ({
        code: p.code,
        name: p.name,
        logoKey: p.logoKey,
        availability: p.availability,
        connectionMethods: p.connectionMethods.map((m) => m.connectionMethod),
      })),
    }));
  }
}
