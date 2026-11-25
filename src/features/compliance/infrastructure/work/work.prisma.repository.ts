import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { evidenceStateOf } from '../../domain/evidence/evidence';
import { ConnectedIntegrationCategories, NO_INTEGRATIONS } from '../../domain/evidence/test-evidence-source';
import { verdictStateOf } from '../../domain/verdicts/test-verdict';
import { outcomeOfEvidence, outcomeOfVerdict } from '../../domain/work/work-bucket';
import { workPieceOf } from '../../domain/work/work-piece';
import { ControlDeliveries, WorkPerson, WorkRepository } from '../../domain/work/work.repository';
import { latestVerdicts } from '../shared/latest-results.query';
import { ALL_REVIEWS, toReviewRecord, versionOf } from '../evidence/evidence-review.mapper';

const READ_TRANSACTION = { timeoutMs: 30_000 };

@Injectable()
export class WorkPrismaRepository extends WorkRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  deliveriesOf(scope: TenantScope, controlIds: string[], connected: ReadonlyMap<string, ConnectedIntegrationCategories>): Promise<Map<string, ControlDeliveries>> {
    return this.prisma.withScope(scope, async (tx) => {
      const byControl = new Map<string, ControlDeliveries>(controlIds.map((id) => [id, { items: [], openObservations: 0 }]));
      if (!controlIds.length) return byControl;

      const controls = await tx.clientControl.findMany({
        where: { id: { in: controlIds } },
        select: { id: true, serviceId: true, dimensions: { select: { dimension: true, type: true, reasonNotApplicable: true } }, tests: { select: { testId: true, test: { select: { dimension: true, primarySource: true, integrationCategory: { select: { name: true } } } } } } },
      });
      // Qué cuenta cada prueba (evidencia o veredicto) lo decide `workPieceOf`; las categorías conectadas son del servicio y llegan resueltas.
      const serviceIds = [...new Set(controls.map((c) => c.serviceId))];
      const pieces = new Map(controls.map((c) => [c.id, c.tests.map((t) => {
          const dimension = c.dimensions.find((d) => d.dimension === t.test.dimension);
          const test = { dimension: t.test.dimension, primarySource: t.test.primarySource, integrationCategory: t.test.integrationCategory?.name ?? null };
          return { testId: t.testId, piece: workPieceOf(test, dimension && { applies: dimension.reasonNotApplicable === null, type: dimension.type }, connected.get(c.serviceId) ?? NO_INTEGRATIONS) };
        })] as const));

      // Evidencias: una pieza por cada evidencia requerida de cada prueba del control que acepta subida (D88); la prueba que aún no tiene ninguna (el lugar nace con la primera entrega) es una pieza
      // por entregar. Cuenta la entrega más reciente de cada una.
      const requirements = await tx.evidenceRequirement.findMany({
        where: { clientControlId: { in: controlIds }, testId: { not: null } },
        select: { clientControlId: true, testId: true, submissions: { select: { version: true, aiVerdict: true, submittedBy: true, reviews: ALL_REVIEWS } } },
      });
      for (const c of controls) {
        const items = (byControl.get(c.id) as ControlDeliveries).items;
        for (const t of (pieces.get(c.id) ?? []).filter((x) => x.piece === 'evidence')) {
          const own = requirements.filter((r) => r.clientControlId === c.id && r.testId === t.testId);
          if (!own.length) items.push({ delivery: null });
          for (const r of own) {
            const latest = [...r.submissions].sort((x, y) => versionOf(y.version) - versionOf(x.version))[0];
            items.push({
              delivery: latest ? { by: latest.submittedBy, outcome: outcomeOfEvidence(evidenceStateOf({ aiVerdict: latest.aiVerdict, reviews: latest.reviews.map(toReviewRecord) })), ownerCanReview: true } : null,
            });
          }
        }
      }

      // Veredictos: una pieza por prueba manual que no acepta subida de cada control; cuenta el último veredicto de la prueba en el servicio (D85, D121).
      const verdicts = await latestVerdicts(tx, serviceIds);
      const latestOf = new Map(verdicts.map((v) => [`${v.serviceId}|${v.testId}`, v]));
      for (const c of controls) {
        for (const t of (pieces.get(c.id) ?? []).filter((x) => x.piece === 'verdict')) {
          const v = latestOf.get(`${c.serviceId}|${t.testId}`);
          byControl.get(c.id)?.items.push({ delivery: v ? { by: v.registeredBy, outcome: outcomeOfVerdict(verdictStateOf(v.decisions.map((decision) => ({ decision })))), ownerCanReview: v.clientControlId === c.id } : null });
        }
      }

      const open = await tx.auditObservation.groupBy({ by: ['clientControlId'], where: { clientControlId: { in: controlIds }, status: 'open' }, _count: { _all: true } });
      for (const o of open) if (o.clientControlId) (byControl.get(o.clientControlId) as ControlDeliveries).openObservations = o._count._all;
      return byControl;
    }, READ_TRANSACTION);
  }

  people(scope: TenantScope): Promise<WorkPerson[]> {
    return this.prisma.withScope(scope, (tx) =>
      tx.user.findMany({
        where: { companyId: scope.companyId, status: 'active', role: { in: ['responsable', 'delegado', 'admin_empresa'] } },
        select: { id: true, name: true, lastName: true, role: true },
      }),
    );
  }
}
