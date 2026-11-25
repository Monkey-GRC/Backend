import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import type { RequestMeta } from '../../../../common/http/request-meta';
import type { Acceptance } from '../../domain/document.types';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { documentEntry, scopeOf, withFailureAudit } from '../document-audit';
import type { AcceptDocumentDto } from '../dtos/document.dto';

// contracts/documentos.md · POST /v1/documents/{id}/acceptance. Quien lo tiene asignado acepta la versión vigente (`@Can('documents.accept')` deja pasar a los cuatro roles; que esté asignado lo comprueba
// el repositorio con la asignación bloqueada). No hace falta abrir el archivo (D152). La aceptación es inmutable (SEG-88): una versión nueva pide otra.
@Injectable()
export class AcceptDocumentUseCase {
  constructor(private readonly repo: DocumentRepository, private readonly audit: AuditLogWriter) {}

  execute(p: Principal, documentId: string, dto: AcceptDocumentDto, meta: RequestMeta): Promise<Acceptance> {
    return withFailureAudit(this.audit, p, meta, 'document.accept', 'document_acceptance', { document_id: documentId, version_id: dto.version_id }, async () => {
      const done = await this.repo.accept(scopeOf(p), { documentId, versionId: dto.version_id, userId: p.userId, now: new Date() }, (a) =>
        documentEntry(p, meta, 'document.accept', 'document_acceptance', null, {
          id: a.id, document_id: a.documentId, version_id: a.versionId, version_number: a.versionNumber, integrity_hash: a.integrityHash, accepted_at: a.acceptedAt.toISOString(), was_overdue: a.wasOverdue,
        }),
      );
      if (!done) throw new DomainError('NOT_FOUND');
      return done;
    });
  }
}
