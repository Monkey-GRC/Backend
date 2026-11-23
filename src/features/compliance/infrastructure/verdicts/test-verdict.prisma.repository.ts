import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { EvaluationParametersPort } from '../../domain/engine/v2/parameters';
import { ControlAccess, NO_ACCESS } from '../../domain/controls/control-access';
import { dimensionOfAssetType, readControl } from '../../domain/controls/control-readout';
import type { TestState } from '../../domain/engine/states';
import { VerdictResult, VerdictReview, verdictStateOf } from '../../domain/verdicts/test-verdict';
import {
  LastVerdict, NewVerdict, NewVerdictReview, TestVerdictRepository, VerdictOrigin, VerdictRecord, VerdictReviewed, VerdictWithTestState,
} from '../../domain/verdicts/test-verdict.repository';
import { loadControlAccess } from '../shared/control-access.loader';
import { captureControlStates, recordControlStateChanges } from '../shared/control-state-events';
import { latestApprovedVerdictIds } from '../shared/latest-results.query';
import { loadServiceSnapshot } from '../shared/service-snapshot.loader';

const PERSON = { select: { id: true, name: true, lastName: true } } as const;
// Una dimensión que el control resuelve a mano. `hybrid` y `automated` las resuelve la sonda: su veredicto no se da, se mide.
const MANUAL_DIMENSION_TYPES = new Set(['manual', 'technical_manual']);
// Como el resto de lo que relee el servicio entero dentro de la transacción (D91): con la base lejos los 5 s por defecto de Prisma no alcanzan.
const STATE_TRANSACTION = { timeoutMs: 30_000 };
const NEWEST_FIRST = [{ registeredAt: 'desc' }, { id: 'desc' }] as const;

const VERDICT_SELECT = {
  id: true, serviceId: true, clientControlId: true, testId: true, result: true, note: true, closureObservationReason: true, registeredAt: true,
  registeredByUser: { select: { id: true, name: true, lastName: true, role: true } },
  test: { select: { dimension: true } },
  reviews: { select: { reviewerRole: true, decision: true, note: true, reviewedAt: true, reviewedByUser: PERSON } },
} as const;
type VerdictRow = Prisma.TestVerdictGetPayload<{ select: typeof VERDICT_SELECT }>;
type ReviewRow = VerdictRow['reviews'][number];

const person = (u: { id: string; name: string | null; lastName: string | null }) => ({ id: u.id, name: u.name ?? '', lastName: u.lastName ?? '' });
const toReview = (r: ReviewRow): VerdictReview => ({ reviewerRole: r.reviewerRole, decision: r.decision, note: r.note, reviewedBy: person(r.reviewedByUser), reviewedAt: r.reviewedAt });
// El del admin_empresa primero, como en las revisiones de las evidencias.
const byRole = (a: VerdictReview, b: VerdictReview) => (a.reviewerRole === b.reviewerRole ? 0 : a.reviewerRole === 'admin_empresa' ? -1 : 1);

type Carrying = Map<string, Array<{ id: string; code: string }>>;

const toRecord = (r: VerdictRow, carrying: Carrying): VerdictRecord => {
  const reviews = r.reviews.map(toReview).sort(byRole);
  return {
    id: r.id, controlId: r.clientControlId, testId: r.testId, dimension: r.test.dimension, result: r.result, note: r.note, closureObservationReason: r.closureObservationReason,
    registeredBy: { ...person(r.registeredByUser), role: r.registeredByUser.role }, registeredAt: r.registeredAt,
    state: verdictStateOf(reviews), reviews, appliesToControls: carrying.get(r.testId) ?? [],
  };
};

@Injectable()
export class TestVerdictPrismaRepository extends TestVerdictRepository {
  constructor(private readonly prisma: PrismaService, private readonly evaluationParameters: EvaluationParametersPort) {
    super();
  }

