import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { CreateServiceDto } from '../application/dtos/create-service.dto';
import { ListServicesQuery } from '../application/dtos/list-services.query';
import { SetSystemDescriptionDto } from '../application/dtos/system-description.dto';
import { SYSTEM_DESCRIPTION_UPLOAD_LIMIT_BYTES } from '../application/system-description-file';
import { GetSystemDescriptionFileUrlUseCase } from '../application/use-cases/get-system-description-file-url.use-case';
import { UploadSystemDescriptionFileUseCase } from '../application/use-cases/upload-system-description-file.use-case';
import { UpdateServiceDto } from '../application/dtos/update-service.dto';
import { CreateServiceUseCase } from '../application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from '../application/use-cases/delete-service.use-case';
import { GetServiceUseCase } from '../application/use-cases/get-service.use-case';
import { ListServicesUseCase } from '../application/use-cases/list-services.use-case';
import { SetSystemDescriptionUseCase } from '../application/use-cases/set-system-description.use-case';
import { UpdateServiceUseCase } from '../application/use-cases/update-service.use-case';
import { ServiceInput, ServicePatch } from '../domain/entities/service.entity';
import { toServiceListItem, toServiceResponse } from './service-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiEmpty, ApiPaged } from '../../../common/swagger/api-envelope';
import { ServiceListItemResponse, ServiceResponse, SystemDescriptionDownloadResponse } from './service.responses';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

const metaOf = (req: Request): RequestMeta => ({
  ipAddress: req.ip ?? '',
  userAgent: req.get('user-agent') ?? '',
});

// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

const toInput = (dto: CreateServiceDto): ServiceInput => ({
  name: dto.name,
  description: dto.description,
  scopeStatement: dto.scope_statement,
  type: dto.type,
  industriesServed: dto.industries_served,
  activeClientCount: dto.active_client_count ?? null,
  countries: dto.countries,
  dataTypes: dto.data_types,
  trustCriteria: dto.trust_criteria,
  subserviceOrganizations: dto.subservice_organizations.map((s) => ({
    type: s.type,
    provider: s.provider ?? null,
    serviceProvided: s.service_provided ?? null,
    responsibility: s.responsibility ?? null,
  })),
  frameworkCodes: dto.framework_codes,
  previousCertification: dto.previous_certification ?? null,
  expectedAvailability: dto.expected_availability,
  systemDescription: dto.system_description ? { linkUrl: dto.system_description.url } : null,
});

// Solo las claves presentes: `null` en un opcional es "bórralo", ausente es "no lo toques".
const toPatch = (dto: UpdateServiceDto): ServicePatch => {
  const patch: ServicePatch = {};
  if (dto.name !== undefined) patch.name = dto.name;
  if (dto.description !== undefined) patch.description = dto.description;
  if (dto.scope_statement !== undefined) patch.scopeStatement = dto.scope_statement;
  if (dto.type !== undefined) patch.type = dto.type;
  if (dto.industries_served !== undefined) patch.industriesServed = dto.industries_served;
  if (dto.active_client_count !== undefined) patch.activeClientCount = dto.active_client_count;
  if (dto.countries !== undefined) patch.countries = dto.countries;
  if (dto.data_types !== undefined) patch.dataTypes = dto.data_types;
  if (dto.trust_criteria !== undefined) patch.trustCriteria = dto.trust_criteria;
  if (dto.subservice_organizations !== undefined) {
    patch.subserviceOrganizations = dto.subservice_organizations.map((s) => ({
      type: s.type,
      provider: s.provider ?? null,
      serviceProvided: s.service_provided ?? null,
      responsibility: s.responsibility ?? null,
    }));
  }
  if (dto.framework_codes !== undefined) patch.frameworkCodes = dto.framework_codes;
  if (dto.previous_certification !== undefined) patch.previousCertification = dto.previous_certification;
  if (dto.expected_availability !== undefined) patch.expectedAvailability = dto.expected_availability;
  if (dto.system_description) {
    patch.systemDescription = { linkUrl: dto.system_description.url };
  }
  return patch;
};

// Componente 2 del onboarding (contracts/modules/onboarding-service-context.md).
// Solo el admin_empresa declara los servicios de su empresa. La lista y el detalle también los leen el `auditor` (todos) y el `responsable` (los suyos), D96.
@ApiTags(API_TAGS.services)
@Roles('admin_empresa')
@Controller('services')
export class ServicesController {
  constructor(
    private readonly createService: CreateServiceUseCase,
    private readonly listServices: ListServicesUseCase,
    private readonly getService: GetServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
    private readonly deleteService: DeleteServiceUseCase,
    private readonly setSystemDescription: SetSystemDescriptionUseCase,
    private readonly uploadSystemDescription: UploadSystemDescriptionFileUseCase,
    private readonly getSystemDescriptionFileUrl: GetSystemDescriptionFileUrlUseCase,
  ) {}

