import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import type { RequestMeta } from '../../../../common/http/request-meta';
import { assertFileContent } from '../../../../common/storage/file-content';
import { FileStorage } from '../../../../common/storage/file-storage';
import type { UploadedFile } from '../../../../common/storage/uploaded-file';
import type { VersionDetail } from '../../domain/document.types';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { documentEntry, scopeOf, withFailureAudit } from '../document-audit';
import { DOCUMENT_FILE_TYPES, documentKey, fileNameOfDocumentKey, newVersionId } from '../document-file';
import type { ImportDocumentVersionDto } from '../dtos/document.dto';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** `AAAA-MM-DD` real del calendario; no puede ser futura (comparada con hoy en UTC). Devuelve la fecha o el error de campo. */
export function parseApprovalDate(value: string, now: Date): { date: Date } | { error: string } {
  if (!DATE_ONLY.test(value)) return { error: 'date.invalid' };
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return { error: 'date.invalid' };
  return value > now.toISOString().slice(0, 10) ? { error: 'approved_at.future' } : { date };
}

// contracts/documentos.md · POST /v1/documents/{id}/versions. Publica la versión vigente como aprobación importada (D133, D152): sube el archivo y declara quién lo aprobó y cuándo. Solo `admin_empresa`
// (lo impone `@Can('documents.write')`). El archivo se guarda antes de la transacción (no se retiene la conexión con una llamada externa) y se borra si la base o el rastro fallan.
@Injectable()
export class ImportDocumentVersionUseCase {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: FileStorage,
    private readonly audit: AuditLogWriter,
  ) {}

  execute(p: Principal, documentId: string, dto: ImportDocumentVersionDto, file: UploadedFile | undefined, meta: RequestMeta): Promise<VersionDetail> {
    return withFailureAudit(this.audit, p, meta, 'document_version.import', 'document_version', { document_id: documentId }, () => this.run(p, documentId, dto, file, meta));
  }

  private async run(p: Principal, documentId: string, dto: ImportDocumentVersionDto, file: UploadedFile | undefined, meta: RequestMeta): Promise<VersionDetail> {
    if (!file) throw new DomainError('FILE_REQUIRED');
    // Primero qué documento es: uno ajeno o inexistente es 404 y uno externo 409, sin gastar almacenamiento.
    const found = await this.repo.findOrigin(scopeOf(p), documentId);
    if (!found) throw new DomainError('NOT_FOUND');
    if (found.origin === 'external') throw new DomainError('DOCUMENT_EXTERNAL');
    const approval = parseApprovalDate(dto.approved_at, new Date());
    if ('error' in approval) throw new ValidationException([{ field: 'approved_at', code: approval.error }]);

    const contentType = assertFileContent(file, DOCUMENT_FILE_TYPES);
    const versionId = newVersionId();
    const key = documentKey(p.companyId, documentId, versionId, file.originalName);
    const integrityHash = createHash('sha256').update(file.buffer).digest('hex');
    await this.storage.put(key, file.buffer, contentType);

    const approvers = dto.approvers.map((a) => ({ name: a.name, roleLabel: a.role_label }));
    try {
      const published = await this.repo.publishVersion(
        scopeOf(p),
        documentId,
        { id: versionId, fileKey: key, fileName: fileNameOfDocumentKey(key), fileType: contentType, fileSize: file.buffer.length, integrityHash, approvers, approvedAt: approval.date, note: dto.note?.trim() || null, createdBy: p.userId },
        // Se audita la huella y el nombre, nunca el contenido ni la llave del objeto.
        (done) =>
          documentEntry(p, meta, 'document_version.import', 'document_version', null, {
            id: done.version.id, document_id: documentId, number: done.version.number, file_name: done.version.fileName, file_type: done.version.fileType, file_size: done.version.fileSize,
            integrity_hash: done.version.integrityHash, approvers: dto.approvers.map((a) => ({ name: a.name, role_label: a.role_label })), approved_at: dto.approved_at, archived_version_id: done.archivedVersionId,
          }),
      );
      if (!published) throw new DomainError('NOT_FOUND');
      return published.version;
    } catch (error) {
      // Si la base o el rastro fallan, el archivo no puede quedar huérfano en el bucket (el borrado es de mejor esfuerzo y no tapa el error original).
      await this.storage.remove(key);
      throw error;
    }
  }
}
