import type { AuditIntent } from '../../../../common/audit/audit-log.writer';
import type { Page } from '../../../../common/pagination/page';
import type { TenantScope } from '../../../../common/tenancy/tenant-scope';
import type { Acceptance, Approver, DocumentDetail, DocumentListItem, DocumentType, MyDocument, MyDocumentStatus, VersionDetail, VersionFile } from '../document.types';

export type DocumentSort = 'code' | 'name' | '-updated_at';
export type DocumentFilters = { page: number; pageSize: number; sort: DocumentSort; type?: DocumentType; hasCurrentVersion?: boolean; q?: string };
export type MyDocumentFilters = { page: number; pageSize: number; status?: MyDocumentStatus };

/** Lo que el caso de uso ya validó y guardó en el almacenamiento: la versión nueva (`status = current`). */
export type NewVersion = {
  id: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  integrityHash: string;
  approvers: Approver[];
  approvedAt: Date;
  note: string | null;
  createdBy: string;
};

export type PublishedVersion = { version: VersionDetail; archivedVersionId: string | null };
export type AssignmentChange = { userId: string; dueAt: Date };
export type AssignResult = { added: AssignmentChange[]; documentId: string };

// Los documentos de la empresa (`company_documents`, `document_versions`, `document_assignments`, `document_acceptances`). Todo va dentro de `withScope` (RLS por empresa); lo «suyo» de una persona
// (asignaciones) lo filtra la aplicación (D152). Toda escritura recibe su `audit`, que se escribe en la MISMA transacción (SEG-36). Un documento de otra empresa no existe para quien pregunta.
export abstract class DocumentRepository {
  abstract list(scope: TenantScope, filters: DocumentFilters, now: Date): Promise<Page<DocumentListItem>>;

  abstract findDetail(scope: TenantScope, documentId: string, now: Date): Promise<DocumentDetail | null>;

  /** Para decidir antes de gastar almacenamiento. `null` si no existe en la empresa. */
  abstract findOrigin(scope: TenantScope, documentId: string): Promise<{ origin: 'internal' | 'external' } | null>;

  /**
   * Publica la versión vigente: bloquea el documento, archiva la vigente (si la hay) y crea la nueva con el número siguiente.
   * `null` si no existe; `DOCUMENT_EXTERNAL` si es un documento externo (fuera del corte).
   */
  abstract publishVersion(scope: TenantScope, documentId: string, input: NewVersion, audit: AuditIntent<PublishedVersion>): Promise<PublishedVersion | null>;

  /**
   * Asigna a las personas (todo o nada). `null` si el documento no existe; `NOT_FOUND` si alguna persona no existe en la empresa; `DOCUMENT_NOT_PUBLISHED` sin versión vigente;
   * `ASSIGNEE_NOT_ELIGIBLE` (con `user_ids`) si alguna no puede aceptar. Solo cuentan las nuevas (o las que estaban revocadas); repetir no cambia nada. El plazo se lee de PR-14 en la misma transacción.
   */
  abstract assign(scope: TenantScope, documentId: string, userIds: string[], assignedBy: string, now: Date, audit: AuditIntent<AssignResult>): Promise<AssignResult | null>;

  /** Marca `revoked_at`. `false` si el documento o la asignación vigente no existen. Las aceptaciones se conservan. */
  abstract unassign(scope: TenantScope, documentId: string, userId: string, now: Date, audit: AuditIntent<{ documentId: string; userId: string }>): Promise<boolean>;

  abstract listMine(scope: TenantScope, userId: string, filters: MyDocumentFilters, now: Date): Promise<Page<MyDocument>>;

  /**
   * Lee el archivo de la versión y llama a `resolve` (comprueba quién puede verla, lanza el error de negocio y firma el enlace); si todo sale bien, escribe el rastro `document_version.download` en la MISMA transacción:
   * no se entrega un enlace sin rastro, ni queda rastro de uno que no se pudo firmar. `null` si el documento o la versión no existen en la empresa (o la versión no es de ese documento).
   */
  abstract readVersionFile<T>(scope: TenantScope, documentId: string, versionId: string, userId: string, resolve: (found: VersionFile) => Promise<T>, audit: AuditIntent<VersionFile>): Promise<{ found: VersionFile; value: T } | null>;

  /**
   * Acepta la versión: bloquea la asignación de la persona y la fila de la versión, comprueba y escribe. `null` si el documento o la versión no existen; `FORBIDDEN` si no está asignado;
   * `DOCUMENT_ACCEPTANCE_NOT_REQUIRED` · `DOCUMENT_VERSION_NOT_CURRENT` · `DOCUMENT_ALREADY_ACCEPTED`.
   */
  abstract accept(scope: TenantScope, input: { documentId: string; versionId: string; userId: string; now: Date }, audit: AuditIntent<Acceptance & { wasOverdue: boolean }>): Promise<(Acceptance & { wasOverdue: boolean }) | null>;
}
