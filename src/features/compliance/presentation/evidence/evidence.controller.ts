import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Can } from '../../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { RequestMeta } from '../../../../common/http/request-meta';
import { toPageResponse } from '../../../../common/pagination/page';
import { CreateEvidenceRequirementDto, DownloadEvidenceQuery, ListEvidenceQuery, ListSubmissionsQuery, ReviewEvidenceDto } from '../../application/evidence/evidence.dto';
import { EVIDENCE_UPLOAD_LIMIT_BYTES } from '../../application/evidence/evidence-file';
import {
  CreateEvidenceRequirementUseCase, GetEvidenceDownloadUseCase, ListEvidenceUseCase, ListServiceEvidenceUseCase, ListSubmissionsUseCase, ListTestEvidenceUseCase, ReviewEvidenceUseCase, UploadEvidenceUseCase, UploadTestEvidenceUseCase,
} from '../../application/evidence/evidence.use-cases';
import { toRequirement, toSubmission, toTestEvidence } from './evidence-response.mapper';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiItems, ApiPaged } from '../../../../common/swagger/api-envelope';
import { EvidenceDownloadResponse, EvidenceRequirementResponse, EvidenceSubmissionResponse, ServiceEvidenceItemResponse, TestEvidenceResponse } from './evidence.responses';
import { clientIp } from '../../../../common/http/client-ip';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// Evidencias de un control (contracts/modules/compliance-evidence.md, MD-126). Los cuatro roles de la empresa leen y descargan (el `responsable`, solo lo de sus controles);
// suben el `responsable` responsable y, si hace falta, `admin_empresa`. Subir no valida: la validación es del admin_empresa (MD-127, D96).
@ApiTags(API_TAGS.evidence)
@Can('evidence.view')
@Controller()
export class EvidenceController {
  constructor(
    private readonly listEvidence: ListEvidenceUseCase,
    private readonly listServiceEvidence: ListServiceEvidenceUseCase,
    private readonly listSubmissions: ListSubmissionsUseCase,
    private readonly upload: UploadEvidenceUseCase,
    private readonly download: GetEvidenceDownloadUseCase,
    private readonly reviewEvidence: ReviewEvidenceUseCase,
    private readonly createRequirement: CreateEvidenceRequirementUseCase,
    private readonly uploadForTest: UploadTestEvidenceUseCase,
    private readonly listTestEvidence: ListTestEvidenceUseCase,
  ) {}

  @ApiOperation({ summary: 'Evidencias de un control', description: 'Los requerimientos de evidencia del control, cada uno con su responsable y todas sus entregas (la más reciente primero). Un `responsable` solo ve los controles que tiene asignados. Con `view=technical` (solo `auditor` y, por ahora, `admin_empresa`) agrega el bloque `technical`.' })
  @ApiItems(EvidenceRequirementResponse, 'Requerimientos con sus entregas.')
  @Get('controls/:controlId/evidence')
  async evidence(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Query() q: ListEvidenceQuery) {
    const { view, requirements } = await this.listEvidence.execute(p, controlId, q.view);
    return new ResponseDto(HttpStatus.OK, t('evidence.list'), { items: requirements.map((r) => toRequirement(r, view)) });
  }

  @ApiOperation({ summary: 'Evidencias de un servicio', description: 'Los requerimientos de evidencia de **todos** los controles vigentes del servicio, con sus entregas, en una sola petición (MD-208). Cada ítem es el mismo de `GET /controls/{id}/evidence` más `control_id`. Sin paginar, ordenado por código de control y luego `sequence`. `admin_empresa` y `auditor` ven todos los controles; `responsable` y `delegado`, solo los suyos. Con `view=technical` (solo `auditor` y `admin_empresa`) agrega el bloque `technical`. `404` si el servicio no es de la empresa.' })
  @ApiItems(ServiceEvidenceItemResponse, 'Requerimientos de todos los controles del servicio, cada uno con `control_id`.')
  @Get('services/:serviceId/evidence')
  async serviceEvidence(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListEvidenceQuery) {
    const { view, items } = await this.listServiceEvidence.execute(p, serviceId, q.view);
    return new ResponseDto(HttpStatus.OK, t('evidence.service_list'), { items: items.map((i) => ({ control_id: i.controlId, ...toRequirement(i.requirement, view) })) });
  }

