import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { RequestMeta } from '../../../../common/http/request-meta';
import { toPageResponse } from '../../../../common/pagination/page';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../../common/swagger/api-envelope';
import { IssueVerdictDto, ListVerdictsQuery } from '../../application/verdicts/verdict.dto';
import { IssueVerdictUseCase, ListVerdictsUseCase } from '../../application/verdicts/verdict.use-cases';
import { toVerdict } from './verdict-response.mapper';
import { VerdictResponse } from './verdict.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// El veredicto de un test manual que no es documental (contracts/modules/compliance-audit.md, MD-155, D85). Lo da solo el admin_empresa (D96); el historial lo leen el admin_empresa y el
// auditor. Es del test en el servicio: cuenta en todos los controles que lo llevan.
@ApiTags(API_TAGS.controls)
@Controller()
export class VerdictsController {
  constructor(private readonly issue: IssueVerdictUseCase, private readonly list: ListVerdictsUseCase) {}

  @ApiOperation({
    summary: 'Dar el veredicto de un test manual',
    description:
      'Solo `admin_empresa` (D96). Aplica a las pruebas **manuales que no son documentales** (p. ej. la validación manual complementaria de una prueba técnica): una automática la mide la sonda (`409 TEST_NOT_MANUAL`) y una documental se resuelve revisando su evidencia (`409 TEST_DECIDED_BY_EVIDENCE`, D88). ' +
      '**El veredicto es del test en el servicio** (D85): cuenta en todos los controles que lo llevan y sobre todos los activos de su dimensión; `control_id` es el control de origen. Queda como una evaluación nueva e inmutable (la anterior se conserva) con quién la confirmó. ' +
      'Un test sin veredicto está pendiente y no cuenta como cumplido. Si cambia el estado de algún control, queda su evento de cumplimiento (D91). Queda registro de auditoría en la misma transacción.',
  })
  @ApiData(VerdictResponse, 'El veredicto registrado, con el estado del test y los controles donde cuenta.', { status: 201 })
  @ApiDomainErrors('TEST_NOT_MANUAL', 'TEST_DECIDED_BY_EVIDENCE', 'TEST_HAS_NO_ASSETS', 'CONTROL_RETIRED')
  @Post('controls/:controlId/tests/:testId/verdicts')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async issueVerdict(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('testId', idPipe) testId: string, @Body() dto: IssueVerdictDto, @Req() req: Request) {
    const issued = await this.issue.execute(p, controlId, testId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('verdict.issued'), toVerdict(issued));
  }

  @ApiOperation({ summary: 'Historial de veredictos de un test', description: 'Solo `admin_empresa` y `auditor`. Los veredictos del test, del más reciente al más antiguo; nunca se pisan.' })
  @ApiPaged(VerdictResponse, 'Página de veredictos.')
  @Get('controls/:controlId/tests/:testId/verdicts')
  @Roles('admin_empresa', 'auditor')
  async verdicts(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('testId', idPipe) testId: string, @Query() q: ListVerdictsQuery) {
    const page = await this.list.execute(p, controlId, testId, q.page, q.page_size);
    return new ResponseDto(HttpStatus.OK, t('verdict.list'), toPageResponse(page, toVerdict));
  }
}
