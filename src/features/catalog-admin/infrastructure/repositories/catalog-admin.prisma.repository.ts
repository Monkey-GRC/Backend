import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { Page } from '../../../../common/pagination/page';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  CatalogAdminRepository,
  CatalogFilter,
  CauseDetail,
  CauseSummary,
  ControlDetail,
  AllControlsFilter,
  ControlFilter,
  ControlSummary,
  EvidenceTemplateSummary,
  FrameworkDetail,
  FrameworkSummary,
  PageQuery,
  RiskDetail,
  RiskSummary,
  TestDetail,
  TestSummary,
} from '../../domain/repositories/catalog-admin.repository';

const like = (search: string) => ({ contains: search, mode: 'insensitive' as const });
const paging = (q: PageQuery) => ({ skip: (q.page - 1) * q.pageSize, take: q.pageSize });
const pageOf = <T>(items: T[], total: number, q: PageQuery): Page<T> => ({ items, total, page: q.page, pageSize: q.pageSize });
const ref = (r: { id: string; code: string; name: string }) => ({ id: r.id, code: r.code, name: r.name });

// Las condiciones que comparten todas las listas: activo, origen y, si hay, la búsqueda sobre los campos que cada una indique.
function common(filter: CatalogFilter, searchIn: string[], withActive = true): Record<string, unknown>[] {
  const conditions: Record<string, unknown>[] = [];
  if (filter.search) conditions.push({ OR: searchIn.map((field) => ({ [field]: like(filter.search!) })) });
  if (withActive && filter.isActive !== undefined) conditions.push({ isActive: filter.isActive });
  if (filter.origin) conditions.push({ origin: filter.origin });
  return conditions;
}