  @ApiOperation({ summary: 'Evidencia de un test manual', description: 'Lo que se subió para un test **manual o documental** de un control, para mostrarlo en el test. Una prueba documental (D88) devuelve solo el requerimiento de esa prueba en este control; otro test manual (D85) devuelve los de **todos los controles vigentes del servicio que lo llevan**, cada uno con su control, y `shared_with` dice dónde más aplica. Un `responsable` recibe solo lo de las dimensiones de las que es responsable. `404` si el control no lleva el test o la prueba no acepta subida (la regla de la subida por prueba: fuente principal y dimensión aplicable).' })
  @ApiData(TestEvidenceResponse, 'Requerimientos del test con sus entregas.')
  @Get('controls/:controlId/tests/:testId/evidence')
  async testEvidence(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('testId', idPipe) testId: string, @Query() q: ListEvidenceQuery) {
    const result = await this.listTestEvidence.execute(p, controlId, testId, q.view);
    return new ResponseDto(HttpStatus.OK, t('evidence.test_list'), toTestEvidence(result));
  }

  // Multipart, campo `file`. PDF, DOCX, XLSX, PNG o JPG, hasta 25 MB (SEG-60); se valida el contenido, no solo el tipo que declara el navegador.
  @ApiOperation({ summary: 'Subir una evidencia', description: 'Multipart, campo `file`. PDF, DOCX, XLSX, PNG o JPG, hasta 25 MB. Se valida el **contenido** del archivo, no solo el tipo que declara el navegador. Se calcula la huella SHA-256 y se guarda con la versión (crece de uno en uno; una nueva nunca pisa la anterior), la fecha y quién la subió. La empresa solo **aporta**: subir no valida: la validación es del `admin_empresa` (D96). Suben el `responsable` responsable y, si hace falta, `admin_empresa`. Queda registro de auditoría.' })
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'PDF, DOCX, XLSX, PNG o JPG; máx. 25 MB.' } } } })
  @ApiData(EvidenceSubmissionResponse, 'Entrega registrada, con su huella y versión.', { status: 201 })
  @ApiDomainErrors('FILE_REQUIRED', 'FILE_TOO_LARGE', 'UNSUPPORTED_MEDIA_TYPE', 'CONTROL_RETIRED', 'EVIDENCE_VERSION_CONFLICT', 'STORAGE_UNAVAILABLE')
  @Post('evidence-requirements/:requirementId/submissions')
  @Can('evidence.upload')
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

  @ApiOperation({ summary: 'Entregas de un requerimiento', description: 'El historial de versiones del requerimiento, de la más reciente a la más antigua. Con `view=technical` (solo `auditor` y, por ahora, `admin_empresa`) agrega el bloque `technical`.' })
  @ApiPaged(EvidenceSubmissionResponse, 'Página de entregas.')
  @Get('evidence-requirements/:requirementId/submissions')
  async submissions(@CurrentUser() p: Principal, @Param('requirementId', idPipe) requirementId: string, @Query() q: ListSubmissionsQuery) {
    const { view, page } = await this.listSubmissions.execute(p, requirementId, q.page, q.page_size, q.view);
    return new ResponseDto(HttpStatus.OK, t('evidence.submission_list'), toPageResponse(page, (s) => toSubmission(s, view, true)));
  }

  // D88 · La persona lee lo que pide la prueba y sube su documento, en un solo paso. El admin_empresa la valida después.
  @ApiOperation({ summary: 'Subir la evidencia de una prueba de fuente manual', description: 'Multipart, campo `file` (PDF, DOCX, XLSX, PNG o JPG, hasta 25 MB). La evidencia es **de esa prueba en este control** (D88): en la primera entrega se crea el lugar donde queda y las siguientes son versiones nuevas. Suben `admin_empresa` y el `responsable` dueño del control. La prueba debe ser del control (si no, 404) y aceptar subida según su fuente principal: `document` y `manual` sí; `probe`, `cloud_engine` y `probe_and_cloud_engine` no (`422 test.not_manual`); `integration` sí, de respaldo, mientras el servicio no tenga conectada una integración de su categoría. Además, su dimensión debe aplicar en el control (`422 dimension.not_in_control`). Subir **no cumple** la prueba: la deja en revisión hasta que el `admin_empresa` valide la evidencia (D96). Queda registro de auditoría.' })
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'PDF, DOCX, XLSX, PNG o JPG; máx. 25 MB.' } } } })
  @ApiConsumes('multipart/form-data')
  @ApiData(EvidenceSubmissionResponse, 'Entrega registrada para esa prueba.', { status: 201 })
  @ApiDomainErrors('FILE_REQUIRED', 'FILE_TOO_LARGE', 'UNSUPPORTED_MEDIA_TYPE', 'CONTROL_RETIRED', 'STORAGE_UNAVAILABLE')
  @Post('controls/:controlId/tests/:testId/evidence')
  @Can('evidence.upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: EVIDENCE_UPLOAD_LIMIT_BYTES, files: 1 } }))
  async submitForTest(
    @CurrentUser() p: Principal,
    @Param('controlId', idPipe) controlId: string,
    @Param('testId', idPipe) testId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    const created = await this.uploadForTest.execute(p, controlId, testId, file && { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype }, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('evidence.submitted'), toSubmission(created, 'business', true));
  }

  // D102 · Quien sube es el ejecutor, el dueño o el admin_empresa; revisan el dueño (si no la subió él) y el admin_empresa. El rol sale de la sesión; el cuerpo no lo lleva.
  @ApiOperation({ summary: 'Revisar una evidencia', description: 'El `responsable` dueño del control (lo que no subió él) y el `admin_empresa` (cualquiera, también lo suyo; P34). `delegado`, `auditor` y `admin_monkey`, 403; un `responsable` ajeno al control, 403. Una revisión por rol: crea o reemplaza la de quien llama; el rol lo fija el servidor. El estado sale de COMBINAR las revisiones (D102): algún rechazo gana; sin rechazos y con al menos una validación, validada. **Rechazar** es dejar algún atributo en `false` y exige `note` (el motivo que quien subió lee para corregir). Marca los seis atributos (`true`, `false` o sin valorar) y la validación humana (`review`). Solo una evidencia **validada por una persona** puede cumplir (RN-03); `ai_prevalidated` lo deriva el sistema y no se acepta. De esta revisión sale el estado de las pruebas documentales del control (D88). Responde con la entrega y su `evidence_state`. Queda registro de auditoría.' })
  @ApiData(EvidenceSubmissionResponse, 'La entrega con su `evidence_state` combinado; el `admin_empresa` recibe además el bloque `technical`.')
  @Put('evidence-submissions/:submissionId/review')
  @Can('evidence.review')
  async review(@CurrentUser() p: Principal, @Param('submissionId', idPipe) submissionId: string, @Body() dto: ReviewEvidenceDto, @Req() req: Request) {
    const reviewed = await this.reviewEvidence.execute(p, submissionId, dto, metaOf(req));
    // El responsable ve el estado y la nota de rechazo, no los atributos (la vista técnica es de admin_empresa y auditor).
    return new ResponseDto(HttpStatus.OK, t('evidence.reviewed'), toSubmission(reviewed.submission, reviewed.reviewerRole === 'admin_empresa' ? 'technical' : 'business', true));
  }

  // D88 · Una evidencia propia en un control: de una prueba documental concreta, o compartida con todas las del control.
  @ApiOperation({ summary: 'Agregar una evidencia propia a un control', description: 'Solo `admin_empresa`. Agrega al control una evidencia requerida **propia** (`origin: "own"`). Con `test_id` sirve solo a esa prueba del control, que debe aceptar subida (la misma regla de la subida por prueba: `test.not_manual`, `test.not_in_control`); sin él queda compartida con todas (D88). Así todo control puede respaldar sus pruebas manuales aunque el catálogo no le haya traído un documento. `dimension` debe ser una que el control exige (`dimension.not_in_control`) y, con `test_id`, la de esa prueba (`dimension.not_of_test`). Queda registro de auditoría.' })
  @ApiData(EvidenceRequirementResponse, 'Evidencia requerida creada.', { status: 201 })
  @ApiDomainErrors('CONTROL_RETIRED')
  @Post('controls/:controlId/evidence-requirements')
  @Can('evidence.requirements')
  @HttpCode(HttpStatus.CREATED)
  async addRequirement(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Body() dto: CreateEvidenceRequirementDto, @Req() req: Request) {
    const created = await this.createRequirement.execute(p, controlId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('evidence.requirement_created'), toRequirement(created, 'business'));
  }

  // El archivo nunca es público: un enlace firmado de 5 minutos. Cada enlace generado queda en el rastro.
  @ApiOperation({ summary: 'Descargar o ver una evidencia', description: 'Devuelve un **enlace firmado de 5 minutos**: el archivo nunca es público. Con `disposition=inline` la pantalla lo muestra sin descargarlo (solo PDF, PNG y JPG; con DOCX o XLSX responde `422 disposition.not_supported`). La disposición y el tipo de contenido van fijados en el enlace. Cada enlace generado, también el `inline`, queda en el rastro de auditoría (sin la URL firmada).' })
  @ApiData(EvidenceDownloadResponse, 'Enlace temporal de descarga o de vista.')
  @ApiDomainErrors('STORAGE_UNAVAILABLE')
  @Get('evidence-submissions/:submissionId/download')
  async downloadLink(@CurrentUser() p: Principal, @Param('submissionId', idPipe) submissionId: string, @Query() q: DownloadEvidenceQuery, @Req() req: Request) {
    const link = await this.download.execute(p, submissionId, q.disposition ?? 'attachment', metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('evidence.download'), { url: link.url, file_name: link.fileName, file_type: link.fileType, disposition: link.disposition, expires_in: link.expiresIn });
  }
}
