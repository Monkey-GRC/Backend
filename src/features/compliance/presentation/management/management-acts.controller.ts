import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { Can } from '../../../../common/authorization/can.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { DomainError } from '../../../../common/errors/domain-error';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { clientIp } from '../../../../common/http/client-ip';
import { RequestMeta } from '../../../../common/http/request-meta';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { toPageResponse } from '../../../../common/pagination/page';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../../common/swagger/api-envelope';
import { DeclareNoOccurrencesDto, NotApplicableRequestDto, ProposeLevelDto, RegisterOccurrenceDto, RegisterPlanDto, RequestDecisionDto } from '../../application/management/acts.dto';
import {
  DecideLevelOverrideUseCase, DecideNotApplicableUseCase, DecideRemediationPlanUseCase, DeclareNoOccurrencesUseCase, ProposeLevelOverrideUseCase, RegisterOccurrenceUseCase, RegisterRemediationPlanUseCase,
  RequestNotApplicableUseCase, RevertNotApplicableUseCase,
} from '../../application/management/management-acts.use-cases';
import { ListManagementHistoryUseCase, ListOccurrencesUseCase, ManagementHistoryQuery, OccurrencesQuery } from '../../application/management/management-history.use-cases';
import type { Dimension } from '../../domain/controls/control-readout';
import { neutralName } from '../controls/control-response.mapper';
import { person, toApplicabilityRequest, toDeclaration, toLevelOverride, toOccurrence, toPlan } from './management-acts.mapper';
import { ManagementHistoryItemResponse, LevelOverrideResponse, NoOccurrenceDeclarationResponse, NotApplicableRequestResponse, OccurrenceResponse, RemediationPlanResponse } from './management-acts.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });
const nameOf = (test: Parameters<typeof neutralName>[0] & { dimension: Parameters<typeof neutralName>[1] }) => neutralName(test, test.dimension, t);

const DECIDE_ERRORS = ['ALREADY_DECIDED', 'REQUEST_NO_LONGER_VALID'] as const;
const NOTE_WHO = 'Quien lleva el control es el responsable dueño; si el control no tiene responsable o lo es el `admin_empresa`, lo lleva el `admin_empresa`, y lo que propone vale directo.';

// Corrección del nivel (R5), plan de remediación, «No aplica» y ocurrencias (contracts/cumplimiento/aprobacion.md, «Lo nuevo de MD-529», D135, D140, D131).
@ApiTags(API_TAGS.controls)
@Controller()
export class ManagementActsController {
  constructor(
    private readonly proposeLevel: ProposeLevelOverrideUseCase,
    private readonly decideLevel: DecideLevelOverrideUseCase,
    private readonly registerPlan: RegisterRemediationPlanUseCase,
    private readonly decidePlan: DecideRemediationPlanUseCase,
    private readonly requestNa: RequestNotApplicableUseCase,
    private readonly decideNa: DecideNotApplicableUseCase,
    private readonly revertNa: RevertNotApplicableUseCase,
    private readonly registerOccurrence: RegisterOccurrenceUseCase,
    private readonly declareNone: DeclareNoOccurrencesUseCase,
    private readonly history: ListManagementHistoryUseCase,
    private readonly occurrences: ListOccurrencesUseCase,
  ) {}

