import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { dimensionOfAssetType, readControl } from '../../domain/controls/control-readout';
import type { TestState } from '../../domain/engine/states';
import { LastVerdict, NewVerdict, TestVerdictRepository, VerdictIssued, VerdictRecord, VerdictResult } from '../../domain/verdicts/test-verdict.repository';
import { captureControlStates, recordControlStateChanges } from '../shared/control-state-events';
import { loadServiceSnapshot } from '../shared/service-snapshot.loader';

const PERSON = { select: { id: true, name: true, lastName: true } } as const;
// Una dimensión que el control resuelve a mano. `hybrid` y `automated` las resuelve la sonda: su veredicto no se da, se mide.
const MANUAL_DIMENSION_TYPES = new Set(['manual', 'technical_manual']);
const CHUNK = 1000;

@Injectable()
export class TestVerdictPrismaRepository extends TestVerdictRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  issue(scope: TenantScope, controlId: string, testId: string, input: NewVerdict, audit: Parameters<TestVerdictRepository['issue']>[4]): Promise<VerdictIssued | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const origin = await this.originOf(tx, controlId, testId);
      if (!origin) return null;
      if (!origin.active) throw new DomainError('CONTROL_RETIRED');
      const dimension = origin.dimension;
      // La documental se resuelve revisando su evidencia (D88); la automática, midiendo. El veredicto es solo de lo manual que no es documental.
      if (dimension === 'policy') throw new DomainError('TEST_DECIDED_BY_EVIDENCE');
      const kind = await tx.clientControlDimension.findFirst({ where: { clientControlId: controlId, dimension }, select: { type: true } });
      if (!kind || !MANUAL_DIMENSION_TYPES.has(kind.type)) throw new DomainError('TEST_NOT_MANUAL');

      // MD-154, D85 · Con observaciones del auditor abiertas en el control de origen el veredicto se da igual, pero explicando por qué. Criterio provisional: cuenta solo el control de
      // origen y solo las `open` (una que la empresa ya respondió, `answered`, deja de pedir explicación). Una observación no mueve el porcentaje: esto solo exige constancia.
      if (!input.closureObservationReason && (await tx.auditObservation.count({ where: { clientControlId: controlId, status: 'open' } })) > 0) {
        throw new ValidationException([{ field: 'closure_observation_reason', code: 'closure_reason.required' }]);
      }

      // RN-13 / D85: cuenta en todos los controles vigentes del servicio que llevan el test, y sobre todos los activos de su dimensión.
      const controls = await tx.clientControlTest.findMany({
        where: { testId, clientControl: { serviceId: origin.serviceId, isActive: true } },
        select: { clientControlId: true, clientControl: { select: { ownCode: true, control: { select: { code: true } } } } },
      });
      const assets = (await tx.serviceAsset.findMany({ where: { serviceId: origin.serviceId, asset: { status: 'active' } }, select: { asset: { select: { id: true, type: true } } } }))
        .map((r) => r.asset)
        .filter((a) => dimensionOfAssetType(a.type) === dimension);
      if (assets.length === 0) throw new DomainError('TEST_HAS_NO_ASSETS');
      // La versión del catálogo con la que se evalúa: la del marco contratado más antiguo del servicio (igual que la sonda).
      const framework = await tx.serviceFramework.findFirst({ where: { serviceId: origin.serviceId, status: 'active' }, orderBy: { contractedAt: 'asc' }, select: { catalogVersionId: true } });
      if (!framework) throw new DomainError('NOT_FOUND');

      const before = await captureControlStates(tx, origin.serviceId);
      const evaluatedAt = new Date();
      const rows = controls.flatMap((c) =>
        assets.map((a) => ({
          id: randomUUID(), tenantId: scope.companyId, serviceId: origin.serviceId, clientControlId: c.clientControlId, testId, assetId: a.id, catalogVersionId: framework.catalogVersionId,
          confirmedBy: input.confirmedBy, evaluatedAt, dimension, result: input.result, origin: 'manual' as const, verdictNote: input.note,
          closureObservationReason: input.closureObservationReason,
        })),
      );
      for (let i = 0; i < rows.length; i += CHUNK) await tx.evaluation.createMany({ data: rows.slice(i, i + CHUNK) });

      const confirmedBy = await tx.user.findFirstOrThrow({ where: { id: input.confirmedBy }, ...PERSON });
      const record: VerdictRecord = {
        id: rows.find((r) => r.clientControlId === controlId)!.id, controlId, testId, dimension, result: input.result, note: input.note,
        closureObservationReason: input.closureObservationReason, confirmedBy: { id: confirmedBy.id, name: confirmedBy.name ?? '', lastName: confirmedBy.lastName ?? '' }, evaluatedAt,
        appliesToControls: controls.map((c) => ({ id: c.clientControlId, code: c.clientControl.control?.code ?? c.clientControl.ownCode })),
      };
      const issued: VerdictIssued = { ...record, testState: await this.testState(tx, origin.serviceId, controlId, testId) };
      await insertAuditLog(tx, audit(issued));
      await recordControlStateChanges(tx, {
        tenantId: scope.companyId, serviceId: origin.serviceId, before, cause: 'test_verdict',
        actor: { userId: input.confirmedBy, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent },
      });
      return issued;
    });
  }

  latestByControl(scope: TenantScope, controlId: string): Promise<Map<string, LastVerdict>> {
    return this.prisma.withScope(scope, async (tx) => {
      // Una fila por test, la más reciente: un veredicto son varias filas con el mismo instante y quien lo dio.
      const rows = await tx.evaluation.findMany({
        where: { clientControlId: controlId, origin: 'manual' },
        orderBy: [{ evaluatedAt: 'desc' }, { id: 'asc' }],
        distinct: ['testId'],
        select: { testId: true, result: true, evaluatedAt: true, confirmedByUser: PERSON },
      });
      return new Map(
        rows.map((r) => [
          r.testId,
          {
            result: r.result as VerdictResult, evaluatedAt: r.evaluatedAt,
            confirmedBy: r.confirmedByUser ? { id: r.confirmedByUser.id, name: r.confirmedByUser.name ?? '', lastName: r.confirmedByUser.lastName ?? '' } : { id: '', name: '', lastName: '' },
          },
        ]),
      );
    });
  }

  list(scope: TenantScope, controlId: string, testId: string, page: number, pageSize: number): Promise<Page<VerdictRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const origin = await this.originOf(tx, controlId, testId);
      if (!origin) return null;
      // Un veredicto son varias filas con el mismo instante (una por control y activo): se toma una por instante.
      const distinct = await tx.evaluation.findMany({
        where: { clientControlId: controlId, testId, origin: 'manual' },
        orderBy: [{ evaluatedAt: 'desc' }, { id: 'asc' }],
        distinct: ['evaluatedAt'],
        select: { id: true, evaluatedAt: true, result: true, verdictNote: true, closureObservationReason: true, dimension: true, confirmedByUser: PERSON },
      });
      const items = distinct.slice((page - 1) * pageSize, page * pageSize);
      const siblings = items.length
        ? await tx.evaluation.findMany({
            where: { testId, origin: 'manual', evaluatedAt: { in: items.map((i) => i.evaluatedAt) } },
            distinct: ['evaluatedAt', 'clientControlId'],
            select: { evaluatedAt: true, clientControl: { select: { id: true, ownCode: true, control: { select: { code: true } } } } },
          })
        : [];
      return {
        items: items.map((e) => ({
          id: e.id, controlId, testId, dimension: e.dimension, result: e.result as VerdictRecord['result'], note: e.verdictNote, closureObservationReason: e.closureObservationReason,
          confirmedBy: e.confirmedByUser ? { id: e.confirmedByUser.id, name: e.confirmedByUser.name ?? '', lastName: e.confirmedByUser.lastName ?? '' } : { id: '', name: '', lastName: '' }, evaluatedAt: e.evaluatedAt,
          appliesToControls: siblings.filter((s) => s.evaluatedAt.getTime() === e.evaluatedAt.getTime()).map((s) => ({ id: s.clientControl.id, code: s.clientControl.control?.code ?? s.clientControl.ownCode })),
        })),
        total: distinct.length, page, pageSize,
      };
    });
  }

  private async originOf(tx: TransactionClient, controlId: string, testId: string) {
    const link = await tx.clientControlTest.findFirst({
      where: { clientControlId: controlId, testId },
      select: { test: { select: { dimension: true } }, clientControl: { select: { serviceId: true, isActive: true } } },
    });
    return link ? { serviceId: link.clientControl.serviceId, active: link.clientControl.isActive, dimension: link.test.dimension } : null;
  }

  private async testState(tx: TransactionClient, serviceId: string, controlId: string, testId: string): Promise<TestState> {
    const data = await loadServiceSnapshot(tx, serviceId, controlId);
    const control = data.controls.find((c) => c.id === controlId)!;
    return readControl(control, data.assets, data.results).tests.find((t) => t.test.testId === testId)!.state;
  }
}
