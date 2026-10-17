import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import {
  CreateCauseDto, CreateRiskDto, LinkCauseControlDto, LinkRiskCauseDto, ListCausesQuery, ListRisksQuery, UpdateCauseDto, UpdateRiskDto, ViewQuery,
} from '../application/dtos/risk.dto';
import {
  CreateCauseUseCase, CreateRiskUseCase, DeactivateCauseUseCase, DeactivateRiskUseCase, GetCauseUseCase, GetRiskUseCase, LinkUseCases, ListCausesUseCase, ListRisksUseCase,
  UpdateCauseUseCase, UpdateRiskUseCase,
} from '../application/use-cases/risk.use-cases';
import { riskMatrix } from '../domain/risk-types';
import { toCause, toRiskDetail, toRiskListItem } from './risk-response.mapper';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// Riesgos y causas de un servicio (contracts/modules/compliance-risks.md, MD-122). Los ven los cuatro roles de la empresa (el `funcional`, solo lo que llega a una acción
// suya); los gestiona solo el administrador. `admin_monkey` no entra al cumplimiento de una empresa por aquí.
@ApiTags('compliance')
@ApiCookieAuth()
@Roles('admin_empresa', 'funcional', 'consultor', 'auditor')
@Controller()
export class RisksController {
  constructor(
    private readonly listRisks: ListRisksUseCase, private readonly getRisk: GetRiskUseCase, private readonly createRisk: CreateRiskUseCase,
    private readonly updateRisk: UpdateRiskUseCase, private readonly deactivateRisk: DeactivateRiskUseCase,
    private readonly listCauses: ListCausesUseCase, private readonly getCause: GetCauseUseCase, private readonly createCause: CreateCauseUseCase,
    private readonly updateCause: UpdateCauseUseCase, private readonly deactivateCause: DeactivateCauseUseCase, private readonly links: LinkUseCases,
  ) {}

  // La matriz 5×5 con el nivel de cada casilla: no depende de ningún servicio ni de ninguna empresa, así que la leen los cuatro roles.
  @Get('risk-matrix')
  matrix() {
    return new ResponseDto(HttpStatus.OK, t('risk.matrix'), riskMatrix());
  }

  // ── riesgos ──
  @Get('services/:serviceId/risks')
  async risks(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListRisksQuery) {
    const { view, graph, page } = await this.listRisks.execute(p, serviceId, {
      page: q.page, pageSize: q.page_size, includeInactive: q.include_inactive, origin: q.origin, trustCriterion: q.trust_criterion, level: q.inherent_risk_level, evaluated: q.evaluated, view: q.view,
    });
    return new ResponseDto(HttpStatus.OK, t('risk.list'), toPageResponse(page, (r) => toRiskListItem(r, graph, view === 'technical')));
  }

  @Post('services/:serviceId/risks')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async newRisk(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: CreateRiskDto, @Req() req: Request) {
    const { view, graph, risk } = await this.createRisk.execute(p, serviceId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('risk.created'), toRiskDetail(risk, graph, view === 'technical'));
  }

  @Get('risks/:id')
  async risk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Query() q: ViewQuery) {
    const { view, graph, risk } = await this.getRisk.execute(p, id, q.view);
    return new ResponseDto(HttpStatus.OK, t('risk.read'), toRiskDetail(risk, graph, view === 'technical'));
  }

  @Patch('risks/:id')
  @Roles('admin_empresa')
  async editRisk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateRiskDto, @Req() req: Request) {
    const { view, graph, risk } = await this.updateRisk.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('risk.updated'), toRiskDetail(risk, graph, view === 'technical'));
  }

  @Delete('risks/:id')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRisk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    await this.deactivateRisk.execute(p, id, metaOf(req));
  }

  @Post('risks/:id/causes')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async linkCause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: LinkRiskCauseDto, @Req() req: Request) {
    await this.links.linkRiskCause(p, id, dto.cause_id, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('risk.linked'), { risk_id: id, cause_id: dto.cause_id });
  }

  @Delete('risks/:id/causes/:causeId')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkCause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Param('causeId', idPipe) causeId: string, @Req() req: Request) {
    await this.links.unlinkRiskCause(p, id, causeId, metaOf(req));
  }

  // ── causas ──
  @Get('services/:serviceId/causes')
  async causes(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListCausesQuery) {
    const { view, graph, page } = await this.listCauses.execute(p, serviceId, {
      page: q.page, pageSize: q.page_size, includeInactive: q.include_inactive, origin: q.origin, failureCategory: q.failure_category, riskId: q.risk_id, view: q.view,
    });
    return new ResponseDto(HttpStatus.OK, t('cause.list'), toPageResponse(page, (c) => toCause(c, graph, view === 'technical')));
  }

  @Post('services/:serviceId/causes')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async newCause(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: CreateCauseDto, @Req() req: Request) {
    const { view, graph, cause } = await this.createCause.execute(p, serviceId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('cause.created'), toCause(cause, graph, view === 'technical'));
  }

  @Get('causes/:id')
  async cause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Query() q: ViewQuery) {
    const { view, graph, cause } = await this.getCause.execute(p, id, q.view);
    return new ResponseDto(HttpStatus.OK, t('cause.read'), toCause(cause, graph, view === 'technical'));
  }

  @Patch('causes/:id')
  @Roles('admin_empresa')
  async editCause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateCauseDto, @Req() req: Request) {
    const { view, graph, cause } = await this.updateCause.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('cause.updated'), toCause(cause, graph, view === 'technical'));
  }

  @Delete('causes/:id')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCause(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    await this.deactivateCause.execute(p, id, metaOf(req));
  }

  @Post('causes/:id/controls')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async linkControl(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: LinkCauseControlDto, @Req() req: Request) {
    const options = { isMandatory: dto.is_mandatory ?? true, effect: dto.effect ?? null };
    await this.links.linkCauseControl(p, id, dto.control_id, options, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('cause.control_linked'), { cause_id: id, control_id: dto.control_id, is_mandatory: options.isMandatory, effect: options.effect });
  }

  @Delete('causes/:id/controls/:controlId')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkControl(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Param('controlId', idPipe) controlId: string, @Req() req: Request) {
    await this.links.unlinkCauseControl(p, id, controlId, metaOf(req));
  }
}
