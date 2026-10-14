import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { CreateControlDto } from '../application/dtos/control-change.dto';
import { GetControlQuery, ListControlsQuery } from '../application/dtos/list-controls.query';
import { CreateControlUseCase } from '../application/use-cases/create-control.use-case';
import { GetControlUseCase } from '../application/use-cases/get-control.use-case';
import { ListControlsUseCase } from '../application/use-cases/list-controls.use-case';
import { toControlDetail, toControlListItem } from './control-response.mapper';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Acciones de protección de un servicio (contracts/modules/compliance-controls.md, MD-117). `admin_monkey` no entra al cumplimiento de una empresa por
// aquí (MD-146 le dará su propio acceso). La vista técnica la restringe el caso de uso: `auditor` y `consultor`.
@ApiTags('compliance')
@ApiCookieAuth()
@Roles('admin_empresa', 'funcional', 'consultor', 'auditor')
@Controller()
export class ControlsController {
  constructor(
    private readonly listControls: ListControlsUseCase,
    private readonly getControl: GetControlUseCase,
    private readonly createControl: CreateControlUseCase,
  ) {}

  @Get('services/:serviceId/controls')
  async list(@CurrentUser() principal: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListControlsQuery) {
    const { view, page } = await this.listControls.execute(principal, serviceId, {
      page: q.page,
      pageSize: q.page_size,
      sort: q.sort,
      trustCriterion: q.trust_criterion,
      type: q.type,
      readiness: q.readiness,
      approval: q.approval,
      assignedTo: q.assigned_to,
      origin: q.origin,
      view: q.view,
    });
    return new ResponseDto(HttpStatus.OK, t('control.list'), toPageResponse(page, (r) => toControlListItem(r, view === 'technical')));
  }

  // MD-150 · Solo el administrador de la empresa crea un control propio.
  @Post('services/:serviceId/controls')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() principal: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: CreateControlDto, @Req() req: Request) {
    const meta: RequestMeta = { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' };
    const detail = await this.createControl.execute(principal, serviceId, dto, meta);
    return new ResponseDto(HttpStatus.CREATED, t('control.created'), toControlDetail(detail, t));
  }

  @Get('controls/:id')
  async detail(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() q: GetControlQuery) {
    const detail = await this.getControl.execute(principal, id, q.view);
    return new ResponseDto(HttpStatus.OK, t('control.read'), toControlDetail(detail, t));
  }
}