  originOf(scope: TenantScope, controlId: string, testId: string): Promise<VerdictOrigin | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const origin = await this.origin(tx, controlId, testId);
      if (!origin) return null;
      const access = (await loadControlAccess(tx, [controlId])).get(controlId) ?? NO_ACCESS;
      return { ...origin, access };
    });
  }

  issue(scope: TenantScope, controlId: string, testId: string, input: NewVerdict, audit: Parameters<TestVerdictRepository['issue']>[4]): Promise<VerdictWithTestState | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const origin = await this.origin(tx, controlId, testId);
      if (!origin) return null;
      if (!origin.active) throw new DomainError('CONTROL_RETIRED');
      const { dimension } = origin;
      // La documental se resuelve revisando su evidencia (D88); la automática, midiendo. El veredicto es solo de lo manual que no es documental.
      if (dimension === 'policy') throw new DomainError('TEST_DECIDED_BY_EVIDENCE');
      const kind = await tx.clientControlDimension.findFirst({ where: { clientControlId: controlId, dimension }, select: { type: true } });
      if (!kind || !MANUAL_DIMENSION_TYPES.has(kind.type)) throw new DomainError('TEST_NOT_MANUAL');

      // MD-154, D85 · Con observaciones del auditor abiertas en el control de origen el veredicto se da igual, pero explicando por qué. Criterio provisional: cuenta solo el control de
      // origen y solo las `open` (una que la empresa ya respondió, `answered`, deja de pedir explicación). Una observación no mueve el porcentaje: esto solo exige constancia.
      if (!input.closureObservationReason && (await tx.auditObservation.count({ where: { clientControlId: controlId, status: 'open' } })) > 0) {
        throw new ValidationException([{ field: 'closure_observation_reason', code: 'closure_reason.required' }]);
      }

      // D85 · Cuenta sobre los activos de su dimensión: sin ellos no hay sobre qué dar el veredicto.
      const assets = (await tx.serviceAsset.findMany({ where: { serviceId: origin.serviceId, asset: { status: 'active' } }, select: { asset: { select: { type: true } } } }))
        .map((r) => r.asset)
        .filter((a) => dimensionOfAssetType(a.type) === dimension);
      if (assets.length === 0) throw new DomainError('TEST_HAS_NO_ASSETS');

      const before = await captureControlStates(tx, origin.serviceId, await this.evaluationParameters.load());
      const now = new Date();
      const created = await tx.testVerdict.create({
        data: {
          tenantId: scope.companyId, serviceId: origin.serviceId, clientControlId: controlId, testId, result: input.result, note: input.note,
          closureObservationReason: input.closureObservationReason, registeredBy: input.registeredBy, registeredAt: now,
          // P34 · El admin_empresa que registra aprueba lo suyo: nace con su aprobación y queda en el rastro quién registró y quién aprobó.
          ...(input.approvedAtBirth ? { reviews: { create: { tenantId: scope.companyId, reviewerRole: 'admin_empresa', decision: 'approve', reviewedBy: input.registeredBy, reviewedAt: now } } } : {}),
        },
        select: VERDICT_SELECT,
      });
      const issued: VerdictWithTestState = { ...toRecord(created, await this.carrying(tx, origin.serviceId, [testId])), testState: await this.testState(tx, origin.serviceId, controlId, testId) };
      await insertAuditLog(tx, audit(issued));
      await recordControlStateChanges(tx, { parameters: await this.evaluationParameters.load(),
        tenantId: scope.companyId, serviceId: origin.serviceId, before, cause: 'test_verdict',
        actor: { userId: input.registeredBy, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent },
      });
      return issued;
    }, STATE_TRANSACTION);
  }

  findForReview(scope: TenantScope, verdictId: string): Promise<{ verdict: VerdictRecord; access: ControlAccess; superseded: boolean } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.testVerdict.findFirst({ where: { id: verdictId }, select: VERDICT_SELECT });
      if (!row) return null;
      const access = (await loadControlAccess(tx, [row.clientControlId])).get(row.clientControlId) ?? NO_ACCESS;
      return { verdict: toRecord(row, await this.carrying(tx, row.serviceId, [row.testId])), access, superseded: await this.isSuperseded(tx, row) };
    });
  }

  saveReview(scope: TenantScope, verdictId: string, input: NewVerdictReview, audit: Parameters<TestVerdictRepository['saveReview']>[3]): Promise<VerdictReviewed | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.testVerdict.findFirst({ where: { id: verdictId }, select: VERDICT_SELECT });
      if (!found) return null;
      if (await this.isSuperseded(tx, found)) throw new DomainError('VERDICT_SUPERSEDED');
      // D91 · Aprobar o rechazar mueve el estado del test: cada control que cambie deja su evento.
      const before = await captureControlStates(tx, found.serviceId, await this.evaluationParameters.load());
      const previous = found.reviews.find((r) => r.reviewerRole === input.reviewerRole);
      const values = { decision: input.decision, note: input.note, reviewedBy: input.reviewedBy, reviewedAt: new Date() };
      await tx.testVerdictReview.upsert({
        where: { testVerdictId_reviewerRole: { testVerdictId: verdictId, reviewerRole: input.reviewerRole } },
        create: { tenantId: scope.companyId, testVerdictId: verdictId, reviewerRole: input.reviewerRole, ...values },
        update: values,
      });
      const row = await tx.testVerdict.findFirstOrThrow({ where: { id: verdictId }, select: VERDICT_SELECT });
      const record = toRecord(row, await this.carrying(tx, row.serviceId, [row.testId]));
      const saved: VerdictReviewed = {
        verdict: { ...record, testState: await this.testState(tx, row.serviceId, row.clientControlId, row.testId) },
        before: previous ? toReview(previous) : null,
        after: record.reviews.find((r) => r.reviewerRole === input.reviewerRole)!,
        stateBefore: verdictStateOf(found.reviews),
      };
      await insertAuditLog(tx, audit(saved));
      await recordControlStateChanges(tx, { parameters: await this.evaluationParameters.load(),
        tenantId: scope.companyId, serviceId: row.serviceId, before, cause: 'test_verdict_review',
        actor: { userId: input.reviewedBy, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent },
      });
      return saved;
    }, STATE_TRANSACTION);
  }

  latestByControl(scope: TenantScope, controlId: string): Promise<Map<string, LastVerdict>> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({ where: { id: controlId }, select: { serviceId: true } });
      if (!control) return new Map();
      // Solo los aprobados (alguna aprobación y ningún rechazo) y el más reciente de cada test: un LATERAL por test elige los ids y luego se leen con sus revisiones, sin traer el historial.
      const rows = await tx.testVerdict.findMany({ where: { id: { in: await latestApprovedVerdictIds(tx, control.serviceId, controlId) } }, select: VERDICT_SELECT });
      const last = new Map<string, LastVerdict>();
      for (const r of rows) {
        if (verdictStateOf(r.reviews) !== 'approved') continue;
        // Quien lo confirmó es quien lo aprobó; si aprobaron los dos, el admin_empresa.
        const approver = r.reviews.map(toReview).filter((v) => v.decision === 'approve').sort(byRole)[0];
        last.set(r.testId, { result: r.result as VerdictResult, evaluatedAt: r.registeredAt, confirmedBy: approver.reviewedBy });
      }
      return last;
    });
  }

  list(scope: TenantScope, controlId: string, testId: string, page: number, pageSize: number): Promise<{ page: Page<VerdictRecord>; access: ControlAccess } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const origin = await this.origin(tx, controlId, testId);
      if (!origin) return null;
      const where = { serviceId: origin.serviceId, testId };
      const total = await tx.testVerdict.count({ where });
      const rows = await tx.testVerdict.findMany({ where, orderBy: [...NEWEST_FIRST], skip: (page - 1) * pageSize, take: pageSize, select: VERDICT_SELECT });
      const carrying = await this.carrying(tx, origin.serviceId, [testId]);
      const access = (await loadControlAccess(tx, [controlId])).get(controlId) ?? NO_ACCESS;
      return { page: { items: rows.map((r) => toRecord(r, carrying)), total, page, pageSize }, access };
    });
  }

  private async origin(tx: TransactionClient, controlId: string, testId: string) {
    const link = await tx.clientControlTest.findFirst({
      where: { clientControlId: controlId, testId },
      select: { test: { select: { dimension: true } }, clientControl: { select: { serviceId: true, isActive: true } } },
    });
    return link ? { serviceId: link.clientControl.serviceId, active: link.clientControl.isActive, dimension: link.test.dimension } : null;
  }

  /** Los controles vigentes del servicio que llevan cada test, por código: donde cuenta el veredicto (D85). Una consulta para todos los tests. */
  private async carrying(tx: TransactionClient, serviceId: string, testIds: string[]): Promise<Carrying> {
    const rows = await tx.clientControlTest.findMany({
      where: { testId: { in: testIds }, clientControl: { serviceId, isActive: true } },
      select: { testId: true, clientControl: { select: { id: true, ownCode: true, control: { select: { code: true } } } } },
    });
    const byTest: Carrying = new Map();
    for (const r of rows) byTest.set(r.testId, [...(byTest.get(r.testId) ?? []), { id: r.clientControl.id, code: r.clientControl.control?.code ?? r.clientControl.ownCode }]);
    for (const list of byTest.values()) list.sort((a, b) => a.code.localeCompare(b.code));
    return byTest;
  }

  /** Hay uno más nuevo del mismo test en el servicio: el vigente es el último registrado. */
  private async isSuperseded(tx: TransactionClient, v: { id: string; serviceId: string; testId: string; registeredAt: Date }): Promise<boolean> {
    const newer = await tx.testVerdict.count({
      where: { serviceId: v.serviceId, testId: v.testId, OR: [{ registeredAt: { gt: v.registeredAt } }, { registeredAt: v.registeredAt, id: { gt: v.id } }] },
    });
    return newer > 0;
  }

  private async testState(tx: TransactionClient, serviceId: string, controlId: string, testId: string): Promise<TestState> {
    const data = await loadServiceSnapshot(tx, serviceId, await this.evaluationParameters.load(), controlId);
    const control = data.controls.find((c) => c.id === controlId)!;
    return readControl(control, data).tests.find((t) => t.test.testId === testId)?.state ?? 'pending';
  }
}
