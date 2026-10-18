import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiPaged } from '../../../common/swagger/api-envelope';
import { ControlDetailResponse, ControlListItemResponse } from './control.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Acciones de protección de un servicio (contracts/modules/compliance-controls.md, MD-117). `admin_monkey` no entra al cumplimiento de una empresa por
// aquí (MD-146 le dará su propio acceso). La vista técnica la restringe el caso de uso: `auditor` y `consultor`.
@ApiTags(API_TAGS.controls)
@Roles('admin_empresa', 'funcional', 'consultor', 'auditor')
@Controller()
export class ControlsController {
  constructor(
    private readonly listControls: ListControlsUseCase,
    private readonly getControl: GetControlUseCase,
    private readonly createControl: CreateControlUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar los controles de un servicio', description: 'Los controles del servicio con su estado, **avance y cobertura juntos**, quién los tiene a cargo y si hay un cambio pendiente. Filtros por criterio, tipo, estado, aprobación, responsable y origen. El `funcional` solo ve los que tiene asignados. Con `view=technical` (solo `auditor`, `consultor` y, por ahora, `admin_empresa`) agrega el bloque `technical`.' })
  @ApiPaged(ControlListItemResponse, 'Página de controles.')
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
  @ApiOperation({ summary: 'Crear un control propio', description: 'Solo `admin_empresa`. Crea un control propio del servicio (origen `own`, numeración `C01`…): es solo documental, por eso su única dimensión es `policy`. Nace `pending` hasta que el consultor lo apruebe. Queda registro de auditoría.' })
  @ApiData(ControlDetailResponse, 'Control propio creado.', { status: 201 })
  @Post('services/:serviceId/controls')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() principal: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: CreateControlDto, @Req() req: Request) {
    const meta: RequestMeta = { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' };
    const detail = await this.createControl.execute(principal, serviceId, dto, meta);
    return new ResponseDto(HttpStatus.CREATED, t('control.created'), toControlDetail(detail, t));
  }

  @ApiOperation({ summary: 'Detalle de un control', description: 'Estado, avance y cobertura; interpretación, dimensiones, evidencias requeridas con su última entrega, causas que trata y en qué falla. Un `funcional` que no tiene el control asignado recibe 403. Con `view=technical` (solo `auditor`, `consultor` y, por ahora, `admin_empresa`) agrega el bloque `technical`.' })
  @ApiData(ControlDetailResponse, 'Detalle del control.')
  @Get('controls/:id')
  async detail(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() q: GetControlQuery) {
    const detail = await this.getControl.execute(principal, id, q.view);
    return new ResponseDto(HttpStatus.OK, t('control.read'), toControlDetail(detail, t));
  }
}
