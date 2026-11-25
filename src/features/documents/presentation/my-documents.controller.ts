import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { Can } from '../../../common/authorization/can.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { toPageResponse } from '../../../common/pagination/page';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiDomainErrors, ApiPaged } from '../../../common/swagger/api-envelope';
import { ListMyDocumentsQuery } from '../application/dtos/document.dto';
import { ListMyDocumentsUseCase } from '../application/use-cases/document-read.use-cases';
import { toMyDocument } from './document-response.mapper';
import { MyDocumentResponse } from './document.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// «Mis documentos» (contracts/documentos.md, D152): lo que le asignaron a quien pregunta. La pantalla de entrada del `colaborador`. El `auditor` no acepta documentos (D133): `403`.
@ApiTags(API_TAGS.documents)
@Controller('me/documents')
export class MyDocumentsController {
  constructor(private readonly mine: ListMyDocumentsUseCase) {}

  @ApiOperation({ summary: 'Mis documentos', description: 'Los documentos que le asignaron a quien llama, con la versión vigente y su estado, derivado (nunca guardado): `accepted` si aceptó la vigente; si no, `overdue` cuando pasó `due_at`; si no, `pending`. Orden: vencidos, pendientes y aceptados; luego por código. Sin asignaciones, la lista llega vacía. Filtro opcional `status`.' })
  @ApiPaged(MyDocumentResponse, 'Página de documentos asignados.')
  @ApiDomainErrors('FORBIDDEN')
  @Can('documents.mine')
  @Get()
  async documents(@CurrentUser() p: Principal, @Query() q: ListMyDocumentsQuery) {
    return new ResponseDto(HttpStatus.OK, t('document.mine'), toPageResponse(await this.mine.execute(p, q), toMyDocument));
  }
}
