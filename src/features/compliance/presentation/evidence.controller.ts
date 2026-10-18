import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { ListEvidenceQuery, ListSubmissionsQuery } from '../application/dtos/evidence.dto';
import { EVIDENCE_UPLOAD_LIMIT_BYTES } from '../application/evidence-file';
import { GetEvidenceDownloadUseCase, ListEvidenceUseCase, ListSubmissionsUseCase, UploadEvidenceUseCase } from '../application/use-cases/evidence.use-cases';
import { toRequirement, toSubmission } from './evidence-response.mapper';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// Evidencias de un control (contracts/modules/compliance-evidence.md, MD-126). Los cuatro roles de la empresa leen y descargan (el `funcional`, solo lo de sus controles);
// suben `admin_empresa` y el `funcional` dueño. La empresa solo aporta: aprobar o rechazar no existe aquí (D84), la revisión es del consultor y del auditor (MD-127).
@ApiTags('compliance')
@ApiCookieAuth()
@Roles('admin_empresa', 'funcional', 'consultor', 'auditor')
@Controller()
export class EvidenceController {
  constructor(
    private readonly listEvidence: ListEvidenceUseCase,
    private readonly listSubmissions: ListSubmissionsUseCase,
    private readonly upload: UploadEvidenceUseCase,
    private readonly download: GetEvidenceDownloadUseCase,
  ) {}

  @Get('controls/:controlId/evidence')
  async evidence(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Query() q: ListEvidenceQuery) {
    const { view, requirements } = await this.listEvidence.execute(p, controlId, q.view);
    return new ResponseDto(HttpStatus.OK, t('evidence.list'), { items: requirements.map((r) => toRequirement(r, view)) });
  }

  // Multipart, campo `file`. PDF, DOCX, XLSX, PNG o JPG, hasta 25 MB (SEG-60); se valida el contenido, no solo el tipo que declara el navegador.
  @Post('evidence-requirements/:requirementId/submissions')
  @Roles('admin_empresa', 'funcional')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: EVIDENCE_UPLOAD_LIMIT_BYTES, files: 1 } }))
  async submit(
    @CurrentUser() p: Principal,
    @Param('requirementId', idPipe) requirementId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    const created = await this.upload.execute(p, requirementId, file && { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype }, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('evidence.submitted'), toSubmission(created, 'business', true));
  }

  @Get('evidence-requirements/:requirementId/submissions')
  async submissions(@CurrentUser() p: Principal, @Param('requirementId', idPipe) requirementId: string, @Query() q: ListSubmissionsQuery) {
    const { view, page } = await this.listSubmissions.execute(p, requirementId, q.page, q.page_size, q.view);
    return new ResponseDto(HttpStatus.OK, t('evidence.submission_list'), toPageResponse(page, (s) => toSubmission(s, view, true)));
  }

  // El archivo nunca es público: un enlace firmado de 5 minutos. Cada enlace generado queda en el rastro.
  @Get('evidence-submissions/:submissionId/download')
  async downloadLink(@CurrentUser() p: Principal, @Param('submissionId', idPipe) submissionId: string, @Req() req: Request) {
    const link = await this.download.execute(p, submissionId, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('evidence.download'), { url: link.url, file_name: link.fileName, file_type: link.fileType, expires_in: link.expiresIn });
  }
}
