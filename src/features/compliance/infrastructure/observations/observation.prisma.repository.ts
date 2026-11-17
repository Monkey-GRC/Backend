import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { ObservationAccess, ObservationChange, ObservationFilters, ObservationRecord, ObservationRepository } from '../../domain/observations/observation.repository';
import { ObservationStatus, ObservationType } from '../../domain/observations/observation-lifecycle';
import { loadControlAccess } from '../shared/control-access.loader';
import { isPartyOf, NO_ACCESS } from '../../domain/controls/control-access';

const PERSON = { select: { id: true, name: true, lastName: true } } as const;
const SELECT = {
  id: true, serviceId: true, clientControlId: true, evidenceSubmissionId: true, type: true, body: true, status: true, createdAt: true, answerNote: true, answerEvidenceId: true,
  answeredAt: true, closedAt: true,
  createdByUser: { select: { id: true, name: true, lastName: true, role: true } },
  answeredByUser: PERSON,
  closedByUser: PERSON,
} as const;
type Row = Prisma.AuditObservationGetPayload<{ select: typeof SELECT }>;

const toRecord = (r: Row): ObservationRecord => ({
  id: r.id, serviceId: r.serviceId, clientControlId: r.clientControlId, evidenceSubmissionId: r.evidenceSubmissionId, type: r.type as ObservationType, body: r.body,
  status: r.status as ObservationStatus, createdBy: r.createdByUser, createdAt: r.createdAt, answerNote: r.answerNote, answerEvidenceId: r.answerEvidenceId,
  answeredBy: r.answeredByUser, answeredAt: r.answeredAt, closedBy: r.closedByUser, closedAt: r.closedAt,
});

@Injectable()
export class ObservationPrismaRepository extends ObservationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(
    scope: TenantScope,
    serviceId: string,
    input: { type: ObservationType; body: string; clientControlId: string | null; evidenceSubmissionId: string | null; createdBy: string },
    audit: Parameters<ObservationRepository['create']>[3],
  ): Promise<ObservationRecord | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await this.serviceExists(tx, scope, serviceId))) return null;

      let controlId = input.clientControlId;
      if (controlId) {
        const control = await tx.clientControl.findFirst({ where: { id: controlId, serviceId }, select: { isActive: true } });
        if (!control) throw new DomainError('NOT_FOUND');
        // Sobre un control dado de baja ya no se mide ni se trabaja: no se le abren observaciones nuevas (las que ya tenía se conservan y se leen).
        if (!control.isActive) throw new DomainError('CONTROL_RETIRED');
      }
      if (input.evidenceSubmissionId) {
        const evidence = await tx.evidenceSubmission.findFirst({
          where: { id: input.evidenceSubmissionId, evidenceRequirement: { clientControl: { serviceId } } },
          select: { evidenceRequirement: { select: { clientControlId: true } } },
        });
        if (!evidence) throw new DomainError('NOT_FOUND');
        const evidenceControl = evidence.evidenceRequirement.clientControlId;
        if (controlId && controlId !== evidenceControl) throw new ValidationException([{ field: 'evidence_submission_id', code: 'control.mismatch' }]);
        // Una entrega pertenece a un único control: si solo se mandó la evidencia, la observación queda también en ese control (así la ve su responsable).
        controlId = evidenceControl;
      }

      const row = await tx.auditObservation.create({
        data: { tenantId: scope.companyId, serviceId, clientControlId: controlId, evidenceSubmissionId: input.evidenceSubmissionId, createdBy: input.createdBy, type: input.type, body: input.body },
        select: SELECT,
      });
      const created = toRecord(row);
      await insertAuditLog(tx, audit(created));
      return created;
    });
  }

  list(scope: TenantScope, serviceId: string, f: ObservationFilters): Promise<Page<ObservationRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await this.serviceExists(tx, scope, serviceId))) return null;

      const where: Prisma.AuditObservationWhereInput = { serviceId, ...(f.status ? { status: f.status } : {}), ...(f.type ? { type: f.type } : {}) };
      if (f.onlyControlsOf) {
        // El `responsable` ve las de los controles de los que es responsable (dueño o ejecutor, D102); las de un servicio completo, no.
        const controls = (await tx.clientControl.findMany({ where: { serviceId }, select: { id: true } })).map((c) => c.id);
        const accessOf = await loadControlAccess(tx, controls);
        const mine = controls.filter((id) => isPartyOf(f.onlyControlsOf as string, accessOf.get(id) ?? NO_ACCESS));
        where.clientControlId = { in: f.clientControlId ? mine.filter((id) => id === f.clientControlId) : mine };
      } else if (f.clientControlId) {
        where.clientControlId = f.clientControlId;
      }

      const total = await tx.auditObservation.count({ where });
      const rows = await tx.auditObservation.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (f.page - 1) * f.pageSize, take: f.pageSize, select: SELECT });
      return { items: rows.map(toRecord), total, page: f.page, pageSize: f.pageSize };
    });
  }

  find(scope: TenantScope, id: string): Promise<ObservationAccess | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.auditObservation.findUnique({ where: { id }, select: SELECT });
      return row ? this.access(tx, row) : null;
    });
  }

  mutate(
    scope: TenantScope,
    id: string,
    decide: (current: ObservationAccess) => ObservationChange,
    audit: Parameters<ObservationRepository['mutate']>[3],
  ): Promise<ObservationRecord | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // Con la fila bloqueada, dos peticiones a la vez (dos respuestas, cerrar mientras se responde) se atienden una tras otra y la segunda ve el estado ya cambiado.
      const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM tenant.audit_observations WHERE id = ${id}::uuid FOR UPDATE`;
      if (!locked.length) return null;

      const current = await this.access(tx, await tx.auditObservation.findUniqueOrThrow({ where: { id }, select: SELECT }));
      const change = decide(current);

      if (change.answer?.evidenceId) {
        // La evidencia que respalda la respuesta es una entrega de un control de ESTE servicio.
        const evidence = await tx.evidenceSubmission.findFirst({ where: { id: change.answer.evidenceId, evidenceRequirement: { clientControl: { serviceId: current.record.serviceId } } }, select: { id: true } });
        if (!evidence) throw new DomainError('NOT_FOUND');
      }

      await tx.auditObservation.update({
        where: { id },
        data: {
          ...(change.body !== undefined ? { body: change.body } : {}),
          ...(change.status ? { status: change.status } : {}),
          ...(change.answer ? { answerNote: change.answer.note, answerEvidenceId: change.answer.evidenceId, answeredBy: change.answer.by, answeredAt: change.answer.at } : {}),
          ...(change.closed ? { closedBy: change.closed.by, closedAt: change.closed.at } : {}),
        },
      });
      const after = toRecord(await tx.auditObservation.findUniqueOrThrow({ where: { id }, select: SELECT }));
      await insertAuditLog(tx, audit({ before: current.record, after }));
      return after;
    });
  }

  private async access(tx: TransactionClient, row: Row): Promise<ObservationAccess> {
    const record = toRecord(row);
    if (!record.clientControlId) return { record, access: NO_ACCESS };
    const access = (await loadControlAccess(tx, [record.clientControlId])).get(record.clientControlId) ?? NO_ACCESS;
    return { record, access };
  }

  private async serviceExists(tx: TransactionClient, scope: TenantScope, serviceId: string): Promise<boolean> {
    return !!(await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } }));
  }
}