  @ApiOperation({
    summary: 'Proponer un nivel final distinto del sugerido (R5)',
    description:
      `${NOTE_WHO} El nivel final reemplaza al sugerido en \`complies\`, el estado de gestión, el rollup y el riesgo cuando se aprueba. Con un sugerido de 1 a 3 solo se puede proponer otro de 1 a 3 (\`409 LEVEL_CHANGE_NOT_ALLOWED\`); con 4 o 5, cualquiera de 1 a 5; nunca \`not_evaluated\` (\`422 proposed_level.invalid\`) ni con un sugerido \`not_evaluated\` (\`409 LEVEL_NOT_EVALUATED\`). Una sola pendiente por control (\`409 LEVEL_OVERRIDE_ALREADY_PENDING\`). Bajar de cumple a no cumple quita las aprobaciones del control. Queda en el registro de auditoría.`,
  })
  @ApiData(LevelOverrideResponse, 'La propuesta, `pending` o `approved` si la hizo el administrador que lleva el control.', { status: 201 })
  @ApiDomainErrors('LEVEL_NOT_EVALUATED', 'LEVEL_CHANGE_NOT_ALLOWED', 'LEVEL_OVERRIDE_ALREADY_PENDING')
  @Post('controls/:controlId/level-overrides')
  @Can('controls.propose_level')
  @HttpCode(HttpStatus.CREATED)
  async propose(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Body() dto: ProposeLevelDto, @Req() req: Request) {
    const out = await this.proposeLevel.execute(p, controlId, dto, metaOf(req));
    const record = out.readout.control.extras?.overrides.find((o) => o.id === out.id);
    if (!record) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.CREATED, t('approval.level_override_proposed'), toLevelOverride(record, out.readout, true));
  }

  @ApiOperation({ summary: 'Aprobar o rechazar la propuesta de nivel', description: 'Solo el `admin_empresa`. Aprobar aplica el nivel final y, si el control deja de cumplir, le quita las aprobaciones; rechazar exige `reason` (`422 reason.required`). Queda en el registro de auditoría.' })
  @ApiData(LevelOverrideResponse, 'La propuesta ya decidida.')
  @ApiDomainErrors(...DECIDE_ERRORS)
  @Post('level-overrides/:id/decision')
  @Can('controls.decide_level')
  @HttpCode(HttpStatus.OK)
  async decideOverride(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: RequestDecisionDto, @Req() req: Request) {
    const out = await this.decideLevel.execute(p, id, dto, metaOf(req));
    const record = out.readout.control.extras?.overrides.find((o) => o.id === id);
    if (!record) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.OK, t('approval.level_override_decided'), toLevelOverride(record, out.readout, true));
  }

  @ApiOperation({
    summary: 'Registrar el plan de remediación de una excepción',
    description: `${NOTE_WHO} Uno por cada prueba en excepción: qué se hará, quién (persona activa de la empresa) y para cuándo. Parcial exige un plan aprobado por cada excepción. Un plan vencido sigue contando (solo \`is_overdue\`).`,
  })
  @ApiData(RemediationPlanResponse, 'El plan, `pending` o `approved` si lo registró el administrador que lleva el control.', { status: 201 })
  @ApiDomainErrors('TEST_NOT_IN_EXCEPTION', 'PLAN_ALREADY_EXISTS')
  @Post('controls/:controlId/remediation-plans')
  @Can('controls.plan_register')
  @HttpCode(HttpStatus.CREATED)
  async plan(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Body() dto: RegisterPlanDto, @Req() req: Request) {
    const out = await this.registerPlan.execute(p, controlId, dto, metaOf(req));
    const record = out.readout.control.extras?.plans.find((x) => x.id === out.id);
    if (!record) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.CREATED, t('approval.plan_registered'), toPlan(record, out.readout, nameOf, new Date(), true));
  }

  @ApiOperation({ summary: 'Aprobar o rechazar el plan de remediación', description: 'Solo el `admin_empresa`. Rechazar exige `reason`. Un plan rechazado se vuelve a registrar con un `POST` nuevo.' })
  @ApiData(RemediationPlanResponse, 'El plan ya decidido.')
  @ApiDomainErrors(...DECIDE_ERRORS)
  @Post('remediation-plans/:id/decision')
  @Can('controls.plan_decide')
  @HttpCode(HttpStatus.OK)
  async decidePlanRoute(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: RequestDecisionDto, @Req() req: Request) {
    const out = await this.decidePlan.execute(p, id, dto, metaOf(req));
    const record = out.readout.control.extras?.plans.find((x) => x.id === id);
    if (!record) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.OK, t('approval.plan_decided'), toPlan(record, out.readout, nameOf, new Date(), true));
  }

  @ApiOperation({
    summary: 'Pedir «No aplica» para un requisito',
    description: `${NOTE_WHO} Aprobado, el requisito sale del denominador del C%. No se puede pedir sobre el último requisito aplicable (\`409 LAST_APPLICABLE_REQUIREMENT\`).`,
  })
  @ApiData(NotApplicableRequestResponse, 'La solicitud, `pending` o `approved` si la hizo el administrador que lleva el control.', { status: 201 })
  @ApiDomainErrors('ALREADY_NOT_APPLICABLE', 'REQUEST_ALREADY_PENDING', 'LAST_APPLICABLE_REQUIREMENT')
  @Post('controls/:controlId/requirements/:requirementId/not-applicable-requests')
  @Can('controls.na_request')
  @HttpCode(HttpStatus.CREATED)
  async requestNotApplicable(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('requirementId', idPipe) requirementId: string, @Body() dto: NotApplicableRequestDto, @Req() req: Request) {
    const out = await this.requestNa.execute(p, controlId, requirementId, dto, metaOf(req));
    const record = out.readout.control.extras?.applicability.get(requirementId)?.find((x) => x.id === out.id);
    if (!record) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.CREATED, t('approval.not_applicable_requested'), toApplicabilityRequest(record, out.readout, true));
  }

  @ApiOperation({ summary: 'Aprobar o rechazar el «No aplica»', description: 'Solo el `admin_empresa`. Aprobar recalcula el C%, el nivel y el estado de gestión del control; rechazar exige `reason`.' })
  @ApiData(NotApplicableRequestResponse, 'La solicitud ya decidida.')
  @ApiDomainErrors(...DECIDE_ERRORS, 'LAST_APPLICABLE_REQUIREMENT')
  @Post('not-applicable-requests/:id/decision')
  @Can('controls.na_decide')
  @HttpCode(HttpStatus.OK)
  async decideNotApplicable(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: RequestDecisionDto, @Req() req: Request) {
    const out = await this.decideNa.execute(p, id, dto, metaOf(req));
    const record = [...(out.readout.control.extras?.applicability.values() ?? [])].flat().find((x) => x.id === id);
    if (!record) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.OK, t('approval.not_applicable_decided'), toApplicabilityRequest(record, out.readout, true));
  }

  @ApiOperation({ summary: 'Volver a aplicar un requisito en «No aplica»', description: 'Quien lleva el control, directo y sin aprobación (volver a medir solo endurece el control). Exige `reason`. Si el control cumplía, puede dejar de hacerlo y pierde las aprobaciones.' })
  @ApiData(NotApplicableRequestResponse, 'La solicitud ya revertida (`reverted_by` y `reverted_at`).')
  @ApiDomainErrors('NOT_NOT_APPLICABLE')
  @Post('controls/:controlId/requirements/:requirementId/not-applicable/revert')
  @Can('controls.na_request')
  @HttpCode(HttpStatus.OK)
  async revert(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('requirementId', idPipe) requirementId: string, @Body() dto: NotApplicableRequestDto, @Req() req: Request) {
    const out = await this.revertNa.execute(p, controlId, requirementId, dto, metaOf(req));
    const record = out.readout.control.extras?.applicability.get(requirementId)?.find((x) => x.id === out.id);
    if (!record) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.OK, t('approval.not_applicable_reverted'), toApplicabilityRequest(record, out.readout, true));
  }

  @ApiOperation({ summary: 'Registrar una ocurrencia de un requisito «cuando sea requerido»', description: 'El ejecutor, el dueño o el `admin_empresa`. La ocurrencia exige su evidencia (`POST /v1/controls/{id}/tests/{test_id}/evidence` con `occurrence_id`). Si el trimestre tenía una declaración de «sin ocurrencias», queda sin efecto.' })
  @ApiData(OccurrenceResponse, 'La ocurrencia registrada.', { status: 201 })
  @ApiDomainErrors('REQUIREMENT_NOT_ON_DEMAND')
  @Post('controls/:controlId/requirements/:requirementId/occurrences')
  @Can('evidence.upload')
  @HttpCode(HttpStatus.CREATED)
  async occurrence(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('requirementId', idPipe) requirementId: string, @Body() dto: RegisterOccurrenceDto, @Req() req: Request) {
    const out = await this.registerOccurrence.execute(p, controlId, requirementId, dto, metaOf(req));
    const record = out.readout.control.extras?.occurrences.get(requirementId)?.find((x) => x.id === out.id);
    const requirement = out.readout.requirements.find((r) => r.requirement.id === requirementId)?.requirement;
    if (!record || !requirement) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.CREATED, t('approval.occurrence_registered'), toOccurrence(record, requirement));
  }

  @ApiOperation({ summary: 'Declarar «sin ocurrencias» en el trimestre', description: `${NOTE_WHO} Vale para el trimestre abierto; con ocurrencias ya registradas, \`409 OCCURRENCES_EXIST\`. Sin ocurrencias ni declaración, el trimestre cerrado deja el requisito Vencido.` })
  @ApiData(NoOccurrenceDeclarationResponse, 'La declaración.', { status: 201 })
  @ApiDomainErrors('REQUIREMENT_NOT_ON_DEMAND', 'OCCURRENCES_EXIST', 'ALREADY_DECLARED')
  @Post('controls/:controlId/requirements/:requirementId/no-occurrence-declarations')
  @Can('controls.declare_no_occurrences')
  @HttpCode(HttpStatus.CREATED)
  async declare(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('requirementId', idPipe) requirementId: string, @Body() dto: DeclareNoOccurrencesDto, @Req() req: Request) {
    const out = await this.declareNone.execute(p, controlId, requirementId, dto, metaOf(req));
    const record = out.readout.control.extras?.declarations.get(requirementId)?.find((x) => x.id === out.id);
    const requirement = out.readout.requirements.find((r) => r.requirement.id === requirementId)?.requirement;
    if (!record || !requirement) throw new DomainError('NOT_FOUND');
    return new ResponseDto(HttpStatus.CREATED, t('approval.no_occurrences_declared'), toDeclaration(record, requirement));
  }

  @ApiOperation({ summary: 'Listar las ocurrencias de un requisito «cuando sea requerido»', description: 'Mismas reglas de lectura que el detalle del control: `admin_empresa` y `auditor`, todas; `responsable` y `delegado`, solo las de sus controles (`403` en otro). Paginada, la más reciente primero.' })
  @ApiPaged(OccurrenceResponse, 'Página de ocurrencias, cada una con el número de entregas de evidencia vigentes.')
  @ApiDomainErrors('FORBIDDEN')
  @Get('controls/:controlId/requirements/:requirementId/occurrences')
  @Can('controls.view')
  async listOccurrences(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('requirementId', idPipe) requirementId: string, @Query() q: OccurrencesQuery) {
    const r = await this.occurrences.execute(p, controlId, requirementId, q);
    return new ResponseDto(HttpStatus.OK, t('approval.occurrence_list'), toPageResponse(r.page, (o) => toOccurrence(o, r.requirement)));
  }

  @ApiOperation({
    summary: 'Historial de gestión de un control',
    description: 'Cada acto con quién y cuándo: aprobaciones, devoluciones (con motivo y evidencias devueltas), aprobaciones sin efecto, resultados manuales, propuestas y decisiones de nivel, planes, «No aplica», ocurrencias y declaraciones. Paginada en la base, la más reciente primero. Mismas reglas de lectura que el detalle; un control dado de baja se sigue leyendo (D119). Los niveles solo salen para `auditor`, `admin_empresa` y el responsable dueño; para los demás van en `null`.',
  })
  @ApiPaged(ManagementHistoryItemResponse, 'Página de actos de gestión.')
  @ApiDomainErrors('FORBIDDEN')
  @Get('controls/:controlId/management-history')
  @Can('controls.view')
  async managementHistory(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Query() q: ManagementHistoryQuery) {
    const page = await this.history.execute(p, controlId, q);
    return new ResponseDto(
      HttpStatus.OK, t('approval.history_list'),
      toPageResponse(page, (r) => ({
        id: r.id, type: r.type, at: r.at.toISOString(), actor: r.actor ? person(r.actor) : null,
        test: r.test ? { id: r.test.id, code: r.test.code, display_name: neutralName({ displayName: r.test.testName, displayNameEn: r.test.testNameEn }, r.test.dimension as Dimension, t) } : null,
        requirement: r.requirement, detail: r.detail,
      })),
    );
  }
}
