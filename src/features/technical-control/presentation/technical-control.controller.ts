import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { ServiceAssetsDto } from '../application/dtos/technical-control.dtos';
import { SetServiceAssetsUseCase } from '../application/use-cases/asset.use-cases';
import { GetTechnicalControlUseCase } from '../application/use-cases/service-technical-control.use-cases';
import { ConnectionProbe } from '../domain/ports/connection-probe';
import { toTechnicalControlResponse } from './technical-control-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData } from '../../../common/swagger/api-envelope';
import { ServiceAssetsResultResponse, TechnicalControlStateResponse } from './technical-control.responses';
import { clientIp } from '../../../common/http/client-ip';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Componente 3, parte del servicio: las conexiones que ofrece y los activos que son del servicio
// (contracts/modules/onboarding-technical-control.md). Solo admin_empresa.
@ApiTags(API_TAGS.technicalControl)
@Roles('admin_empresa')
@Controller('services/:id')
export class TechnicalControlController {
  constructor(
    private readonly getState: GetTechnicalControlUseCase,
    private readonly setServiceAssets: SetServiceAssetsUseCase,
    private readonly probe: ConnectionProbe,
  ) {}

  // Todo lo del paso 3 de un servicio en una sola lectura: lo necesita la pantalla al abrir.
  @ApiOperation({ summary: 'Estado del control técnico de un servicio', description: 'Todo lo del paso 3 en una sola lectura: las conexiones que el cliente puede registrar (todas las del catálogo; él elige la plataforma) y el modo de la sonda. La pantalla lo pide al abrir.' })
  @ApiData(TechnicalControlStateResponse, 'Conexiones disponibles y modo de la sonda.')
  @Get('technical-control')
  async state(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    const state = await this.getState.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('technical_control.state'), toTechnicalControlResponse(state, this.probe.mode));
  }

  // Los activos de una conexión que son de ESTE servicio (D61). Fija el conjunto exacto: lo que no viene, queda fuera.
  @ApiOperation({ summary: 'Fijar los activos de una conexión que son de este servicio', description: 'Una conexión descubre muchos activos (D61); aquí se declara cuáles pertenecen a **este** servicio. Fija el conjunto exacto: lo que no viene, queda fuera. Máximo 500.' })
  @ApiData(ServiceAssetsResultResponse, 'Conjunto guardado y cuántos se agregaron o quitaron.')
  @Put('connections/:connectionId/assets')
  @HttpCode(HttpStatus.OK)
  async serviceAssets(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Param('connectionId', idPipe) connectionId: string,
    @Body() dto: ServiceAssetsDto,
    @Req() req: Request,
  ) {
    const result = await this.setServiceAssets.execute(principal, id, connectionId, dto.asset_ids, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('technical_control.assets_saved'), { included: result.total, added: result.added, removed: result.removed });
  }
}
