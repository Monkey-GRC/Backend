import { Body, Controller, HttpStatus, Param, ParseUUIDPipe, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { RequestMeta } from '../../../../common/http/request-meta';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData } from '../../../../common/swagger/api-envelope';
import { SetEvaluationPeriodDto } from '../../application/periods/evaluation-period.dto';
import { SetEvaluationPeriodUseCase } from '../../application/periods/evaluation-period.use-cases';
import { toEvaluationPeriod } from './evaluation-period-response.mapper';
import { EvaluationPeriodResponse } from './evaluation-period.responses';
import { clientIp } from '../../../../common/http/client-ip';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// El período auditado y la fecha de corte de un marco del servicio (contracts/modules/compliance-overview.md, D87, MD-168). Solo `admin_empresa` (D96).
@ApiTags(API_TAGS.overview)
@Roles('admin_empresa')
@Controller()
export class EvaluationPeriodController {
  constructor(private readonly setPeriod: SetEvaluationPeriodUseCase) {}

  @ApiOperation({
    summary: 'Declarar el período auditado de un marco',
    description:
      'Solo `admin_empresa`. Declara (o cambia) el período auditado —inicio y fin; pueden ser el mismo día, SOC 2 Tipo I— de un marco contratado del servicio y, si se envía `cutoff_date`, **congela** la fecha de corte. ' +
      'Sin `cutoff_date` la fecha de corte es «hoy» (sin salirse del período). La fecha de corte no reinicia nada: no borra evidencia ni veredictos. ' +
      'Con el período definido el resumen deja de responder «Sin medir» por esta causa y se pueden crear exclusiones. Reemplaza lo anterior y se puede repetir. Queda registro de auditoría con el valor anterior y el nuevo.',
  })
  @ApiData(EvaluationPeriodResponse, 'La evaluación del marco: período y fecha de corte efectiva.')
  @Put('services/:serviceId/frameworks/:frameworkCode/evaluation-period')
  async set(
    @CurrentUser() p: Principal,
    @Param('serviceId', idPipe) serviceId: string,
    @Param('frameworkCode') frameworkCode: string,
    @Body() dto: SetEvaluationPeriodDto,
    @Req() req: Request,
  ) {
    const view = await this.setPeriod.execute(p, serviceId, frameworkCode, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('evaluation_period.updated'), toEvaluationPeriod(view));
  }
}
