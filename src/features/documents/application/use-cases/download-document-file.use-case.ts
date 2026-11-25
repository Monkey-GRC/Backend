import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import type { RequestMeta } from '../../../../common/http/request-meta';
import { INLINE_TYPES } from '../../../../common/storage/file-content';
import { FileStorage } from '../../../../common/storage/file-storage';
import { mayReadVersionFile } from '../../domain/document-rules';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { documentEntry, scopeOf, withFailureAudit } from '../document-audit';

export const DOCUMENT_LINK_SECONDS = 300;

// contracts/documentos.md · GET /v1/documents/{id}/versions/{version_id}/file. Un enlace firmado de 5 minutos (SEG-59): el archivo nunca es público. Quién lo ve lo decide `mayReadVersionFile`.
// El rastro `document_version.download` se escribe en la misma transacción que la lectura y la autorización: sin rastro no hay enlace. Un `403` deja `result = error` (de mejor esfuerzo).
@Injectable()
export class GetDocumentFileUseCase {
  constructor(private readonly repo: DocumentRepository, private readonly storage: FileStorage, private readonly audit: AuditLogWriter) {}

  async execute(p: Principal, documentId: string, versionId: string, disposition: 'attachment' | 'inline', meta: RequestMeta): Promise<{ url: string; fileName: string; fileType: string; disposition: 'attachment' | 'inline'; expiresIn: number }> {
    const done = await withFailureAudit(this.audit, p, meta, 'document_version.download', 'document_version', { id: versionId, document_id: documentId }, () =>
      this.repo.readVersionFile(
        scopeOf(p), documentId, versionId, p.userId,
        async (f) => {
          if (!mayReadVersionFile({ role: p.role, assigned: f.assigned, isCurrent: f.version.isCurrent, acceptedByMe: f.acceptedByMe })) throw new DomainError('FORBIDDEN');
          if (disposition === 'inline' && !INLINE_TYPES.includes(f.version.fileType)) throw new ValidationException([{ field: 'disposition', code: 'disposition.not_inline' }]);
          // El tipo y la disposición se fijan al firmar: quien recibe el enlace no los puede cambiar.
          return this.storage.downloadUrl(f.version.fileKey, f.version.fileName, DOCUMENT_LINK_SECONDS, { disposition, contentType: f.version.fileType });
        },
        // Se registra la versión y la disposición, nunca la URL firmada.
        (f) => documentEntry(p, meta, 'document_version.download', 'document_version', null, { id: f.version.id, document_id: documentId, file_name: f.version.fileName, disposition }),
      ),
    );
    if (!done) throw new DomainError('NOT_FOUND');
    return { url: done.value, fileName: done.found.version.fileName, fileType: done.found.version.fileType, disposition, expiresIn: DOCUMENT_LINK_SECONDS };
  }
}
