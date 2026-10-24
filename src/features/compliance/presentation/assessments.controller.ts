import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../common/swagger/api-envelope';
import { IssueAssessmentDto, ListAssessmentsQuery } from '../application/dtos/assessment.dto';
import { IssueAssessmentUseCase, ListAssessmentsUseCase } from '../application/use-cases/assessment.use-cases';
import { toAssessment } from './assessment-response.mapper';
import { AssessmentResponse } from './assessment.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
// 404 también cuando el id no es un UUID: no hay nada que encontrar.
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// La evaluación del consultor y la del auditor sobre un servicio y un marco (contracts/modules/compliance-overview.md, D77, MD-155). Cada rol emite solo la suya (SEG-56).
@ApiTags(API_TAGS.overview)
@Roles('consultor', 'auditor')
@Controller()
export class AssessmentsController {
  constructor(private readonly issue: IssueAssessmentUseCase, private readonly list: ListAssessmentsUseCase) {}

  @ApiOperation({
    summary: 'Emitir la evaluación del servicio',
    description:
      'Solo `consultor` y `auditor`, **cada uno la suya**: el rol sale de la sesión y el cuerpo no lo lleva. El consultor emite `ready` (lista para la auditoría) o `not_ready`; el auditor, `certified` o `not_certified`. ' +
      'Emitir el valor del otro rol responde `403`; un valor que no existe, `422 enum.invalid`. `rationale` es obligatoria. Queda ligada a la evaluación del servicio (marco, versión, período y fecha de corte) y **congela la fecha de corte** si no lo estaba; ' +
      'desde entonces el período no se puede cambiar (`409 EVALUATION_ALREADY_ISSUED`). Una vez emitida no se edita ni se borra: se emite otra y la vigente es la última de ese rol. **No cambia el estado calculado.**',
  })
  @ApiData(AssessmentResponse, 'La evaluación emitida.', { status: 201 })
  @ApiDomainErrors('EVALUATION_NOT_DEFINED')
  @Post('services/:serviceId/frameworks/:frameworkCode/assessments')
  @HttpCode(HttpStatus.CREATED)
  async issueAssessment(
    @CurrentUser() p: Principal,
    @Param('serviceId', idPipe) serviceId: string,
    @Param('frameworkCode') frameworkCode: string,
    @Body() dto: IssueAssessmentDto,
    @Req() req: Request,
  ) {
    const issued = await this.issue.execute(p, serviceId, frameworkCode, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('assessment.issued'), toAssessment(issued));
  }

  @ApiOperation({ summary: 'Evaluaciones del servicio', description: 'Solo `consultor` y `auditor`. La más reciente primero; `current=true` deja solo la vigente de cada rol.' })
  @ApiPaged(AssessmentResponse, 'Página de evaluaciones.')
  @Get('services/:serviceId/frameworks/:frameworkCode/assessments')
  async assessments(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string, @Param('frameworkCode') frameworkCode: string, @Query() q: ListAssessmentsQuery) {
    const page = await this.list.execute(p, serviceId, frameworkCode, { assessorRole: q.assessor_role, current: q.current }, q.page, q.page_size);
    return new ResponseDto(HttpStatus.OK, t('assessment.list'), toPageResponse(page, toAssessment));
  }
}
