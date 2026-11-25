import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { NotificationEmitter } from '../../../../common/notifications/notification-emitter';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import {
  ControlEvidenceFacts, EvidenceAccess, EvidenceRepository, NewRequirement, NewReview, NewSubmission, RequirementRecord, ReviewSaved, ServiceEvidence, SubmissionRecord, TestEvidence,
} from '../../domain/evidence/evidence.repository';
import { loadControlAccess } from '../shared/control-access.loader';
import { ControlAccess, NO_ACCESS } from '../../domain/controls/control-access';
import { evidenceStateOf } from '../../domain/evidence/evidence';
import { captureControlStates, recordControlStateChanges } from '../shared/control-state-events';
import { ALL_REVIEWS, REVIEW_SELECT, toReviewRecord, versionOf } from './evidence-review.mapper';

// Subir o revisar una evidencia relee el servicio entero (captura el estado de sus controles antes y después, D91) dentro de la misma transacción: con la base lejos
// (desarrollo contra una base remota) los 5 s por defecto de Prisma no alcanzan y la subida responde 500 (P2028).
const STATE_TRANSACTION = { timeoutMs: 30_000 };

const PERSON ={ select: { id: true, name: true, lastName: true } } as const;
// Todas las revisiones de la entrega, la de cada rol (D102): ya no se esconde la de un rol al otro (SEG-61 se retiró, D96).
const submissionSelect = () =>
  ({
    id: true, evidenceRequirementId: true, version: true, filePath: true, fileType: true, fileSize: true, integrityHash: true, submittedAt: true, aiVerdict: true,
    submittedByUser: PERSON,
    reviews: ALL_REVIEWS,
  }) as const;
type SubmissionRow = Prisma.EvidenceSubmissionGetPayload<{ select: ReturnType<typeof submissionSelect> }>;

const toSubmission = (r: SubmissionRow): SubmissionRecord => ({
  id: r.id, requirementId: r.evidenceRequirementId, version: versionOf(r.version), fileKey: r.filePath, fileType: r.fileType, fileSize: r.fileSize,
  integrityHash: r.integrityHash, submittedBy: r.submittedByUser, submittedAt: r.submittedAt, aiVerdict: r.aiVerdict,
  reviews: r.reviews.map(toReviewRecord),
});
const newestFirst = (a: SubmissionRecord, b: SubmissionRecord) => b.version - a.version;

