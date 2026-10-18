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
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData } from '../../../common/swagger/api-envelope';
import { DeploymentScenarioResponse, ServiceAssetsResultResponse, TechnicalControlStateResponse } from './technical-control.responses';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// Componente 3, parte del servicio: escenario de despliegue y scope declarado
// (contracts/modules/onboarding-technical-control.md). Solo admin_empresa.
@ApiTags(API_TAGS.technicalControl)
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
  @ApiOperation({ summary: 'Estado del control técnico de un servicio', description: 'Todo lo del paso 3 en una sola lectura: el escenario de despliegue, las capacidades automáticas que aplican y si el paso está completo. La pantalla lo pide al abrir.' })
  @ApiData(TechnicalControlStateResponse, 'Escenario, capacidades aplicables y modo de la sonda.')
  @Get('technical-control')
  async state(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string) {
    const state = await this.getState.execute(principal, id);
    return new ResponseDto(HttpStatus.OK, t('technical_control.state'), toTechnicalControlResponse(state, this.probe.mode));
  }

  @ApiOperation({ summary: 'Declarar el escenario de despliegue', description: 'Dice dónde corre el servicio (nube administrada, nube con servidores, local o híbrido). De él depende qué capacidades automáticas aplican y qué conexiones puede registrar el cliente. Queda registro de auditoría.' })
  @ApiData(DeploymentScenarioResponse, 'Escenario guardado con las capacidades que le aplican.')
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
