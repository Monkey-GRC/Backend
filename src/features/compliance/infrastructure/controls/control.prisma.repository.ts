import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ControlDetailData, ControlRepository, Placement, ServiceOverviewData, ServiceReadoutData } from '../../domain/controls/control.repository';
import { evidenceStateOf } from '../../domain/evidence/evidence';
import { loadServiceSnapshot } from '../shared/service-snapshot.loader';
import { ALL_REVIEWS, toReviewRecord } from '../evidence/evidence-review.mapper';

// Una lectura del cumplimiento junta controles, evaluaciones y exclusiones de un servicio en una sola transacción: con la base lejos (desarrollo contra una base remota)
// los 5 s por defecto de Prisma no alcanzan y el resumen responde 500.
const READ_TRANSACTION = { timeoutMs: 30_000 };

@Injectable()
export class ControlPrismaRepository extends ControlRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  loadService(scope: TenantScope, serviceId: string): Promise<ServiceReadoutData | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      return service ? loadServiceSnapshot(tx, serviceId) : null;
    }, READ_TRANSACTION);
  }

  loadOverview(scope: TenantScope, serviceId: string): Promise<ServiceOverviewData | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      if (!service) return null;
      const base = await loadServiceSnapshot(tx, serviceId);

      // Solo los marcos activos del servicio.
      const frameworks = (
        await tx.serviceFramework.findMany({
          where: { serviceId, status: 'active' },
          orderBy: { contractedAt: 'asc' },
          select: { frameworkId: true, periodStart: true, periodEnd: true, cutoffDate: true, framework: { select: { code: true, name: true } }, catalogVersion: { select: { number: true } } },
        })
      ).map((f) => ({
        frameworkId: f.frameworkId, code: f.framework.code, name: f.framework.name, catalogVersion: f.catalogVersion.number,
        periodStart: f.periodStart, periodEnd: f.periodEnd, cutoffDate: f.cutoffDate,
      }));

      // Una categoría está en alcance si es obligatoria (Seguridad en SOC 2) o si el servicio la eligió.
      const selected = new Set((await tx.serviceTrustCriterion.findMany({ where: { serviceId }, select: { trustCriterion: { select: { criterion: true } } } })).map((r) => r.trustCriterion.criterion));
      const criteria = (await tx.trustCriterion.findMany({ select: { criterion: true, isMandatory: true } })).map((c) => ({ criterion: c.criterion, mandatory: c.isMandatory, selected: selected.has(c.criterion) }));

      // Dónde cae cada control: por los requisitos a los que sirve (marco y categoría del requisito); uno propio, en la categoría que eligió la empresa y en todos los marcos del servicio.
      const rows = await tx.clientControl.findMany({
        where: { serviceId, isActive: true },
        select: { id: true, trustCriterion: true, control: { select: { pointOfFocusControls: { select: { pointOfFocus: { select: { requirement: { select: { frameworkId: true, trustCriterion: { select: { criterion: true } } } } } } } } } } },
      });
      const placements = new Map<string, Placement[]>();
      for (const row of rows) {
        const seen = new Set<string>();
        const list: Placement[] = [];
        const add = (frameworkId: string, criterion: string) => {
          const key = `${frameworkId}|${criterion}`;
          if (!seen.has(key)) {
            seen.add(key);
            list.push({ frameworkId, criterion });
          }
        };
        if (row.control) for (const link of row.control.pointOfFocusControls) add(link.pointOfFocus.requirement.frameworkId, link.pointOfFocus.requirement.trustCriterion.criterion);
        else if (row.trustCriterion) for (const f of frameworks) add(f.frameworkId, row.trustCriterion);
        placements.set(row.id, list);
      }
      return { ...base, frameworks, criteria, placements };
    }, READ_TRANSACTION);
  }

  sharedControlsOfTests(scope: TenantScope, controlId: string, testIds: string[]): Promise<Map<string, Array<{ id: string; code: string }>>> {
    return this.prisma.withScope(scope, async (tx) => {
      const shared = new Map<string, Array<{ id: string; code: string }>>();
      const control = await tx.clientControl.findFirst({ where: { id: controlId }, select: { serviceId: true } });
      if (!control || testIds.length === 0) return shared;
      const links = await tx.clientControlTest.findMany({
        where: { testId: { in: testIds }, clientControl: { serviceId: control.serviceId, isActive: true, id: { not: controlId } } },
        select: { testId: true, clientControl: { select: { id: true, ownCode: true, control: { select: { code: true } } } } },
      });
      for (const l of links) {
        const list = shared.get(l.testId) ?? [];
        list.push({ id: l.clientControl.id, code: l.clientControl.control?.code ?? l.clientControl.ownCode });
        shared.set(l.testId, list);
      }
      for (const list of shared.values()) list.sort((a, b) => a.code.localeCompare(b.code));
      return shared;
    });
  }

  loadControl(scope: TenantScope, controlId: string): Promise<ControlDetailData | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.clientControl.findFirst({ where: { id: controlId, isActive: true }, select: { serviceId: true } });
      if (!found) return null;
      const base = await loadServiceSnapshot(tx, found.serviceId, controlId);

      const requirements = await tx.evidenceRequirement.findMany({
        where: { clientControlId: controlId },
        orderBy: { sequence: 'asc' },
        select: {
          id: true, code: true, sequence: true, description: true, dimension: true, validityWithinPeriod: true, sourceRef: true,
          responsible: { select: { id: true, type: true, personName: true } },
          // La revisión del admin_empresa: la única, la que ven todos y la que consume el motor (D96).
          submissions: { select: { id: true, version: true, aiVerdict: true, reviews: ALL_REVIEWS } },
        },
      });
      const links = await tx.clientCauseControl.findMany({
        where: { clientControlId: controlId, clientCause: { isActive: true } },
        select: { clientCause: { select: { id: true, code: true, name: true } } },
      });

      return {
        ...base,
        evidence: requirements.map((r) => {
          // `version` es texto en el modelo ("1", "2"…): la última es la de mayor número.
          const latest = [...r.submissions].sort((a, b) => (Number(b.version) || 0) - (Number(a.version) || 0))[0];
          return {
            requirementId: r.id, code: r.code, sequence: r.sequence, description: r.description, dimension: r.dimension,
            validityWithinPeriod: r.validityWithinPeriod,
            origin: r.sourceRef ? ('catalog' as const) : ('own' as const),
            responsible: r.responsible ? { id: r.responsible.id, type: r.responsible.type, personName: r.responsible.personName } : null,
            latestSubmission: latest ? { id: latest.id, version: Number(latest.version) || 0, evidenceState: evidenceStateOf({ aiVerdict: latest.aiVerdict, reviews: latest.reviews.map(toReviewRecord) }) } : null,
          };
        }),
        causes: links.map((l) => ({ id: l.clientCause.id, code: l.clientCause.code, name: l.clientCause.name })),
      };
    }, READ_TRANSACTION);
  }
}
