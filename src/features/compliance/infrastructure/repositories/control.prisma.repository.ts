import { Injectable } from '@nestjs/common';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { Dimension, ReadoutControl, resultKey } from '../../domain/control-readout';
import { AssetResult } from '../../domain/engine/states';
import { ControlDetailData, ControlRepository, Placement, ServiceOverviewData, ServiceReadoutData } from '../../domain/repositories/control.repository';
import { evidenceStateOf } from '../../domain/evidence';

// Orden canónico de las categorías (enums.md `trust_criterion`).
const CRITERIA_ORDER = ['security', 'availability', 'confidentiality', 'integrity', 'privacy'];

@Injectable()
export class ControlPrismaRepository extends ControlRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  loadService(scope: TenantScope, serviceId: string): Promise<ServiceReadoutData | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      return service ? this.snapshot(tx, serviceId) : null;
    });
  }

  loadOverview(scope: TenantScope, serviceId: string): Promise<ServiceOverviewData | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      if (!service) return null;
      const base = await this.snapshot(tx, serviceId);

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
    });
  }

  loadControl(scope: TenantScope, controlId: string): Promise<ControlDetailData | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.clientControl.findFirst({ where: { id: controlId, isActive: true }, select: { serviceId: true } });
      if (!found) return null;
      const base = await this.snapshot(tx, found.serviceId, controlId);

      const requirements = await tx.evidenceRequirement.findMany({
        where: { clientControlId: controlId },
        orderBy: { sequence: 'asc' },
        select: {
          id: true, code: true, sequence: true, description: true, dimension: true, validityWithinPeriod: true, sourceRef: true,
          responsible: { select: { id: true, type: true, personName: true } },
          submissions: { select: { id: true, version: true, aiVerdict: true } },
        },
      });
      const links = await tx.clientCauseControl.findMany({
        where: { clientControlId: controlId, clientCause: { isActive: true } },
        select: { clientCause: { select: { id: true, name: true } } },
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
            latestSubmission: latest ? { id: latest.id, version: Number(latest.version) || 0, evidenceState: evidenceStateOf(latest) } : null,
          };
        }),
        causes: links.map((l) => ({ id: l.clientCause.id, name: l.clientCause.name })),
      };
    });
  }

  // Un número fijo de consultas, sin importar cuántos controles tenga el servicio.
  private async snapshot(tx: TransactionClient, serviceId: string, onlyControlId?: string): Promise<ServiceReadoutData> {
    const contractedCriteria = new Set(
      (await tx.serviceTrustCriterion.findMany({ where: { serviceId }, select: { trustCriterion: { select: { criterion: true } } } })).map((r) => r.trustCriterion.criterion),
    );
    const contractedFrameworks = new Set((await tx.serviceFramework.findMany({ where: { serviceId }, select: { frameworkId: true } })).map((r) => r.frameworkId));

    const rows = await tx.clientControl.findMany({
      where: { serviceId, isActive: true, ...(onlyControlId ? { id: onlyControlId } : {}) },
      select: {
        id: true, serviceId: true, ownCode: true, name: true, trustCriterion: true, type: true, clientInterpretation: true,
        control: {
          select: {
            code: true, name: true, description: true,
            pointOfFocusControls: {
              select: { pointOfFocus: { select: { number: true, requirement: { select: { code: true, frameworkId: true, trustCriterion: { select: { criterion: true } } } } } } },
            },
          },
        },
        dimensions: { select: { dimension: true, type: true, reasonNotApplicable: true } },
        tests: { select: { testId: true, test: { select: { code: true, dimension: true, displayName: true, displayDescription: true } } } },
        // Puede haber más de una persona asignada; el contrato muestra una (la primera) y el permiso cuenta todas. MD-158 define cómo se reparte.
        userControlAssignments: { orderBy: { assignedAt: 'asc' }, select: { user: { select: { id: true, name: true, lastName: true } } } },
      },
    });

    // Las propuestas de cambio de estas acciones: dicen si un control propio ya está aprobado y si hay algo pendiente.
    const changes = rows.length
      ? await tx.clientControlChange.findMany({ where: { serviceId, clientControlId: { in: rows.map((r) => r.id) } }, select: { clientControlId: true, changeType: true, status: true } })
      : [];

    const controls: ReadoutControl[] = rows.map((c) => {
      const criteria = new Set<string>();
      const requirementCodes = new Set<string>();
      const pointsOfFocus = new Set<string>();
      for (const link of c.control?.pointOfFocusControls ?? []) {
        const req = link.pointOfFocus.requirement;
        if (!contractedFrameworks.has(req.frameworkId) || !contractedCriteria.has(req.trustCriterion.criterion)) continue;
        criteria.add(req.trustCriterion.criterion);
        requirementCodes.add(req.code);
        pointsOfFocus.add(`${req.code}-POF${link.pointOfFocus.number}`);
      }
      const assigned = c.userControlAssignments[0]?.user;
      const mine = changes.filter((x) => x.clientControlId === c.id);
      const creation = mine.find((x) => x.changeType === 'create');
      return {
        id: c.id,
        serviceId: c.serviceId,
        ownCode: c.ownCode,
        name: c.control?.name ?? c.name ?? c.ownCode,
        origin: c.control ? 'catalog' : 'own',
        type: c.type,
        interpretation: c.clientInterpretation,
        catalogDescription: c.control?.description ?? null,
        dimensions: c.dimensions.map((d) => ({ dimension: d.dimension as Dimension, applies: d.reasonNotApplicable === null, type: d.type, reasonNotApplicable: d.reasonNotApplicable })),
        // `client_control_tests` todavía no guarda «obligatorio» ni «vigente» (D68): hasta entonces todo test vinculado es obligatorio y vigente.
        tests: c.tests.map((t) => ({ testId: t.testId, code: t.test.code, displayName: t.test.displayName, displayDescription: t.test.displayDescription, dimension: t.test.dimension as Dimension, mandatory: true, active: true })),
        // Un control propio no llega a ningún requisito: su categoría es la que eligió la empresa.
        trustCriteria: c.control ? [...criteria].sort((a, b) => CRITERIA_ORDER.indexOf(a) - CRITERIA_ORDER.indexOf(b)) : c.trustCriterion ? [c.trustCriterion] : [],
        assignee: assigned ? { userId: assigned.id, name: assigned.name, lastName: assigned.lastName } : null,
        assignedUserIds: c.userControlAssignments.map((a) => a.user.id),
        approval: creation?.status ?? 'approved',
        hasPendingChange: mine.some((x) => x.status === 'pending'),
        catalogCode: c.control?.code ?? null,
        requirementCodes: [...requirementCodes].sort(),
        pointsOfFocus: [...pointsOfFocus].sort(),
      };
    });

    const assets = (await tx.serviceAsset.findMany({ where: { serviceId, asset: { status: 'active' } }, select: { asset: { select: { id: true, name: true, type: true } } } })).map((r) => r.asset);

    // El último resultado de cada (control, test, activo): el histórico es inmutable y la lectura toma el más reciente.
    const latest = controls.length
      ? await tx.evaluation.findMany({
          where: { serviceId, clientControlId: { in: controls.map((c) => c.id) } },
          orderBy: { evaluatedAt: 'desc' },
          distinct: ['clientControlId', 'testId', 'assetId'],
          select: { clientControlId: true, testId: true, assetId: true, result: true },
        })
      : [];
    const results = new Map<string, AssetResult>(latest.map((e) => [resultKey(e.clientControlId, e.testId, e.assetId), e.result as AssetResult]));

    // Una exclusión APROBADA y vigente saca al activo del universo del test (su resultado es `excluded`, RN-05); la pendiente, la rechazada y la vencida no cambian nada:
    // el activo sigue contando. El veredicto de la sonda no se toca: la exclusión se superpone al leer (MD-144, D78).
    const day = new Date();
    const now = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
    const excluded = await tx.exclusion.findMany({
      where: { serviceId, status: 'approved', assetId: { not: null }, validFrom: { lte: now }, validUntil: { gte: now } },
      select: { testId: true, assetId: true },
    });
    for (const x of excluded) {
      for (const c of controls) if (c.tests.some((t) => t.testId === x.testId)) results.set(resultKey(c.id, x.testId, x.assetId as string), 'excluded');
    }

    return { serviceId, controls, assets, results };
  }
}
