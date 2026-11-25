import { Injectable } from '@nestjs/common';
import type { Principal } from '../../../../common/auth/principal';
import { DomainError } from '../../../../common/errors/domain-error';
import type { Page } from '../../../../common/pagination/page';
import type { DocumentDetail, DocumentListItem, MyDocument } from '../../domain/document.types';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { scopeOf } from '../document-audit';
import type { ListDocumentsQuery, ListMyDocumentsQuery } from '../dtos/document.dto';

// contracts/documentos.md · Listar, ver el detalle y «Mis documentos». Quién puede lo fija `@Can` en la ruta; lo «suyo» (asignado) lo filtra el repositorio por `userId`.

@Injectable()
export class ListDocumentsUseCase {
  constructor(private readonly repo: DocumentRepository) {}

  execute(p: Principal, q: ListDocumentsQuery): Promise<Page<DocumentListItem>> {
    return this.repo.list(scopeOf(p), { page: q.page, pageSize: q.page_size, sort: q.sort, type: q.type, hasCurrentVersion: q.has_current_version, q: q.q }, new Date());
  }
}

@Injectable()
export class GetDocumentUseCase {
  constructor(private readonly repo: DocumentRepository) {}

  async execute(p: Principal, documentId: string): Promise<DocumentDetail> {
    const found = await this.repo.findDetail(scopeOf(p), documentId, new Date());
    if (!found) throw new DomainError('NOT_FOUND');
    return found;
  }
}

@Injectable()
export class ListMyDocumentsUseCase {
  constructor(private readonly repo: DocumentRepository) {}

  execute(p: Principal, q: ListMyDocumentsQuery): Promise<Page<MyDocument>> {
    return this.repo.listMine(scopeOf(p), p.userId, { page: q.page, pageSize: q.page_size, status: q.status }, new Date());
  }
}
