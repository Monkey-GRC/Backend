import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Can } from '../../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { RequestMeta } from '../../../../common/http/request-meta';
import { toPageResponse } from '../../../../common/pagination/page';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../../common/swagger/api-envelope';
import { IssueVerdictDto, ListVerdictsQuery, ReviewVerdictDto } from '../../application/verdicts/verdict.dto';
import { IssueVerdictUseCase, ListVerdictsUseCase, ReviewVerdictUseCase } from '../../application/verdicts/verdict.use-cases';
import { toVerdict } from './verdict-response.mapper';
import { VerdictResponse } from './verdict.responses';
import { clientIp } from '../../../../common/http/client-ip';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// El veredicto de un test manual que no es documental (contracts/cumplimiento/veredictos.md, D85, D102, D121). Lo registra el ejecutor, el dueño o el admin_empresa y lo revisan el dueño y el
// admin_empresa; el historial lo leen el admin_empresa, el auditor y el dueño y ejecutor del control. Es del test en el servicio: cuenta en todos los controles que lo llevan, si está aprobado.
@ApiTags(API_TAGS.controls)
@Controller()
export class VerdictsController {
  constructor(private readonly issue: IssueVerdictUseCase, private readonly review: ReviewVerdictUseCase, private readonly list: ListVerdictsUseCase) {}

  @ApiOperation({
    summary: 'Registrar el veredicto de un test manual',
    description:
      '`admin_empresa`, el dueño (`responsable`) o el ejecutor (`delegado`) del control (D102, D121); el resto, 403. Aplica a las pruebas **manuales que no son documentales** (p. ej. la validación manual complementaria de una prueba técnica): una automática la mide la sonda (`409 TEST_NOT_MANUAL`) y una documental se resuelve revisando su evidencia (`409 TEST_DECIDED_BY_EVIDENCE`, D88). ' +
      'Nace `pending` y **todavía no cuenta**; si lo registra el `admin_empresa`, nace con su aprobación y cuenta al instante (P34). **El veredicto es del test en el servicio** (D85): una vez aprobado cuenta en todos los controles que lo llevan y sobre todos los activos de su dimensión; `control_id` es el control de origen. Es inmutable (el anterior se conserva). ' +
      'Un test sin veredicto aprobado está pendiente y no cuenta como cumplido. Si cambia el estado de algún control, queda su evento de cumplimiento (D91). Queda registro de auditoría en la misma transacción.',
  })
  @ApiData(VerdictResponse, 'El veredicto registrado, con su estado, quién lo registró y el estado del test.', { status: 201 })
  @ApiDomainErrors('TEST_NOT_MANUAL', 'TEST_DECIDED_BY_EVIDENCE', 'TEST_HAS_NO_ASSETS', 'CONTROL_RETIRED')
  @Post('controls/:controlId/tests/:testId/verdicts')
  @Can('verdicts.register')
  @HttpCode(HttpStatus.CREATED)
  async issueVerdict(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('testId', idPipe) testId: string, @Body() dto: IssueVerdictDto, @Req() req: Request) {
    const issued = await this.issue.execute(p, controlId, testId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('verdict.issued'), toVerdict(issued));
  }

  @ApiOperation({
    summary: 'Revisar un veredicto',
    description:
      'El dueño del control de origen (si no lo registró él) y el `admin_empresa` (siempre, también lo suyo). El ejecutor, el auditor, `admin_monkey` y un responsable ajeno, 403. El rol lo fija el servidor. Una revisión por rol: un segundo `PUT` del mismo rol la reemplaza. ' +
      'Estado: algún rechazo es `rejected`; sin rechazos y con una aprobación, `approved`. Rechazar exige `note` (`422 note.required`). Solo se revisa el último veredicto del test en el servicio (`409 VERDICT_SUPERSEDED`). Queda registro de auditoría.',
  })
  @ApiData(VerdictResponse, 'El veredicto con su estado combinado y sus revisiones.')
  @ApiDomainErrors('VERDICT_SUPERSEDED')
  @Put('verdicts/:verdictId/review')
  @Can('verdicts.review')
  async reviewVerdict(@CurrentUser() p: Principal, @Param('verdictId', idPipe) verdictId: string, @Body() dto: ReviewVerdictDto, @Req() req: Request) {
    const reviewed = await this.review.execute(p, verdictId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t('verdict.reviewed'), toVerdict(reviewed));
  }

  @ApiOperation({ summary: 'Historial de veredictos de un test', description: '`admin_empresa`, `auditor` y el dueño y el ejecutor del control. Los veredictos del test en el servicio, del más reciente al más antiguo, con su estado, quién los registró y sus revisiones; nunca se pisan.' })
  @ApiPaged(VerdictResponse, 'Página de veredictos.')
  @Get('controls/:controlId/tests/:testId/verdicts')
  @Can('tests.results')
  async verdicts(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('testId', idPipe) testId: string, @Query() q: ListVerdictsQuery) {
    const page = await this.list.execute(p, controlId, testId, q.page, q.page_size);
    return new ResponseDto(HttpStatus.OK, t('verdict.list'), toPageResponse(page, toVerdict));
  }
}
