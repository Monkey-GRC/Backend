import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AssignedPerson, AssignmentListingData, AssignmentLoadFilters, AssignmentRecord, AssignmentRepository, AssignmentServiceData } from '../../domain/assignments/assignment.repository';
import { loadServiceSnapshot } from '../shared/service-snapshot.loader';

// Como las demás lecturas del cumplimiento: varios servicios en una transacción, con más holgura que los 5 s por defecto de Prisma.
const READ_TRANSACTION = { timeoutMs: 30_000 };

const PERSON = { select: { id: true, name: true, lastName: true, role: true } } as const;
const toPerson = (u: { id: string; name: string | null; lastName: string | null; role: string }): AssignedPerson => ({ id: u.id, name: u.name, lastName: u.lastName, role: u.role });

@Injectable()
export class AssignmentPrismaRepository extends AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  load(scope: TenantScope, f: AssignmentLoadFilters): Promise<AssignmentListingData> {
    return this.prisma.withScope(scope, async (tx) => {
      // Entran a la consulta los servicios con algún control vigente que cumpla lo que se puede decidir en la base (asignación, marco, alcance de quien pregunta): el estado de cada control se calcula
      // por servicio y es lo caro. Los filtros se vuelven a aplicar control por control en `listAssignments`.
      const assignmentWhere: Prisma.ClientControlAssignmentWhereInput = {
        ...(f.ownerId ? { ownerId: f.ownerId } : {}),
        ...(f.executorId ? { executorId: f.executorId } : {}),
        ...(f.involvedUserId ? { OR: [{ ownerId: f.involvedUserId }, { executorId: f.involvedUserId }] } : {}),
      };
      const needsAssignment = Object.keys(assignmentWhere).length > 0;
      const controlWhere: Prisma.ClientControlWhereInput = {
        isActive: true,
        ...(f.assignment === 'unassigned' ? { assignment: { is: null } } : f.assignment === 'assigned' || needsAssignment ? { assignment: { is: assignmentWhere } } : {}),
      };
      const services = await tx.service.findMany({
        where: {
          organization: { companyId: scope.companyId },
          ...(f.serviceId ? { id: f.serviceId } : {}),
          ...(f.frameworkId ? { frameworks: { some: { frameworkId: f.frameworkId } } } : {}),
          clientControls: { some: controlWhere },
        },
        select: { id: true, name: true },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      });

      const loaded: AssignmentServiceData[] = [];
      for (const s of services) loaded.push({ id: s.id, name: s.name, readout: await loadServiceSnapshot(tx, s.id) });
      const controlIds = loaded.flatMap((s) => s.readout.controls.map((c) => c.id));

      const rows = controlIds.length
        ? await tx.clientControlAssignment.findMany({ where: { clientControlId: { in: controlIds } }, select: { clientControlId: true, owner: PERSON, executor: PERSON } })
        : [];
      const assignments = new Map<string, AssignmentRecord>(rows.map((r) => [r.clientControlId, { owner: toPerson(r.owner), executor: r.executor ? toPerson(r.executor) : null }]));

      let frameworkRequirements: Map<string, Set<string>> | null = null;
      if (f.frameworkId && controlIds.length) {
        frameworkRequirements = new Map();
        const covered = await tx.clientControl.findMany({
          where: { id: { in: controlIds } },
          select: { id: true, control: { select: { pointOfFocusControls: { where: { pointOfFocus: { requirement: { frameworkId: f.frameworkId } } }, select: { pointOfFocus: { select: { requirement: { select: { code: true } } } } } } } } },
        });
        for (const c of covered) frameworkRequirements.set(c.id, new Set((c.control?.pointOfFocusControls ?? []).map((l) => l.pointOfFocus.requirement.code)));
      }
      return { services: loaded, assignments, frameworkRequirements };
    }, READ_TRANSACTION);
  }
}
