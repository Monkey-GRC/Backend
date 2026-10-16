import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { toPageResponse } from '../../../common/pagination/page';
import { CreateTreatmentDto, EvaluateRiskDto, HistoryQuery } from '../application/dtos/risk-assessment.dto';
import {
  CreateTreatmentUseCase, EvaluateRiskUseCase, EvaluationHistoryUseCase, ListTreatmentsUseCase,
} from '../application/use-cases/risk-assessment.use-cases';
import { toEvaluationEntry, toRiskTreatment } from './risk-response.mapper';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// Evaluación 5×5 y tratamiento de un riesgo (contracts/modules/compliance-risks.md, MD-123). Evalúa y trata solo el administrador de la empresa; el consultor y el
// auditor leen. El `funcional` lee los tratamientos de un riesgo suyo, pero no el historial de evaluaciones. `admin_monkey` no entra al cumplimiento de una empresa por aquí.
@ApiTags('compliance')
@ApiCookieAuth()
@Roles('admin_empresa', 'funcional', 'consultor', 'auditor')
@Controller('risks/:id')
export class RiskAssessmentController {
  constructor(
    private readonly evaluate: EvaluateRiskUseCase, private readonly history: EvaluationHistoryUseCase,
    private readonly createTreatment: CreateTreatmentUseCase, private readonly listTreatments: ListTreatmentsUseCase,
  ) {}

  @Post('evaluation')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async evaluateRisk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: EvaluateRiskDto, @Req() req: Request) {
    const done = await this.evaluate.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('risk.evaluated'), toEvaluationEntry(done));
  }

  @Get('evaluation-history')
  @Roles('admin_empresa', 'consultor', 'auditor')
  async evaluationHistory(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Query() q: HistoryQuery) {
    const page = await this.history.execute(p, id, { page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('risk.evaluation_history'), toPageResponse(page, toEvaluationEntry));
  }

  @Post('treatments')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async newTreatment(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: CreateTreatmentDto, @Req() req: Request) {
    const created = await this.createTreatment.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('risk_treatment.created'), toRiskTreatment(created));
  }

  @Get('treatments')
  async treatments(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Query() q: HistoryQuery) {
    const page = await this.listTreatments.execute(p, id, { page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('risk_treatment.list'), toPageResponse(page, toRiskTreatment));
  }
}
