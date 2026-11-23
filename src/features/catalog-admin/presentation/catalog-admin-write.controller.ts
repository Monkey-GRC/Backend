import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import {
  AddDimensionDto,
  CreateCauseDto,
  CreateControlDto,
  CreateEvidenceTemplateDto,
  CreateRiskDto,
  CreateTestDto,
  LinkCauseDto,
  LinkControlDto,
  LinkEvidenceTemplateDto,
  LinkPointOfFocusDto,
  LinkTestDto,
  PointsOfFocusQuery,
  UpdateCauseDto,
  UpdateControlDto,
  UpdateEvidenceTemplateDto,
  UpdateRiskDto,
  UpdateTestDto,
} from '../application/dtos/catalog-write.dto';
import {
  GetCatalogCauseUseCase,
  GetCatalogControlUseCase,
  GetCatalogEvidenceTemplateUseCase,
  GetCatalogRiskUseCase,
  GetCatalogTestUseCase,
} from '../application/use-cases/catalog-queries.use-cases';
import { CatalogLinks, CauseWrites, ControlWrites, EvidenceTemplateWrites, ListPointsOfFocusUseCase, RiskWrites, TestWrites } from '../application/use-cases/catalog-write.use-cases';
import { toCauseDetail, toControlDetail, toEvidenceTemplate, toRiskDetail, toTestDetail } from './catalog-admin-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiItems, ApiNoBody } from '../../../common/swagger/api-envelope';
import { DIMENSIONS } from '../application/dtos/catalog-write.dto';
import { CatalogCauseDetailResponse, CatalogControlDetailResponse, CatalogEvidenceTemplateResponse, CatalogRiskDetailResponse, CatalogTestDetailResponse, FrameworkPointOfFocusResponse } from './catalog-admin.responses';
import { CatalogReadOnlyGuard } from './catalog-read-only.guard';
import { clientIp } from '../../../common/http/client-ip';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const uuid = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// contracts/modules/monkey-admin-catalog.md — escritura del catálogo maestro, exclusiva de admin_monkey. Crear, editar y dar de baja (nunca borrar), y vincular
// elementos entre sí. Cada respuesta trae el elemento ya actualizado; cada cambio deja su rastro `catalog.*` en la auditoría.
@Roles('admin_monkey')
@UseGuards(CatalogReadOnlyGuard)
@Controller('catalog')
export class CatalogAdminWriteController {
  constructor(
    private readonly controlWrites: ControlWrites,
    private readonly riskWrites: RiskWrites,
    private readonly causeWrites: CauseWrites,
    private readonly templateWrites: EvidenceTemplateWrites,
    private readonly testWrites: TestWrites,
    private readonly links: CatalogLinks,
    private readonly pointsOfFocus: ListPointsOfFocusUseCase,
    private readonly getControl: GetCatalogControlUseCase,
    private readonly getRisk: GetCatalogRiskUseCase,
    private readonly getCause: GetCatalogCauseUseCase,
    private readonly getTest: GetCatalogTestUseCase,
    private readonly getTemplate: GetCatalogEvidenceTemplateUseCase,
  ) {}

