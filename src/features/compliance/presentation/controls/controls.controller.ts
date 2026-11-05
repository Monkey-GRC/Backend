import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { RequestMeta } from '../../../../common/http/request-meta';
import { toPageResponse } from '../../../../common/pagination/page';
import { CreateControlDto, EditClientControlDto } from '../../application/controls/control.dto';
import { GetControlQuery, ListControlsQuery } from '../../application/controls/list-controls.query';
import { CreateControlUseCase } from '../../application/controls/create-control.use-case';
import { RetireControlUseCase, UpdateControlUseCase } from '../../application/controls/edit-control.use-cases';
import { GetControlUseCase } from '../../application/controls/get-control.use-case';
import { ListControlsUseCase } from '../../application/controls/list-controls.use-case';
import { toControlDetail, toControlListItem } from './control-response.mapper';
import { toControlTestItem } from './control-test-response.mapper';
import { ControlTestItemResponse } from './control-test.responses';
import { ListControlTestsQuery } from '../../application/evidence/evidence.dto';
import { ListControlTestsUseCase } from '../../application/controls/list-control-tests.use-case';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiNoBody, ApiPaged } from '../../../../common/swagger/api-envelope';
import { ControlDetailResponse, ControlListItemResponse } from './control.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Acciones de protección de un servicio (contracts/modules/compliance-controls.md, MD-117). `admin_monkey` no entra al cumplimiento de una empresa por
// aquí (MD-146 le dará su propio acceso). La vista técnica la restringe el caso de uso: `auditor` y `admin_empresa`.
@ApiTags(API_TAGS.controls)
@Roles('admin_empresa', 'responsable', 'delegado', 'auditor')
@Controller()
export class ControlsController {
  constructor(
    private readonly listControls: ListControlsUseCase,
    private readonly getControl: GetControlUseCase,
    private readonly createControl: CreateControlUseCase,
    private readonly updateControl: UpdateControlUseCase,
    private readonly retireControl: RetireControlUseCase,
    private readonly listControlTests: ListControlTestsUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar los controles de un servicio', description: 'Los controles del servicio con su estado, **avance y cobertura juntos**, quién los tiene a cargo. Filtros por criterio, tipo, estado y origen. El `responsable` solo ve los que tiene asignados. Con `view=technical` (solo `auditor` y `admin_empresa`) agrega el bloque `technical`.' })
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
      origin: q.origin,
      view: q.view,
    });
    return new ResponseDto(HttpStatus.OK, t('control.list'), toPageResponse(page, (r) => toControlListItem(r, view === 'technical')));
  }

  // MD-177 · La vista técnica de un control: todas sus pruebas con su estado (compliance-audit.md). Solo `admin_empresa` y `auditor` (D81); el caso de uso responde 403 a otro rol.
  @ApiOperation({ summary: 'Pruebas de un control', description: 'Las pruebas que verifican el control, **todas con su estado**, también las que aún no tienen activos conectados («Sin activos»). Es la vista técnica (D81): solo `admin_empresa` y `auditor`; el `responsable`, el `delegado` y `admin_monkey` reciben `403`. `shared_with` son los otros controles del servicio que llevan la prueba, cuyo veredicto vale en todos (D85); en una prueba documental va vacío (D88). `last_verdict` es el último veredicto del `admin_empresa` sobre una prueba manual no documental. `ai_suggestion` hoy es siempre `null`. Paginada.' })
  @ApiPaged(ControlTestItemResponse, 'Página de pruebas del control.')
  @Get('controls/:id/tests')
  async tests(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() q: ListControlTestsQuery) {
    const page = await this.listControlTests.execute(principal, id, q.page, q.page_size);
    return new ResponseDto(HttpStatus.OK, t('control_test.list'), toPageResponse(page, (i) => toControlTestItem(i, t)));
  }

  // MD-150 · Solo el administrador de la empresa crea un control propio.
  @ApiOperation({ summary: 'Crear un control propio', description: 'Solo `admin_empresa`. Crea un control propio del servicio (origen `own`, numeración `C01`…): es solo documental, por eso su única dimensión es `policy`. Nace `approved` y cuenta desde el primer momento (D96). Queda registro de auditoría.' })
  @ApiData(ControlDetailResponse, 'Control propio creado.', { status: 201 })
  @Post('services/:serviceId/controls')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() principal: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: CreateControlDto, @Req() req: Request) {
    const meta: RequestMeta = { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' };
    const detail = await this.createControl.execute(principal, serviceId, dto, meta);
    return new ResponseDto(HttpStatus.CREATED, t('control.created'), toControlDetail(detail, t));
  }

  @ApiOperation({ summary: 'Detalle de un control', description: 'Estado, avance y cobertura; interpretación, dimensiones, evidencias requeridas con su última entrega, causas que trata y en qué falla. Un `responsable` que no tiene el control asignado recibe 403. Con `view=technical` (solo `auditor` y `admin_empresa`) agrega el bloque `technical`.' })
  @ApiData(ControlDetailResponse, 'Detalle del control.')
  @Get('controls/:id')
  async detail(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() q: GetControlQuery) {
    const detail = await this.getControl.execute(principal, id, q.view);
    return new ResponseDto(HttpStatus.OK, t('control.read'), toControlDetail(detail, t));
  }

  @ApiOperation({ summary: 'Editar un control', description: 'Solo `admin_empresa` (D96). Cambia la interpretación o las dimensiones **al instante**, sin propuesta ni aprobación; las dos cosas pueden ir juntas. Una dimensión con `applies: false` exige `reason_not_applicable`. Un control propio solo admite la dimensión `policy`. Si cambia lo que se mide deja un evento de cumplimiento. Queda registro de auditoría con el antes y el después.' })
  @ApiData(ControlDetailResponse, 'Control ya cambiado.')
  @ApiDomainErrors('CONTROL_RETIRED')
  @Patch('controls/:id')
  @Roles('admin_empresa')
  async update(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Body() dto: EditClientControlDto, @Req() req: Request) {
    const meta: RequestMeta = { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' };
    const detail = await this.updateControl.execute(principal, id, dto, meta);
    return new ResponseDto(HttpStatus.OK, t('control.updated'), toControlDetail(detail, t));
  }

  @ApiOperation({ summary: 'Dar de baja un control', description: 'Solo `admin_empresa` (D96). Es una **baja**, no un borrado: el control deja de contar y de verse en las listas, y el histórico (evaluaciones, evidencias, auditoría) se conserva. Darlo de baja dos veces es `409 CONTROL_RETIRED`. La API no pide confirmación: el `DELETE` es el acto confirmado. Queda registro de auditoría y evento de cumplimiento.' })
  @ApiNoBody('Control dado de baja.')
  @ApiDomainErrors('CONTROL_RETIRED')
  @Delete('controls/:id')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.NO_CONTENT)
  async retire(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    const meta: RequestMeta = { ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' };
    await this.retireControl.execute(principal, id, meta);
  }
}
