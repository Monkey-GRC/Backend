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
import { CreateTreatmentDto, EvaluateRiskDto, HistoryQuery } from '../../application/risks/risk-assessment.dto';
import {
  CreateTreatmentUseCase, EvaluateRiskUseCase, EvaluationHistoryUseCase, ListTreatmentsUseCase,
} from '../../application/risks/risk-assessment.use-cases';
import { toEvaluationEntry, toRiskTreatment } from './risk-response.mapper';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../../common/swagger/api-envelope';
import { RiskEvaluationEntryResponse, RiskTreatmentResponse } from './risk.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// Evaluación 5×5 y tratamiento de un riesgo (contracts/modules/compliance-risks.md, MD-123). Evalúa y trata solo el administrador de la empresa; el
// auditor lee. El `responsable` lee los tratamientos de un riesgo suyo, pero no el historial de evaluaciones. `admin_monkey` no entra al cumplimiento de una empresa por aquí.
@ApiTags(API_TAGS.riskAssessment)
@Roles('admin_empresa', 'responsable', 'auditor')
@Controller('risks/:id')
export class RiskAssessmentController {
  constructor(
    private readonly evaluate: EvaluateRiskUseCase, private readonly history: EvaluationHistoryUseCase,
    private readonly createTreatment: CreateTreatmentUseCase, private readonly listTreatments: ListTreatmentsUseCase,
  ) {}

  @ApiOperation({ summary: 'Evaluar un riesgo', description: 'Solo `admin_empresa`. Registra la probabilidad y el impacto (1 a 5). **El valor y el nivel los calcula el servidor**; si el cliente los envía, se ignoran. Cada evaluación queda en el historial con la anterior. Queda registro de auditoría.' })
  @ApiData(RiskEvaluationEntryResponse, 'Evaluación registrada.', { status: 201 })
  @ApiDomainErrors('RISK_INACTIVE')
  @Post('evaluation')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async evaluateRisk(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: EvaluateRiskDto, @Req() req: Request) {
    const done = await this.evaluate.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('risk.evaluated'), toEvaluationEntry(done));
  }

  @ApiOperation({ summary: 'Historial de evaluaciones de un riesgo', description: 'De la más reciente a la más antigua, cada una con la evaluación anterior. Lo leen `admin_empresa` y `auditor`; el `responsable` no.' })
  @ApiPaged(RiskEvaluationEntryResponse, 'Página del historial.')
  @Get('evaluation-history')
  @Roles('admin_empresa', 'auditor')
  async evaluationHistory(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Query() q: HistoryQuery) {
    const page = await this.history.execute(p, id, { page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('risk.evaluation_history'), toPageResponse(page, toEvaluationEntry));
  }

  @ApiOperation({ summary: 'Registrar un tratamiento', description: 'Solo `admin_empresa`. La decisión sobre el riesgo (mitigar, aceptar, transferir o evitar), con su responsable (un cargo, no una persona con cuenta) y su fecha límite, que no puede estar en el pasado. El último tratamiento es el vigente. Queda registro de auditoría.' })
  @ApiData(RiskTreatmentResponse, 'Tratamiento registrado.', { status: 201 })
  @ApiDomainErrors('RISK_INACTIVE')
  @Post('treatments')
  @Roles('admin_empresa')
  @HttpCode(HttpStatus.CREATED)
  async newTreatment(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: CreateTreatmentDto, @Req() req: Request) {
    const created = await this.createTreatment.execute(p, id, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('risk_treatment.created'), toRiskTreatment(created));
  }

  @ApiOperation({ summary: 'Historial de tratamientos de un riesgo', description: 'Todas las decisiones tomadas sobre el riesgo, de la más reciente a la más antigua. El `responsable` lee las de un riesgo suyo.' })
  @ApiPaged(RiskTreatmentResponse, 'Página de tratamientos.')
  @Get('treatments')
  async treatments(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Query() q: HistoryQuery) {
    const page = await this.listTreatments.execute(p, id, { page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('risk_treatment.list'), toPageResponse(page, toRiskTreatment));
  }
}
