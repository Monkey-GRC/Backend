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
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { DeploymentScenarioDto, ServiceAssetsDto } from '../application/dtos/technical-control.dtos';
import { SetServiceAssetsUseCase } from '../application/use-cases/asset.use-cases';
import {
  GetTechnicalControlUseCase,
  SetDeploymentScenarioUseCase,
} from '../application/use-cases/service-technical-control.use-cases';
import { ConnectionProbe } from '../domain/ports/connection-probe';
import {
  toDeploymentScenarioResponse,
  toTechnicalControlResponse,
} from './technical-control-response.mapper';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Componente 3, parte del servicio: escenario de despliegue y scope declarado
// (contracts/modules/onboarding-technical-control.md). Solo admin_empresa.
@ApiTags('technical-control')
@ApiCookieAuth()
@Roles('admin_empresa')
@Controller('services/:id')
export class TechnicalControlController {
  constructor(
    private readonly getState: GetTechnicalControlUseCase,
    private readonly setScenario: SetDeploymentScenarioUseCase,
    private readonly setServiceAssets: SetServiceAssetsUseCase,
    private readonly probe: ConnectionProbe,
  ) {}

  // Todo lo del paso 3 de un servicio en una sola lectura: lo necesita la pantalla al abrir.
  @Get('technical-control')
  async state(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    const state = await this.getState.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('technical_control.state'), toTechnicalControlResponse(state, this.probe.mode));
  }

  @Put('deployment-scenario')
  @HttpCode(HttpStatus.OK)
  async deploymentScenario(
    @CurrentUser() principal: Principal,
    @Param('id', idPipe) id: string,
    @Body() dto: DeploymentScenarioDto,
    @Req() req: Request,
  ) {
    const state = await this.setScenario.execute(principal, id, dto.deployment_scenario, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('deployment_scenario.saved'), toDeploymentScenarioResponse(state));
  }

  // Los activos de una conexión que son de ESTE servicio (D61). Fija el conjunto exacto: lo que no viene, queda fuera.
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