const requirementSelect = () =>
  ({
    id: true, code: true, sequence: true, description: true, dimension: true, validityWithinPeriod: true, sourceRef: true,
    test: { select: { id: true, code: true, displayName: true, displayNameEn: true } },
    responsible: { select: { id: true, type: true, personName: true } },
    submissions: { select: submissionSelect() },
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
  constructor(private readonly prisma: PrismaService, private readonly evaluationParameters: EvaluationParametersPort, private readonly notifications: NotificationEmitter) {
    super();
  }

  listByControl(scope: TenantScope, controlId: string): Promise<{ access: ControlAccess; requirements: RequirementRecord[] } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: { serviceId: true, evidenceRequirements: { orderBy: { sequence: 'asc' }, select: requirementSelect() } },
      });
      if (!control) return null;
      const access = (await loadControlAccess(tx, [controlId])).get(controlId) ?? NO_ACCESS;
      return { access, requirements: control.evidenceRequirements.map(toRequirement) };
    });
  }

  listByService(scope: TenantScope, serviceId: string): Promise<ServiceEvidence | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, organization: { companyId: scope.companyId } }, select: { id: true } });
      if (!service) return null;
      const rows = await tx.clientControl.findMany({ where: { serviceId, isActive: true }, select: { id: true, ownCode: true } });
      const ids = rows.map((r) => r.id);
      const accessOf = await loadControlAccess(tx, ids);
      const requirements = ids.length
        ? await tx.evidenceRequirement.findMany({ where: { clientControlId: { in: ids } }, orderBy: [{ sequence: 'asc' }], select: { ...requirementSelect(), clientControlId: true } })
        : [];
      return {
        controls: rows.map((r) => ({ id: r.id, ownCode: r.ownCode, access: accessOf.get(r.id) ?? NO_ACCESS })),
        items: requirements.map((r) => ({ controlId: r.clientControlId, requirement: toRequirement(r) })),
      };
    });
  }

  listByTest(scope: TenantScope, controlId: string, testId: string): Promise<TestEvidence | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const origin = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: {
          id: true, serviceId: true, ownCode: true, control: { select: { code: true } }, dimensions: { select: { dimension: true, reasonNotApplicable: true } },
          tests: { where: { testId }, select: { test: { select: { dimension: true, primarySource: true, integrationCategory: { select: { name: true } } } } } },
        },
      });
      const found = origin?.tests[0]?.test;
      if (!origin || !found) return null;
      const dimension = found.dimension;
      // Qué pruebas tienen evidencia que mostrar lo decide el caso de uso con la regla única (`evidenceAcceptanceOf`): aquí solo se traen sus hechos.
      const test = {
        primarySource: found.primarySource, integrationCategory: found.integrationCategory?.name ?? null,
        dimensionApplies: origin.dimensions.some((d) => d.dimension === dimension && d.reasonNotApplicable === null),
      };

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
        select: { ...requirementSelect(), clientControlId: true },
      });
      const accessOf = await loadControlAccess(tx, ids);
      return {
        testId, dimension, serviceId: origin.serviceId, test,
        controls: controls.map((c) => ({ id: c.id, code: c.code, access: accessOf.get(c.id) ?? NO_ACCESS })),
        items: rows
          .map((r) => ({ controlId: r.clientControlId, requirement: toRequirement(r) }))
          .sort((a, b) => ids.indexOf(a.controlId) - ids.indexOf(b.controlId) || a.requirement.sequence - b.requirement.sequence),
      };
    });
  }

  findRequirement(scope: TenantScope, requirementId: string): Promise<EvidenceAccess | null> {
    return this.prisma.withScope(scope, (tx) => this.accessOf(tx, requirementId));
  }

  listSubmissions(scope: TenantScope, requirementId: string, page: number, pageSize: number): Promise<Page<SubmissionRecord>> {
    return this.prisma.withScope(scope, async (tx) => {
      const where = { evidenceRequirementId: requirementId };
      const total = await tx.evidenceSubmission.count({ where });
      // La versión es texto: se trae el requerimiento completo (un puñado de filas) y se pagina en memoria, para ordenar como número.
      const rows = await tx.evidenceSubmission.findMany({ where, select: submissionSelect() });
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
        const parameters = await this.evaluationParameters.load(tx);
        const before = await captureControlStates(tx, access.serviceId, parameters);
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
          select: submissionSelect(),
        });
        const created = toSubmission(row);
        await insertAuditLog(tx, audit(created));
        await recordControlStateChanges(tx, { parameters,
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

  findSubmission(scope: TenantScope, submissionId: string): Promise<{ submission: SubmissionRecord; access: EvidenceAccess } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.evidenceSubmission.findFirst({ where: { id: submissionId }, select: submissionSelect() });
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
      // D91 · La revisión de un rol mueve el estado de las pruebas (D96) y deja el evento de cada control que cambie.
      const parameters = await this.evaluationParameters.load(tx);
      const before = await captureControlStates(tx, access.serviceId, parameters);
      const key = { evidenceSubmissionId_reviewerRole: { evidenceSubmissionId: submissionId, reviewerRole: input.reviewerRole } };
      const previous = await tx.evidenceReview.findUnique({ where: key, select: REVIEW_SELECT });
      const values = {
        reviewedBy: input.reviewedBy, reviewedAt: new Date(), typeOk: input.typeOk, periodOk: input.periodOk, validOk: input.validOk, approvedOk: input.approvedOk,
        signedOk: input.signedOk, contentOk: input.contentOk, review: input.review, note: input.note,
      };
      await tx.evidenceReview.upsert({
        where: key,
        create: { tenantId: scope.companyId, evidenceSubmissionId: submissionId, reviewerRole: input.reviewerRole, ...values },
        update: values,
      });
      const row = await tx.evidenceSubmission.findFirstOrThrow({ where: { id: submissionId }, select: submissionSelect() });
      const submission = toSubmission(row);
      const saved: ReviewSaved = { submission, access, before: previous ? toReviewRecord(previous) : null, after: submission.reviews.find((r) => r.reviewerRole === input.reviewerRole)! };
      await insertAuditLog(tx, audit(saved));
      // MD-515 · D151 · Validar o rechazar avisa a quien subió la entrega y al dueño del control (no a quien revisó), en esta misma transacción.
      const decided = evidenceStateOf({ aiVerdict: null, reviews: [saved.after] });
      const type = decided === 'compliant' ? 'evidence_approved' : decided === 'non_compliant' || decided === 'expired' ? 'evidence_rejected' : null;
      if (type) {
        await this.notifications.emitForControls(tx, scope.companyId, [
          { type, controlId: access.controlId, uploaderId: submission.submittedBy.id, actorId: input.reviewedBy, dedupeSuffix: `${submissionId}:${input.reviewerRole}:${saved.after.reviewedAt.getTime()}` },
        ]);
      }
      if (before) {
        await recordControlStateChanges(tx, { parameters,
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
          tests: { select: { testId: true, test: { select: { code: true, displayName: true, displayNameEn: true, dimension: true, primarySource: true, integrationCategory: { select: { name: true } } } } } },
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
      const access = (await loadControlAccess(tx, [c.id])).get(c.id) ?? NO_ACCESS;
      return {
        controlId: c.id, serviceId: c.serviceId, active: c.isActive, ownCode: c.ownCode,
        access,
        dimensions: c.dimensions.filter((d) => d.reasonNotApplicable === null).map((d) => d.dimension),
        tests: c.tests.map((t) => ({ id: t.testId, code: t.test.code, displayName: t.test.displayName, displayNameEn: t.test.displayNameEn, dimension: t.test.dimension, primarySource: t.test.primarySource, integrationCategory: t.test.integrationCategory?.name ?? null })),
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
        select: requirementSelect(),
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
        select: requirementSelect(),
      });
      await insertAuditLog(tx, audit(toRequirement(row)));
      return { requirementId: row.id, created: true };
    });
  }

  private async accessOf(tx: TransactionClient, requirementId: string): Promise<EvidenceAccess | null> {
    const r = await tx.evidenceRequirement.findFirst({
      where: { id: requirementId },
      select: { id: true, clientControl: { select: { id: true, serviceId: true, isActive: true } } },
    });
    if (!r) return null;
    const access = (await loadControlAccess(tx, [r.clientControl.id])).get(r.clientControl.id) ?? NO_ACCESS;
    return { requirementId: r.id, controlId: r.clientControl.id, serviceId: r.clientControl.serviceId, controlActive: r.clientControl.isActive, access };
  }
}
