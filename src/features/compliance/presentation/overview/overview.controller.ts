import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { GetControlQuery } from '../../application/controls/list-controls.query';
import { GetOverviewUseCase } from '../../application/overview/get-overview.use-case';
import { toOverview } from './overview-response.mapper';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData } from '../../../../common/swagger/api-envelope';
import { ComplianceOverviewResponse } from './overview.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// El resumen de cumplimiento de un servicio (contracts/modules/compliance-overview.md, MD-137). `admin_monkey` no entra al cumplimiento de una empresa por aquí. La vista
// técnica la restringe el caso de uso: `auditor` y `admin_empresa` (D81, D96).
@ApiTags(API_TAGS.overview)
@Roles('admin_empresa', 'funcional', 'auditor')
@Controller()
export class OverviewController {
  constructor(private readonly getOverview: GetOverviewUseCase) {}

  @ApiOperation({ summary: 'Resumen de cumplimiento de un servicio', description: 'Por cada marco contratado del servicio: el estado (Preparado, Casi listo, Requiere trabajo o Sin medir), el **avance** y la **cobertura juntos**, la evaluación (versión del catálogo y período) y el desglose por categoría con los controles que fallan y en qué fallan. La unidad es servicio × marco: nunca hay un número de toda la empresa. El avance informa; no decide el cumplimiento, que lo certifica la auditoría. Con `view=technical` (solo `auditor` y `admin_empresa`) agrega el bloque `technical`.' })
  @ApiData(ComplianceOverviewResponse, 'Resumen por marco y categoría.')
  @Get('services/:serviceId/compliance-overview')
  async overview(@CurrentUser() principal: Principal, @Param('serviceId', idPipe) serviceId: string, @Query() q: GetControlQuery) {
    const { view, frameworks } = await this.getOverview.execute(principal, serviceId, q.view);
    return new ResponseDto(HttpStatus.OK, t('compliance.overview'), toOverview(serviceId, frameworks, view === 'technical', t));
  }
}
