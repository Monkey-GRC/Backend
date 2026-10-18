import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { ListExecutionsQuery, ReadinessQuery } from '../application/dtos/runner.dtos';
import { GetAssetReadinessUseCase, ListExecutionsUseCase, QueueExecutionUseCase } from '../application/use-cases/scan.use-cases';
import { toExecutionResponse, toReadinessResponse } from './scan-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../common/swagger/api-envelope';
import { AssetReadinessResponse, ExecutionResponse, QueuedExecutionResponse } from './technical-control.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Operación continua de un activo de nube (contracts/modules/control-tecnico.md): evaluar ahora, historial y estado de preparación.
@ApiTags(API_TAGS.executions)
@Roles('admin_empresa')
@Controller('assets/:id')
export class ExecutionsController {
  constructor(
    private readonly queueExecution: QueueExecutionUseCase,
    private readonly listExecutions: ListExecutionsUseCase,
    private readonly getReadiness: GetAssetReadinessUseCase,
    private readonly config: ConfigService,
  ) {}

  // «Evaluar ahora»: deja la ejecución en cola y responde ya (202); nunca espera al motor.
  @ApiOperation({ summary: 'Evaluar ahora', description: 'Deja una evaluación en cola y responde de inmediato (202): nunca espera al motor. Una evaluación puede tardar minutos; el estado se consulta en el historial.' })
  @ApiData(QueuedExecutionResponse, 'Evaluación en cola.', { status: 202 })
  @ApiDomainErrors('ASSET_NOT_VALIDATED', 'EXECUTION_IN_PROGRESS')
  @Post('executions')
  @HttpCode(HttpStatus.ACCEPTED)
  async evaluate(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    const queued = await this.queueExecution.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.ACCEPTED, t('execution.queued'), { id: queued.executionId, status: 'queued', origin: 'manual', started_at: null });
  }

  @ApiOperation({ summary: 'Historial de evaluaciones', description: 'Las evaluaciones del activo, de la más reciente a la más antigua, con el motivo traducido si alguna falló.' })
  @ApiPaged(ExecutionResponse, 'Página de evaluaciones.')
  @Get('executions')
  async history(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() query: ListExecutionsQuery) {
    const page = await this.listExecutions.execute(principal, id, { page: query.page, pageSize: query.page_size });
    return new ResponseDto(HttpStatus.OK, t('execution.list'), toPageResponse(page, (e) => toExecutionResponse(e, t)));
  }

  @ApiOperation({ summary: 'Preparación del activo', description: 'Estado cualitativo derivado de la última evaluación completada (nunca almacenado), con la cobertura (cuánto se midió) y el avance «de lo medido» como dos números aparte, y el detalle por área. Sin ninguna evaluación completada devuelve `not_measured`: es un hueco de cobertura, no un fallo. Con `service_id` solo mide lo de ese servicio.' })
  @ApiData(AssetReadinessResponse, 'Preparación del activo y por área.')
  @Get('readiness')
  async readiness(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() query: ReadinessQuery) {
    // Producción cuenta solo lo que el comité ratificó (D56); la demo y el desarrollo pueden incluir los vínculos propuestos.
    const includeProposed = this.config.get<string>('READINESS_INCLUDE_PROPOSED')?.trim().toLowerCase() === 'true';
    const out = await this.getReadiness.execute({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, id, { includeProposed, serviceId: query.service_id });
    return new ResponseDto(HttpStatus.OK, t('readiness.read'), toReadinessResponse(id, out));
  }
}
