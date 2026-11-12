import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { countRecognizedResources, liveConnectionWhere } from '../../../../infrastructure/database/asset-visibility';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { CatalogIntegration, ConnectionRecord, IntegrationConnections, CoverageRecord, IntegrationDetailRecord } from '../../domain/entities/integration.entities';
import { IntegrationRepository } from '../../domain/repositories/integration.repository';

const PLATFORM_SELECT = { code: true, name: true, logoKey: true, availability: true, automatedCapability: { select: { catalogCode: true } } } as const;

// Nombre, logo y disponibilidad: los de la plataforma si la integración la tiene (un dato, un dueño, D110).
const resolve = (i: { name: string | null; logoKey: string | null; availability: 'available' | 'coming_soon' | null; capabilityPlatform: { name: string; logoKey: string; availability: 'available' | 'coming_soon' } | null }) => ({
  name: i.capabilityPlatform?.name ?? i.name ?? '',
  logoKey: i.capabilityPlatform?.logoKey ?? i.logoKey ?? '',
  availability: i.capabilityPlatform?.availability ?? i.availability ?? 'coming_soon',
});

@Injectable()
export class IntegrationPrismaRepository extends IntegrationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findCatalog(scope: TenantScope): Promise<CatalogIntegration[]> {
    return this.prisma.withScope(scope, (tx) => this.loadCatalog(tx, scope));
  }

  findConnections(scope: TenantScope): Promise<IntegrationConnections[]> {
    return this.prisma.withScope(scope, (tx) => this.loadConnections(tx, scope));
  }

  // El detalle reutiliza lo mismo que el catálogo y la lista (una sola regla); solo añade la cobertura del catálogo.
  findDetail(scope: TenantScope, code: string): Promise<IntegrationDetailRecord | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const [catalog, [connections]] = await Promise.all([this.loadCatalog(tx, scope), this.loadConnections(tx, scope, code)]);
      const item = catalog.find((i) => i.code === code);
      if (!item) return null;
      return { item, connections: connections ?? null, coverage: item.connection ? await this.loadCoverage(tx, item.connection.platform) : null };
    });
  }

  private async loadCatalog(tx: TransactionClient, scope: TenantScope): Promise<CatalogIntegration[]> {
    {
      const [rows, owned] = await Promise.all([
        tx.integration.findMany({ include: { capabilityPlatform: { select: PLATFORM_SELECT } } }),
        tx.asset.findMany({ where: { ...liveConnectionWhere(scope.companyId), platformId: { not: null } }, select: { platformId: true }, distinct: ['platformId'] }),
      ]);
      const connectedPlatforms = new Set(owned.map((a) => a.platformId));
      return rows
        .sort((a, b) => (a.purpose === b.purpose ? a.sortOrder - b.sortOrder : a.purpose === 'measurement' ? -1 : 1))
        .map((i) => ({
          code: i.code,
          ...resolve(i),
          purpose: i.purpose,
          connection: i.capabilityPlatform ? { category: i.capabilityPlatform.automatedCapability.catalogCode, platform: i.capabilityPlatform.code } : null,
          connected: i.capabilityPlatformId !== null && connectedPlatforms.has(i.capabilityPlatformId),
        }));
    }
  }

  private async loadConnections(tx: TransactionClient, scope: TenantScope, code?: string): Promise<IntegrationConnections[]> {
    {
      const [integrations, assets] = await Promise.all([
        tx.integration.findMany({ where: { capabilityPlatformId: { not: null }, ...(code ? { code } : {}) }, include: { capabilityPlatform: { select: PLATFORM_SELECT } } }),
        tx.asset.findMany({
          where: { ...liveConnectionWhere(scope.companyId), platformId: { not: null }, ...(code ? { capabilityPlatform: { is: { integration: { is: { code } } } } } : {}) },
          orderBy: { code: 'asc' },
          select: {
            id: true,
            code: true,
            name: true,
            platformId: true,
            operationalStatus: true,
            provisionings: { take: 1, select: { connectionStatus: true, lastValidatedAt: true, regions: true, inventoryAt: true } },
            serviceAssets: { select: { service: { select: { id: true, name: true } } } },
          },
        }),
      ]);

      const resourceCount = await countRecognizedResources(tx, assets.map((a) => ({ id: a.id, regions: a.provisionings[0].regions, inventoryAt: a.provisionings[0].inventoryAt })));

      const byPlatform = new Map<string, ConnectionRecord[]>();
      for (const a of assets) {
        const p = a.provisionings[0];
        const record: ConnectionRecord = {
          assetId: a.id,
          code: a.code,
          name: a.name,
          connectionStatus: p.connectionStatus,
          operationalStatus: a.operationalStatus,
          lastValidatedAt: p.lastValidatedAt,
          resourceCount: resourceCount.get(a.id) ?? 0,
          services: a.serviceAssets.map((s) => s.service).sort((x, y) => x.name.localeCompare(y.name)),
        };
        byPlatform.set(a.platformId as string, [...(byPlatform.get(a.platformId as string) ?? []), record]);
      }
      return integrations.map((i) => ({
        code: i.code,
        name: resolve(i).name,
        logoKey: resolve(i).logoKey,
        purpose: i.purpose,
        sortOrder: i.sortOrder,
        connections: byPlatform.get(i.capabilityPlatformId as string) ?? [],
      }));
    }
  }

  // La cobertura sale del catálogo: un check pertenece a una plataforma por su campo `platform` (el código de la plataforma de conexión). Una prueba entra si tiene al menos un check
  // de esa plataforma, con cualquier procedencia (D56). Tres consultas fijas, sin importar cuántas pruebas haya.
  private async loadCoverage(tx: TransactionClient, platform: string): Promise<CoverageRecord | null> {
    if ((await tx.check.count({ where: { platform } })) === 0) return null;
    const tests = await tx.test.findMany({
      where: { isActive: true, testChecks: { some: { check: { platform } } } },
      orderBy: { code: 'asc' },
      select: { code: true, name: true, displayName: true, displayNameEn: true, controlTests: { where: { control: { isActive: true } }, select: { controlId: true } } },
    });
    const controlIds = [...new Set(tests.flatMap((t) => t.controlTests.map((c) => c.controlId)))];
    const links = controlIds.length
      ? await tx.pointOfFocusControl.findMany({
          where: { controlId: { in: controlIds } },
          select: { controlId: true, pointOfFocus: { select: { requirement: { select: { framework: { select: { code: true, name: true } } } } } } },
        })
      : [];
    return {
      // `name` es del comité y puede nombrar al motor: al cliente solo llega el nombre neutro (D70), que el mapper elige según el idioma.
      tests: tests.map((t) => ({ code: t.code, displayName: t.displayName, displayNameEn: t.displayNameEn })),
      controlIds,
      frameworkLinks: links.map((l) => ({ controlId: l.controlId, frameworkCode: l.pointOfFocus.requirement.framework.code, frameworkName: l.pointOfFocus.requirement.framework.name })),
    };
  }
}
