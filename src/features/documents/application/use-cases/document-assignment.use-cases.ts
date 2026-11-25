import { Injectable } from '@nestjs/common';
import { AuditLogWriter } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import type { RequestMeta } from '../../../../common/http/request-meta';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { documentEntry, scopeOf, withFailureAudit } from '../document-audit';
import type { AssignDocumentDto } from '../dtos/document.dto';

// contracts/documentos.md · Asignar y quitar. Solo `admin_empresa` (`@Can('documents.assign')`). El plazo (PR-14) lo fija el repositorio con el puerto de parámetros, en la misma transacción.

@Injectable()
export class AssignDocumentUseCase {
  constructor(private readonly repo: DocumentRepository, private readonly audit: AuditLogWriter) {}

  /** Devuelve cuántas asignaciones son nuevas (repetir no cambia nada). */
  execute(p: Principal, documentId: string, dto: AssignDocumentDto, meta: RequestMeta): Promise<number> {
    return withFailureAudit(this.audit, p, meta, 'document_assignment.add', 'document_assignment', { document_id: documentId, user_ids: dto.user_ids }, async () => {
      const done = await this.repo.assign(scopeOf(p), documentId, dto.user_ids, p.userId, new Date(), (result) =>
        result.added.map((a) => documentEntry(p, meta, 'document_assignment.add', 'document_assignment', null, { document_id: result.documentId, user_id: a.userId, due_at: a.dueAt.toISOString() })),
      );
      if (!done) throw new DomainError('NOT_FOUND');
      return done.added.length;
    });
  }
}

@Injectable()
export class UnassignDocumentUseCase {
  constructor(private readonly repo: DocumentRepository, private readonly audit: AuditLogWriter) {}

  async execute(p: Principal, documentId: string, userId: string, meta: RequestMeta): Promise<void> {
    await withFailureAudit(this.audit, p, meta, 'document_assignment.remove', 'document_assignment', { document_id: documentId, user_id: userId }, async () => {
      const removed = await this.repo.unassign(scopeOf(p), documentId, userId, new Date(), (done) =>
        documentEntry(p, meta, 'document_assignment.remove', 'document_assignment', { document_id: done.documentId, user_id: done.userId }, null),
      );
      if (!removed) throw new DomainError('NOT_FOUND');
    });
  }
}
