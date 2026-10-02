import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import {
  OrganizationalContext,
  OrganizationalContextInput,
} from '../../domain/entities/organizational-context.entity';
import { OrganizationalContextRepository } from '../../domain/repositories/organizational-context.repository';

@Injectable()
export class OrganizationalContextPrismaRepository extends OrganizationalContextRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  find(scope: TenantScope): Promise<OrganizationalContext> {
    return this.prisma.withScope(scope, (tx) => this.read(tx, scope.companyId));
  }

  async existingRegulationCodes(codes: string[]): Promise<string[]> {
    // catalog.regulations: lectura libre, sin tenant.
    const rows = await this.prisma.regulation.findMany({
      where: { code: { in: codes } },
      select: { code: true },
    });
    return rows.map((r) => r.code);
  }

  save(
    scope: TenantScope,
    input: OrganizationalContextInput,
  ): Promise<{ before: OrganizationalContext; after: OrganizationalContext }> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.read(tx, scope.companyId);
      const company = await tx.company.findUniqueOrThrow({
        where: { id: scope.companyId },
        select: { name: true },
      });

      const fields = {
        description: input.description,
        size: input.size,
        industry: input.industry,
        businessModel: input.businessModel,
        yearsInOperation: input.yearsInOperation,
        incorporationCountries: input.incorporationCountries,
        clientCountries: input.clientCountries,
        complianceMaturity: input.complianceMaturity,
      };

      // Una organización por empresa (company_id único). La razón social se copia de la empresa
      // al crearla y no se vuelve a tocar: está bloqueada desde el registro (D24).
      const organization = await tx.organization.upsert({
        where: { companyId: scope.companyId },
        create: { companyId: scope.companyId, name: company.name, ...fields },
        update: fields,
        select: { id: true },
      });

      // Regulaciones: se deja exactamente la lista enviada (se quitan las que sobran y se añaden
      // las nuevas). `none` y `other` son filas del catálogo como cualquier otra.
      const wanted = await tx.regulation.findMany({
        where: { code: { in: input.regulationCodes } },
        select: { id: true },
      });
      const wantedIds = wanted.map((r) => r.id);
      await tx.organizationRegulation.deleteMany({
        where: { organizationId: organization.id, regulationId: { notIn: wantedIds } },
      });
      const kept = await tx.organizationRegulation.findMany({
        where: { organizationId: organization.id },
        select: { regulationId: true },
      });
      const keptIds = new Set(kept.map((r) => r.regulationId));
      const toAdd = wantedIds.filter((id) => !keptIds.has(id));
      if (toAdd.length > 0) {
        await tx.organizationRegulation.createMany({
          data: toAdd.map((regulationId) => ({
            tenantId: scope.companyId,
            organizationId: organization.id,
            regulationId,
          })),
        });
      }

      return { before, after: await this.read(tx, scope.companyId) };
    });
  }

  private async read(tx: TransactionClient, companyId: string): Promise<OrganizationalContext> {
    const company = await tx.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { name: true },
    });
    const org = await tx.organization.findUnique({
      where: { companyId },
      include: { regulations: { include: { regulation: true } } },
    });
    if (!org) return OrganizationalContext.empty(company.name);

    return new OrganizationalContext(
      org.id,
      org.name,
      org.description,
      org.size,
      org.industry,
      org.businessModel,
      org.yearsInOperation,
      org.incorporationCountries,
      org.clientCountries,
      org.complianceMaturity,
      org.regulations
        .map((r) => ({
          code: r.regulation.code,
          name: r.regulation.name,
          jurisdiction: r.regulation.jurisdiction,
        }))
        .sort((a, b) => a.code.localeCompare(b.code)),
    );
  }
}
