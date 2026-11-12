import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { ReviewerRole } from '../../domain/evidence/evidence';
import {
  ControlEvidenceFacts, EvidenceAccess, EvidenceRepository, NewRequirement, NewReview, NewSubmission, RequirementRecord, ReviewSaved, ServiceEvidence, SubmissionRecord, TestEvidence,
} from '../../domain/evidence/evidence.repository';
import { loadControlResponsibles, usersOf } from '../shared/control-responsibles';
import { captureControlStates, recordControlStateChanges } from '../shared/control-state-events';
import { reviewsOf, toReviewRecord, versionOf } from './evidence-review.mapper';

// Subir o revisar una evidencia relee el servicio entero (captura el estado de sus controles antes y después, D91) dentro de la misma transacción: con la base lejos
// (desarrollo contra una base remota) los 5 s por defecto de Prisma no alcanzan y la subida responde 500 (P2028).
const STATE_TRANSACTION = { timeoutMs: 30_000 };

const PERSON ={ select: { id: true, name: true, lastName: true } } as const;
// Una dimensión que el control resuelve a mano; la documental (`policy`) también es manual (D88). Lo mismo que decide si cabe un veredicto (`test-verdict.prisma.repository.ts`).
const MANUAL_DIMENSION_TYPES = new Set(['manual', 'technical_manual']);
// La revisión que se lee es la del rol que pregunta, nunca la del otro (D84, SEG-61): por eso la entrega se pide con el rol.
const submissionSelect = (viewer: ReviewerRole) =>
  ({
    id: true, evidenceRequirementId: true, version: true, filePath: true, fileType: true, fileSize: true, integrityHash: true, submittedAt: true, aiVerdict: true,
    submittedByUser: PERSON,
    reviews: reviewsOf(viewer),
  }) as const;
type SubmissionRow = Prisma.EvidenceSubmissionGetPayload<{ select: ReturnType<typeof submissionSelect> }>;

const toSubmission = (r: SubmissionRow): SubmissionRecord => ({
  id: r.id, requirementId: r.evidenceRequirementId, version: versionOf(r.version), fileKey: r.filePath, fileType: r.fileType, fileSize: r.fileSize,
  integrityHash: r.integrityHash, submittedBy: r.submittedByUser, submittedAt: r.submittedAt, aiVerdict: r.aiVerdict,
  review: r.reviews[0] ? toReviewRecord(r.reviews[0]) : null,
});
const newestFirst = (a: SubmissionRecord, b: SubmissionRecord) => b.version - a.version;

const requirementSelect = (viewer: ReviewerRole) =>
  ({
    id: true, code: true, sequence: true, description: true, dimension: true, validityWithinPeriod: true, sourceRef: true,
    test: { select: { id: true, code: true, displayName: true, displayNameEn: true } },
    responsible: { select: { id: true, type: true, personName: true } },
    submissions: { select: submissionSelect(viewer) },
  }) as const;
type RequirementRow = Prisma.EvidenceRequirementGetPayload<{ select: ReturnType<typeof requirementSelect> }>;

const toRequirement = (r: RequirementRow): RequirementRecord => ({
  id: r.id, code: r.code, sequence: r.sequence, description: r.description, dimension: r.dimension, validityWithinPeriod: r.validityWithinPeriod,
  test: r.test ? { id: r.test.id, code: r.test.code, displayName: r.test.displayName, displayNameEn: r.test.displayNameEn } : null,
  origin: r.sourceRef ? ('catalog' as const) : ('own' as const),
  responsible: r.responsible ? { id: r.responsible.id, type: r.responsible.type, personName: r.responsible.personName } : null,
  submissions: r.submissions.map(toSubmission).sort(newestFirst),
});