  // ---- controles ------------------------------------------------------------------------------------------------------------------------------

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Crear un control', description: 'Crea un control propio del catálogo (origen `monkey_admin`). Queda sin vincular a ningún requisito hasta que se le agreguen puntos de enfoque. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogControlDetailResponse, 'Control creado.', { status: 201 })
  @ApiDomainErrors('CODE_ALREADY_EXISTS')
  @Post('controls')
  @HttpCode(HttpStatus.CREATED)
  async createControl(@CurrentUser() p: Principal, @Body() dto: CreateControlDto, @Req() req: Request) {
    const change = await this.controlWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toControlDetail(await this.getControl.execute(change.id)));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Editar un control', description: 'Cambia nombre, descripción, dominio o referencia, o lo da de baja/reactiva con `is_active`. Solo las claves enviadas. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogControlDetailResponse, 'Control actualizado.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Patch('controls/:id')
  async updateControl(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateControlDto, @Req() req: Request) {
    await this.controlWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toControlDetail(await this.getControl.execute(id)));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Dar de baja un control', description: 'Los elementos del catálogo **no se borran**: se dan de baja y siguen visibles. Si otro elemento activo depende de este, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('controls/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateControl(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.controlWrites.deactivate(p, id, metaOf(req));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Vincular una plantilla de evidencia a un control', description: 'Vincula dos elementos del catálogo. Si ya estaban vinculados responde `LINK_ALREADY_EXISTS`. Queda registro de auditoría (`catalog.*`). `sequence` fija la posición (1…N+1); sin ella va al final.' })
  @ApiData(CatalogControlDetailResponse, 'Control con la plantilla vinculada.', { status: 201 })
  @ApiDomainErrors('LINK_ALREADY_EXISTS')
  @Post('controls/:id/evidence-templates')
  @HttpCode(HttpStatus.CREATED)
  async linkTemplate(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkEvidenceTemplateDto, @Req() req: Request) {
    await this.links.linkEvidenceTemplate(p, id, dto.evidence_template_id, dto.sequence, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toControlDetail(await this.getControl.execute(id)));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Desvincular una plantilla de evidencia de un control', description: 'Desvincula dos elementos. Si el vínculo es el único que sostiene a un elemento activo, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('controls/:id/evidence-templates/:templateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkTemplate(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('templateId', uuid) templateId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkEvidenceTemplate(p, id, templateId, metaOf(req));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Vincular una prueba a un control', description: 'Vincula dos elementos del catálogo. Si ya estaban vinculados responde `LINK_ALREADY_EXISTS`. Queda registro de auditoría (`catalog.*`). La dimensión de la prueba debe estar entre las del control.' })
  @ApiData(CatalogControlDetailResponse, 'Control con la prueba vinculada.', { status: 201 })
  @ApiDomainErrors('LINK_ALREADY_EXISTS')
  @Post('controls/:id/tests')
  @HttpCode(HttpStatus.CREATED)
  async linkTest(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkTestDto, @Req() req: Request) {
    await this.links.linkTest(p, id, dto.test_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toControlDetail(await this.getControl.execute(id)));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Desvincular una prueba de un control', description: 'Desvincula dos elementos. Si el vínculo es el único que sostiene a un elemento activo, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('controls/:id/tests/:testId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkTest(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('testId', uuid) testId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkTest(p, id, testId, metaOf(req));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Vincular un control a un punto de enfoque', description: 'Cuelga el control de un requisito del marco por medio de uno de sus puntos de enfoque (`GET /v1/catalog/frameworks/{id}/points-of-focus` los lista). Vincula dos elementos del catálogo. Si ya estaban vinculados responde `LINK_ALREADY_EXISTS`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogControlDetailResponse, 'Control con el punto de enfoque vinculado.', { status: 201 })
  @ApiDomainErrors('LINK_ALREADY_EXISTS')
  @Post('controls/:id/points-of-focus')
  @HttpCode(HttpStatus.CREATED)
  async linkPointOfFocus(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkPointOfFocusDto, @Req() req: Request) {
    await this.links.linkPointOfFocus(p, id, dto.point_of_focus_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toControlDetail(await this.getControl.execute(id)));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Desvincular un control de un punto de enfoque', description: 'Desvincula dos elementos. Si el vínculo es el único que sostiene a un elemento activo, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('controls/:id/points-of-focus/:pointOfFocusId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkPointOfFocus(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('pointOfFocusId', uuid) pointOfFocusId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkPointOfFocus(p, id, pointOfFocusId, metaOf(req));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Agregar una dimensión a un control', description: 'Declara en qué dimensión se evalúa el control y cómo (manual, automática, híbrida…), y si requiere la sonda, IA o confirmación del admin_empresa. Vincula dos elementos del catálogo. Si ya estaban vinculados responde `LINK_ALREADY_EXISTS`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogControlDetailResponse, 'Control con la dimensión agregada.', { status: 201 })
  @ApiDomainErrors('LINK_ALREADY_EXISTS')
  @Post('controls/:id/dimensions')
  @HttpCode(HttpStatus.CREATED)
  async addDimension(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: AddDimensionDto, @Req() req: Request) {
    await this.links.addDimension(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toControlDetail(await this.getControl.execute(id)));
  }

  @ApiTags(API_TAGS.catalogControls)
  @ApiOperation({ summary: 'Quitar una dimensión de un control', description: 'Desvincula dos elementos. Si el vínculo es el único que sostiene a un elemento activo, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiParam({ name: 'dimension', enum: DIMENSIONS, description: 'Dimensión que se quita del control.' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('controls/:id/dimensions/:dimension')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDimension(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('dimension') dimension: string, @Req() req: Request): Promise<void> {
    await this.links.removeDimension(p, id, dimension, metaOf(req));
  }

  /** Apoyo para vincular: los puntos de enfoque de un marco, para elegir a cuál se vincula un control. */
  @ApiTags(API_TAGS.catalogFrameworks)
  @ApiOperation({ summary: 'Puntos de enfoque de un marco', description: 'Apoyo para vincular: los puntos de enfoque de un marco, opcionalmente de un solo requisito, con cuántos controles tiene cada uno.' })
  @ApiItems(FrameworkPointOfFocusResponse, 'Puntos de enfoque del marco.')
  @Get('frameworks/:id/points-of-focus')
  async listPointsOfFocus(@Param('id', uuid) id: string, @Query() q: PointsOfFocusQuery) {
    const items = await this.pointsOfFocus.execute(id, q.requirement_code);
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.points_of_focus_list'), {
      items: items.map((p) => ({ id: p.id, framework_code: p.frameworkCode, requirement_code: p.requirementCode, number: p.number, description: p.description, controls_count: p.controlsCount })),
    });
  }

  // ---- riesgos --------------------------------------------------------------------------------------------------------------------------------

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Crear un riesgo', description: 'Crea un riesgo propio (origen `monkey_admin`). Si no se envía `code`, el servidor asigna el siguiente `R0NN` libre. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogRiskDetailResponse, 'Riesgo creado.', { status: 201 })
  @ApiDomainErrors('CODE_ALREADY_EXISTS')
  @Post('risks')
  @HttpCode(HttpStatus.CREATED)
  async createRisk(@CurrentUser() p: Principal, @Body() dto: CreateRiskDto, @Req() req: Request) {
    const change = await this.riskWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toRiskDetail(await this.getRisk.execute(change.id)));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Editar un riesgo', description: 'Cambia sus textos, criterio o impactos, o lo da de baja/reactiva con `is_active`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogRiskDetailResponse, 'Riesgo actualizado.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Patch('risks/:id')
  async updateRisk(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateRiskDto, @Req() req: Request) {
    await this.riskWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toRiskDetail(await this.getRisk.execute(id)));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Dar de baja un riesgo', description: 'Los elementos del catálogo **no se borran**: se dan de baja y siguen visibles. Si otro elemento activo depende de este, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('risks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateRisk(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.riskWrites.deactivate(p, id, metaOf(req));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Vincular una causa a un riesgo', description: 'Vincula dos elementos del catálogo. Si ya estaban vinculados responde `LINK_ALREADY_EXISTS`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogRiskDetailResponse, 'Riesgo con la causa vinculada.', { status: 201 })
  @ApiDomainErrors('LINK_ALREADY_EXISTS')
  @Post('risks/:id/causes')
  @HttpCode(HttpStatus.CREATED)
  async linkRiskCause(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkCauseDto, @Req() req: Request) {
    await this.links.linkRiskToCause(p, id, dto.cause_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toRiskDetail(await this.getRisk.execute(id)));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Desvincular una causa de un riesgo', description: 'Desvincula dos elementos. Si el vínculo es el único que sostiene a un elemento activo, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('risks/:id/causes/:causeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkRiskCause(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('causeId', uuid) causeId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkRiskFromCause(p, id, causeId, metaOf(req));
  }

  // ---- causas ---------------------------------------------------------------------------------------------------------------------------------

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Crear una causa', description: 'Crea una causa propia (origen `monkey_admin`). Si no se envía `code`, el servidor asigna el siguiente `F0NN` libre. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogCauseDetailResponse, 'Causa creada.', { status: 201 })
  @ApiDomainErrors('CODE_ALREADY_EXISTS')
  @Post('causes')
  @HttpCode(HttpStatus.CREATED)
  async createCause(@CurrentUser() p: Principal, @Body() dto: CreateCauseDto, @Req() req: Request) {
    const change = await this.causeWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toCauseDetail(await this.getCause.execute(change.id)));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Editar una causa', description: 'Cambia sus textos o categoría de falla, o la da de baja/reactiva con `is_active`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogCauseDetailResponse, 'Causa actualizada.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Patch('causes/:id')
  async updateCause(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateCauseDto, @Req() req: Request) {
    await this.causeWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toCauseDetail(await this.getCause.execute(id)));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Dar de baja una causa', description: 'Los elementos del catálogo **no se borran**: se dan de baja y siguen visibles. Si otro elemento activo depende de este, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('causes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateCause(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.causeWrites.deactivate(p, id, metaOf(req));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Vincular un control a una causa', description: 'El control pasa a tratar la causa. Vincula dos elementos del catálogo. Si ya estaban vinculados responde `LINK_ALREADY_EXISTS`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogCauseDetailResponse, 'Causa con el control vinculado.', { status: 201 })
  @ApiDomainErrors('LINK_ALREADY_EXISTS')
  @Post('causes/:id/controls')
  @HttpCode(HttpStatus.CREATED)
  async linkCauseControl(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkControlDto, @Req() req: Request) {
    await this.links.linkCauseToControl(p, id, dto.control_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toCauseDetail(await this.getCause.execute(id)));
  }

  @ApiTags(API_TAGS.catalogRisks)
  @ApiOperation({ summary: 'Desvincular un control de una causa', description: 'Desvincula dos elementos. Si el vínculo es el único que sostiene a un elemento activo, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('causes/:id/controls/:controlId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkCauseControl(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('controlId', uuid) controlId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkCauseFromControl(p, id, controlId, metaOf(req));
  }

  // ---- plantillas de evidencia ----------------------------------------------------------------------------------------------------------------

  @ApiTags(API_TAGS.catalogEvidence)
  @ApiOperation({ summary: 'Crear una plantilla de evidencia', description: 'Crea una plantilla propia (origen `monkey_admin`); por defecto de dimensión `policy`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogEvidenceTemplateResponse, 'Plantilla creada.', { status: 201 })
  @ApiDomainErrors('CODE_ALREADY_EXISTS')
  @Post('evidence-templates')
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(@CurrentUser() p: Principal, @Body() dto: CreateEvidenceTemplateDto, @Req() req: Request) {
    const change = await this.templateWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toEvidenceTemplate(await this.getTemplate.execute(change.id)));
  }

  @ApiTags(API_TAGS.catalogEvidence)
  @ApiOperation({ summary: 'Editar una plantilla de evidencia', description: 'Cambia su descripción o la da de baja/reactiva con `is_active`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogEvidenceTemplateResponse, 'Plantilla actualizada.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Patch('evidence-templates/:id')
  async updateTemplate(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateEvidenceTemplateDto, @Req() req: Request) {
    await this.templateWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toEvidenceTemplate(await this.getTemplate.execute(id)));
  }

  @ApiTags(API_TAGS.catalogEvidence)
  @ApiOperation({ summary: 'Dar de baja una plantilla de evidencia', description: 'Los elementos del catálogo **no se borran**: se dan de baja y siguen visibles. Si otro elemento activo depende de este, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('evidence-templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateTemplate(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.templateWrites.deactivate(p, id, metaOf(req));
  }

  // ---- pruebas --------------------------------------------------------------------------------------------------------------------------------

  @ApiTags(API_TAGS.catalogTests)
  @ApiOperation({ summary: 'Crear una prueba', description: 'Crea una prueba propia (origen `monkey_admin`). El prefijo del código dice la dimensión (`T-DOC`, `T-SRV`, `T-BD`, `T-APP`, `T-CLD`) y debe coincidir. Los textos del comité son opcionales y nunca salen al cliente (D70). Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogTestDetailResponse, 'Prueba creada.', { status: 201 })
  @ApiDomainErrors('CODE_ALREADY_EXISTS')
  @Post('tests')
  @HttpCode(HttpStatus.CREATED)
  async createTest(@CurrentUser() p: Principal, @Body() dto: CreateTestDto, @Req() req: Request) {
    const change = await this.testWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toTestDetail(await this.getTest.execute(change.id)));
  }

  @ApiTags(API_TAGS.catalogTests)
  @ApiOperation({ summary: 'Editar una prueba', description: 'Cambia sus nombres, objetivo o textos del comité, o la da de baja/reactiva con `is_active`. Queda registro de auditoría (`catalog.*`).' })
  @ApiData(CatalogTestDetailResponse, 'Prueba actualizada.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Patch('tests/:id')
  async updateTest(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateTestDto, @Req() req: Request) {
    await this.testWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toTestDetail(await this.getTest.execute(id)));
  }

  @ApiTags(API_TAGS.catalogTests)
  @ApiOperation({ summary: 'Dar de baja una prueba', description: 'Los elementos del catálogo **no se borran**: se dan de baja y siguen visibles. Si otro elemento activo depende de este, responde `CATALOG_ITEM_IN_USE`. Queda registro de auditoría (`catalog.*`).' })
  @ApiNoBody('Hecho. No hay cuerpo.')
  @ApiDomainErrors('CATALOG_ITEM_IN_USE')
  @Delete('tests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateTest(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.testWrites.deactivate(p, id, metaOf(req));
  }
}
