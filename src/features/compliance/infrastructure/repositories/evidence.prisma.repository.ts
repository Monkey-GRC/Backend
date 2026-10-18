import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import { DomainError } from '../../../../common/errors/domain-error';
import { Page } from '../../../../common/pagination/page';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService, TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { EvidenceAccess, EvidenceRepository, NewSubmission, RequirementRecord, SubmissionRecord } from '../../domain/repositories/evidence.repository';

const PERSON = { select: { id: true, name: true, lastName: true } } as const;
const SUBMISSION = {
  id: true, evidenceRequirementId: true, version: true, filePath: true, fileType: true, fileSize: true, integrityHash: true, submittedAt: true, aiVerdict: true,
  submittedByUser: PERSON,
} as const;
type SubmissionRow = Prisma.EvidenceSubmissionGetPayload<{ select: typeof SUBMISSION }>;

// `version` es texto en el modelo ("1", "2"…): se ordena y se compara como número.
const versionOf = (v: string): number => Number(v) || 0;
const toSubmission = (r: SubmissionRow): SubmissionRecord => ({
  id: r.id, requirementId: r.evidenceRequirementId, version: versionOf(r.version), fileKey: r.filePath, fileType: r.fileType, fileSize: r.fileSize,
  integrityHash: r.integrityHash, submittedBy: r.submittedByUser, submittedAt: r.submittedAt, aiVerdict: r.aiVerdict,
});
const newestFirst = (a: SubmissionRecord, b: SubmissionRecord) => b.version - a.version;

const REQUIREMENT = {
  id: true, code: true, sequence: true, description: true, dimension: true, validityWithinPeriod: true, sourceRef: true,
  responsible: { select: { id: true, type: true, personName: true } },
  submissions: { select: SUBMISSION },
} as const;

@Injectable()
export class EvidencePrismaRepository extends EvidenceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  listByControl(scope: TenantScope, controlId: string): Promise<{ assignedUserIds: string[]; requirements: RequirementRecord[] } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const control = await tx.clientControl.findFirst({
        where: { id: controlId },
        select: { userControlAssignments: { select: { userId: true } }, evidenceRequirements: { orderBy: { sequence: 'asc' }, select: REQUIREMENT } },
      });
      if (!control) return null;
      return {
        assignedUserIds: control.userControlAssignments.map((a) => a.userId),
        requirements: control.evidenceRequirements.map((r) => ({
          id: r.id, code: r.code, sequence: r.sequence, description: r.description, dimension: r.dimension, validityWithinPeriod: r.validityWithinPeriod,
          origin: r.sourceRef ? ('catalog' as const) : ('own' as const),
          responsible: r.responsible ? { id: r.responsible.id, type: r.responsible.type, personName: r.responsible.personName } : null,
          submissions: r.submissions.map(toSubmission).sort(newestFirst),
        })),
      };
    });
  }

  findRequirement(scope: TenantScope, requirementId: string): Promise<EvidenceAccess | null> {
    return this.prisma.withScope(scope, (tx) => this.accessOf(tx, requirementId));
  }

  listSubmissions(scope: TenantScope, requirementId: string, page: number, pageSize: number): Promise<Page<SubmissionRecord> | null> {
    return this.prisma.withScope(scope, async (tx) => {
      if (!(await this.accessOf(tx, requirementId))) return null;
      const where = { evidenceRequirementId: requirementId };
      const total = await tx.evidenceSubmission.count({ where });
      // La versión es texto: se trae el requerimiento completo (un puñado de filas) y se pagina en memoria, para ordenar como número.
      const rows = await tx.evidenceSubmission.findMany({ where, select: SUBMISSION });
      const items = rows.map(toSubmission).sort(newestFirst).slice((page - 1) * pageSize, page * pageSize);
      return { items, total, page, pageSize };
    });
  }

  async createSubmission(scope: TenantScope, requirementId: string, input: NewSubmission, audit: Parameters<EvidenceRepository['createSubmission']>[3]): Promise<SubmissionRecord | null> {
    try {
      return await this.prisma.withScope(scope, async (tx) => {
        if (!(await this.accessOf(tx, requirementId))) return null;
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
          select: SUBMISSION,
        });
        const created = toSubmission(row);
        await insertAuditLog(tx, audit(created));
        return created;
      });
    } catch (e) {
      // Nunca debería pasar con el bloqueo de arriba; si pasa, es una carrera real y se pide reintentar en vez de pisar.
      if ((e as { code?: string })?.code === 'P2002') throw new DomainError('EVIDENCE_VERSION_CONFLICT');
      throw e;
    }
  }

  findSubmission(scope: TenantScope, submissionId: string): Promise<{ submission: SubmissionRecord; access: EvidenceAccess } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const row = await tx.evidenceSubmission.findFirst({ where: { id: submissionId }, select: SUBMISSION });
      if (!row) return null;
      const access = await this.accessOf(tx, row.evidenceRequirementId);
      return access ? { submission: toSubmission(row), access } : null;
    });
  }

  private async accessOf(tx: TransactionClient, requirementId: string): Promise<EvidenceAccess | null> {
    const r = await tx.evidenceRequirement.findFirst({
      where: { id: requirementId },
      select: { id: true, clientControl: { select: { id: true, serviceId: true, isActive: true, userControlAssignments: { select: { userId: true } } } } },
    });
    if (!r) return null;
    return {
      requirementId: r.id, controlId: r.clientControl.id, serviceId: r.clientControl.serviceId, controlActive: r.clientControl.isActive,
      assignedUserIds: r.clientControl.userControlAssignments.map((a) => a.userId),
    };
  }
}
