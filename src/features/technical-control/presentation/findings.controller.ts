import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Can } from '../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { toPageResponse } from '../../../common/pagination/page';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors } from '../../../common/swagger/api-envelope';
import { ListExecutionsQuery } from '../application/dtos/runner.dtos';
import { ListFindingsUseCase } from '../application/use-cases/findings.use-cases';
import { toFindingResponse, toFindingsResponse } from './scan-response.mapper';
import { FindingsResponse } from './technical-control.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// D90, D96 · Qué falló y cómo corregirlo (contracts/modules/compliance-audit.md): para una prueba de nube de un control, lo que no cumplió la última evaluación y la guía para corregirlo.
// Lo ven el administrador, el auditor y el dueño (`responsable`) o el ejecutor (`delegado`) de ese control.
@ApiTags(API_TAGS.executions)
@Can('tests.results')
@Controller('controls/:controlId/tests/:testId/findings')
export class FindingsController {
  constructor(private readonly listFindings: ListFindingsUseCase) {}

  @ApiOperation({
    summary: 'Brechas y observaciones de una prueba',
    description:
      'Una fila por comprobación y activo de la última corrida de cada activo que mide la prueba (una cuenta de nube, un servidor con agente), con la misma regla que el motor de cumplimiento: `gap` (FAIL de una comprobación Directa sin excepción vigente), `excepted` (con excepción vigente) u `observation` (FAIL de una Complementaria). Orden: brechas por prioridad (de crítica a baja), exceptuadas y observaciones; dentro de cada grupo, por título. Trae qué se evaluó, cómo corregirlo en el idioma de la petición, la prioridad y su base, el responsable y la fecha compromiso del plan vigente (o el responsable del control) y desde cuándo falla. Nunca trae identificadores del motor ni su texto crudo. Un `responsable` o `delegado` solo lo ve si es el dueño o el ejecutor del control; si no, 403.',
  })
  @ApiData(FindingsResponse, 'Las brechas y observaciones de la prueba, paginadas.')
  @ApiDomainErrors('NOT_FOUND', 'FORBIDDEN')
  @Get()
  async list(@CurrentUser() principal: Principal, @Param('controlId', idPipe) controlId: string, @Param('testId', idPipe) testId: string, @Query() query: ListExecutionsQuery) {
    const language = I18nContext.current()?.lang?.toLowerCase().startsWith('en') ? 'en' : 'es';
    const out = await this.listFindings.execute(principal, { controlId, testId, language, fallbackTitle: t('finding.untitled') }, { page: query.page, pageSize: query.page_size });
    return new ResponseDto(HttpStatus.OK, t('finding.list'), toFindingsResponse(out, toPageResponse(out.page, toFindingResponse)));
  }
}