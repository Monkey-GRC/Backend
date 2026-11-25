import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { Can } from '../../../common/authorization/can.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { clientIp } from '../../../common/http/client-ip';
import type { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { FILE_UPLOAD_LIMIT_BYTES } from '../../../common/storage/file-content';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiNoBody, ApiPaged } from '../../../common/swagger/api-envelope';
import { AcceptDocumentDto, AssignDocumentDto, DocumentFileQuery, ImportDocumentVersionDto, ListDocumentsQuery } from '../application/dtos/document.dto';
import { AcceptDocumentUseCase } from '../application/use-cases/accept-document.use-case';
import { AssignDocumentUseCase, UnassignDocumentUseCase } from '../application/use-cases/document-assignment.use-cases';
import { GetDocumentUseCase, ListDocumentsUseCase } from '../application/use-cases/document-read.use-cases';
import { GetDocumentFileUseCase } from '../application/use-cases/download-document-file.use-case';
import { ImportDocumentVersionUseCase } from '../application/use-cases/import-document-version.use-case';
import { toAcceptance, toDocumentDetail, toDocumentItem, toVersion } from './document-response.mapper';
import { DocumentAcceptanceResponse, DocumentAssignedResponse, DocumentDetailResponse, DocumentFileResponse, DocumentItemResponse, DocumentVersionResponse } from './document.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// Documentos de la empresa (contracts/documentos.md, D133, D152 · corte mínimo de MD-503). El `admin_empresa` publica la versión vigente como aprobación importada y la asigna; el `auditor` lee;
// los asignados la ven y la aceptan. Quién puede qué sale de la matriz (`@Can`); un documento de otra empresa es `404` y uno de la propia que no te toca, `403`.
@ApiTags(API_TAGS.documents)
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly list: ListDocumentsUseCase,
    private readonly detail: GetDocumentUseCase,
    private readonly importVersion: ImportDocumentVersionUseCase,
    private readonly file: GetDocumentFileUseCase,
    private readonly assign: AssignDocumentUseCase,
    private readonly unassign: UnassignDocumentUseCase,
    private readonly accept: AcceptDocumentUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar los documentos de la empresa', description: 'Los documentos del catálogo vinculados a los controles de los marcos contratados, uno por documento y por empresa. Cada uno trae su versión vigente (o `null` si aún no se publica) y cuántas personas lo tienen asignado, lo aceptaron, están por aceptar o vencidas. Filtros por tipo, por si tiene versión vigente y por código o nombre (sin mayúsculas ni acentos). Los porcentajes no viajan. Solo lectura para el `auditor`.' })
  @ApiPaged(DocumentItemResponse, 'Página de documentos.')
  @ApiDomainErrors('FORBIDDEN')
  @Can('documents.history')
  @Get()
  async documents(@CurrentUser() p: Principal, @Query() q: ListDocumentsQuery) {
    return new ResponseDto(HttpStatus.OK, t('document.list'), toPageResponse(await this.list.execute(p, q), toDocumentItem));
  }

  @ApiOperation({ summary: 'Detalle de un documento', description: 'Lo de la lista más la descripción y el contenido mínimo del catálogo, todas las versiones (con quién aprobó fuera de Monkey, el archivo y su huella) y a quién está asignado, con el estado de cada persona (`pending`, `accepted` u `overdue`, derivado).' })
  @ApiData(DocumentDetailResponse, 'El documento con sus versiones y asignados.')
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND')
  @Can('documents.history')
  @Get(':id')
  async documentDetail(@CurrentUser() p: Principal, @Param('id', idPipe) id: string) {
    return new ResponseDto(HttpStatus.OK, t('document.detail'), toDocumentDetail(await this.detail.execute(p, id)));
  }

  // Multipart, campo `file` y los datos de la aprobación. PDF, DOCX, PNG o JPG, hasta 25 MB (SEG-60); se valida el contenido, no solo el tipo que declara el navegador.
  @ApiOperation({ summary: 'Publicar una versión importada', description: 'Solo `admin_empresa`. Multipart: `file` (PDF, DOCX, PNG o JPG, hasta 25 MB; se valida el **contenido**), `approved_at` (fecha AAAA-MM-DD, no futura), `approvers` (texto JSON `[{"name":"…","role_label":"…"}]`, de 1 a 3: quién lo aprobó fuera de Monkey; puede no tener cuenta) y `note` (máx. 500). Se guarda la huella SHA-256. La nueva versión queda `current` con el número siguiente y la anterior queda `archived` (nunca se borra). **Una versión nueva pide aceptar otra vez** a todos los asignados. Un documento externo responde `409 DOCUMENT_EXTERNAL`.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'approved_at', 'approvers'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'PDF, DOCX, PNG o JPG; máx. 25 MB.' },
        approved_at: { type: 'string', format: 'date', description: 'Cuándo se aprobó (AAAA-MM-DD). No puede ser futura.' },
        approvers: { type: 'string', description: 'Texto JSON: `[{"name":"María Pérez","role_label":"Gerente general"}]` (de 1 a 3).' },
        note: { type: 'string', maxLength: 500, description: 'Referencia del acta (opcional).' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiData(DocumentVersionResponse, 'La versión vigente nueva, con su huella.', { status: 201 })
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND', 'FILE_REQUIRED', 'FILE_TOO_LARGE', 'UNSUPPORTED_MEDIA_TYPE', 'DOCUMENT_EXTERNAL', 'STORAGE_UNAVAILABLE')
  @Can('documents.write')
  @Post(':id/versions')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: FILE_UPLOAD_LIMIT_BYTES, files: 1 } }))
  async publish(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: ImportDocumentVersionDto, @UploadedFile() file: Express.Multer.File | undefined, @Req() req: Request) {
    const version = await this.importVersion.execute(p, id, dto, file && { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype }, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('document.version_imported'), toVersion(version));
  }

  // El archivo nunca es público: un enlace firmado de 5 minutos. Cada enlace generado queda en el rastro.
  @ApiOperation({ summary: 'Ver o descargar una versión', description: 'Devuelve un **enlace firmado de 5 minutos**: el archivo nunca es público. Con `disposition=inline` la pantalla lo muestra sin descargarlo (solo PDF, PNG y JPG; con DOCX responde `422 disposition.not_inline`). `admin_empresa` y `auditor` ven cualquier versión; quien tiene el documento asignado, la vigente o una que aceptó; si no, `403`. Cada enlace generado queda en el rastro de auditoría (sin la URL firmada).' })
  @ApiData(DocumentFileResponse, 'Enlace temporal de descarga o de vista.')
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND', 'STORAGE_UNAVAILABLE')
  @Can('documents.view_current')
  @Get(':id/versions/:versionId/file')
  async versionFile(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Param('versionId', idPipe) versionId: string, @Query() q: DocumentFileQuery, @Req() req: Request) {
    const link = await this.file.execute(p, id, versionId, q.disposition ?? 'attachment', metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('document.download'), { url: link.url, file_name: link.fileName, file_type: link.fileType, disposition: link.disposition, expires_in: link.expiresIn });
  }

  @ApiOperation({ summary: 'Asignar un documento a personas', description: 'Solo `admin_empresa`. De 1 a 200 personas, todo o nada: cuentas `active` o `pending` de rol `admin_empresa`, `responsable`, `delegado` o `colaborador` (un `auditor` o `admin_monkey` es `409 ASSIGNEE_NOT_ELIGIBLE` con `error.user_ids`; de otra empresa, `404`). El documento necesita una versión vigente (`409 DOCUMENT_NOT_PUBLISHED`). Cada asignación nueva lleva `due_at` = asignación + PR-14 (días para aceptar), fijado al asignar; repetir una persona no cambia nada. `added` cuenta solo las nuevas. Deja `document_assignment.add` por persona.' })
  @ApiData(DocumentAssignedResponse, 'Cuántas asignaciones son nuevas.')
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND', 'DOCUMENT_NOT_PUBLISHED', 'ASSIGNEE_NOT_ELIGIBLE')
  @Can('documents.assign')
  @Post(':id/assignments')
  @HttpCode(HttpStatus.OK)
  async assignTo(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: AssignDocumentDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('document.assigned'), { added: await this.assign.execute(p, id, dto, metaOf(req)) });
  }

  @ApiOperation({ summary: 'Quitar la asignación de una persona', description: 'Solo `admin_empresa`. Marca la asignación como quitada (`revoked_at`): la persona deja de verlo en «Mis documentos» y de contar; sus aceptaciones se conservan. `404` si el documento o la asignación vigente no existen. Se puede volver a asignar (plazo nuevo). Deja `document_assignment.remove`.' })
  @ApiNoBody('Asignación quitada. No hay cuerpo.')
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND')
  @Can('documents.assign')
  @Delete(':id/assignments/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignFrom(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Param('userId', idPipe) userId: string, @Req() req: Request): Promise<void> {
    await this.unassign.execute(p, id, userId, metaOf(req));
  }

  @ApiOperation({ summary: 'Aceptar un documento', description: 'Quien tiene el documento asignado (`admin_empresa`, `responsable`, `delegado` o `colaborador`) acepta la versión vigente: `version_id` es la que la persona vio, para no aceptar una que cambió mientras leía. No hace falta haber abierto el archivo (D152). Se acepta también fuera de plazo (queda `was_overdue` en el rastro). La aceptación es **inmutable** y única por persona y versión (SEG-88). `403` si no está asignado; `409` si la versión ya no es la vigente, ya la aceptó o el documento no pide aceptación. Deja `document.accept` con la huella.' })
  @ApiData(DocumentAcceptanceResponse, 'La aceptación registrada, con la huella del archivo.', { status: 201 })
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND', 'DOCUMENT_VERSION_NOT_CURRENT', 'DOCUMENT_ALREADY_ACCEPTED', 'DOCUMENT_ACCEPTANCE_NOT_REQUIRED')
  @Can('documents.accept')
  @Post(':id/acceptance')
  @HttpCode(HttpStatus.CREATED)
  async acceptDocument(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: AcceptDocumentDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.CREATED, t('document.accepted'), toAcceptance(await this.accept.execute(p, id, dto, metaOf(req))));
  }
}
