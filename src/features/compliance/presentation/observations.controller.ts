import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../common/swagger/api-envelope';
import { AnswerObservationDto, CreateObservationDto, ListObservationsQuery, UpdateObservationDto } from '../application/dtos/observation.dto';
import {
  AnswerObservationUseCase, CreateObservationUseCase, GetObservationUseCase, ListObservationsUseCase, UpdateObservationUseCase,
} from '../application/use-cases/observation.use-cases';
import { toObservation } from './observation-response.mapper';
import { ObservationResponse } from './observation.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// Observaciones del auditor (contracts/modules/compliance-audit.md, MD-154, D96). Las escribe, edita y cierra solo el `auditor` y solo las suyas; las responde el `admin_empresa` o el
// `funcional` responsable del control; las leen los tres (el `funcional`, solo las de sus controles). `admin_monkey` no entra. No mueven el porcentaje.
@ApiTags(API_TAGS.observations)
@Controller()
export class ObservationsController {
  constructor(
    private readonly create: CreateObservationUseCase,
    private readonly list: ListObservationsUseCase,
    private readonly get: GetObservationUseCase,
    private readonly update: UpdateObservationUseCase,
    private readonly answer: AnswerObservationUseCase,
  ) {}

  @ApiOperation({ summary: 'Registrar una observación', description: 'Solo `auditor`. Nace `open` y la empresa ya puede verla. Puede hablar del servicio completo, de un control o de una evidencia; si solo trae la evidencia, queda también en el control de esa evidencia. No mueve el porcentaje. Deja registro de auditoría en la misma transacción.' })
  @ApiData(ObservationResponse, 'Observación registrada, abierta.', { status: 201 })
  @ApiDomainErrors('CONTROL_RETIRED')
  @Post('services/:serviceId/observations')
  @Roles('auditor')
  @HttpCode(HttpStatus.CREATED)
  async register(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Body() dto: CreateObservationDto, @Req() req: Request) {
    const created = await this.create.execute(p, serviceId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('observation.created'), toObservation(created));
  }

  @ApiOperation({ summary: 'Listar las observaciones de un servicio', description: 'De la más reciente a la más antigua, con filtros por estado, tipo y control. `admin_empresa` y `auditor` las ven todas; el `funcional`, solo las de los controles de los que es responsable (las de un servicio completo, no).' })
  @ApiPaged(ObservationResponse, 'Página de observaciones.')
  @Get('services/:serviceId/observations')
  @Roles('admin_empresa', 'funcional', 'auditor')
  async observations(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: ListObservationsQuery) {
    const page = await this.list.execute(p, serviceId, { status: q.status, type: q.type, clientControlId: q.client_control_id, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('observation.list'), toPageResponse(page, toObservation));
  }

  @ApiOperation({ summary: 'Ver una observación', description: '`403` para el `funcional` si no es responsable de su control, o si es de un servicio completo.' })
  @ApiData(ObservationResponse, 'La observación.')
  @Get('observations/:id')
  @Roles('admin_empresa', 'funcional', 'auditor')
  async detail(@CurrentUser() p: Principal, @Param('id', idPipe) id: string) {
    return new ResponseDto(HttpStatus.OK, t('observation.detail'), toObservation(await this.get.execute(p, id)));
  }

  @ApiOperation({
    summary: 'Editar, cerrar o devolver una observación',
    description: 'Solo su autor (`auditor`). Una sola cosa por petición: `{ "body" }` cambia el texto mientras no esté cerrada; `{ "status": "closed" }` la cierra (solo una respondida); `{ "status": "open" }` la devuelve a la empresa porque no quedó conforme (solo una respondida). Una cerrada no se modifica ni se reabre: si hace falta algo más, se crea otra.',
  })
  @ApiData(ObservationResponse, 'Observación ya cambiada.')
  @ApiDomainErrors('OBSERVATION_CLOSED', 'INVALID_TRANSITION')
  @Patch('observations/:id')
  @Roles('auditor')
  async change(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateObservationDto, @Req() req: Request) {
    const changed = await this.update.execute(p, id, dto, metaOf(req));
    const key = dto.status === 'closed' ? 'observation.closed' : dto.status === 'open' ? 'observation.returned' : 'observation.updated';
    return new ResponseDto(HttpStatus.OK, t(key), toObservation(changed));
  }

  @ApiOperation({ summary: 'Responder una observación', description: '`admin_empresa`, o el `funcional` responsable del control. Exige `answer_note`; `answer_evidence_id` es opcional y debe ser una entrega de un control del mismo servicio. Pasa a `answered`. No cambia el porcentaje: si la respuesta es un documento, entra como evidencia y se valida por el camino de siempre.' })
  @ApiData(ObservationResponse, 'Observación respondida.')
  @ApiDomainErrors('OBSERVATION_CLOSED', 'OBSERVATION_NOT_OPEN')
  @Post('observations/:id/answer')
  @Roles('admin_empresa', 'funcional')
  @HttpCode(HttpStatus.OK)
  async reply(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: AnswerObservationDto, @Req() req: Request) {
    const answered = await this.answer.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('observation.answered'), toObservation(answered));
  }
}
