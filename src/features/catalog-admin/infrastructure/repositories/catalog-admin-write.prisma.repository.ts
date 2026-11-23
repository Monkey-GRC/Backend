import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import {
  Audit,
  CatalogAdminWriteRepository,
  Change,
  NewTest,
  PointOfFocusRef,
  Snapshot,
  TestPatch,
} from '../../domain/repositories/catalog-admin-write.repository';

const isUnique = (e: unknown) => (e as { code?: string })?.code === 'P2002';
const strip = <T extends Record<string, unknown>>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

// Snapshots de lo que la auditoría guarda de cada elemento (sin textos largos del comité: el rastro dice QUÉ cambió, no copia el catálogo).
const controlSnap = (c: { code: string; name: string; domain: string | null; description: string; sourceRef: string | null; isActive: boolean; origin: string }): Snapshot => ({
  code: c.code, name: c.name, domain: c.domain, description: c.description, source_ref: c.sourceRef, is_active: c.isActive, origin: c.origin,
});
const riskSnap = (r: { code: string; name: string; description: string; trustCriterion: string; potentialImpact: unknown; isActive: boolean; origin: string }): Snapshot => ({
  code: r.code, name: r.name, description: r.description, trust_criterion: r.trustCriterion, potential_impact: r.potentialImpact, is_active: r.isActive, origin: r.origin,
});
const causeSnap = (c: { code: string; name: string | null; description: string; failureCategory: string | null; isActive: boolean; origin: string }): Snapshot => ({
  code: c.code, name: c.name, description: c.description, failure_category: c.failureCategory, is_active: c.isActive, origin: c.origin,
});
const templateSnap = (t: { code: string; description: string; dimension: string; isActive: boolean; origin: string }): Snapshot => ({
  code: t.code, description: t.description, dimension: t.dimension, is_active: t.isActive, origin: t.origin,
});
const testSnap = (t: { code: string; dimension: string; name: string | null; displayName: string | null; displayDescription: string | null; objective: string; type: string | null; isActive: boolean; origin: string }): Snapshot => ({
  code: t.code, dimension: t.dimension, name: t.name, display_name: t.displayName, display_description: t.displayDescription, objective: t.objective, type: t.type, is_active: t.isActive, origin: t.origin,
});

/** El siguiente código libre de la serie (`R011`, `F057`, `RC093`): el mayor número que hay, más uno. */
async function nextCode(codes: string[], prefix: string): Promise<string> {
  const numbers = codes.map((c) => Number(c.slice(prefix.length))).filter((n) => Number.isInteger(n));
  return `${prefix}${String(Math.max(0, ...numbers) + 1).padStart(3, '0')}`;
}