@Injectable()
export class EvidencePrismaRepository extends EvidenceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  listByControl(scope: TenantScope, controlId: string, viewer: ReviewerRole): Promise<{ assignedUserIds: string[]; responsibleByDimension: Record<string, string[]>; requirements: RequirementRecord[] } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: { serviceId: true, evidenceRequirements: { orderBy: { sequence: 'asc' }, select: requirementSelect(viewer) } },
      });
      if (!control) return null;
      const dims = (await loadControlResponsibles(tx, [controlId])).byControl.get(controlId);
      return { assignedUserIds: usersOf(dims), responsibleByDimension: Object.fromEntries(dims ?? []), requirements: control.evidenceRequirements.map(toRequirement) };
    });
  }

  listByService(scope: TenantScope, serviceId: string, viewer: ReviewerRole): Promise<ServiceEvidence | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      if (!service) return null;
      const rows = await tx.clientControl.findMany({ where: { serviceId, isActive: true }, select: { id: true, ownCode: true } });
      const ids = rows.map((r) => r.id);
      const byControl = (await loadControlResponsibles(tx, ids)).byControl;
      const requirements = ids.length
        ? await tx.evidenceRequirement.findMany({ where: { clientControlId: { in: ids } }, orderBy: [{ sequence: 'asc' }], select: { ...requirementSelect(viewer), clientControlId: true } })
        : [];
      return {
        controls: rows.map((r) => ({ id: r.id, ownCode: r.ownCode, assignedUserIds: usersOf(byControl.get(r.id)), responsibleByDimension: Object.fromEntries(byControl.get(r.id) ?? []) })),
        items: requirements.map((r) => ({ controlId: r.clientControlId, requirement: toRequirement(r) })),
      };
    });
  }

  listByTest(scope: TenantScope, controlId: string, testId: string, viewer: ReviewerRole): Promise<TestEvidence | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const origin = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: { id: true, serviceId: true, ownCode: true, control: { select: { code: true } }, tests: { where: { testId }, select: { test: { select: { dimension: true } } } } },
      });
      const dimension = origin?.tests[0]?.test.dimension;
      if (!origin || !dimension) return null;
      // Solo un test manual o documental tiene evidencia que mostrar; uno automático lo mide la sonda.
      if (dimension !== 'policy') {
        const kind = await tx.clientControlDimension.findFirst({ where: { clientControlId: controlId, dimension }, select: { type: true } });
        if (!kind || !MANUAL_DIMENSION_TYPES.has(kind.type)) return null;
      }

      // D88: una prueba documental se respalda en SU control. D85: otro test manual vale en todos los controles vigentes del servicio que lo llevan.
      const others =
        dimension === 'policy'
          ? []
          : (await tx.clientControlTest.findMany({
              where: { testId, clientControl: { serviceId: origin.serviceId, isActive: true, id: { not: origin.id } } },
              select: { clientControl: { select: { id: true, ownCode: true, control: { select: { code: true } } } } },
            }))
              .map((l) => ({ id: l.clientControl.id, code: l.clientControl.control?.code ?? l.clientControl.ownCode }))
              .sort((a, b) => a.code.localeCompare(b.code));
      // El control de origen va primero, esté o no vigente.
      const controls = [{ id: origin.id, code: origin.control?.code ?? origin.ownCode }, ...others];
      const ids = controls.map((c) => c.id);

      const rows = await tx.evidenceRequirement.findMany({
        where: {
          clientControlId: { in: ids },
          ...(dimension === 'policy' ? { testId } : { OR: [{ testId }, { testId: null, dimension }] }),
        },
        orderBy: [{ sequence: 'asc' }],
        select: { ...requirementSelect(viewer), clientControlId: true },
      });
      const byControl = (await loadControlResponsibles(tx, ids)).byControl;
      return {
        testId, dimension,
        controls: controls.map((c) => ({ id: c.id, code: c.code, responsibleByDimension: Object.fromEntries(byControl.get(c.id) ?? []) })),
        items: rows
          .map((r) => ({ controlId: r.clientControlId, requirement: toRequirement(r) }))
          .sort((a, b) => ids.indexOf(a.controlId) - ids.indexOf(b.controlId) || a.requirement.sequence - b.requirement.sequence),
      };
    });
  }

  findRequirement(scope: TenantScope, requirementId: string): Promise<EvidenceAccess | null> {
    return this.prisma.withScope(scope, (tx) => this.accessOf(tx, requirementId));
  }

  listSubmissions(scope: TenantScope, requirementId: string, page: number, pageSize: number, viewer: ReviewerRole): Promise<Page<SubmissionRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await this.accessOf(tx, requirementId))) return null;
      const where = { evidenceRequirementId: requirementId };
      const total = await tx.evidenceSubmission.count({ where });
      // La versión es texto: se trae el requerimiento completo (un puñado de filas) y se pagina en memoria, para ordenar como número.
      const rows = await tx.evidenceSubmission.findMany({ where, select: submissionSelect(viewer) });
      const items = rows.map(toSubmission).sort(newestFirst).slice((page - 1) * pageSize, page * pageSize);
      return { items, total, page, pageSize };
    });
  }

  async createSubmission(scope: TenantScope, requirementId: string, input: NewSubmission, audit: Parameters<EvidenceRepository['createSubmission']>[3]): Promise<SubmissionRecord | null> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        const access = await this.accessOf(tx, requirementId);
        if (!access) return null;
        // D91 · Una entrega nueva devuelve la prueba a revisión: si eso mueve el estado de un control, queda su evento.
        const before = await captureControlStates(tx, access.serviceId);
        // Dos subidas a la vez al mismo requerimiento no pueden quedarse con la misma versión: se bloquea la fila del requerimiento mientras se calcula la siguiente.
        // (El índice único (requerimiento, versión) es la red de seguridad.)
        await tx.$queryRaw`select id from tenant.evidence_requirements where id = ${requirementId}::uuid for update`;
        const versions = await tx.evidenceSubmission.findMany({ where: { evidenceRequirementId: requirementId }, select: { version: true } });
        const next = Math.max(0, ...versions.map((v) => versionOf(v.version))) + 1;
        const row = await tx.evidenceSubmission.create({
          data: {
            tenantId: scope.companyId, evidenceRequirementId: requirementId, submittedBy: input.submittedBy, filePath: input.fileKey, fileType: input.fileType,
            fileSize: input.fileSize, storageLocation: 's3', integrityHash: input.integrityHash, version: String(next),
          },
          select: submissionSelect('admin_empresa'),
        });
        const created = toSubmission(row);
        await insertAuditLog(tx, audit(created));
        await recordControlStateChanges(tx, {
          tenantId: scope.companyId, serviceId: access.serviceId, before, cause: 'evidence_submission',
          actor: { userId: input.submittedBy, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent },
        });
        return created;
      }, STATE_TRANSACTION);
    } catch (e) {
      // Nunca debería pasar con el bloqueo de arriba; si pasa, es una carrera real y se pide reintentar en vez de pisar.
      if ((e as { code?: string })?.code === 'P2002') throw new DomainError('EVIDENCE_VERSION_CONFLICT');
      throw e;
    }
  }

  findSubmission(scope: TenantScope, submissionId: string, viewer: ReviewerRole): Promise<{ submission: SubmissionRecord; access: EvidenceAccess } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.evidenceSubmission.findFirst({ where: { id: submissionId }, select: submissionSelect(viewer) });
      if (!row) return null;
      const access = await this.accessOf(tx, row.evidenceRequirementId);
      return access ? { submission: toSubmission(row), access } : null;
    });
  }

  saveReview(scope: TenantScope, submissionId: string, input: NewReview, audit: Parameters<EvidenceRepository['saveReview']>[3]): Promise<ReviewSaved | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.evidenceSubmission.findFirst({ where: { id: submissionId }, select: { evidenceRequirementId: true } });
      if (!found) return null;
      const access = await this.accessOf(tx, found.evidenceRequirementId);
      if (!access) return null;
      // D91 · La revisión del admin_empresa mueve el estado de las pruebas (D96) y deja el evento de cada control que cambie.
      const before = await captureControlStates(tx, access.serviceId);
      const key = { evidenceSubmissionId_reviewerRole: { evidenceSubmissionId: submissionId, reviewerRole: input.reviewerRole } };
      const previous = await tx.evidenceReview.findUnique({ where: key, select: reviewsOf(input.reviewerRole).select });
      const values = {
        reviewedBy: input.reviewedBy, reviewedAt: new Date(), typeOk: input.typeOk, periodOk: input.periodOk, validOk: input.validOk, approvedOk: input.approvedOk,
        signedOk: input.signedOk, contentOk: input.contentOk, review: input.review, note: input.note,
      };
      await tx.evidenceReview.upsert({
        where: key,
        create: { tenantId: scope.companyId, evidenceSubmissionId: submissionId, reviewerRole: input.reviewerRole, ...values },
        update: values,
      });
      const row = await tx.evidenceSubmission.findFirstOrThrow({ where: { id: submissionId }, select: submissionSelect(input.reviewerRole) });
      const submission = toSubmission(row);
      const saved: ReviewSaved = { submission, access, before: previous ? toReviewRecord(previous) : null, after: submission.review! };
      await insertAuditLog(tx, audit(saved));
      if (before) {
        await recordControlStateChanges(tx, {
          tenantId: scope.companyId, serviceId: access.serviceId, before, cause: 'evidence_review',
          actor: { userId: input.reviewedBy, ipAddress: input.meta.ipAddress, userAgent: input.meta.userAgent },
        });
      }
      return saved;
    }, STATE_TRANSACTION);
  }

  controlEvidenceFacts(scope: TenantScope, controlId: string): Promise<ControlEvidenceFacts | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const c = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: {
          id: true, serviceId: true, isActive: true, ownCode: true,
          dimensions: { select: { dimension: true, reasonNotApplicable: true } },
          tests: { select: { testId: true, test: { select: { code: true, displayName: true, displayNameEn: true, dimension: true } } } },
          evidenceRequirements: { select: { sequence: true, validityWithinPeriod: true } },
        },
      });
      if (!c) return null;
      // El período de vigencia que ya usan las demás evidencias del servicio (se copió al clonar el catálogo); si el control aún no tiene ninguna, el de otro del servicio.
      let validity: string | null = c.evidenceRequirements[0]?.validityWithinPeriod ?? null;
      if (!validity) {
        const sibling = await tx.evidenceRequirement.findFirst({ where: { clientControl: { serviceId: c.serviceId } }, select: { validityWithinPeriod: true } });
        validity = sibling?.validityWithinPeriod ?? null;
      }
      const dims = (await loadControlResponsibles(tx, [c.id])).byControl.get(c.id);
      return {
        controlId: c.id, serviceId: c.serviceId, active: c.isActive, ownCode: c.ownCode,
        assignedUserIds: usersOf(dims),
        responsibleByDimension: Object.fromEntries(dims ?? []),
        dimensions: c.dimensions.filter((d) => d.reasonNotApplicable === null).map((d) => d.dimension),
        tests: c.tests.map((t) => ({ id: t.testId, code: t.test.code, displayName: t.test.displayName, displayNameEn: t.test.displayNameEn, dimension: t.test.dimension })),
        validityWithinPeriod: validity,
      };
    });
  }

  createRequirement(scope: TenantScope, controlId: string, input: NewRequirement, audit: Parameters<EvidenceRepository['createRequirement']>[3]): Promise<RequirementRecord | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({ where: { id: controlId }, select: { ownCode: true } });
      if (!control) return null;
      // Dos altas a la vez no pueden quedarse con la misma posición: se bloquea la fila del control mientras se calcula (el índice único (control, código) es la red de seguridad).
      await tx.$queryRaw`select id from tenant.client_controls where id = ${controlId}::uuid for update`;
      const last = await tx.evidenceRequirement.aggregate({ where: { clientControlId: controlId }, _max: { sequence: true } });
      const sequence = (last._max.sequence ?? 0) + 1;
      const row = await tx.evidenceRequirement.create({
        data: {
          tenantId: scope.companyId, clientControlId: controlId, code: `EV-${control.ownCode}-${String(sequence).padStart(2, '0')}`, sequence,
          description: input.description, dimension: input.dimension as Prisma.EvidenceRequirementUncheckedCreateInput['dimension'], testId: input.testId,
          validityWithinPeriod: input.validityWithinPeriod,
        },
        select: requirementSelect('admin_empresa'),
      });
      const created = toRequirement(row);
      await insertAuditLog(tx, audit(created));
      return created;
    });
  }

  findOrCreateTestRequirement(
    scope: TenantScope, controlId: string, testId: string, input: NewRequirement, audit: Parameters<EvidenceRepository['findOrCreateTestRequirement']>[4],
  ): Promise<{ requirementId: string; created: boolean } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({ where: { id: controlId }, select: { ownCode: true } });
      if (!control) return null;
      // Bloquea el control: dos primeras entregas a la vez para la misma prueba terminan en un solo requerimiento.
      await tx.$queryRaw`select id from tenant.client_controls where id = ${controlId}::uuid for update`;
      const existing = await tx.evidenceRequirement.findFirst({ where: { clientControlId: controlId, testId }, orderBy: { sequence: 'asc' }, select: { id: true } });
      if (existing) return { requirementId: existing.id, created: false };
      const last = await tx.evidenceRequirement.aggregate({ where: { clientControlId: controlId }, _max: { sequence: true } });
      const sequence = (last._max.sequence ?? 0) + 1;
      const row = await tx.evidenceRequirement.create({
        data: {
          tenantId: scope.companyId, clientControlId: controlId, code: `EV-${control.ownCode}-${String(sequence).padStart(2, '0')}`, sequence,
          description: input.description, dimension: input.dimension as Prisma.EvidenceRequirementUncheckedCreateInput['dimension'], testId,
          validityWithinPeriod: input.validityWithinPeriod,
        },
        select: requirementSelect('admin_empresa'),
      });
      await insertAuditLog(tx, audit(toRequirement(row)));
      return { requirementId: row.id, created: true };
    });
  }

  private async accessOf(tx: TransactionClient, requirementId: string): Promise<EvidenceAccess | null> {
    const r = await tx.evidenceRequirement.findFirst({
      where: { id: requirementId },
      select: { id: true, dimension: true, clientControl: { select: { id: true, serviceId: true, isActive: true } } },
    });
    if (!r) return null;
    // D98 · Le toca a quienes atienden la dimensión del requerimiento, no a cualquiera que atienda otra dimensión del control.
    const users = (await loadControlResponsibles(tx, [r.clientControl.id])).byControl.get(r.clientControl.id)?.get(r.dimension as never) ?? [];
    return {
      requirementId: r.id, controlId: r.clientControl.id, serviceId: r.clientControl.serviceId, controlActive: r.clientControl.isActive,
      assignedUserIds: users,
    };
  }
}
