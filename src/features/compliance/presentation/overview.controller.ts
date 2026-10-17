import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { GetControlQuery } from '../application/dtos/list-controls.query';
import { GetOverviewUseCase } from '../application/use-cases/get-overview.use-case';
import { toOverview } from './overview-response.mapper';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// El resumen de cumplimiento de un servicio (contracts/modules/compliance-overview.md, MD-137). `admin_monkey` no entra al cumplimiento de una empresa por aquí. La vista
// técnica la restringe el caso de uso: `auditor`, `consultor` y, mientras los permisos por pantalla sigan abiertos (P3), `admin_empresa` (D81).
@ApiTags('compliance')
@ApiCookieAuth()
@Roles('admin_empresa', 'funcional', 'consultor', 'auditor')
@Controller()
export class OverviewController {
  constructor(private readonly getOverview: GetOverviewUseCase) {}

  @Get('services/:serviceId/compliance-overview')
  async overview(@CurrentUser() principal: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: GetControlQuery) {
    const { view, frameworks } = await this.getOverview.execute(principal, serviceId, q.view);
    return new ResponseDto(HttpStatus.OK, t('compliance.overview'), toOverview(serviceId, frameworks, view === 'technical', t));
  }
}
