import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { Responsible, ResponsibleChange, ResponsibleRepository, ResponsibleType } from '../../domain/repositories/responsible.repository';

const SELECT = { id: true, type: true, personName: true, _count: { select: { assets: true, evidenceRequirements: true } } } as const;
type Row = { id: string; type: string; personName: string; _count: { assets: number; evidenceRequirements: number } };

// Está en uso si un activo o una evidencia requerida apunta al cargo. (El tratamiento de un riesgo se suma con MD-123.)
const toResponsible = (r: Row): Responsible => ({ id: r.id, type: r.type as ResponsibleType, personName: r.personName, isInUse: r._count.assets + r._count.evidenceRequirements > 0 });
const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === 'P2002';

@Injectable()
export class ResponsiblePrismaRepository extends ResponsibleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  list(scope: TenantScope, filters: { type?: ResponsibleType; page: number; pageSize: number }): Promise<Page<Responsible>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where = filters.type ? { type: filters.type } : {};
      const total = await tx.organizationResponsible.count({ where });
      const rows = await tx.organizationResponsible.findMany({
        where, orderBy: [{ type: 'asc' }, { personName: 'asc' }], skip: (filters.page - 1) * filters.pageSize, take: filters.pageSize, select: SELECT,
      });
      return { items: rows.map(toResponsible), total, page: filters.page, pageSize: filters.pageSize };
    });
  }

  create(scope: TenantScope, input: { type: ResponsibleType; personName: string }, audit: Parameters<ResponsibleRepository['create']>[2]): Promise<Responsible> {
    return this.prisma.withScope(scope, async (tx) => {
      const organization = await tx.organization.findFirst({ where: { companyId: scope.companyId }, select: { id: true } });
      if (!organization) throw new DomainError('ORGANIZATION_NOT_DECLARED');
      try {
        const row = await tx.organizationResponsible.create({ data: { tenantId: scope.companyId, organizationId: organization.id, type: input.type, personName: input.personName }, select: SELECT });
        const created = toResponsible(row);
        await insertAuditLog(tx, audit(created));
        return created;
      } catch (e) {
        if (isUniqueViolation(e)) throw new DomainError('RESPONSIBLE_ALREADY_EXISTS');
        throw e;
      }
    });
  }

  rename(scope: TenantScope, id: string, personName: string, audit: Parameters<ResponsibleRepository['rename']>[3]): Promise<ResponsibleChange | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await this.find(tx, id);
      if (!before) return null;
      try {
        await tx.organizationResponsible.update({ where: { id }, data: { personName } });
      } catch (e) {
        if (isUniqueViolation(e)) throw new DomainError('RESPONSIBLE_ALREADY_EXISTS');
        throw e;
      }
      const after = (await this.find(tx, id)) as Responsible;
      const change = { before, after };
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  remove(scope: TenantScope, id: string, audit: Parameters<ResponsibleRepository['remove']>[2]): Promise<Responsible | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await this.find(tx, id);
      if (!found) return null;
      if (found.isInUse) throw new DomainError('RESPONSIBLE_IN_USE');
      await tx.organizationResponsible.delete({ where: { id } });
      await insertAuditLog(tx, audit(found));
      return found;
    });
  }

  private async find(tx: TransactionClient, id: string): Promise<Responsible | null> {
    const row = await tx.organizationResponsible.findFirst({ where: { id }, select: SELECT });
    return row ? toResponsible(row) : null;
  }
}
