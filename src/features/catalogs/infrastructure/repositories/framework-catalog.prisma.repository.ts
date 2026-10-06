import { Injectable } from '@nestjs/common';
import { FRAMEWORK_DISPLAY_ORDER } from '../../../../common/catalogs/onboarding-catalogs';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { FrameworkItem } from '../../domain/entities/catalog-item';
import { FrameworkCatalogRepository } from '../../domain/repositories/framework-catalog.repository';

type FrameworkRow = { code: string; name: string; scopeDescription: string; availability: FrameworkItem['availability'] };

const toItem = (f: FrameworkRow): FrameworkItem => ({
  code: f.code,
  name: f.name,
  description: f.scopeDescription,
  availability: f.availability,
});

// El orden del catálogo es el de demanda (D50); un código que no esté en la lista va al final.
const order = new Map<string, number>(FRAMEWORK_DISPLAY_ORDER.map((c, i) => [c, i]));
const byDisplayOrder = (a: FrameworkItem, b: FrameworkItem): number =>
  (order.get(a.code) ?? 99) - (order.get(b.code) ?? 99) || a.code.localeCompare(b.code);

// Un código puede tener varias versiones del marco; al cliente se le ofrece una sola vez.
const uniqueByCode = (rows: FrameworkRow[]): FrameworkRow[] => {
  const seen = new Set<string>();
  return rows.filter((r) => (seen.has(r.code) ? false : (seen.add(r.code), true)));
};

@Injectable()
export class FrameworkCatalogPrismaRepository extends FrameworkCatalogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<FrameworkItem[]> {
    // catalog.* tiene política de lectura libre (SELECT USING true): no necesita tenant.
    const rows = await this.prisma.framework.findMany({
      select: { code: true, name: true, scopeDescription: true, availability: true },
      orderBy: [{ code: 'asc' }, { version: 'desc' }],
    });
    return uniqueByCode(rows).map(toItem).sort(byDisplayOrder);
  }

  findContracted(scope: TenantScope): Promise<FrameworkItem[]> {
    // platform.company_frameworks: la empresa lee lo suyo (RLS por tenant).
    return this.prisma.withScope(scope, async (tx) => {
      const rows = await tx.companyFramework.findMany({
        where: { companyId: scope.companyId },
        select: {
          framework: { select: { code: true, name: true, scopeDescription: true, availability: true } },
        },
      });
      return uniqueByCode(rows.map((r) => r.framework)).map(toItem).sort(byDisplayOrder);
    });
  }
}
