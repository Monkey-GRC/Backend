import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { OwnerChange, ResponsibilityRepository, ResponsibleChange } from '../../domain/repositories/responsibility.repository';
import { ControlResponsibleRow, DIMENSIONS, Dimension, DimensionOwnerRow, PersonRef } from '../../domain/team.types';

const PERSON = { select: { id: true, email: true, name: true, lastName: true } } as const;
const toPerson = (p: { id: string; email: string; name: string | null; lastName: string | null } | null | undefined): PersonRef | null =>
  p ? { id: p.id, email: p.email, name: p.name, lastName: p.lastName } : null;

@Injectable()
export class ResponsibilityPrismaRepository extends ResponsibilityRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  listDimensionOwners(scope: TenantScope, serviceId: string): Promise<DimensionOwnerRow[] | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await this.serviceExists(tx, scope, serviceId))) return null;
      return this.ownerRows(tx, serviceId);
    });
  }

  setDimensionOwner(scope: TenantScope, c: OwnerChange, audit: Parameters<ResponsibilityRepository['setDimensionOwner']>[2]): Promise<DimensionOwnerRow | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await this.serviceExists(tx, scope, c.serviceId))) return null;
      if (c.userId) await this.assertResponsible(tx, c.userId, c.dimension);
      const before = (await this.ownerRows(tx, c.serviceId)).find((r) => r.dimension === c.dimension)!;
      if (c.userId) {
        await tx.serviceDimensionOwner.upsert({
          where: { serviceId_dimension: { serviceId: c.serviceId, dimension: c.dimension } },
          create: { companyId: scope.companyId, serviceId: c.serviceId, dimension: c.dimension, userId: c.userId, assignedBy: c.assignedBy },
          update: { userId: c.userId, assignedBy: c.assignedBy, assignedAt: new Date() },
        });
      } else {
        await tx.serviceDimensionOwner.deleteMany({ where: { serviceId: c.serviceId, dimension: c.dimension } });
      }
      const after = (await this.ownerRows(tx, c.serviceId)).find((r) => r.dimension === c.dimension)!;
      await insertAuditLog(tx, audit({ before, after }));
      return after;
    });
  }

  listControlResponsibles(scope: TenantScope, controlId: string): Promise<ControlResponsibleRow[] | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({ where: { id: controlId }, select: { id: true, serviceId: true } });
      if (!control) return null;
      return this.controlRows(tx, control.id, control.serviceId);
    });
  }

  setControlResponsible(scope: TenantScope, c: ResponsibleChange, audit: Parameters<ResponsibilityRepository['setControlResponsible']>[2]): Promise<ControlResponsibleRow | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({ where: { id: c.controlId }, select: { id: true, serviceId: true, isActive: true } });
      if (!control) return null;
      const before = (await this.controlRows(tx, control.id, control.serviceId)).find((r) => r.dimension === c.dimension);
      // Una dimensión en la que el control no tiene pruebas no tiene a quién responsabilizar.
      if (!before) return null;
      if (!control.isActive) throw new DomainError('CONTROL_RETIRED');
      if (c.userId) await this.assertResponsible(tx, c.userId, c.dimension);
      if (c.userId) {
        await tx.userControlAssignment.upsert({
          where: { clientControlId_dimension: { clientControlId: c.controlId, dimension: c.dimension } },
          create: { companyId: scope.companyId, clientControlId: c.controlId, dimension: c.dimension, userId: c.userId, assignedBy: c.assignedBy },
          update: { userId: c.userId, assignedBy: c.assignedBy, assignedAt: new Date() },
        });
      } else {
        await tx.userControlAssignment.deleteMany({ where: { clientControlId: c.controlId, dimension: c.dimension } });
      }
      const after = (await this.controlRows(tx, control.id, control.serviceId)).find((r) => r.dimension === c.dimension)!;
      await insertAuditLog(tx, audit({ before, after }));
      return after;
    });
  }

  private async serviceExists(tx: TransactionClient, scope: TenantScope, serviceId: string): Promise<boolean> {
    return !!(await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } }));
  }

  /** Solo se responsabiliza a un `funcional` de la empresa (activo o pendiente) que tenga esa especialidad. */
  private async assertResponsible(tx: TransactionClient, userId: string, dimension: Dimension): Promise<void> {
    const user = await tx.user.findFirst({ where: { id: userId, role: 'funcional', status: { in: ['active', 'pending'] } }, select: { dimensions: { select: { dimension: true } } } });
    if (!user) throw new DomainError('NOT_FOUND');
    if (!user.dimensions.some((d) => d.dimension === dimension)) throw new DomainError('USER_LACKS_DIMENSION');
  }

  /** Las cinco dimensiones de un servicio con su responsable y cuántos controles quedan sin dueño. */
  private async ownerRows(tx: TransactionClient, serviceId: string): Promise<DimensionOwnerRow[]> {
    const owners = await tx.serviceDimensionOwner.findMany({ where: { serviceId }, select: { dimension: true, user: PERSON } });
    const links = await tx.clientControlTest.findMany({ where: { clientControl: { serviceId, isActive: true } }, select: { clientControlId: true, test: { select: { dimension: true } } } });
    const exceptions = await tx.userControlAssignment.findMany({ where: { clientControl: { serviceId, isActive: true } }, select: { clientControlId: true, dimension: true } });

    return DIMENSIONS.map((dimension) => {
      const controls = new Set(links.filter((l) => l.test.dimension === dimension).map((l) => l.clientControlId));
      const withException = exceptions.filter((e) => e.dimension === dimension && controls.has(e.clientControlId)).length;
      const owner = toPerson(owners.find((o) => o.dimension === dimension)?.user);
      return { dimension, owner, controlsTotal: controls.size, controlsWithException: withException, controlsWithoutOwner: owner ? 0 : controls.size - withException };
    });
  }

  /** Una fila por cada dimensión en la que el control tiene pruebas, con su responsable efectivo y de dónde sale. */
  private async controlRows(tx: TransactionClient, controlId: string, serviceId: string): Promise<ControlResponsibleRow[]> {
    const tests = await tx.clientControlTest.findMany({ where: { clientControlId: controlId }, select: { test: { select: { dimension: true } } } });
    const exceptions = await tx.userControlAssignment.findMany({ where: { clientControlId: controlId }, select: { dimension: true, user: PERSON } });
    const owners = await tx.serviceDimensionOwner.findMany({ where: { serviceId }, select: { dimension: true, user: PERSON } });

    return DIMENSIONS.filter((d) => tests.some((t) => t.test.dimension === d)).map((dimension) => {
      const exception = toPerson(exceptions.find((e) => e.dimension === dimension)?.user);
      const service = toPerson(owners.find((o) => o.dimension === dimension)?.user);
      return {
        dimension,
        testsCount: tests.filter((t) => t.test.dimension === dimension).length,
        owner: exception ?? service,
        source: exception ? ('control' as const) : service ? ('service' as const) : null,
      };
    });
  }
}
