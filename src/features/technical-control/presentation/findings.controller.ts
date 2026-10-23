import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { toPageResponse } from '../../../common/pagination/page';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiDomainErrors, ApiPaged } from '../../../common/swagger/api-envelope';
import { ListExecutionsQuery } from '../application/dtos/runner.dtos';
import { ListFindingsUseCase } from '../application/use-cases/findings.use-cases';
import { toFindingResponse } from './scan-response.mapper';
import { FindingResponse } from './technical-control.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// D90 · Qué falló y cómo corregirlo (contracts/modules/compliance-audit.md): para una prueba de nube de un control, lo que no cumplió la última evaluación y la guía para corregirlo.
@ApiTags(API_TAGS.executions)
@Roles('admin_empresa', 'consultor', 'auditor')
@Controller('controls/:controlId/tests/:testId/findings')
export class FindingsController {
  constructor(
    private readonly listFindings: ListFindingsUseCase,
    private readonly config: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Qué falló y cómo corregirlo',
    description:
      'Lo que no cumplió la última evaluación completada de las conexiones de nube del servicio, agrupado por comprobación y de la más grave a la menos grave, con los recursos afectados y la guía para corregirlo en el idioma de la petición. La respuesta trae además `test_id` y `measured_at`. Si la guía está traducida por una IA, `is_ai_generated` es `true`. Nunca trae identificadores del motor ni su texto crudo.',
  })
  @ApiPaged(FindingResponse, 'Página de hallazgos.')
  @ApiDomainErrors('NOT_FOUND')
  @Get()
  async list(@CurrentUser() principal: Principal, @Param('controlId', idPipe) controlId: string, @Param('testId', idPipe) testId: string, @Query() query: ListExecutionsQuery) {
    const includeProposed = this.config.get<string>('READINESS_INCLUDE_PROPOSED')?.trim().toLowerCase() === 'true';
    const language = I18nContext.current()?.lang?.toLowerCase().startsWith('en') ? 'en' : 'es';
    const out = await this.listFindings.execute(principal, { controlId, testId, language, fallbackTitle: t('finding.untitled'), includeProposed }, { page: query.page, pageSize: query.page_size });
    return new ResponseDto(HttpStatus.OK, t('finding.list'), { test_id: testId, measured_at: out.measuredAt ? out.measuredAt.toISOString() : null, ...toPageResponse(out.page, toFindingResponse) });
  }
}