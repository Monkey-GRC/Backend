import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { ListExecutionsQuery } from '../application/dtos/runner.dtos';
import { GetAssetReadinessUseCase, ListExecutionsUseCase, QueueExecutionUseCase } from '../application/use-cases/scan.use-cases';
import { toExecutionResponse, toReadinessResponse } from './scan-response.mapper';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Operación continua de un activo de nube (contracts/modules/control-tecnico.md): evaluar ahora, historial y estado de preparación.
@ApiTags('assets')
@ApiCookieAuth()
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
  @Post('executions')
  @HttpCode(HttpStatus.ACCEPTED)
  async evaluate(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    const queued = await this.queueExecution.execute(principal, id, metaOf(req));
    return new ResponseDto(HttpStatus.ACCEPTED, t('execution.queued'), { id: queued.executionId, status: 'queued', origin: 'manual', started_at: null });
  }

  @Get('executions')
  async history(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Query() query: ListExecutionsQuery) {
    const page = await this.listExecutions.execute(principal, id, { page: query.page, pageSize: query.page_size });
    return new ResponseDto(HttpStatus.OK, t('execution.list'), toPageResponse(page, (e) => toExecutionResponse(e, t)));
  }

  @Get('readiness')
  async readiness(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    // Producción cuenta solo lo que el comité ratificó (D56); la demo y el desarrollo pueden incluir los vínculos propuestos.
    const includeProposed = this.config.get<string>('READINESS_INCLUDE_PROPOSED')?.trim().toLowerCase() === 'true';
    const out = await this.getReadiness.execute({ companyId: principal.companyId, userId: principal.userId, role: principal.role }, id, { includeProposed });
    return new ResponseDto(HttpStatus.OK, t('readiness.read'), toReadinessResponse(id, out));
  }
}
