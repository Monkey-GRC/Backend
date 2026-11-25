import type { Acceptance, Assignee, DocumentDetail, DocumentListItem, MyDocument, VersionDetail, VersionSummary } from '../domain/document.types';

// La forma del JSON de contracts/documentos.md. Las fechas con hora, en ISO 8601 UTC; la fecha de aprobación, sin hora (conventions.md).
const day = (d: Date): string => d.toISOString().slice(0, 10);
const person = (p: { id: string; name: string | null; lastName: string | null }) => ({ id: p.id, name: p.name, last_name: p.lastName });

const toSummary = (v: VersionSummary) => ({ id: v.id, number: v.number, approved_at: day(v.approvedAt), is_imported_approval: v.isImportedApproval, file_name: v.fileName, file_type: v.fileType });

export const toDocumentItem = (d: DocumentListItem) => ({
  id: d.id, code: d.code, name: d.name, type: d.type, origin: d.origin, acceptance: d.acceptance,
  current_version: d.currentVersion ? toSummary(d.currentVersion) : null,
  assignments: { total: d.assignments.total, accepted: d.assignments.accepted, pending: d.assignments.pending, overdue: d.assignments.overdue },
});

export const toVersion = (v: VersionDetail) => ({
  id: v.id, number: v.number, status: v.status, approved_at: day(v.approvedAt), is_imported_approval: v.isImportedApproval,
  imported_approval: v.isImportedApproval ? { approvers: v.approvers.map((a) => ({ name: a.name, role_label: a.roleLabel })), approved_at: day(v.approvedAt), note: v.approvalNote } : null,
  file_name: v.fileName, file_type: v.fileType, file_size: v.fileSize, integrity_hash: v.integrityHash, created_by: person(v.createdBy), created_at: v.createdAt.toISOString(),
});

const toAssignee = (a: Assignee) => ({
  user: { ...person(a.user), role: a.user.role }, assigned_at: a.assignedAt.toISOString(), due_at: a.dueAt.toISOString(), status: a.status,
  accepted_version_number: a.acceptedVersionNumber, accepted_at: a.acceptedAt?.toISOString() ?? null,
});

export const toDocumentDetail = (d: DocumentDetail) => ({
  ...toDocumentItem(d), description: d.description, minimum_content: d.minimumContent, versions: d.versions.map(toVersion), assignees: d.assignees.map(toAssignee),
});

export const toMyDocument = (m: MyDocument) => ({
  document: { id: m.document.id, code: m.document.code, name: m.document.name, type: m.document.type },
  version: { id: m.version.id, number: m.version.number, approved_at: day(m.version.approvedAt) },
  requires_acceptance: m.requiresAcceptance, status: m.status, assigned_at: m.assignedAt.toISOString(), due_at: m.dueAt.toISOString(), accepted_at: m.acceptedAt?.toISOString() ?? null,
});

export const toAcceptance = (a: Acceptance) => ({
  id: a.id, document_id: a.documentId, version: { id: a.versionId, number: a.versionNumber }, accepted_at: a.acceptedAt.toISOString(), integrity_hash: a.integrityHash,
});
