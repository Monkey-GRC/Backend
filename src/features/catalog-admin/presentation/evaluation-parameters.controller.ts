import { Body, Controller, Get, HttpStatus, Param, Patch, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { clientIp } from '../../../common/http/client-ip';
import { PARAMETER_KEYS } from '../../../common/evaluation-parameters/parameter-definitions';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiItems } from '../../../common/swagger/api-envelope';
import { UpdateEvaluationParameterDto } from '../application/dtos/evaluation-parameter.dto';
import { ListEvaluationParametersUseCase, UpdateEvaluationParameterUseCase } from '../application/use-cases/evaluation-parameters.use-cases';
import { ParameterRecord } from '../domain/repositories/evaluation-parameters.repository';
import { EvaluationParameterResponse } from './catalog-admin.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

const toParameter = (r: ParameterRecord) => ({
  key: r.key,
  code: r.code,
  name: t(`evaluation_parameter.${r.key}.name`),
  description: t(`evaluation_parameter.${r.key}.description`),
  unit: r.unit,
  value: r.value,
  default_value: r.defaultValue,
  updated_at: r.updatedAt ? r.updatedAt.toISOString() : null,
  updated_by: r.updatedBy,
});

// contracts/catalogo-maestro.md «Parámetros de evaluación (RC-19)» — exclusivo de admin_monkey. No los bloquea `CATALOG_READ_ONLY`: no son parte de la carga del catálogo v2.
@ApiTags(API_TAGS.catalogEvaluationParameters)
@Roles('admin_monkey')
@Controller('catalog/evaluation-parameters')
export class EvaluationParametersController {
  constructor(
    private readonly list: ListEvaluationParametersUseCase,
    private readonly update: UpdateEvaluationParameterUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar los parámetros de evaluación', description: 'Los parámetros del motor de evaluación (umbrales PR-01 y PR-02, frescura, avisos…), en el orden del contrato y sin paginar. Un solo valor de Monkey para todos los clientes.' })
  @ApiItems(EvaluationParameterResponse, 'Los parámetros con su valor vigente y el del libro.')
  @Get()
  async parameters(@CurrentUser() p: Principal) {
    const items = (await this.list.execute(p)).map(toParameter);
    return new ResponseDto(HttpStatus.OK, t('evaluation_parameter.list'), { items });
  }

  @ApiOperation({
    summary: 'Cambiar un parámetro de evaluación',
    description: 'Cambia el valor de UN parámetro. Se valida por su `unit` y por su clave (rangos y reglas contra el valor vigente de los otros). El valor nuevo rige desde la siguiente lectura de todos los clientes y no es retroactivo. Mandar el mismo valor responde 200 sin cambio y sin rastro. Deja auditoría `catalog.evaluation_parameter.update`.',
  })
  @ApiParam({ name: 'key', enum: [...PARAMETER_KEYS], description: 'Clave del parámetro.' })
  @ApiData(EvaluationParameterResponse, 'El parámetro ya actualizado.')
  @Patch(':key')
  async change(@CurrentUser() p: Principal, @Param('key') key: string, @Body() dto: UpdateEvaluationParameterDto, @Req() req: Request) {
    const updated = await this.update.execute(p, key, dto.value, { ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });
    return new ResponseDto(HttpStatus.OK, t('evaluation_parameter.updated'), toParameter(updated));
  }
}
