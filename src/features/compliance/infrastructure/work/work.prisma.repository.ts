import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ConnectedIntegrationCategories, NO_INTEGRATIONS } from '../../domain/evidence/test-evidence-source';
import { outcomeOfEvidence } from '../../domain/work/work-bucket';
import { workPiecesOf } from '../../domain/work/work-piece';
import { ControlDeliveries, WorkPerson, WorkRepository } from '../../domain/work/work.repository';
import { submissionState, SUBMISSION_STATE_SELECT, versionOf } from '../evidence/evidence-state.mapper';

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
        select: { id: true, serviceId: true, controlId: true, dimensions: { select: { dimension: true, type: true, reasonNotApplicable: true } }, tests: { select: { testId: true, test: { select: { dimension: true, type: true, primarySource: true, integrationCategory: { select: { name: true } } } } } } },
      });
      // Qué cuenta cada prueba (evidencia o veredicto) lo decide `workPieceOf`; las categorías conectadas son del servicio y llegan resueltas.
      const pieces = new Map(controls.map((c) => [c.id, c.tests.map((t) => {
          const dimension = c.dimensions.find((d) => d.dimension === t.test.dimension);
          const test = { dimension: t.test.dimension, type: t.test.type, primarySource: t.test.primarySource, integrationCategory: t.test.integrationCategory?.name ?? null };
          // Un control propio se mide con su evidencia como un requisito documental único: no tiene resultado que registrar.
          const all = workPiecesOf(test, dimension && { applies: dimension.reasonNotApplicable === null, type: dimension.type }, connected.get(c.serviceId) ?? NO_INTEGRATIONS);
          return { testId: t.testId, pieces: c.controlId === null ? all.filter((x) => x !== 'result') : all };
        })] as const));

      // Evidencias: una pieza por cada evidencia requerida de cada prueba del control que acepta subida (D88); la prueba que aún no tiene ninguna (el lugar nace con la primera entrega) es una pieza
      // por entregar. Cuenta la entrega más reciente de cada una.
      const requirements = await tx.evidenceRequirement.findMany({
        where: { clientControlId: { in: controlIds }, testId: { not: null } },
        select: { clientControlId: true, testId: true, submissions: { select: { ...SUBMISSION_STATE_SELECT, submittedBy: true } } },
      });
      for (const c of controls) {
        const items = (byControl.get(c.id) as ControlDeliveries).items;
        for (const t of (pieces.get(c.id) ?? []).filter((x) => x.pieces.includes('evidence'))) {
          const own = requirements.filter((r) => r.clientControlId === c.id && r.testId === t.testId);
          if (!own.length) items.push({ delivery: null });
          for (const r of own) {
            const latest = [...r.submissions].sort((x, y) => versionOf(y.version) - versionOf(x.version))[0];
            items.push({
              delivery: latest ? { by: latest.submittedBy, outcome: outcomeOfEvidence(submissionState(latest)), ownerCanReview: true } : null,
            });
          }
        }
      }

      // Resultados (MD-504, D140 punto 2): una pieza por prueba manual que no acepta subida; cuenta el último resultado que el responsable registró de la prueba EN ESE control. Registrado es
      // entregado: lo que no cumpla lo muestra el estado del control, no un rechazo de la pieza.
      const results = await tx.manualTestResult.findMany({
        where: { clientControlId: { in: controlIds } },
        orderBy: [{ registeredAt: 'desc' }, { id: 'desc' }],
        select: { clientControlId: true, testId: true, registeredBy: true },
      });
      const latestResult = new Map<string, string>();
      for (const r of results) if (!latestResult.has(`${r.clientControlId}|${r.testId}`)) latestResult.set(`${r.clientControlId}|${r.testId}`, r.registeredBy);
      for (const c of controls) {
        for (const t of (pieces.get(c.id) ?? []).filter((x) => x.pieces.includes('result'))) {
          const by = latestResult.get(`${c.id}|${t.testId}`);
          // DT-120 · Si la prueba también acepta subida y ya tiene una entrega que cuenta, al dueño le toca registrar el resultado (`to_review`).
          const evidenceReady = t.pieces.includes('evidence') && requirements.some((r) => r.clientControlId === c.id && r.testId === t.testId && r.submissions.some((s) => outcomeOfEvidence(submissionState(s)) === 'accepted'));
          byControl.get(c.id)?.items.push({ kind: 'result', evidenceReady, delivery: by ? { by, outcome: 'accepted', ownerCanReview: false } : null });
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
