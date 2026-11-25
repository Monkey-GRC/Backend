import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Can } from '../../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { RequestMeta } from '../../../../common/http/request-meta';
import { toPageResponse } from '../../../../common/pagination/page';
import {
  CreateCauseDto, CreateRiskDto, DeactivateRiskDto, LinkCauseControlDto, LinkRiskCauseDto, ListCausesQuery, ListRisksQuery, UpdateCauseDto, UpdateRiskDto, ViewQuery,
} from '../../application/risks/risk.dto';
import {
  CreateCauseUseCase, CreateRiskUseCase, DeactivateCauseUseCase, DeactivateRiskUseCase, GetCauseUseCase, GetRiskUseCase, LinkUseCases, ListCausesUseCase, ListRisksUseCase,
  ReactivateRiskUseCase, UpdateCauseUseCase, UpdateRiskUseCase,
} from '../../application/risks/risk.use-cases';
import { riskMatrix } from '../../domain/risks/risk-types';
import { toCause, toRiskDetail, toRiskListItem } from './risk-response.mapper';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiNoBody, ApiPaged } from '../../../../common/swagger/api-envelope';
import { CauseControlLinkResponse, CauseResponse, RiskCauseLinkResponse, RiskDetailResponse, RiskListItemResponse, RiskMatrixResponse } from './risk.responses';
import { clientIp } from '../../../../common/http/client-ip';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// Riesgos y causas de un servicio (contracts/modules/compliance-risks.md, MD-122). Los ven los cuatro roles de la empresa (el `responsable`, solo lo que llega a una acción
// suya); los gestiona solo el administrador. `admin_monkey` no entra al cumplimiento de una empresa por aquí.
@ApiTags(API_TAGS.risks)
@Can('risks.view')
@Controller()
export class RisksController {
  constructor(
    private readonly listRisks: ListRisksUseCase, private readonly getRisk: GetRiskUseCase, private readonly createRisk: CreateRiskUseCase,
    private readonly updateRisk: UpdateRiskUseCase, private readonly deactivateRisk: DeactivateRiskUseCase, private readonly reactivateRisk: ReactivateRiskUseCase,
    private readonly listCauses: ListCausesUseCase, private readonly getCause: GetCauseUseCase, private readonly createCause: CreateCauseUseCase,
    private readonly updateCause: UpdateCauseUseCase, private readonly deactivateCause: DeactivateCauseUseCase, private readonly links: LinkUseCases,
  ) {}

  // La matriz 5×5 con el nivel de cada casilla: no depende de ningún servicio ni de ninguna empresa, así que la leen los cuatro roles.
  @ApiOperation({ summary: 'Matriz de riesgo 5×5', description: 'Las 25 casillas (probabilidad × impacto) con su valor y el nivel que corresponde. No depende de ningún servicio ni empresa. Es la misma función que usa la evaluación, así que el nivel de una casilla vacía es el que tendría un riesgo evaluado ahí.' })
  @ApiData(RiskMatrixResponse, 'La matriz completa.')
  @Get('risk-matrix')
  matrix() {
    return new ResponseDto(HttpStatus.OK, t('risk.matrix'), riskMatrix());
  }

  // ── riesgos ──
  @ApiOperation({ summary: 'Listar los riesgos de un servicio', description: 'Riesgos del servicio con su evaluación inherente (si la tiene), el tratamiento vigente y cuántas causas activas tienen. Filtros por criterio, nivel, origen y si están evaluados. Con `view=technical` (solo `auditor` y `admin_empresa`) agrega el bloque `technical`.' })
  @ApiPaged(RiskListItemResponse, 'Página de riesgos.')
  @Get('services/:serviceId/risks')
  async risks(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListRisksQuery) {
    const { view, graph, page } = await this.listRisks.execute(p, serviceId, {
      page: q.page, pageSize: q.page_size, includeInactive: q.include_inactive, origin: q.origin, trustCriterion: q.trust_criterion, level: q.inherent_risk_level, evaluated: q.evaluated, view: q.view,
    });
    return new ResponseDto(HttpStatus.OK, t('risk.list'), toPageResponse(page, (r) => toRiskListItem(r, graph, view === 'technical')));
  }

