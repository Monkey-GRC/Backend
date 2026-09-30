import { Injectable } from '@nestjs/common';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { AccessKey } from '../../domain/entities/access-key.entity';
import { CompanyDetail, CompanyOverview } from '../../domain/entities/company-overview';
import { Company } from '../../domain/entities/company.entity';
import {
  CompanyListQuery,
  CompanyRepository,
  NewAccessKey,
  NewCompany,
} from '../../domain/repositories/company.repository';

type CompanyRow = {
  id: string;
  name: string;
  adminEmail: string;
  isolationStrategy: 'dedicated' | 'shared';
  status: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
};

type AccessKeyRow = {
  id: string;
  companyId: string;
  status: 'pending' | 'used' | 'expired' | 'revoked';
  expiresAt: Date;
  usedAt: Date | null;
};

const toCompany = (r: CompanyRow) =>
  new Company(r.id, r.name, r.adminEmail, r.isolationStrategy, r.status, r.createdAt, r.updatedAt);

const toAccessKey = (r: AccessKeyRow) =>
  new AccessKey(r.id, r.companyId, r.status, r.expiresAt, r.usedAt);

// access_keys no tiene created_at: la clave vigente es la que vence más tarde (cada regeneración
// emite una con vencimiento posterior).
const CURRENT_KEY_ORDER = { expiresAt: 'desc' } as const;

@Injectable()
export class CompanyPrismaRepository extends CompanyRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // companies y access_keys: las políticas RLS dejan ver todo a app.user_role = admin_monkey (D31).

  existsActiveWithName(scope: TenantScope, name: string): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) =>
      (await tx.company.count({
        where: { status: 'active', name: { equals: name, mode: 'insensitive' } },
      })) > 0,
    );
  }

  existsWithAdminEmail(scope: TenantScope, adminEmail: string): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) =>
      (await tx.company.count({
        where: { adminEmail: { equals: adminEmail, mode: 'insensitive' } },
      })) > 0,
    );
  }

  createWithAccessKey(
    scope: TenantScope,
    data: NewCompany,
    key: NewAccessKey,
  ): Promise<{ company: Company; accessKey: AccessKey }> {
    return this.prisma.withScope(scope, async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.name,
          adminEmail: data.adminEmail,
          isolationStrategy: data.isolationStrategy,
        },
      });
      const accessKey = await tx.accessKey.create({
        data: {
          companyId: company.id,
          createdBy: key.createdBy,
          codeHash: key.codeHash,
          expiresAt: key.expiresAt,
        },
      });
      return { company: toCompany(company), accessKey: toAccessKey(accessKey) };
    });
  }

  list(scope: TenantScope, query: CompanyListQuery): Promise<Page<CompanyOverview>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where = {
        id: { not: query.excludeCompanyId },
        ...(query.status ? { status: query.status } : {}),
      };
      const field = query.sort.replace('-', '') === 'name' ? 'name' : 'createdAt';
      const direction = query.sort.startsWith('-') ? 'desc' : 'asc';

      const [rows, total] = await Promise.all([
        tx.company.findMany({
          where,
          orderBy: { [field]: direction },
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
          include: { accessKeys: { orderBy: CURRENT_KEY_ORDER, take: 1 } },
        }),
        tx.company.count({ where }),
      ]);

      const onboarded = await this.onboardedCompanyIds(tx, scope, rows.map((r) => r.id));
      return {
        items: rows.map((row) => ({
          company: toCompany(row),
          currentAccessKey: row.accessKeys[0] ? toAccessKey(row.accessKeys[0]) : null,
          onboardingCompleted: onboarded.has(row.id),
        })),
        total,
        page: query.page,
        pageSize: query.pageSize,
      };
    });
  }

  findById(
    scope: TenantScope,
    companyId: string,
    excludeCompanyId: string,
  ): Promise<CompanyDetail | null> {
    if (companyId === excludeCompanyId) return Promise.resolve(null);
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.company.findUnique({
        where: { id: companyId },
        include: { accessKeys: { orderBy: CURRENT_KEY_ORDER } },
      });
      if (!row) return null;

      const onboarded = await this.onboardedCompanyIds(tx, scope, [row.id]);
      const accessKeys = row.accessKeys.map(toAccessKey);
      return {
        company: toCompany(row),
        currentAccessKey: accessKeys[0] ?? null,
        onboardingCompleted: onboarded.has(row.id),
        accessKeys,
      };
    });
  }

  // "¿Existe ya organizations para esta empresa?" (campo derivado del contrato). organizations es
  // de tenant y su política solo mira app.tenant_id, sin excepción para admin_monkey: dentro de la
  // misma transacción se fija el tenant de cada empresa para consultarla, y al final se restaura.
  private async onboardedCompanyIds(
    tx: TransactionClient,
    scope: TenantScope,
    companyIds: string[],
  ): Promise<Set<string>> {
    const onboarded = new Set<string>();
    for (const id of companyIds) {
      await tx.$queryRaw`SELECT set_config('app.tenant_id', ${id}, true)`;
      const organization = await tx.organization.findUnique({
        where: { companyId: id },
        select: { id: true },
      });
      if (organization) onboarded.add(id);
    }
    await tx.$queryRaw`SELECT set_config('app.tenant_id', ${scope.companyId}, true)`;
    return onboarded;
  }
}
