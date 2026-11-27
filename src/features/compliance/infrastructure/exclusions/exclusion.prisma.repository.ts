import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { exceptionEndsOn } from '../../../../common/evaluation-parameters/exception-window';
import { EvaluationParameters, EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import { dimensionOfAssetType, hasDirectFailure } from '../../domain/controls/control-readout';
import { recordControlStateChanges, statesOfSnapshot } from '../shared/control-state-events';
import { loadServiceSnapshot } from '../shared/service-snapshot.loader';
import { expiredWhere, utcToday } from './exclusion-window';
import { ExclusionFilters, ExclusionRecord, ExclusionRepository, ExclusionStatus } from '../../domain/exclusions/exclusion.repository';

const PERSON = { select: { id: true, name: true, lastName: true } } as const;
const SELECT = {
  id: true, serviceId: true, justification: true, technicalJustification: true, status: true, validFrom: true, validUntil: true, expiredAt: true, requestedAt: true, decisionNote: true, decidedAt: true,
  test: { select: { id: true, displayName: true, displayNameEn: true, dimension: true } },
  asset: { select: { id: true, name: true } },
  proposedByUser: PERSON,
  decidedByUser: PERSON,
} as const;
type Row = Prisma.ExclusionGetPayload<{ select: typeof SELECT }>;

const toRecord = (r: Row, parameters: Pick<EvaluationParameters, 'checkExceptionMaxDays'>): ExclusionRecord => ({
  id: r.id, serviceId: r.serviceId,
  test: { id: r.test.id, displayName: r.test.displayName, displayNameEn: r.test.displayNameEn, dimension: r.test.dimension },
  // `asset_id` es nulo solo en la exclusión de un check, que el contrato todavía no expone.
  asset: { id: r.asset?.id ?? '', name: r.asset?.name ?? '' },
  justification: r.justification, technicalJustification: r.technicalJustification, status: r.status as ExclusionStatus, validFrom: r.validFrom, validUntil: r.validUntil,
  effectiveUntil: exceptionEndsOn(r.validFrom, r.validUntil, parameters), expiredAt: r.expiredAt,
  proposedBy: r.proposedByUser, requestedAt: r.requestedAt, decidedBy: r.decidedByUser, decisionNote: r.decisionNote, decidedAt: r.decidedAt,
});

const day = (d: Date) => d.toISOString().slice(0, 10);
const isUniqueViolation = (e: unknown) => (e as { code?: string })?.code === 'P2002';
@Injectable()
export class ExclusionPrismaRepository extends ExclusionRepository {
  constructor(private readonly prisma: PrismaService, private readonly evaluationParameters: EvaluationParametersPort, private readonly notifications: NotificationEmitter) {
    super();
  }

  list(scope: TenantScope, serviceId: string, f: ExclusionFilters): Promise<Page<ExclusionRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await this.serviceExists(tx, scope, serviceId))) return null;
      const parameters = await this.evaluationParameters.load(tx);
      // «Vencida» es una aprobada cuya vigencia efectiva (la menor entre su fin y PR-04) ya pasó: el activo vuelve a contar.
      const expiredClause = expiredWhere(utcToday(), parameters.checkExceptionMaxDays);
      const where: Prisma.ExclusionWhereInput = {
        serviceId,
        ...(f.testId ? { testId: f.testId } : {}),
        ...(f.assetId ? { assetId: f.assetId } : {}),
        ...(f.expired === true ? expiredClause : {}),
        ...(f.expired === false ? { NOT: expiredClause } : {}),
      };
      const total = await tx.exclusion.count({ where });
      const rows = await tx.exclusion.findMany({
        where, orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }], skip: (f.page - 1) * f.pageSize, take: f.pageSize, select: SELECT,
      });
      return { items: rows.map((r) => toRecord(r, parameters)), total, page: f.page, pageSize: f.pageSize };
    });
  }

  async create(
    scope: TenantScope,
    serviceId: string,
    input: { testId: string; assetId: string; justification: string; technicalJustification: string; validUntil: Date; decidedBy: string; meta: { ipAddress: string; userAgent: string } },
    audit: Parameters<ExclusionRepository['create']>[3],
  ): Promise<ExclusionRecord | null> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        if (!(await this.serviceExists(tx, scope, serviceId))) return null;

        // El activo debe ser del servicio, y el test debe aplicarle: lo miden las acciones del servicio y es de la dimensión del activo.
        const link = await tx.serviceAsset.findFirst({ where: { serviceId, assetId: input.assetId, asset: { status: 'active' } }, select: { asset: { select: { type: true } } } });
        const test = await tx.test.findFirst({ where: { id: input.testId }, select: { dimension: true } });
        const dimension = link ? dimensionOfAssetType(link.asset.type) : null;
        // D160 · También le aplica si una evaluación automática midió esa prueba en ese activo (la cuenta de nube en una prueba de aplicación, un recurso descubierto…): misma
        // regla que la lectura del cumplimiento (`assetsInScope`).
        const sameType = !!link && !!test && dimension === test.dimension;
        const measured =
          !!link && !!test && !sameType &&
          !!(await tx.evaluation.findFirst({ where: { serviceId, testId: input.testId, assetId: input.assetId, origin: 'automated', result: { not: 'not_applicable' } }, select: { id: true } }));
        const applies =
          (sameType || measured) && !!(await tx.clientControlTest.findFirst({ where: { testId: input.testId, clientControl: { serviceId, isActive: true } }, select: { id: true } }));
        if (!applies) throw new DomainError('NOT_FOUND');

        // D135 · La fecha de fin la manda el cliente: posterior a hoy y como mucho hoy + PR-04 vigente del tenant.
        const now = utcToday();
        const parameters = await this.evaluationParameters.load(tx);
        const maxDays = parameters.checkExceptionMaxDays;
        if (exceptionEndsOn(now, input.validUntil, parameters).getTime() < input.validUntil.getTime()) {
          throw new ValidationException([{ field: 'valid_until', code: 'exception.max_days', params: { days: maxDays } }]);
        }

        // Dos excepciones a la vez de lo mismo se serializan.
        await tx.$executeRaw`select pg_advisory_xact_lock(hashtextextended(${serviceId + input.testId + input.assetId}, 0))`;

        // Una aprobada vigente (o una pendiente heredada) de lo mismo: conflicto. Una vencida se renueva con una nueva (se revalida, no se hereda).
        const existing = await tx.exclusion.findFirst({
          where: { serviceId, testId: input.testId, assetId: input.assetId, OR: [{ status: 'pending' }, { status: 'approved', NOT: expiredWhere(now, maxDays) }] },
          select: { id: true },
        });
        if (existing) throw new DomainError('EXCLUSION_ALREADY_EXISTS');

        // Solo se exceptúa un FAIL que existe hoy: la misma lectura del motor v2. Es la única lectura del servicio: de ella sale también el estado «antes» (D91).
        const snapshot = await loadServiceSnapshot(tx, serviceId, parameters);
        if (!hasDirectFailure(snapshot, input.testId, input.assetId)) throw new DomainError('CHECK_NOT_FAILING');
        const states = statesOfSnapshot(snapshot);

        // D91 · Aprobar saca al activo del test: si eso mueve el estado de un control, queda su evento.
        const row = await tx.exclusion.create({
          data: {
            tenantId: scope.companyId, serviceId, testId: input.testId, assetId: input.assetId, proposedBy: input.decidedBy, justification: input.justification,
            technicalJustification: input.technicalJustification, validFrom: now, validUntil: input.validUntil,
            status: 'approved', decidedBy: input.decidedBy, decidedAt: new Date(),
          },
          select: SELECT,
        });
        const created = toRecord(row, parameters);
        await tx.complianceEvent.createMany({
          data: [{
            tenantId: scope.companyId, userId: input.decidedBy, changedField: 'exclusion.approve', previousValue: Prisma.DbNull,
            newValue: { exclusion_id: created.id, service_id: serviceId, test_id: created.test.id, asset_id: created.asset.id, valid_from: day(created.validFrom), valid_until: day(created.validUntil), effective_until: day(created.effectiveUntil) },
            ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent,
          }],
        });
        await insertAuditLog(tx, audit(created));
        await recordControlStateChanges(tx, { parameters,
          tenantId: scope.companyId, serviceId, before: states, cause: 'exclusion_approved', notifications: this.notifications,
          actor: { userId: input.decidedBy, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent },
        });
        return created;
      });
    } catch (e) {
      // Un resto de la regla vieja (una pendiente del mismo activo y test) la frena el índice único parcial.
      if (isUniqueViolation(e)) throw new DomainError('EXCLUSION_ALREADY_EXISTS');
      throw e;
    }
  }

  private async serviceExists(tx: TransactionClient, scope: TenantScope, serviceId: string): Promise<boolean> {
    return !!(await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } }));
  }
}