// Escribe el catálogo maestro. Solo `admin_monkey` puede (RLS de `catalog`, D31): el alcance que llega trae ese rol y `withScope` lo fija en la transacción.
// Dar de baja no borra (`is_active = false`): las copias de cada empresa y las evaluaciones apuntan al catálogo. Lo que se cambia aquí NO llega a las
// copias que las empresas ya clonaron (D28); la propagación (A4) queda fuera de esta entrega.
@Injectable()
export class CatalogAdminWritePrismaRepository extends CatalogAdminWriteRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  // ---- controles ------------------------------------------------------------------------------------------------------------------------------

  createControl(scope: TenantScope, input: { code: string; name: string; description: string; domain: string; sourceRef?: string }, audit: Audit): Promise<Change> {
    return this.prisma.withScope(scope, async (tx) => {
      try {
        const row = await tx.control.create({ data: { ...input, sourceRef: input.sourceRef ?? null, origin: 'monkey_admin' } });
        return this.record(tx, audit, { id: row.id, code: row.code, before: null, after: controlSnap(row) });
      } catch (e) {
        throw isUnique(e) ? new DomainError('CODE_ALREADY_EXISTS') : e;
      }
    });
  }

  updateControl(scope: TenantScope, id: string, patch: Parameters<CatalogAdminWriteRepository['updateControl']>[2], audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.control.findUnique({ where: { id } });
      if (!before) return null;
      const after = await tx.control.update({ where: { id }, data: strip(patch) });
      return this.record(tx, audit, { id, code: before.code, before: controlSnap(before), after: controlSnap(after) });
    });
  }

  // ---- riesgos y causas -----------------------------------------------------------------------------------------------------------------------

  createRisk(scope: TenantScope, input: Parameters<CatalogAdminWriteRepository['createRisk']>[1], audit: Audit): Promise<Change> {
    return this.prisma.withScope(scope, async (tx) => {
      const code = input.code ?? (await nextCode((await tx.risk.findMany({ select: { code: true } })).map((r) => r.code), 'R'));
      try {
        const row = await tx.risk.create({
          data: { code, name: input.name, description: input.description, trustCriterion: input.trustCriterion as never, potentialImpact: input.potentialImpact, origin: 'monkey_admin' },
        });
        return this.record(tx, audit, { id: row.id, code: row.code, before: null, after: riskSnap(row) });
      } catch (e) {
        throw isUnique(e) ? new DomainError('CODE_ALREADY_EXISTS') : e;
      }
    });
  }

  updateRisk(scope: TenantScope, id: string, patch: Parameters<CatalogAdminWriteRepository['updateRisk']>[2], audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.risk.findUnique({ where: { id } });
      if (!before) return null;
      const after = await tx.risk.update({ where: { id }, data: strip({ ...patch, trustCriterion: patch.trustCriterion as never }) });
      return this.record(tx, audit, { id, code: before.code, before: riskSnap(before), after: riskSnap(after) });
    });
  }

  createCause(scope: TenantScope, input: Parameters<CatalogAdminWriteRepository['createCause']>[1], audit: Audit): Promise<Change> {
    return this.prisma.withScope(scope, async (tx) => {
      const code = input.code ?? (await nextCode((await tx.cause.findMany({ select: { code: true } })).map((c) => c.code), 'F'));
      try {
        const row = await tx.cause.create({ data: { code, name: input.name, description: input.description, failureCategory: input.failureCategory as never, origin: 'monkey_admin' } });
        return this.record(tx, audit, { id: row.id, code: row.code, before: null, after: causeSnap(row) });
      } catch (e) {
        throw isUnique(e) ? new DomainError('CODE_ALREADY_EXISTS') : e;
      }
    });
  }

  updateCause(scope: TenantScope, id: string, patch: Parameters<CatalogAdminWriteRepository['updateCause']>[2], audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.cause.findUnique({ where: { id } });
      if (!before) return null;
      const after = await tx.cause.update({ where: { id }, data: strip({ ...patch, failureCategory: patch.failureCategory as never }) });
      return this.record(tx, audit, { id, code: before.code, before: causeSnap(before), after: causeSnap(after) });
    });
  }

  // ---- plantillas de evidencia ----------------------------------------------------------------------------------------------------------------

  createEvidenceTemplate(scope: TenantScope, input: { code: string; description: string; dimension?: string }, audit: Audit): Promise<Change> {
    return this.prisma.withScope(scope, async (tx) => {
      try {
        const row = await tx.evidenceTemplate.create({ data: { code: input.code, description: input.description, dimension: (input.dimension ?? 'policy') as never, origin: 'monkey_admin' } });
        return this.record(tx, audit, { id: row.id, code: row.code, before: null, after: templateSnap(row) });
      } catch (e) {
        throw isUnique(e) ? new DomainError('CODE_ALREADY_EXISTS') : e;
      }
    });
  }

  updateEvidenceTemplate(scope: TenantScope, id: string, patch: Partial<{ description: string; isActive: boolean }>, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.evidenceTemplate.findUnique({ where: { id } });
      if (!before) return null;
      const after = await tx.evidenceTemplate.update({ where: { id }, data: strip(patch) });
      return this.record(tx, audit, { id, code: before.code, before: templateSnap(before), after: templateSnap(after) });
    });
  }

  // ---- pruebas --------------------------------------------------------------------------------------------------------------------------------

  createTest(scope: TenantScope, input: NewTest, audit: Audit): Promise<Change> {
    return this.prisma.withScope(scope, async (tx) => {
      try {
        const row = await tx.test.create({
          data: {
            code: input.code,
            dimension: input.dimension as never,
            name: input.name,
            displayName: input.displayName,
            displayDescription: input.displayDescription,
            objective: input.objective,
            type: input.type as never,
            tool: input.tool ?? '',
            population: input.population ?? '',
            period: input.period ?? '',
            populationSize: input.populationSize ?? '',
            suggestedSampleSize: input.suggestedSampleSize ?? '',
            selectionMethod: input.selectionMethod ?? '',
            evidenceToRequest: input.evidenceToRequest ?? '',
            prerequisites: input.prerequisites ?? '',
            stepByStep: input.stepByStep?.join('\n') ?? null,
            attributesToValidate: input.attributesToValidate ?? [],
            complianceCriterion: input.complianceCriterion ?? '',
            exceptions: input.exceptions ?? '',
            exceptionsHandling: input.exceptionsHandling ?? '',
            evidenceToRetain: input.evidenceToRetain ?? '',
            automatedCoverage: input.automatedCoverage ?? '',
            complementaryManualValidation: input.complementaryManualValidation ?? '',
            limitations: input.limitations ?? '',
            origin: 'monkey_admin',
          },
        });
        return this.record(tx, audit, { id: row.id, code: row.code, before: null, after: testSnap(row) });
      } catch (e) {
        throw isUnique(e) ? new DomainError('CODE_ALREADY_EXISTS') : e;
      }
    });
  }

  updateTest(scope: TenantScope, id: string, patch: TestPatch, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const before = await tx.test.findUnique({ where: { id } });
      if (!before) return null;
      // Dar de baja una prueba no puede dejar sin ninguna prueba activa a un control activo que la usaba.
      if (patch.isActive === false && before.isActive) await this.assertNotTheLastTest(tx, id);
      const after = await tx.test.update({ where: { id }, data: strip(patch) as Prisma.TestUpdateInput });
      return this.record(tx, audit, { id, code: before.code, before: testSnap(before), after: testSnap(after) });
    });
  }

  // ---- vínculos -------------------------------------------------------------------------------------------------------------------------------

  linkEvidenceTemplate(scope: TenantScope, controlId: string, templateId: string, sequence: number | undefined, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const [control, template] = await Promise.all([tx.control.findUnique({ where: { id: controlId } }), tx.evidenceTemplate.findUnique({ where: { id: templateId } })]);
      if (!control || !template) return null;
      if (await tx.controlEvidenceTemplate.findUnique({ where: { controlId_evidenceTemplateId: { controlId, evidenceTemplateId: templateId } } })) throw new DomainError('LINK_ALREADY_EXISTS');
      const count = await tx.controlEvidenceTemplate.count({ where: { controlId } });
      const position = sequence === undefined ? count + 1 : sequence;
      if (position < 1 || position > count + 1) throw new ValidationException([{ field: 'sequence', code: 'sequence.range' }]);
      // Las secuencias son únicas por control y contiguas desde 1: para hacer lugar se suben las siguientes, de la última a la primera.
      const later = await tx.controlEvidenceTemplate.findMany({ where: { controlId, sequence: { gte: position } }, orderBy: { sequence: 'desc' } });
      for (const row of later) await tx.controlEvidenceTemplate.update({ where: { id: row.id }, data: { sequence: row.sequence + 1 } });
      await tx.controlEvidenceTemplate.create({ data: { controlId, evidenceTemplateId: templateId, sequence: position } });
      return this.record(tx, audit, { id: controlId, code: control.code, before: null, after: { control: control.code, evidence_template: template.code, sequence: position } });
    });
  }

  unlinkEvidenceTemplate(scope: TenantScope, controlId: string, templateId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const link = await tx.controlEvidenceTemplate.findUnique({
        where: { controlId_evidenceTemplateId: { controlId, evidenceTemplateId: templateId } },
        include: { control: { select: { code: true } }, evidenceTemplate: { select: { code: true } } },
      });
      if (!link) return null;
      await tx.controlEvidenceTemplate.delete({ where: { id: link.id } });
      // Se cierra el hueco para que las secuencias sigan contiguas desde 1: de la siguiente a la última, cada una un lugar abajo.
      const later = await tx.controlEvidenceTemplate.findMany({ where: { controlId, sequence: { gt: link.sequence } }, orderBy: { sequence: 'asc' } });
      for (const row of later) await tx.controlEvidenceTemplate.update({ where: { id: row.id }, data: { sequence: row.sequence - 1 } });
      return this.record(tx, audit, { id: controlId, code: link.control.code, before: { control: link.control.code, evidence_template: link.evidenceTemplate.code, sequence: link.sequence }, after: null });
    });
  }

  linkTest(scope: TenantScope, controlId: string, testId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const [control, test] = await Promise.all([
        tx.control.findUnique({ where: { id: controlId }, include: { dimensions: { select: { dimension: true } } } }),
        tx.test.findUnique({ where: { id: testId } }),
      ]);
      if (!control || !test) return null;
      // Una prueba mide una dimensión: el control tiene que tenerla, si no la prueba no mediría nada.
      if (!control.dimensions.some((d) => d.dimension === test.dimension)) throw new ValidationException([{ field: 'test_id', code: 'dimension.not_in_control' }]);
      try {
        await tx.controlTest.create({ data: { controlId, testId } });
      } catch (e) {
        throw isUnique(e) ? new DomainError('LINK_ALREADY_EXISTS') : e;
      }
      return this.record(tx, audit, { id: controlId, code: control.code, before: null, after: { control: control.code, test: test.code } });
    });
  }

  unlinkTest(scope: TenantScope, controlId: string, testId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const link = await tx.controlTest.findUnique({ where: { controlId_testId: { controlId, testId } }, include: { control: { select: { code: true, isActive: true } }, test: { select: { code: true } } } });
      if (!link) return null;
      // Un control activo que tenía pruebas no puede quedarse sin ninguna: primero se le da de baja.
      if (link.control.isActive && (await tx.controlTest.count({ where: { controlId, testId: { not: testId } } })) === 0) throw new DomainError('CATALOG_ITEM_IN_USE', { control: link.control.code });
      await tx.controlTest.delete({ where: { id: link.id } });
      return this.record(tx, audit, { id: controlId, code: link.control.code, before: { control: link.control.code, test: link.test.code }, after: null });
    });
  }

  linkPointOfFocus(scope: TenantScope, controlId: string, pointOfFocusId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const [control, pof] = await Promise.all([
        tx.control.findUnique({ where: { id: controlId } }),
        tx.pointOfFocus.findUnique({ where: { id: pointOfFocusId }, include: { requirement: { select: { code: true } } } }),
      ]);
      if (!control || !pof) return null;
      try {
        await tx.pointOfFocusControl.create({ data: { controlId, pointOfFocusId } });
      } catch (e) {
        throw isUnique(e) ? new DomainError('LINK_ALREADY_EXISTS') : e;
      }
      return this.record(tx, audit, { id: controlId, code: control.code, before: null, after: { control: control.code, requirement: pof.requirement.code, point_of_focus: pof.number } });
    });
  }

  unlinkPointOfFocus(scope: TenantScope, controlId: string, pointOfFocusId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const link = await tx.pointOfFocusControl.findUnique({
        where: { pointOfFocusId_controlId: { pointOfFocusId, controlId } },
        include: { control: { select: { code: true } }, pointOfFocus: { select: { number: true, requirement: { select: { code: true } } } } },
      });
      if (!link) return null;
      await tx.pointOfFocusControl.delete({ where: { id: link.id } });
      return this.record(tx, audit, {
        id: controlId,
        code: link.control.code,
        before: { control: link.control.code, requirement: link.pointOfFocus.requirement.code, point_of_focus: link.pointOfFocus.number },
        after: null,
      });
    });
  }

  linkCauseToControl(scope: TenantScope, causeId: string, controlId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const [cause, control] = await Promise.all([tx.cause.findUnique({ where: { id: causeId } }), tx.control.findUnique({ where: { id: controlId } })]);
      if (!cause || !control) return null;
      try {
        await tx.causeControl.create({ data: { causeId, controlId } });
      } catch (e) {
        throw isUnique(e) ? new DomainError('LINK_ALREADY_EXISTS') : e;
      }
      return this.record(tx, audit, { id: causeId, code: cause.code, before: null, after: { cause: cause.code, control: control.code } });
    });
  }

  unlinkCauseFromControl(scope: TenantScope, causeId: string, controlId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const link = await tx.causeControl.findUnique({ where: { causeId_controlId: { causeId, controlId } }, include: { cause: { select: { code: true } }, control: { select: { code: true } } } });
      if (!link) return null;
      await tx.causeControl.delete({ where: { id: link.id } });
      return this.record(tx, audit, { id: causeId, code: link.cause.code, before: { cause: link.cause.code, control: link.control.code }, after: null });
    });
  }

  linkRiskToCause(scope: TenantScope, riskId: string, causeId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const [risk, cause] = await Promise.all([tx.risk.findUnique({ where: { id: riskId } }), tx.cause.findUnique({ where: { id: causeId } })]);
      if (!risk || !cause) return null;
      if (await tx.riskCause.findUnique({ where: { riskId_causeId: { riskId, causeId } } })) throw new DomainError('LINK_ALREADY_EXISTS');
      const code = await nextCode((await tx.riskCause.findMany({ select: { code: true } })).flatMap((r) => (r.code ? [r.code] : [])), 'RC');
      try {
        await tx.riskCause.create({ data: { code, riskId, causeId } });
      } catch (e) {
        throw isUnique(e) ? new DomainError('LINK_ALREADY_EXISTS') : e;
      }
      return this.record(tx, audit, { id: riskId, code: risk.code, before: null, after: { risk: risk.code, cause: cause.code, link: code } });
    });
  }

  unlinkRiskFromCause(scope: TenantScope, riskId: string, causeId: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const link = await tx.riskCause.findUnique({ where: { riskId_causeId: { riskId, causeId } }, include: { risk: { select: { code: true } }, cause: { select: { code: true } } } });
      if (!link) return null;
      await tx.riskCause.delete({ where: { id: link.id } });
      return this.record(tx, audit, { id: riskId, code: link.risk.code, before: { risk: link.risk.code, cause: link.cause.code, link: link.code }, after: null });
    });
  }

  addDimension(scope: TenantScope, controlId: string, input: Parameters<CatalogAdminWriteRepository['addDimension']>[2], audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.control.findUnique({ where: { id: controlId } });
      if (!control) return null;
      try {
        await tx.controlDimensionEntry.create({
          data: {
            controlId,
            dimension: input.dimension as never,
            type: input.type as never,
            requiresProbe: input.requiresProbe,
            requiresAi: input.requiresAi,
            requiresComplianceConfirmation: input.requiresComplianceConfirmation,
          },
        });
      } catch (e) {
        throw isUnique(e) ? new DomainError('LINK_ALREADY_EXISTS') : e;
      }
      return this.record(tx, audit, { id: controlId, code: control.code, before: null, after: { control: control.code, dimension: input.dimension, type: input.type } });
    });
  }

  removeDimension(scope: TenantScope, controlId: string, dimension: string, audit: Audit): Promise<Change | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const entry = await tx.controlDimensionEntry.findUnique({ where: { controlId_dimension: { controlId, dimension: dimension as never } }, include: { control: { select: { code: true } } } });
      if (!entry) return null;
      // Las pruebas de esa dimensión que el control usa se quedarían sin nada que medir: primero se desvinculan.
      const tests = await tx.controlTest.count({ where: { controlId, test: { dimension: dimension as never } } });
      if (tests > 0) throw new DomainError('CATALOG_ITEM_IN_USE', { control: entry.control.code, dimension });
      await tx.controlDimensionEntry.delete({ where: { id: entry.id } });
      return this.record(tx, audit, { id: controlId, code: entry.control.code, before: { control: entry.control.code, dimension, type: entry.type }, after: null });
    });
  }

  // ---- lectura de apoyo -----------------------------------------------------------------------------------------------------------------------

  async listPointsOfFocus(frameworkId: string, requirementCode?: string): Promise<PointOfFocusRef[] | null> {
    const framework = await this.prisma.framework.findUnique({ where: { id: frameworkId }, select: { code: true } });
    if (!framework) return null;
    const rows = await this.prisma.pointOfFocus.findMany({
      where: { requirement: { frameworkId, ...(requirementCode ? { code: requirementCode } : {}) } },
      include: { requirement: { select: { code: true } }, _count: { select: { pointOfFocusControls: true } } },
    });
    return rows
      .map((p) => ({ id: p.id, frameworkCode: framework.code, requirementCode: p.requirement.code, number: p.number, description: p.description, controlsCount: p._count.pointOfFocusControls }))
      .sort((a, b) => a.requirementCode.localeCompare(b.requirementCode, 'en', { numeric: true }) || a.number - b.number);
  }

  // ---- internos -------------------------------------------------------------------------------------------------------------------------------

  private async assertNotTheLastTest(tx: TransactionClient, testId: string): Promise<void> {
    const links = await tx.controlTest.findMany({ where: { testId, control: { isActive: true } }, select: { controlId: true, control: { select: { code: true } } } });
    const stranded: string[] = [];
    for (const link of links) {
      const others = await tx.controlTest.count({ where: { controlId: link.controlId, testId: { not: testId }, test: { isActive: true } } });
      if (others === 0) stranded.push(link.control.code);
    }
    if (stranded.length) throw new DomainError('CATALOG_ITEM_IN_USE', { controls: stranded });
  }

  /** Deja el rastro en la MISMA transacción que el efecto: si el rastro falla, el cambio se revierte (SEG-36). */
  private async record(tx: TransactionClient, audit: Audit, change: Change): Promise<Change> {
    await insertAuditLog(tx, audit(change));
    return change;
  }
}
