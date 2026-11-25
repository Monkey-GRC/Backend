import { Prisma } from '../../../../../generated/prisma/client';
import type { Page } from '../../../../common/pagination/page';
import type { TransactionClient } from '../../../../infrastructure/database/prisma.service';
import { assignmentStatus, emptyCounts, MY_STATUS_ORDER } from '../../domain/document-rules';
import type {
  Approver, Assignee, AssignmentCounts, DocumentAcceptance, DocumentDetail, DocumentListItem, DocumentOrigin, DocumentType, DocumentVersionStatus, MyDocument, MyDocumentStatus, VersionSummary,
} from '../../domain/document.types';
import type { DocumentFilters, MyDocumentFilters } from '../../domain/repositories/document.repository';

// Las lecturas de Documentos (listar, detalle, «Mis documentos»): una consulta por paso, nunca una por documento. Todo corre dentro de `withScope` (RLS por empresa).

// Las columnas `timestamp` de Prisma son UTC sin zona: el instante de comparación se manda como texto con zona y se lleva al reloj UTC, sin depender de la zona de la sesión.
export const utc = (instant: Date): Prisma.Sql => Prisma.sql`(${instant.toISOString()}::timestamptz AT TIME ZONE 'UTC')`;

// Sin la extensión `unaccent`: se pliegan a mano los acentos del español (código y nombre del catálogo).
const FOLD_FROM = 'áàäâéèëêíìïîóòöôúùüûñÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑ';
const FOLD_TO = 'aaaaeeeeiiiioooouuuunaaaaeeeeiiiioooouuuun';
const fold = (column: string): Prisma.Sql => Prisma.sql`translate(lower(${Prisma.raw(column)}), ${FOLD_FROM}, ${FOLD_TO})`;
const foldText = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const escapeLike = (text: string): string => text.replace(/[\\%_]/g, (c) => `\\${c}`);

// ─── Listar ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const where = (f: DocumentFilters): Prisma.Sql => {
  const parts: Prisma.Sql[] = [];
  if (f.type) parts.push(Prisma.sql`d.type = ${f.type}::catalog.document_type`);
  if (f.hasCurrentVersion !== undefined) parts.push(f.hasCurrentVersion ? Prisma.sql`v.id IS NOT NULL` : Prisma.sql`v.id IS NULL`);
  if (f.q) {
    const like = `%${escapeLike(foldText(f.q))}%`;
    parts.push(Prisma.sql`(${fold('d.code')} LIKE ${like} ESCAPE '\\' OR ${fold('d.name')} LIKE ${like} ESCAPE '\\')`);
  }
  return parts.length ? Prisma.sql`WHERE ${Prisma.join(parts, ' AND ')}` : Prisma.empty;
};

const orderBy = (sort: DocumentFilters['sort']): Prisma.Sql =>
  sort === 'name' ? Prisma.sql`ORDER BY d.name ASC, cd.id` : sort === '-updated_at' ? Prisma.sql`ORDER BY COALESCE(v.created_at, cd.created_at) DESC, cd.id` : Prisma.sql`ORDER BY d.code ASC, cd.id`;

const FROM = Prisma.sql`FROM tenant.company_documents cd
  JOIN catalog.documents d ON d.id = cd.document_id
  LEFT JOIN tenant.document_versions v ON v.company_document_id = cd.id AND v.status = 'current'`;

const LIST_SELECT = {
  id: true, origin: true, acceptance: true,
  document: { select: { code: true, name: true, type: true } },
  versions: { where: { status: 'current' as const }, select: { id: true, number: true, approvedAt: true, isImportedApproval: true, fileName: true, fileType: true } },
} as const;

const toSummary = (v: { id: string; number: number; approvedAt: Date; isImportedApproval: boolean; fileName: string; fileType: string }): VersionSummary => ({
  id: v.id, number: v.number, approvedAt: v.approvedAt, isImportedApproval: v.isImportedApproval, fileName: v.fileName, fileType: v.fileType,
});

type CountRow = { id: string; total: number; accepted: number; pending: number; overdue: number };