  @ApiOperation({ summary: 'Declarar un servicio', description: 'Componente 2 del onboarding. Crea el servicio, lo vincula a los marcos contratados y **clona el catálogo** (controles, riesgos, pruebas y plantillas de evidencia) dentro de la misma transacción. Requiere que el contexto organizacional ya esté declarado. Queda registro de auditoría.' })
  @ApiData(ServiceResponse, 'Servicio creado con su catálogo ya clonado.', { status: 201 })
  @ApiDomainErrors('ORGANIZATION_NOT_DECLARED', 'SERVICE_NAME_TAKEN', 'FRAMEWORK_NOT_CONTRACTED')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() principal: Principal,
    @Body() dto: CreateServiceDto,
    @Req() req: Request,
  ) {
    const service = await this.createService.execute(principal, toInput(dto), metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('service.created'), toServiceResponse(service));
  }

  @ApiOperation({ summary: 'Listar servicios', description: 'Los servicios de la empresa, con lo mínimo para pintar la lista: marcos, estado del catálogo y resumen del control técnico. Los lee dmin_empresa (todos), uditor (todos, solo lectura) y uncional (solo aquellos en los que es responsable de alguna dimensión).' })
  @ApiPaged(ServiceListItemResponse, 'Página de servicios.')
  @Get()
  @Roles('admin_empresa', 'responsable', 'auditor')
  async list(@CurrentUser() principal: Principal, @Query() query: ListServicesQuery) {
    const page = await this.listServices.execute(principal, {
      page: query.page,
      pageSize: query.page_size,
    });
    return new ResponseDto(HttpStatus.OK, t('service.list'), toPageResponse(page, toServiceListItem));
  }

  @ApiOperation({ summary: 'Detalle de un servicio', description: 'Todos los campos declarados (la pantalla de edición los necesita), más el catálogo clonado y el avance de llenado. Lo leen dmin_empresa, uditor y el uncional responsable de algo en él; a otro uncional le responde 403.' })
  @ApiData(ServiceResponse, 'Detalle del servicio.')
  @ApiDomainErrors('FORBIDDEN')
  @Get(':id')
  @Roles('admin_empresa', 'responsable', 'auditor')
  async detail(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    const service = await this.getService.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('service.detail'), toServiceResponse(service));
  }

  @ApiOperation({ summary: 'Editar un servicio', description: 'Mismas claves que al crear, todas opcionales: solo se aplican las que vienen. `null` en un opcional lo borra; ausente no lo toca. Cambiar `trust_criteria` o `framework_codes` recalcula los requisitos aplicables. Queda registro de auditoría.' })
  @ApiData(ServiceResponse, 'Servicio actualizado.')
  @ApiDomainErrors('SERVICE_NAME_TAKEN', 'FRAMEWORK_NOT_CONTRACTED')
  @Patch(':id')
  async update(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Body() dto: UpdateServiceDto,
    @Req() req: Request,
  ) {
    const service = await this.updateService.execute(principal, id, toPatch(dto), metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('service.updated'), toServiceResponse(service));
  }

  @ApiOperation({ summary: 'Eliminar un servicio', description: 'Solo se puede eliminar un servicio que aún no tenga historial de evaluaciones; con historial responde `SERVICE_HAS_EVALUATIONS`. Queda registro de auditoría.' })
  @ApiEmpty('Servicio eliminado. `data` es `null`.')
  @ApiDomainErrors('SERVICE_HAS_EVALUATIONS')
  @Delete(':id')
  async remove(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Req() req: Request,
  ) {
    await this.deleteService.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('service.deleted'), null);
  }

  @ApiOperation({ summary: 'Declarar la Descripción del Sistema como enlace', description: 'Guarda (o reemplaza) el enlace a la Descripción del Sistema del servicio. Para subir un archivo se usa `POST /v1/services/{id}/system-description/file`.' })
  @ApiData(ServiceResponse, 'Servicio con la Descripción del Sistema actualizada.')
  @Post(':id/system-description')
  @HttpCode(HttpStatus.OK)
  async saveSystemDescription(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Body() dto: SetSystemDescriptionDto,
    @Req() req: Request,
  ) {
    const service = await this.setSystemDescription.execute(
      principal,
      id,
      { linkUrl: dto.url },
      metaOf(req),
    );
    return new ResponseDto(
      HttpStatus.OK,
      t('service.system_description_saved'),
      toServiceResponse(service),
    );
  }

  // Archivo en vez de enlace (multipart, campo `file`). Máximo 25 MB, PDF o .docx.
  @ApiOperation({ summary: 'Subir la Descripción del Sistema como archivo', description: 'Multipart, campo `file`. PDF o DOCX, hasta 25 MB. Se valida el contenido, no solo la extensión. El archivo queda en almacenamiento privado.' })
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary', description: 'PDF o DOCX, máx. 25 MB.' } } } })
  @ApiData(ServiceResponse, 'Servicio con el archivo registrado como Descripción del Sistema.')
  @ApiDomainErrors('FILE_REQUIRED', 'FILE_TOO_LARGE', 'UNSUPPORTED_MEDIA_TYPE', 'STORAGE_UNAVAILABLE')
  @Post(':id/system-description/file')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: SYSTEM_DESCRIPTION_UPLOAD_LIMIT_BYTES, files: 1 } }),
  )
  async uploadSystemDescriptionFile(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    const service = await this.uploadSystemDescription.execute(
      principal,
      id,
      file && { buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype },
      metaOf(req),
    );
    return new ResponseDto(
      HttpStatus.OK,
      t('service.system_description_saved'),
      toServiceResponse(service),
    );
  }

  // Enlace temporal (5 min) para descargar el archivo; el bucket no es público.
  @ApiOperation({ summary: 'Descargar la Descripción del Sistema (archivo)', description: 'Devuelve un enlace firmado de 5 minutos. El almacenamiento no es público.' })
  @ApiData(SystemDescriptionDownloadResponse, 'Enlace temporal de descarga.')
  @ApiDomainErrors('SYSTEM_DESCRIPTION_NOT_A_FILE', 'STORAGE_UNAVAILABLE')
  @Get(':id/system-description/file')
  async systemDescriptionFile(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    const link = await this.getSystemDescriptionFileUrl.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('service.system_description_file'), {
      url: link.url,
      file_name: link.fileName,
      expires_in: link.expiresIn,
    });
  }
}
