import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import { AssignedPerson, AssignmentCandidates, AssignmentListingData, AssignmentLoadFilters, AssignmentRecord, AssignmentRepository, AssignmentServiceData } from '../../domain/assignments/assignment.repository';
import { ControlState } from '../../domain/engine/states';
import { readControl } from '../../domain/controls/control-readout';
import { loadContracted, loadServiceSnapshot, placementsOf, POINT_OF_FOCUS_LINKS } from '../shared/service-snapshot.loader';

// Como las demás lecturas del cumplimiento: varios servicios en una transacción, con más holgura que los 5 s por defecto de Prisma.
const READ_TRANSACTION = { timeoutMs: 30_000 };

const PERSON = { select: { id: true, name: true, lastName: true, role: true, status: true } } as const;
const toPerson = (u: { id: string; name: string | null; lastName: string | null; role: string }): AssignedPerson => ({ id: u.id, name: u.name, lastName: u.lastName, role: u.role });

@Injectable()
export class AssignmentPrismaRepository extends AssignmentRepository {
  constructor(private readonly prisma: PrismaService, private readonly evaluationParameters: EvaluationParametersPort) {
    super();
  }

  load(scope: TenantScope, f: AssignmentLoadFilters): Promise<AssignmentListingData> {
    return this.prisma.withScope(scope, async (tx) => {
      const services = await this.servicesOf(tx, scope, f);
      const parameters = await this.evaluationParameters.load(tx);
      const loaded: AssignmentServiceData[] = [];
      for (const s of services) loaded.push({ id: s.id, name: s.name, readout: await loadServiceSnapshot(tx, s.id, parameters) });
      const controlIds = loaded.flatMap((s) => s.readout.controls.map((c) => c.id));
      return { services: loaded, assignments: await this.assignmentsOf(tx, controlIds), frameworkRequirements: await this.frameworkRequirementsOf(tx, f, controlIds) };
    }, READ_TRANSACTION);
  }

  // `GET /v1/assignments`: la parte liviana. Lo que decide qué controles entran y en qué orden (código, nombre, requisitos, asignación) sale de unas pocas consultas por servicio; el estado, que
  // es lo caro, se pide después y solo de los controles que se muestran (`statesOf`).
  loadCandidates(scope: TenantScope, f: AssignmentLoadFilters): Promise<AssignmentCandidates> {
    return this.prisma.withScope(scope, async (tx) => {
      const services = await this.servicesOf(tx, scope, f);
      const loaded: AssignmentCandidates['services'] = [];
      for (const s of services) {
        const contracted = await loadContracted(tx, s.id);
        const rows = await tx.clientControl.findMany({
          where: { serviceId: s.id, isActive: true },
          select: { id: true, ownCode: true, name: true, control: { select: { code: true, name: true, ...POINT_OF_FOCUS_LINKS } } },
        });
        loaded.push({
          id: s.id, name: s.name,
          controls: rows.map((c) => ({
            id: c.id, ownCode: c.ownCode, catalogCode: c.control?.code ?? null, name: c.control?.name ?? c.name ?? c.ownCode,
            requirementCodes: [...placementsOf(c.control?.pointOfFocusControls, contracted).requirementCodes].sort(),
          })),
        });
      }
      const controlIds = loaded.flatMap((s) => s.controls.map((c) => c.id));
      return { services: loaded, assignments: await this.assignmentsOf(tx, controlIds), frameworkRequirements: await this.frameworkRequirementsOf(tx, f, controlIds) };
    }, READ_TRANSACTION);
  }

  statesOf(scope: TenantScope, controlIds: readonly string[]): Promise<ReadonlyMap<string, ControlState>> {
    return this.prisma.withScope(scope, async (tx) => {
      const states = new Map<string, ControlState>();
      if (controlIds.length === 0) return states;
      const rows = await tx.clientControl.findMany({ where: { id: { in: [...controlIds] }, isActive: true }, select: { id: true, serviceId: true } });
      const byService = new Map<string, string[]>();
      for (const r of rows) byService.set(r.serviceId, [...(byService.get(r.serviceId) ?? []), r.id]);
      const parameters = await this.evaluationParameters.load(tx);
      for (const [serviceId, ids] of byService) {
        const snapshot = await loadServiceSnapshot(tx, serviceId, parameters, ids);
        for (const control of snapshot.controls) states.set(control.id, readControl(control, snapshot).state);
      }
      return states;
    }, READ_TRANSACTION);
  }

  // Entran a la consulta los servicios con algún control vigente que cumpla lo que se puede decidir en la base (asignación, marco, alcance de quien pregunta): el estado de cada control se calcula
  // por servicio y es lo caro. Los filtros se vuelven a aplicar control por control en `listAssignments`.
  private servicesOf(tx: TransactionClient, scope: TenantScope, f: AssignmentLoadFilters) {
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
    return tx.service.findMany({
      where: {
        organization: { companyId: scope.companyId },
        ...(f.serviceId ? { id: f.serviceId } : {}),
        ...(f.frameworkId ? { frameworks: { some: { frameworkId: f.frameworkId } } } : {}),
        clientControls: { some: controlWhere },
      },
      select: { id: true, name: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  private async assignmentsOf(tx: TransactionClient, controlIds: string[]): Promise<Map<string, AssignmentRecord>> {
    const rows = controlIds.length
      ? await tx.clientControlAssignment.findMany({ where: { clientControlId: { in: controlIds } }, select: { clientControlId: true, owner: PERSON, executor: PERSON } })
      : [];
    return new Map(rows.map((r) => [r.clientControlId, { owner: toPerson(r.owner), executor: r.executor ? toPerson(r.executor) : null, ownerActive: r.owner.status === 'active', executorActive: r.executor?.status === 'active' }]));
  }

  private async frameworkRequirementsOf(tx: TransactionClient, f: AssignmentLoadFilters, controlIds: string[]): Promise<Map<string, Set<string>> | null> {
    if (!f.frameworkId || controlIds.length === 0) return null;
    const out = new Map<string, Set<string>>();
    const covered = await tx.clientControl.findMany({
      where: { id: { in: controlIds } },
      select: { id: true, control: { select: { pointOfFocusControls: { where: { pointOfFocus: { requirement: { frameworkId: f.frameworkId } } }, select: { pointOfFocus: { select: { requirement: { select: { code: true } } } } } } } } },
    });
    for (const c of covered) out.set(c.id, new Set((c.control?.pointOfFocusControls ?? []).map((l) => l.pointOfFocus.requirement.code)));
    return out;
  }
}