// Las asignaciones vigentes de cada documento de la página, contadas en una sola consulta: aceptó la versión vigente, o está dentro de plazo, o ya lo pasó.
async function countsOf(tx: TransactionClient, ids: string[], now: Date): Promise<Map<string, AssignmentCounts>> {
  const rows = await tx.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT a.company_document_id AS id,
           count(*)::int AS total,
           count(*) FILTER (WHERE acc.id IS NOT NULL)::int AS accepted,
           count(*) FILTER (WHERE acc.id IS NULL AND v.id IS NOT NULL AND cd.acceptance <> 'not_required' AND a.due_at >= ${utc(now)})::int AS pending,
           count(*) FILTER (WHERE acc.id IS NULL AND v.id IS NOT NULL AND cd.acceptance <> 'not_required' AND a.due_at < ${utc(now)})::int AS overdue
      FROM tenant.document_assignments a
      JOIN tenant.company_documents cd ON cd.id = a.company_document_id
      LEFT JOIN tenant.document_versions v ON v.company_document_id = a.company_document_id AND v.status = 'current'
      LEFT JOIN tenant.document_acceptances acc ON acc.document_version_id = v.id AND acc.user_id = a.user_id
     WHERE a.company_document_id = ANY(${ids}::uuid[]) AND a.revoked_at IS NULL
     GROUP BY a.company_document_id`);
  return new Map(rows.map((r) => [r.id, { total: r.total, accepted: r.accepted, pending: r.pending, overdue: r.overdue }]));
}

export async function listDocuments(tx: TransactionClient, f: DocumentFilters, now: Date): Promise<Page<DocumentListItem>> {
  const [{ total }] = await tx.$queryRaw<Array<{ total: number }>>(Prisma.sql`SELECT count(*)::int AS total ${FROM} ${where(f)}`);
  if (total === 0) return { items: [], total, page: f.page, pageSize: f.pageSize };
  const ids = (await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`SELECT cd.id ${FROM} ${where(f)} ${orderBy(f.sort)} LIMIT ${f.pageSize} OFFSET ${(f.page - 1) * f.pageSize}`)).map((r) => r.id);
  if (ids.length === 0) return { items: [], total, page: f.page, pageSize: f.pageSize };
  const rows = await tx.companyDocument.findMany({ where: { id: { in: ids } }, select: LIST_SELECT });
  const counts = await countsOf(tx, ids, now);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const items = ids.flatMap((id) => {
    const r = byId.get(id);
    return r?.document ? [toItem({ id: r.id, origin: r.origin, acceptance: r.acceptance, document: r.document }, r.versions[0] ? toSummary(r.versions[0]) : null, counts.get(id) ?? emptyCounts())] : [];
  });
  return { items, total, page: f.page, pageSize: f.pageSize };
}

type ItemBase = { id: string; origin: string; acceptance: string; document: { code: string; name: string; type: string } };
const toItem = (r: ItemBase, currentVersion: VersionSummary | null, assignments: AssignmentCounts): DocumentListItem => ({
  id: r.id, code: r.document.code, name: r.document.name, type: r.document.type as DocumentType, origin: r.origin as DocumentOrigin, acceptance: r.acceptance as DocumentAcceptance, currentVersion, assignments,
});

// ─── Detalle ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const PERSON = { select: { id: true, name: true, lastName: true } } as const;

export async function findDocumentDetail(tx: TransactionClient, id: string, now: Date): Promise<DocumentDetail | null> {
  const doc = await tx.companyDocument.findFirst({
    where: { id },
    select: {
      id: true, origin: true, acceptance: true,
      document: { select: { code: true, name: true, type: true, description: true, minimumContent: true } },
      versions: {
        orderBy: { number: 'desc' },
        select: { id: true, number: true, status: true, approvedAt: true, isImportedApproval: true, approvers: true, approvalNote: true, fileName: true, fileType: true, fileSize: true, integrityHash: true, createdAt: true, createdByUser: PERSON },
      },
      assignments: { where: { revokedAt: null }, select: { assignedAt: true, dueAt: true, user: { select: { id: true, name: true, lastName: true, role: true } } } },
    },
  });
  if (!doc?.document) return null;
  const acceptances = await tx.documentAcceptanceRecord.findMany({ where: { version: { companyDocumentId: id } }, select: { userId: true, documentVersionId: true, acceptedAt: true, version: { select: { number: true } } } });

  const current = doc.versions.find((v) => v.status === 'current') ?? null;
  const assignees: Assignee[] = doc.assignments
    .map((a) => {
      const mine = acceptances.filter((x) => x.userId === a.user.id);
      const latest = mine.reduce<(typeof mine)[number] | null>((best, x) => (!best || x.version.number > best.version.number ? x : best), null);
      const accepted = !!current && mine.some((x) => x.documentVersionId === current.id);
      return {
        user: { id: a.user.id, name: a.user.name, lastName: a.user.lastName, role: a.user.role },
        assignedAt: a.assignedAt, dueAt: a.dueAt,
        // Sin versión vigente no hay nada que aceptar: el estado solo cuenta con ella.
        status: assignmentStatus({ requiresAcceptance: doc.acceptance !== 'not_required', accepted, dueAt: a.dueAt, now }),
        acceptedVersionNumber: latest?.version.number ?? null, acceptedAt: latest?.acceptedAt ?? null,
      };
    })
    .sort((a, b) => `${a.user.lastName ?? ''} ${a.user.name ?? ''}`.localeCompare(`${b.user.lastName ?? ''} ${b.user.name ?? ''}`, 'es') || a.user.id.localeCompare(b.user.id));

  const counts: AssignmentCounts = { total: assignees.length, accepted: 0, pending: 0, overdue: 0 };
  if (current) for (const a of assignees) if (a.status) counts[a.status] += 1;

  return {
    ...toItem({ id: doc.id, origin: doc.origin, acceptance: doc.acceptance, document: doc.document }, current ? toSummary(current) : null, counts),
    description: doc.document.description, minimumContent: doc.document.minimumContent,
    versions: doc.versions.map((v) => ({
      id: v.id, number: v.number, status: v.status as DocumentVersionStatus, approvedAt: v.approvedAt, isImportedApproval: v.isImportedApproval, approvers: approversOf(v.approvers), approvalNote: v.approvalNote,
      fileName: v.fileName, fileType: v.fileType, fileSize: v.fileSize, integrityHash: v.integrityHash, createdBy: v.createdByUser, createdAt: v.createdAt,
    })),
    assignees,
  };
}

export function approversOf(json: unknown): Approver[] {
  if (!Array.isArray(json)) return [];
  return json.map((a) => ({ name: String((a as { name?: unknown }).name ?? ''), roleLabel: String((a as { role_label?: unknown }).role_label ?? '') }));
}

// ─── Mis documentos ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

type MineRow = {
  doc_id: string; code: string; name: string; type: string; acceptance: string; version_id: string; number: number; approved_at: Date; assigned_at: Date; due_at: Date; accepted_at: Date | null; status: MyDocumentStatus | null;
};

export async function listMyDocuments(tx: TransactionClient, userId: string, f: MyDocumentFilters, now: Date): Promise<Page<MyDocument>> {
  // Cada asignación vigente de la persona con la versión vigente del documento y, si la hay, su aceptación; el estado se deriva aquí (nunca se guarda).
  const mine = Prisma.sql`
    SELECT cd.id AS doc_id, d.code, d.name, d.type::text AS type, cd.acceptance::text AS acceptance, v.id AS version_id, v.number, v.approved_at, a.assigned_at, a.due_at, acc.accepted_at,
           CASE WHEN cd.acceptance = 'not_required' THEN NULL WHEN acc.id IS NOT NULL THEN 'accepted' WHEN a.due_at < ${utc(now)} THEN 'overdue' ELSE 'pending' END AS status
      FROM tenant.document_assignments a
      JOIN tenant.company_documents cd ON cd.id = a.company_document_id
      JOIN catalog.documents d ON d.id = cd.document_id
      JOIN tenant.document_versions v ON v.company_document_id = cd.id AND v.status = 'current'
      LEFT JOIN tenant.document_acceptances acc ON acc.document_version_id = v.id AND acc.user_id = a.user_id
     WHERE a.user_id = ${userId}::uuid AND a.revoked_at IS NULL`;
  const filter = f.status ? Prisma.sql`WHERE status = ${f.status}` : Prisma.empty;
  const [{ total }] = await tx.$queryRaw<Array<{ total: number }>>(Prisma.sql`SELECT count(*)::int AS total FROM (${mine}) m ${filter}`);
  if (total === 0) return { items: [], total, page: f.page, pageSize: f.pageSize };
  const rows = await tx.$queryRaw<MineRow[]>(Prisma.sql`
    SELECT * FROM (${mine}) m ${filter}
     ORDER BY CASE status WHEN 'overdue' THEN ${MY_STATUS_ORDER.overdue} WHEN 'pending' THEN ${MY_STATUS_ORDER.pending} WHEN 'accepted' THEN ${MY_STATUS_ORDER.accepted} ELSE ${MY_STATUS_ORDER.accepted + 1} END, code, doc_id
     LIMIT ${f.pageSize} OFFSET ${(f.page - 1) * f.pageSize}`);
  return {
    items: rows.map((r) => ({
      document: { id: r.doc_id, code: r.code, name: r.name, type: r.type as DocumentType },
      version: { id: r.version_id, number: r.number, approvedAt: r.approved_at },
      requiresAcceptance: r.acceptance !== 'not_required',
      status: r.status, assignedAt: r.assigned_at, dueAt: r.due_at, acceptedAt: r.accepted_at,
    })),
    total, page: f.page, pageSize: f.pageSize,
  };
}
