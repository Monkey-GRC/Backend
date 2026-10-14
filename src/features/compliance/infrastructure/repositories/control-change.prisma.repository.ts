import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ChangeStatus, ChangeType, ControlAccess, ControlChange, ControlChangeRepository, OwnControlCreated, OwnControlInput } from '../../domain/repositories/control-change.repository';

const PERSON = { select: { id: true, name: true, lastName: true } } as const;
const CHANGE_SELECT = {
  id: true, clientControlId: true, changeType: true, status: true, proposedValues: true, requestedAt: true, decisionNote: true, decidedAt: true,
  requestedByUser: PERSON, decidedByUser: PERSON,
} as const;

type ChangeRow = Prisma.ClientControlChangeGetPayload<{ select: typeof CHANGE_SELECT }>;

const toChange = (r: ChangeRow): ControlChange => ({
  id: r.id,
  controlId: r.clientControlId,
  changeType: r.changeType as ChangeType,
  status: r.status as ChangeStatus,
  proposedValues: r.proposedValues as Record<string, unknown>,
  requestedBy: r.requestedByUser,
  requestedAt: r.requestedAt,
  decidedBy: r.decidedByUser,
  decisionNote: r.decisionNote,
  decidedAt: r.decidedAt,
});

const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === 'P2002';
const OWN_CODE = /^C(\d+)$/;

@Injectable()
export class ControlChangePrismaRepository extends ControlChangeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  contractedCriteria(scope: TenantScope, serviceId: string): Promise<string[] | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      if (!service) return null;
      return (await tx.serviceTrustCriterion.findMany({ where: { serviceId }, select: { trustCriterion: { select: { criterion: true } } } })).map((r) => r.trustCriterion.criterion);
    });
  }

  async createOwnControl(scope: TenantScope, input: OwnControlInput, audit: Parameters<ControlChangeRepository['createOwnControl']>[2]): Promise<OwnControlCreated> {
    // El código `C##` es el siguiente libre del servicio. Dos altas a la vez pueden pedir el mismo: la restricción única lo detecta y se reintenta.
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.prisma.withScope(scope, async (tx) => {
          const used = await tx.clientControl.findMany({ where: { serviceId: input.serviceId, controlId: null }, select: { ownCode: true } });
          const next = Math.max(0, ...used.map((u) => Number(OWN_CODE.exec(u.ownCode)?.[1] ?? 0))) + 1;
          const ownCode = `C${String(next).padStart(2, '0')}`;

          const control = await tx.clientControl.create({
            data: {
              tenantId: scope.companyId, serviceId: input.serviceId, controlId: null, ownCode, name: input.name, trustCriterion: input.trustCriterion as never,
              clientInterpretation: input.interpretation, type: 'manual', sourceRef: null, isActive: true,
              // Solo documental (D65): su única dimensión es la documental, con las mismas banderas que las del catálogo (la IA pre-valida y una persona confirma).
              dimensions: {
                create: [{ tenantId: scope.companyId, dimension: 'policy', type: 'manual', requiresProbe: false, requiresAi: true, requiresComplianceConfirmation: true, reasonNotApplicable: null }],
              },
            },
            select: { id: true },
          });
          const change = await tx.clientControlChange.create({
            data: {
              tenantId: scope.companyId, serviceId: input.serviceId, clientControlId: control.id, changeType: 'create', requestedBy: input.requestedBy,
              proposedValues: { name: input.name, interpretation: input.interpretation, trust_criterion: input.trustCriterion, dimensions: ['policy'] },
            },
            select: CHANGE_SELECT,
          });
          // Un control propio cuenta desde que se crea, aunque esté pendiente: cambia lo que se mide, así que deja un evento de cumplimiento.
          await tx.complianceEvent.createMany({
            data: [{
              tenantId: scope.companyId, userId: input.requestedBy, changedField: 'client_control.create', previousValue: Prisma.DbNull,
              newValue: { client_control_id: control.id, own_code: ownCode, trust_criterion: input.trustCriterion, approval: 'pending' },
              ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent,
            }],
          });
          const created: OwnControlCreated = { controlId: control.id, ownCode, change: toChange(change) };
          await insertAuditLog(tx, audit(created));
          return created;
        });
      } catch (e) {
        if (isUniqueViolation(e) && attempt < 3) continue;
        throw e;
      }
    }
  }

  findAccess(scope: TenantScope, controlId: string): Promise<ControlAccess | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const c = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: { id: true, serviceId: true, isActive: true, userControlAssignments: { select: { userId: true } } },
      });
      return c ? { id: c.id, serviceId: c.serviceId, isActive: c.isActive, assignedUserIds: c.userControlAssignments.map((a) => a.userId) } : null;
    });
  }

  propose(scope: TenantScope, input: Parameters<ControlChangeRepository['propose']>[1], audit: Parameters<ControlChangeRepository['propose']>[2]): Promise<ControlChange> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({ where: { id: input.controlId }, select: { serviceId: true, isActive: true } });
      if (!control) throw new DomainError('NOT_FOUND');
      if (!control.isActive) throw new DomainError('CONTROL_RETIRED');
      let row: ChangeRow;
      try {
        row = await tx.clientControlChange.create({
          data: {
            tenantId: scope.companyId, serviceId: control.serviceId, clientControlId: input.controlId, changeType: input.changeType,
            proposedValues: input.proposedValues as Prisma.InputJsonObject, requestedBy: input.requestedBy,
          },
          select: CHANGE_SELECT,
        });
      } catch (e) {
        // El índice único parcial: una propuesta pendiente por tipo y por acción.
        if (isUniqueViolation(e)) throw new DomainError('CHANGE_ALREADY_PENDING');
        throw e;
      }
      const change = toChange(row);
      await insertAuditLog(tx, audit(change));
      return change;
    });
  }

  listChanges(scope: TenantScope, controlId: string, filters: { status?: ChangeStatus; page: number; pageSize: number }): Promise<Page<ControlChange>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where = { clientControlId: controlId, ...(filters.status ? { status: filters.status } : {}) };
      const total = await tx.clientControlChange.count({ where });
      const rows = await tx.clientControlChange.findMany({
        where, orderBy: { requestedAt: 'desc' }, skip: (filters.page - 1) * filters.pageSize, take: filters.pageSize, select: CHANGE_SELECT,
      });
      return { items: rows.map(toChange), total, page: filters.page, pageSize: filters.pageSize };
    });
  }
}