  @ApiOperation({ summary: 'Crear un riesgo propio', description: 'Solo `admin_empresa`. Crea un riesgo propio del servicio (origen `own`). Si no se envía `code`, el servidor asigna el siguiente libre. Queda registro de auditoría.' })
  @ApiData(RiskDetailResponse, 'Riesgo creado.', { status: 201 })
  @ApiDomainErrors('CODE_ALREADY_EXISTS')
  @Post('services/:serviceId/risks')
  @Can('risks.create')
  @HttpCode(HttpStatus.CREATED)
  async newRisk(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: CreateRiskDto, @Req() req: Request) {
    const { view, graph, risk } = await this.createRisk.execute(p, serviceId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('risk.created'), toRiskDetail(risk, graph, view === 'technical'));
  }

  @ApiOperation({ summary: 'Detalle de un riesgo', description: 'El riesgo con su evaluación, tratamiento vigente y causas activas, cada una con los controles que la tratan. Con `view=technical` (solo `auditor` y `admin_empresa`) agrega el bloque `technical`.' })
  @ApiData(RiskDetailResponse, 'Detalle del riesgo.')
  @Get('risks/:id')
  async risk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Query() q: ViewQuery) {
    const { view, graph, risk } = await this.getRisk.execute(p, id, q.view);
    return new ResponseDto(HttpStatus.OK, t('risk.read'), toRiskDetail(risk, graph, view === 'technical'));
  }

  @ApiOperation({ summary: 'Editar un riesgo', description: 'Solo `admin_empresa`. Solo las claves enviadas. Queda registro de auditoría.' })
  @ApiData(RiskDetailResponse, 'Riesgo actualizado.')
  @Patch('risks/:id')
  @Can('risks.edit')
  async editRisk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateRiskDto, @Req() req: Request) {
    const { view, graph, risk } = await this.updateRisk.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('risk.updated'), toRiskDetail(risk, graph, view === 'technical'));
  }

  @ApiOperation({ summary: 'Dar de baja un riesgo', description: 'Solo `admin_empresa`. Los riesgos no se borran: se dan de baja (el historial se conserva). Con `reason` opcional (por qué no aplica al servicio), que queda en el registro de auditoría.' })
  @ApiNoBody('Riesgo dado de baja. No hay cuerpo.')
  @Delete('risks/:id')
  @Can('risks.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRisk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request, @Body() dto?: DeactivateRiskDto) {
    await this.deactivateRisk.execute(p, id, metaOf(req), dto?.reason);
  }

  @ApiOperation({ summary: 'Volver a incluir un riesgo retirado', description: 'Solo `admin_empresa`. Devuelve al servicio un riesgo que se había dado de baja; conserva su evaluación anterior si la tenía. Si ya estaba vigente no hace nada. Queda registro de auditoría.' })
  @ApiData(RiskDetailResponse, 'Riesgo vigente de nuevo.')
  @Post('risks/:id/reactivation')
  @Can('risks.manage')
  @HttpCode(HttpStatus.OK)
  async restoreRisk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    const { view, graph, risk } = await this.reactivateRisk.execute(p, id, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('risk.reactivated'), toRiskDetail(risk, graph, view === 'technical'));
  }

  @ApiOperation({ summary: 'Vincular una causa a un riesgo', description: 'Solo `admin_empresa`. La causa y el riesgo deben estar activos. Queda registro de auditoría.' })
  @ApiData(RiskCauseLinkResponse, 'Vínculo creado.', { status: 201 })
  @ApiDomainErrors('LINK_ALREADY_EXISTS', 'RISK_INACTIVE', 'CAUSE_INACTIVE')
  @Post('risks/:id/causes')
  @Can('risks.manage')
  @HttpCode(HttpStatus.CREATED)
  async linkCause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: LinkRiskCauseDto, @Req() req: Request) {
    await this.links.linkRiskCause(p, id, dto.cause_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('risk.linked'), { risk_id: id, cause_id: dto.cause_id });
  }

  @ApiOperation({ summary: 'Desvincular una causa de un riesgo', description: 'Solo `admin_empresa`. Queda registro de auditoría.' })
  @ApiNoBody('Vínculo eliminado. No hay cuerpo.')
  @Delete('risks/:id/causes/:causeId')
  @Can('risks.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkCause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Param('causeId', idPipe) causeId: string, @Req() req: Request) {
    await this.links.unlinkRiskCause(p, id, causeId, metaOf(req));
  }

  // ── causas ──
  @ApiOperation({ summary: 'Listar las causas de un servicio', description: 'Causas del servicio con los riesgos a los que contribuyen y los controles que las tratan. Filtros por categoría de falla, riesgo y origen. Con `view=technical` (solo `auditor` y `admin_empresa`) agrega el bloque `technical`.' })
  @ApiPaged(CauseResponse, 'Página de causas.')
  @Get('services/:serviceId/causes')
  async causes(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListCausesQuery) {
    const { view, graph, page } = await this.listCauses.execute(p, serviceId, {
      page: q.page, pageSize: q.page_size, includeInactive: q.include_inactive, origin: q.origin, failureCategory: q.failure_category, riskId: q.risk_id, view: q.view,
    });
    return new ResponseDto(HttpStatus.OK, t('cause.list'), toPageResponse(page, (c) => toCause(c, graph, view === 'technical')));
  }

  @ApiOperation({ summary: 'Crear una causa propia', description: 'Solo `admin_empresa`. Crea una causa propia del servicio (origen `own`). Si no se envía `code`, el servidor asigna el siguiente libre. Queda registro de auditoría.' })
  @ApiData(CauseResponse, 'Causa creada.', { status: 201 })
  @ApiDomainErrors('CODE_ALREADY_EXISTS')
  @Post('services/:serviceId/causes')
  @Can('risks.manage')
  @HttpCode(HttpStatus.CREATED)
  async newCause(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: CreateCauseDto, @Req() req: Request) {
    const { view, graph, cause } = await this.createCause.execute(p, serviceId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('cause.created'), toCause(cause, graph, view === 'technical'));
  }

  @ApiOperation({ summary: 'Detalle de una causa', description: 'La causa con sus riesgos y los controles que la tratan. Con `view=technical` (solo `auditor` y `admin_empresa`) agrega el bloque `technical`.' })
  @ApiData(CauseResponse, 'Detalle de la causa.')
  @Get('causes/:id')
  async cause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Query() q: ViewQuery) {
    const { view, graph, cause } = await this.getCause.execute(p, id, q.view);
    return new ResponseDto(HttpStatus.OK, t('cause.read'), toCause(cause, graph, view === 'technical'));
  }

  @ApiOperation({ summary: 'Editar una causa', description: 'Solo `admin_empresa`. Solo las claves enviadas. Queda registro de auditoría.' })
  @ApiData(CauseResponse, 'Causa actualizada.')
  @Patch('causes/:id')
  @Can('risks.manage')
  async editCause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateCauseDto, @Req() req: Request) {
    const { view, graph, cause } = await this.updateCause.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('cause.updated'), toCause(cause, graph, view === 'technical'));
  }

  @ApiOperation({ summary: 'Dar de baja una causa', description: 'Solo `admin_empresa`. Las causas no se borran: se dan de baja. Queda registro de auditoría.' })
  @ApiNoBody('Causa dada de baja. No hay cuerpo.')
  @Delete('causes/:id')
  @Can('risks.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    await this.deactivateCause.execute(p, id, metaOf(req));
  }

  @ApiOperation({ summary: 'Vincular un control a una causa', description: 'Solo `admin_empresa`. El control pasa a tratar la causa; `is_mandatory` (por defecto `true`) dice si es obligatorio y `effect` sobre qué actúa (probabilidad o impacto). Queda registro de auditoría.' })
  @ApiData(CauseControlLinkResponse, 'Vínculo creado.', { status: 201 })
  @ApiDomainErrors('LINK_ALREADY_EXISTS', 'CAUSE_INACTIVE')
  @Post('causes/:id/controls')
  @Can('risks.manage')
  @HttpCode(HttpStatus.CREATED)
  async linkControl(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: LinkCauseControlDto, @Req() req: Request) {
    const options = { isMandatory: dto.is_mandatory ?? true, effect: dto.effect ?? null };
    await this.links.linkCauseControl(p, id, dto.control_id, options, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('cause.control_linked'), { cause_id: id, control_id: dto.control_id, is_mandatory: options.isMandatory, effect: options.effect });
  }

  @ApiOperation({ summary: 'Desvincular un control de una causa', description: 'Solo `admin_empresa`. Queda registro de auditoría.' })
  @ApiNoBody('Vínculo eliminado. No hay cuerpo.')
  @Delete('causes/:id/controls/:controlId')
  @Can('risks.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkControl(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Param('controlId', idPipe) controlId: string, @Req() req: Request) {
    await this.links.unlinkCauseControl(p, id, controlId, metaOf(req));
  }
}
