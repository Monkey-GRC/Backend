// Documentos de la empresa (modelo-datos.md §11.2, D133, D152 · corte mínimo de MD-503). Contrato: contracts/documentos.md.

export const DOCUMENT_TYPES = ['policy', 'procedure', 'matrix', 'manual', 'document'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export const DOCUMENT_ORIGINS = ['internal', 'external'] as const;
export type DocumentOrigin = (typeof DOCUMENT_ORIGINS)[number];
export const DOCUMENT_ACCEPTANCES = ['users_who_apply', 'all_users', 'not_required'] as const;
export type DocumentAcceptance = (typeof DOCUMENT_ACCEPTANCES)[number];
export const DOCUMENT_VERSION_STATUSES = ['draft', 'in_approval', 'rejected', 'approved', 'current', 'renewal_due', 'expired', 'archived'] as const;
export type DocumentVersionStatus = (typeof DOCUMENT_VERSION_STATUSES)[number];
/** Se deriva (contracts/enums/documentos.md): no es columna. */
export const MY_DOCUMENT_STATUSES = ['pending', 'accepted', 'overdue'] as const;
export type MyDocumentStatus = (typeof MY_DOCUMENT_STATUSES)[number];

/** Quién aprobó la versión fuera de Monkey (D152): texto, puede no tener cuenta. */
export type Approver = { name: string; roleLabel: string };

export type VersionSummary = { id: string; number: number; approvedAt: Date; isImportedApproval: boolean; fileName: string; fileType: string };

export type AssignmentCounts = { total: number; accepted: number; pending: number; overdue: number };

export type DocumentListItem = {
  id: string;
  code: string;
  name: string;
  type: DocumentType;
  origin: DocumentOrigin;
  acceptance: DocumentAcceptance;
  currentVersion: VersionSummary | null;
  assignments: AssignmentCounts;
};

export type PersonRef = { id: string; name: string | null; lastName: string | null };

export type VersionDetail = {
  id: string;
  number: number;
  status: DocumentVersionStatus;
  approvedAt: Date;
  isImportedApproval: boolean;
  approvers: Approver[];
  approvalNote: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  integrityHash: string;
  createdBy: PersonRef;
  createdAt: Date;
};

export type Assignee = {
  user: PersonRef & { role: string };
  assignedAt: Date;
  dueAt: Date;
  /** `null` si el documento no pide aceptación. */
  status: MyDocumentStatus | null;
  /** La última versión que aceptó (puede no ser la vigente) y cuándo. */
  acceptedVersionNumber: number | null;
  acceptedAt: Date | null;
};

export type DocumentDetail = DocumentListItem & { description: string | null; minimumContent: string | null; versions: VersionDetail[]; assignees: Assignee[] };

export type MyDocument = {
  document: { id: string; code: string; name: string; type: DocumentType };
  version: { id: string; number: number; approvedAt: Date };
  requiresAcceptance: boolean;
  /** `null` si el documento no pide aceptación: nunca `pending` ni `overdue`. */
  status: MyDocumentStatus | null;
  assignedAt: Date;
  dueAt: Date;
  acceptedAt: Date | null;
};

/** El archivo de una versión y lo que decide si quien lo pide puede verlo. */
export type VersionFile = {
  version: { id: string; fileKey: string; fileName: string; fileType: string; isCurrent: boolean };
  /** Tiene una asignación vigente (no revocada) del documento. */
  assigned: boolean;
  /** Aceptó esta versión. */
  acceptedByMe: boolean;
};

export type Acceptance = { id: string; documentId: string; versionId: string; versionNumber: number; acceptedAt: Date; integrityHash: string };