// El catálogo es global y de lectura libre para cualquier sesión (RLS en `catalog`, D31): no hace falta tenant, así que se lee sin transacción de alcance,
// igual que `CompanyPrismaRepository.existingFrameworkCodes`. Quién puede llegar aquí lo decide `@Roles('admin_monkey')` en el controlador.
@Injectable()
export class CatalogAdminPrismaRepository extends CatalogAdminRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // ---- marcos ---------------------------------------------------------------------------------------------------------------------------------------

  async listFrameworks(query: PageQuery): Promise<Page<FrameworkSummary>> {
    const [rows, total] = await Promise.all([
      this.prisma.framework.findMany({ orderBy: [{ code: 'asc' }, { version: 'asc' }], ...paging(query) }),
      this.prisma.framework.count(),
    ]);
    const items = await Promise.all(rows.map((f) => this.summarize(f)));
    return pageOf(items, total, query);
  }

  async findFramework(id: string): Promise<FrameworkDetail | null> {
    const framework = await this.prisma.framework.findUnique({
      where: { id },
      include: {
        requirements: {
          orderBy: { code: 'asc' },
          include: { trustCriterion: true, pointsOfFocus: { select: { pointOfFocusControls: { select: { controlId: true } } } } },
        },
      },
    });
    if (!framework) return null;
    const trust = new Map(framework.requirements.map((r) => [r.trustCriterion.criterion, r.trustCriterion.isMandatory]));
    return {
      ...(await this.summarize(framework)),
      trustCriteria: [...trust].map(([criterion, isMandatory]) => ({ criterion, isMandatory })).sort((a, b) => a.criterion.localeCompare(b.criterion)),
      requirements: framework.requirements.map((r) => ({
        code: r.code,
        tscCategory: r.tscCategory,
        criterion: r.criterion,
        trustCriterion: r.trustCriterion.criterion,
        pointsOfFocusCount: r.pointsOfFocus.length,
        controlsCount: new Set(r.pointsOfFocus.flatMap((p) => p.pointOfFocusControls.map((l) => l.controlId))).size,
      })),
    };
  }

  /** Un control pertenece a un marco por alguno de sus puntos de enfoque (marco → requisito → punto de enfoque → control). */
  private inFramework(frameworkId: string, requirementCode?: string): Prisma.ControlWhereInput {
    return {
      pointOfFocusControls: { some: { pointOfFocus: { requirement: { frameworkId, ...(requirementCode ? { code: requirementCode } : {}) } } } },
    };
  }

  private async summarize(f: { id: string; code: string; name: string; version: string; type: string; availability: string; scopeDescription: string }): Promise<FrameworkSummary> {
    const controls = this.inFramework(f.id);
    const [requirements, controlsCount, tests] = await Promise.all([
      this.prisma.requirement.count({ where: { frameworkId: f.id } }),
      this.prisma.control.count({ where: controls }),
      this.prisma.test.count({ where: { controlTests: { some: { control: controls } } } }),
    ]);
    return {
      id: f.id,
      code: f.code,
      name: f.name,
      version: f.version,
      type: f.type,
      availability: f.availability,
      scopeDescription: f.scopeDescription,
      counts: { requirements, controls: controlsCount, tests },
    };
  }

  // ---- controles ------------------------------------------------------------------------------------------------------------------------------------

  async listFrameworkControls(frameworkId: string, filter: ControlFilter): Promise<Page<ControlSummary> | null> {
    if (!(await this.prisma.framework.findUnique({ where: { id: frameworkId }, select: { id: true } }))) return null;
    return this.listControls({ ...filter, frameworkId });
  }

  async listControls(filter: AllControlsFilter): Promise<Page<ControlSummary>> {
    const conditions: Prisma.ControlWhereInput[] = [...(common(filter, ['code', 'name']) as Prisma.ControlWhereInput[])];
    if (filter.frameworkId) conditions.push(this.inFramework(filter.frameworkId, filter.requirementCode));
    else if (filter.requirementCode) conditions.push({ pointOfFocusControls: { some: { pointOfFocus: { requirement: { code: filter.requirementCode } } } } });
    if (filter.unlinked) conditions.push({ pointOfFocusControls: { none: {} } });
    if (filter.domain) conditions.push({ domain: filter.domain });
    if (filter.hasEvidenceTemplate !== undefined) conditions.push({ evidenceTemplates: filter.hasEvidenceTemplate ? { some: {} } : { none: {} } });
    const where: Prisma.ControlWhereInput = { AND: conditions };

    const [rows, total] = await Promise.all([
      this.prisma.control.findMany({
        where,
        orderBy: { code: 'asc' },
        ...paging(filter),
        include: { dimensions: { select: { dimension: true } }, _count: { select: { controlTests: true, evidenceTemplates: true } } },
      }),
      this.prisma.control.count({ where }),
    ]);
    return pageOf(
      rows.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        domain: c.domain,
        origin: c.origin,
        isActive: c.isActive,
        dimensions: c.dimensions.map((d) => d.dimension).sort(),
        testsCount: c._count.controlTests,
        evidenceTemplatesCount: c._count.evidenceTemplates,
      })),
      total,
      filter,
    );
  }

  async findControl(id: string): Promise<ControlDetail | null> {
    const c = await this.prisma.control.findUnique({
      where: { id },
      include: {
        pointOfFocusControls: { include: { pointOfFocus: { include: { requirement: { include: { framework: { select: { code: true } } } } } } } },
        dimensions: { orderBy: { dimension: 'asc' } },
        controlTests: { include: { test: { select: { id: true, code: true, dimension: true, displayName: true, isActive: true } } } },
        evidenceTemplates: { orderBy: { sequence: 'asc' }, include: { evidenceTemplate: { select: { id: true, code: true, description: true } } } },
        controlPolicies: { include: { policy: { select: { name: true } } } },
        causeControl: { include: { cause: { select: { id: true, code: true, name: true } } } },
      },
    });
    if (!c) return null;
    return {
      id: c.id,
      code: c.code,
      origin: c.origin,
      name: c.name,
      description: c.description,
      domain: c.domain,
      sourceRef: c.sourceRef,
      isActive: c.isActive,
      pointsOfFocus: c.pointOfFocusControls
        .map((l) => ({
          frameworkCode: l.pointOfFocus.requirement.framework.code,
          requirementCode: l.pointOfFocus.requirement.code,
          number: l.pointOfFocus.number,
          description: l.pointOfFocus.description,
        }))
        .sort((a, b) => a.requirementCode.localeCompare(b.requirementCode) || a.number - b.number),
      dimensions: c.dimensions.map((d) => ({
        dimension: d.dimension,
        type: d.type,
        requiresProbe: d.requiresProbe,
        requiresAi: d.requiresAi,
        requiresComplianceConfirmation: d.requiresComplianceConfirmation,
      })),
      tests: c.controlTests.map((l) => l.test).sort((a, b) => a.code.localeCompare(b.code)),
      evidenceTemplates: c.evidenceTemplates.map((l) => ({ ...l.evidenceTemplate, sequence: l.sequence })),
      policies: c.controlPolicies.map((l) => ({ name: l.policy.name, requiresEmployeeAcceptance: l.requiresEmployeeAcceptance })).sort((a, b) => a.name.localeCompare(b.name)),
      causes: c.causeControl.map((l) => l.cause).sort((a, b) => a.code.localeCompare(b.code)),
    };
  }

  // ---- riesgos --------------------------------------------------------------------------------------------------------------------------------------

  async listRisks(filter: CatalogFilter): Promise<Page<RiskSummary>> {
    const where: Prisma.RiskWhereInput = { AND: common(filter, ['code', 'name']) as Prisma.RiskWhereInput[] };
    const [rows, total] = await Promise.all([
      this.prisma.risk.findMany({ where, orderBy: { code: 'asc' }, ...paging(filter), include: { _count: { select: { riskCauses: true } } } }),
      this.prisma.risk.count({ where }),
    ]);
    return pageOf(
      rows.map((r) => ({ id: r.id, code: r.code, origin: r.origin, name: r.name, trustCriterion: r.trustCriterion, isActive: r.isActive, causesCount: r._count.riskCauses })),
      total,
      filter,
    );
  }

  async findRisk(id: string): Promise<RiskDetail | null> {
    const r = await this.prisma.risk.findUnique({ where: { id }, include: { riskCauses: { include: { cause: { select: { id: true, code: true, name: true } } } } } });
    if (!r) return null;
    return {
      id: r.id,
      code: r.code,
      origin: r.origin,
      name: r.name,
      description: r.description,
      trustCriterion: r.trustCriterion,
      potentialImpact: r.potentialImpact,
      isActive: r.isActive,
      causes: r.riskCauses.map((l) => l.cause).sort((a, b) => a.code.localeCompare(b.code)),
    };
  }

  // ---- causas ---------------------------------------------------------------------------------------------------------------------------------------

  async listCauses(filter: CatalogFilter): Promise<Page<CauseSummary>> {
    const where: Prisma.CauseWhereInput = { AND: common(filter, ['code', 'name']) as Prisma.CauseWhereInput[] };
    const [rows, total] = await Promise.all([
      this.prisma.cause.findMany({ where, orderBy: { code: 'asc' }, ...paging(filter), include: { _count: { select: { riskCauses: true, causeControls: true } } } }),
      this.prisma.cause.count({ where }),
    ]);
    return pageOf(
      rows.map((c) => ({
        id: c.id,
        code: c.code,
        origin: c.origin,
        name: c.name,
        failureCategory: c.failureCategory,
        isActive: c.isActive,
        risksCount: c._count.riskCauses,
        controlsCount: c._count.causeControls,
      })),
      total,
      filter,
    );
  }

  async findCause(id: string): Promise<CauseDetail | null> {
    const c = await this.prisma.cause.findUnique({
      where: { id },
      include: {
        riskCauses: { include: { risk: { select: { id: true, code: true, name: true } } } },
        causeControls: { include: { control: { select: { id: true, code: true, name: true } } } },
      },
    });
    if (!c) return null;
    return {
      id: c.id,
      code: c.code,
      origin: c.origin,
      name: c.name,
      description: c.description,
      failureCategory: c.failureCategory,
      isActive: c.isActive,
      risks: c.riskCauses.map((l) => ref(l.risk)).sort((a, b) => a.code.localeCompare(b.code)),
      controls: c.causeControls.map((l) => ref(l.control)).sort((a, b) => a.code.localeCompare(b.code)),
    };
  }

  // ---- pruebas --------------------------------------------------------------------------------------------------------------------------------------

  async listTests(filter: CatalogFilter & { dimension?: string }): Promise<Page<TestSummary>> {
    const conditions = common(filter, ['code', 'name', 'displayName']) as Prisma.TestWhereInput[];
    if (filter.dimension) conditions.push({ dimension: filter.dimension as Prisma.TestWhereInput['dimension'] });
    const where: Prisma.TestWhereInput = { AND: conditions };
    const [rows, total] = await Promise.all([
      this.prisma.test.findMany({ where, orderBy: { code: 'asc' }, ...paging(filter), include: { _count: { select: { controlTests: true } } } }),
      this.prisma.test.count({ where }),
    ]);
    return pageOf(
      rows.map((t) => ({
        id: t.id,
        code: t.code,
        origin: t.origin,
        dimension: t.dimension,
        name: t.name,
        displayName: t.displayName,
        type: t.type,
        isActive: t.isActive,
        controlsCount: t._count.controlTests,
      })),
      total,
      filter,
    );
  }

  async findTest(id: string): Promise<TestDetail | null> {
    const t = await this.prisma.test.findUnique({ where: { id }, include: { controlTests: { include: { control: { select: { id: true, code: true, name: true } } } } } });
    if (!t) return null;
    return {
      id: t.id,
      code: t.code,
      origin: t.origin,
      dimension: t.dimension,
      name: t.name,
      displayName: t.displayName,
      displayDescription: t.displayDescription,
      isActive: t.isActive,
      committee: {
        objective: t.objective,
        type: t.type,
        tool: t.tool,
        population: t.population,
        period: t.period,
        populationSize: t.populationSize,
        suggestedSampleSize: t.suggestedSampleSize,
        selectionMethod: t.selectionMethod,
        evidenceToRequest: t.evidenceToRequest,
        prerequisites: t.prerequisites,
        stepByStep: t.stepByStep,
        attributesToValidate: t.attributesToValidate,
        complianceCriterion: t.complianceCriterion,
        exceptions: t.exceptions,
        exceptionsHandling: t.exceptionsHandling,
        evidenceToRetain: t.evidenceToRetain,
        automatedCoverage: t.automatedCoverage,
        complementaryManualValidation: t.complementaryManualValidation,
        limitations: t.limitations,
      },
      controls: t.controlTests.map((l) => ref(l.control)).sort((a, b) => a.code.localeCompare(b.code)),
    };
  }

  // ---- plantillas de evidencia ----------------------------------------------------------------------------------------------------------------------

  async listEvidenceTemplates(filter: CatalogFilter): Promise<Page<EvidenceTemplateSummary>> {
    const where: Prisma.EvidenceTemplateWhereInput = { AND: common(filter, ['code', 'description']) as Prisma.EvidenceTemplateWhereInput[] };
    const [rows, total] = await Promise.all([
      this.prisma.evidenceTemplate.findMany({ where, orderBy: { code: 'asc' }, ...paging(filter), include: { _count: { select: { controls: true } } } }),
      this.prisma.evidenceTemplate.count({ where }),
    ]);
    return pageOf(
      rows.map((e) => ({ id: e.id, code: e.code, origin: e.origin, description: e.description, dimension: e.dimension, isActive: e.isActive, controlsCount: e._count.controls })),
      total,
      filter,
    );
  }

  async findEvidenceTemplate(id: string): Promise<EvidenceTemplateSummary | null> {
    const e = await this.prisma.evidenceTemplate.findUnique({ where: { id }, include: { _count: { select: { controls: true } } } });
    return e ? { id: e.id, code: e.code, origin: e.origin, description: e.description, dimension: e.dimension, isActive: e.isActive, controlsCount: e._count.controls } : null;
  }
}
