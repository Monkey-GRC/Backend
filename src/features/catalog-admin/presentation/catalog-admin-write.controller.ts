import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
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

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const uuid = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// contracts/modules/monkey-admin-catalog.md — escritura del catálogo maestro, exclusiva de admin_monkey. Crear, editar y dar de baja (nunca borrar), y vincular
// elementos entre sí. Cada respuesta trae el elemento ya actualizado; cada cambio deja su rastro `catalog.*` en la auditoría.
@ApiTags('catalog')
@ApiCookieAuth()
@Roles('admin_monkey')
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

  @Post('controls')
  @HttpCode(HttpStatus.CREATED)
  async createControl(@CurrentUser() p: Principal, @Body() dto: CreateControlDto, @Req() req: Request) {
    const change = await this.controlWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toControlDetail(await this.getControl.execute(change.id)));
  }

  @Patch('controls/:id')
  async updateControl(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateControlDto, @Req() req: Request) {
    await this.controlWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toControlDetail(await this.getControl.execute(id)));
  }

  @Delete('controls/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateControl(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.controlWrites.deactivate(p, id, metaOf(req));
  }

  @Post('controls/:id/evidence-templates')
  @HttpCode(HttpStatus.CREATED)
  async linkTemplate(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkEvidenceTemplateDto, @Req() req: Request) {
    await this.links.linkEvidenceTemplate(p, id, dto.evidence_template_id, dto.sequence, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toControlDetail(await this.getControl.execute(id)));
  }

  @Delete('controls/:id/evidence-templates/:templateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkTemplate(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('templateId', uuid) templateId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkEvidenceTemplate(p, id, templateId, metaOf(req));
  }

  @Post('controls/:id/tests')
  @HttpCode(HttpStatus.CREATED)
  async linkTest(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkTestDto, @Req() req: Request) {
    await this.links.linkTest(p, id, dto.test_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toControlDetail(await this.getControl.execute(id)));
  }

  @Delete('controls/:id/tests/:testId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkTest(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('testId', uuid) testId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkTest(p, id, testId, metaOf(req));
  }

  @Post('controls/:id/points-of-focus')
  @HttpCode(HttpStatus.CREATED)
  async linkPointOfFocus(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkPointOfFocusDto, @Req() req: Request) {
    await this.links.linkPointOfFocus(p, id, dto.point_of_focus_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toControlDetail(await this.getControl.execute(id)));
  }

  @Delete('controls/:id/points-of-focus/:pointOfFocusId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkPointOfFocus(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('pointOfFocusId', uuid) pointOfFocusId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkPointOfFocus(p, id, pointOfFocusId, metaOf(req));
  }

  @Post('controls/:id/dimensions')
  @HttpCode(HttpStatus.CREATED)
  async addDimension(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: AddDimensionDto, @Req() req: Request) {
    await this.links.addDimension(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toControlDetail(await this.getControl.execute(id)));
  }

  @Delete('controls/:id/dimensions/:dimension')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDimension(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('dimension') dimension: string, @Req() req: Request): Promise<void> {
    await this.links.removeDimension(p, id, dimension, metaOf(req));
  }

  /** Apoyo para vincular: los puntos de enfoque de un marco, para elegir a cuál se vincula un control. */
  @Get('frameworks/:id/points-of-focus')
  async listPointsOfFocus(@Param('id', uuid) id: string, @Query() q: PointsOfFocusQuery) {
    const items = await this.pointsOfFocus.execute(id, q.requirement_code);
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.points_of_focus_list'), {
      items: items.map((p) => ({ id: p.id, framework_code: p.frameworkCode, requirement_code: p.requirementCode, number: p.number, description: p.description, controls_count: p.controlsCount })),
    });
  }

  // ---- riesgos --------------------------------------------------------------------------------------------------------------------------------

  @Post('risks')
  @HttpCode(HttpStatus.CREATED)
  async createRisk(@CurrentUser() p: Principal, @Body() dto: CreateRiskDto, @Req() req: Request) {
    const change = await this.riskWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toRiskDetail(await this.getRisk.execute(change.id)));
  }

  @Patch('risks/:id')
  async updateRisk(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateRiskDto, @Req() req: Request) {
    await this.riskWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toRiskDetail(await this.getRisk.execute(id)));
  }

  @Delete('risks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateRisk(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.riskWrites.deactivate(p, id, metaOf(req));
  }

  @Post('risks/:id/causes')
  @HttpCode(HttpStatus.CREATED)
  async linkRiskCause(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkCauseDto, @Req() req: Request) {
    await this.links.linkRiskToCause(p, id, dto.cause_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toRiskDetail(await this.getRisk.execute(id)));
  }

  @Delete('risks/:id/causes/:causeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkRiskCause(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('causeId', uuid) causeId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkRiskFromCause(p, id, causeId, metaOf(req));
  }

  // ---- causas ---------------------------------------------------------------------------------------------------------------------------------

  @Post('causes')
  @HttpCode(HttpStatus.CREATED)
  async createCause(@CurrentUser() p: Principal, @Body() dto: CreateCauseDto, @Req() req: Request) {
    const change = await this.causeWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toCauseDetail(await this.getCause.execute(change.id)));
  }

  @Patch('causes/:id')
  async updateCause(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateCauseDto, @Req() req: Request) {
    await this.causeWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toCauseDetail(await this.getCause.execute(id)));
  }

  @Delete('causes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateCause(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.causeWrites.deactivate(p, id, metaOf(req));
  }

  @Post('causes/:id/controls')
  @HttpCode(HttpStatus.CREATED)
  async linkCauseControl(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: LinkControlDto, @Req() req: Request) {
    await this.links.linkCauseToControl(p, id, dto.control_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.linked'), toCauseDetail(await this.getCause.execute(id)));
  }

  @Delete('causes/:id/controls/:controlId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkCauseControl(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Param('controlId', uuid) controlId: string, @Req() req: Request): Promise<void> {
    await this.links.unlinkCauseFromControl(p, id, controlId, metaOf(req));
  }

  // ---- plantillas de evidencia ----------------------------------------------------------------------------------------------------------------

  @Post('evidence-templates')
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(@CurrentUser() p: Principal, @Body() dto: CreateEvidenceTemplateDto, @Req() req: Request) {
    const change = await this.templateWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toEvidenceTemplate(await this.getTemplate.execute(change.id)));
  }

  @Patch('evidence-templates/:id')
  async updateTemplate(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateEvidenceTemplateDto, @Req() req: Request) {
    await this.templateWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toEvidenceTemplate(await this.getTemplate.execute(id)));
  }

  @Delete('evidence-templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateTemplate(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.templateWrites.deactivate(p, id, metaOf(req));
  }

  // ---- pruebas --------------------------------------------------------------------------------------------------------------------------------

  @Post('tests')
  @HttpCode(HttpStatus.CREATED)
  async createTest(@CurrentUser() p: Principal, @Body() dto: CreateTestDto, @Req() req: Request) {
    const change = await this.testWrites.create(p, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('catalog_admin.created'), toTestDetail(await this.getTest.execute(change.id)));
  }

  @Patch('tests/:id')
  async updateTest(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Body() dto: UpdateTestDto, @Req() req: Request) {
    await this.testWrites.update(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('catalog_admin.updated'), toTestDetail(await this.getTest.execute(id)));
  }

  @Delete('tests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateTest(@CurrentUser() p: Principal, @Param('id', uuid) id: string, @Req() req: Request): Promise<void> {
    await this.testWrites.deactivate(p, id, metaOf(req));
  }
}
