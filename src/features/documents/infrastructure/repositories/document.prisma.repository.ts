import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../../generated/prisma/client';
import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import { DomainError } from '../../../../common/errors/domain-error';
import { EvaluationParametersPort } from '../../../../common/evaluation-parameters/parameters';
import type { Page } from '../../../../common/pagination/page';
import type { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { insertAuditLog } from '../../../../infrastructure/audit/audit-log.insert';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { dueAtOf, isEligibleAssignee } from '../../domain/document-rules';
import type { Acceptance, DocumentDetail, DocumentListItem, DocumentVersionStatus, MyDocument, VersionDetail, VersionFile } from '../../domain/document.types';
import {
  AssignmentChange, AssignResult, DocumentFilters, DocumentRepository, MyDocumentFilters, NewVersion, PublishedVersion,
} from '../../domain/repositories/document.repository';
import { approversOf, findDocumentDetail, listDocuments, listMyDocuments, utc } from './document-read.queries';

const VERSION_SELECT = {
  id: true, number: true, status: true, approvedAt: true, isImportedApproval: true, approvers: true, approvalNote: true, fileName: true, fileType: true, fileSize: true, integrityHash: true, createdAt: true,
  createdByUser: { select: { id: true, name: true, lastName: true } },
} as const;
type VersionRow = Prisma.DocumentVersionGetPayload<{ select: typeof VERSION_SELECT }>;

const toVersion = (v: VersionRow): VersionDetail => ({
  id: v.id, number: v.number, status: v.status as DocumentVersionStatus, approvedAt: v.approvedAt, isImportedApproval: v.isImportedApproval, approvers: approversOf(v.approvers), approvalNote: v.approvalNote,
  fileName: v.fileName, fileType: v.fileType, fileSize: v.fileSize, integrityHash: v.integrityHash, createdBy: v.createdByUser, createdAt: v.createdAt,
});

@Injectable()
export class DocumentPrismaRepository extends DocumentRepository {
  constructor(private readonly prisma: PrismaService, private readonly parameters: EvaluationParametersPort) {
    super();
  }

  list(scope: TenantScope, filters: DocumentFilters, now: Date): Promise<Page<DocumentListItem>> {
    return this.prisma.withScope(scope, (tx) => listDocuments(tx, filters, now));
  }

  findDetail(scope: TenantScope, documentId: string, now: Date): Promise<DocumentDetail | null> {
    return this.prisma.withScope(scope, (tx) => findDocumentDetail(tx, documentId, now));
  }

  findOrigin(scope: TenantScope, documentId: string): Promise<{ origin: 'internal' | 'external' } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const found = await tx.companyDocument.findFirst({ where: { id: documentId }, select: { origin: true } });
      return found ? { origin: found.origin } : null;
    });
  }

  publishVersion(scope: TenantScope, documentId: string, input: NewVersion, audit: AuditIntent<PublishedVersion>): Promise<PublishedVersion | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // El documento se bloquea: dos publicaciones simultáneas se turnan y cada una ve el número y la versión vigente de la anterior.
      const [doc] = await tx.$queryRaw<Array<{ origin: string }>>(Prisma.sql`SELECT origin::text AS origin FROM tenant.company_documents WHERE id = ${documentId}::uuid FOR UPDATE`);
      if (!doc) return null;
      if (doc.origin === 'external') throw new DomainError('DOCUMENT_EXTERNAL');

      const current = await tx.documentVersion.findFirst({ where: { companyDocumentId: documentId, status: 'current' }, select: { id: true } });
      const last = await tx.documentVersion.aggregate({ where: { companyDocumentId: documentId }, _max: { number: true } });
      // La vigente se archiva ANTES de insertar la nueva (índice único de una sola versión vigente); la versión archivada nunca se borra.
      if (current) await tx.documentVersion.update({ where: { id: current.id }, data: { status: 'archived' } });
      const created = await tx.documentVersion.create({
        data: {
          id: input.id, tenantId: scope.companyId, companyDocumentId: documentId, number: (last._max.number ?? 0) + 1, status: 'current', filePath: input.fileKey, fileName: input.fileName, fileType: input.fileType,
          fileSize: input.fileSize, integrityHash: input.integrityHash, isImportedApproval: true, approvers: input.approvers.map((a) => ({ name: a.name, role_label: a.roleLabel })), approvedAt: input.approvedAt,
          approvalNote: input.note, createdBy: input.createdBy,
        },
        select: VERSION_SELECT,
      });
      const result: PublishedVersion = { version: toVersion(created), archivedVersionId: current?.id ?? null };
      await insertAuditLog(tx, audit(result));
      return result;
    });
  }

  assign(scope: TenantScope, documentId: string, userIds: string[], assignedBy: string, now: Date, audit: AuditIntent<AssignResult>): Promise<AssignResult | null> {
    return this.prisma.withScope(scope, async (tx) => {
      // KEY SHARE: una publicación nueva (FOR UPDATE) espera a que esta asignación termine, y viceversa.
      const [doc] = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`SELECT id FROM tenant.company_documents WHERE id = ${documentId}::uuid FOR KEY SHARE`);
      if (!doc) return null;
      const published = await tx.documentVersion.findFirst({ where: { companyDocumentId: documentId, status: 'current' }, select: { id: true } });
      if (!published) throw new DomainError('DOCUMENT_NOT_PUBLISHED');

      // Las filas de las personas se bloquean (KEY SHARE, por id): quien se desactiva a la vez (FOR UPDATE) espera, y aquí se relee su estado ya bloqueada. Con RLS, una persona de otra empresa no existe.
      const people = await tx.$queryRaw<Array<{ id: string; role: string; status: string }>>(
        Prisma.sql`SELECT id, role::text AS role, status::text AS status FROM platform.users WHERE id = ANY(${[...userIds].sort()}::uuid[]) ORDER BY id FOR KEY SHARE`,
      );
      if (people.length !== new Set(userIds).size) throw new DomainError('NOT_FOUND');
      const rejected = people.filter((p) => !isEligibleAssignee(p)).map((p) => p.id);
      if (rejected.length > 0) throw new DomainError('ASSIGNEE_NOT_ELIGIBLE', { user_ids: rejected });

      const dueAt = dueAtOf(now, (await this.parameters.load(tx)).documentAcceptanceDays);
      // Nuevas (el único `(documento, persona)` descarta las que ya están, también ante una carrera) y reactivadas (estaban revocadas: plazo nuevo, desde ahora).
      const inserted = await tx.$queryRaw<Array<{ user_id: string }>>(Prisma.sql`
        INSERT INTO tenant.document_assignments (id, tenant_id, company_document_id, user_id, assigned_by, assigned_at, due_at)
        SELECT gen_random_uuid(), ${scope.companyId}::uuid, ${documentId}::uuid, u, ${assignedBy}::uuid, ${utc(now)}, ${utc(dueAt)} FROM unnest(${userIds}::uuid[]) AS u
        ON CONFLICT (company_document_id, user_id) DO NOTHING
        RETURNING user_id`);
      const reactivated = await tx.$queryRaw<Array<{ user_id: string }>>(Prisma.sql`
        UPDATE tenant.document_assignments SET revoked_at = NULL, assigned_by = ${assignedBy}::uuid, assigned_at = ${utc(now)}, due_at = ${utc(dueAt)}
         WHERE company_document_id = ${documentId}::uuid AND user_id = ANY(${userIds}::uuid[]) AND revoked_at IS NOT NULL
        RETURNING user_id`);
      const addedIds = new Set([...inserted, ...reactivated].map((r) => r.user_id));
      const added: AssignmentChange[] = userIds.filter((id) => addedIds.has(id)).map((userId) => ({ userId, dueAt }));
      const result: AssignResult = { added, documentId };
      if (added.length > 0) await insertAuditLog(tx, audit(result));
      return result;
    });
  }

  unassign(scope: TenantScope, documentId: string, userId: string, now: Date, audit: AuditIntent<{ documentId: string; userId: string }>): Promise<boolean> {
    return this.prisma.withScope(scope, async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        UPDATE tenant.document_assignments SET revoked_at = ${utc(now)}
         WHERE company_document_id = ${documentId}::uuid AND user_id = ${userId}::uuid AND revoked_at IS NULL
        RETURNING id`);
      if (rows.length === 0) return false;
      await insertAuditLog(tx, audit({ documentId, userId }));
      return true;
    });
  }

  listMine(scope: TenantScope, userId: string, filters: MyDocumentFilters, now: Date): Promise<Page<MyDocument>> {
    return this.prisma.withScope(scope, (tx) => listMyDocuments(tx, userId, filters, now));
  }

  readVersionFile<T>(scope: TenantScope, documentId: string, versionId: string, userId: string, resolve: (found: VersionFile) => Promise<T>, audit: AuditIntent<VersionFile>): Promise<{ found: VersionFile; value: T } | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const version = await tx.documentVersion.findFirst({ where: { id: versionId, companyDocumentId: documentId }, select: { id: true, filePath: true, fileName: true, fileType: true, status: true } });
      if (!version) return null;
      const assignment = await tx.documentAssignment.findFirst({ where: { companyDocumentId: documentId, userId, revokedAt: null }, select: { id: true } });
      const accepted = await tx.documentAcceptanceRecord.findFirst({ where: { documentVersionId: versionId, userId }, select: { id: true } });
      const found: VersionFile = {
        version: { id: version.id, fileKey: version.filePath, fileName: version.fileName, fileType: version.fileType, isCurrent: version.status === 'current' },
        assigned: !!assignment, acceptedByMe: !!accepted,
      };
      const value = await resolve(found);
      await insertAuditLog(tx, audit(found));
      return { found, value };
    });
  }

  accept(scope: TenantScope, input: { documentId: string; versionId: string; userId: string; now: Date }, audit: AuditIntent<Acceptance & { wasOverdue: boolean }>): Promise<(Acceptance & { wasOverdue: boolean }) | null> {
    return this.prisma.withScope(scope, async (tx) => {
      const doc = await tx.companyDocument.findFirst({ where: { id: input.documentId }, select: { acceptance: true } });
      if (!doc) return null;
      // La asignación de la persona se bloquea: dos aceptaciones simultáneas de la misma persona se turnan (y el índice único es el respaldo). Quitada (`revoked_at`) es como no estar asignado.
      const [assignment] = await tx.$queryRaw<Array<{ overdue: boolean }>>(Prisma.sql`
        SELECT (due_at < ${utc(input.now)}) AS overdue FROM tenant.document_assignments
         WHERE company_document_id = ${input.documentId}::uuid AND user_id = ${input.userId}::uuid AND revoked_at IS NULL FOR UPDATE`);
      // La versión se bloquea con FOR SHARE: una publicación que la archiva (UPDATE) espera a que esta aceptación termine, y la lee ya con su estado final.
      const [version] = await tx.$queryRaw<Array<{ id: string; number: number; status: string; integrity_hash: string }>>(Prisma.sql`
        SELECT id, number, status::text AS status, integrity_hash FROM tenant.document_versions WHERE id = ${input.versionId}::uuid AND company_document_id = ${input.documentId}::uuid FOR SHARE`);
      if (!version) return null;
      if (!assignment) throw new DomainError('FORBIDDEN');
      if (doc.acceptance === 'not_required') throw new DomainError('DOCUMENT_ACCEPTANCE_NOT_REQUIRED');
      if (version.status !== 'current') throw new DomainError('DOCUMENT_VERSION_NOT_CURRENT');
      const already = await tx.documentAcceptanceRecord.findFirst({ where: { documentVersionId: version.id, userId: input.userId }, select: { id: true } });
      if (already) throw new DomainError('DOCUMENT_ALREADY_ACCEPTED');

      let created: { id: string; acceptedAt: Date };
      try {
        created = await tx.documentAcceptanceRecord.create({
          data: { tenantId: scope.companyId, documentVersionId: version.id, userId: input.userId, integrityHash: version.integrity_hash, wasOverdue: assignment.overdue },
          select: { id: true, acceptedAt: true },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new DomainError('DOCUMENT_ALREADY_ACCEPTED');
        throw error;
      }
      const result = { id: created.id, documentId: input.documentId, versionId: version.id, versionNumber: version.number, acceptedAt: created.acceptedAt, integrityHash: version.integrity_hash, wasOverdue: assignment.overdue };
      await insertAuditLog(tx, audit(result));
      return result;
    });
  }
}
