import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { Can } from '../../../../common/authorization/can.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { clientIp } from '../../../../common/http/client-ip';
import { RequestMeta } from '../../../../common/http/request-meta';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors } from '../../../../common/swagger/api-envelope';
import { ApproveControlUseCase, RegisterManualResultUseCase } from '../../application/management/management.use-cases';
import { ControlApprovalDto, ManualTestResultDto } from '../../application/management/management.dto';
import { toControlDetail } from '../controls/control-response.mapper';
import { ControlDetailResponse } from '../controls/control.responses';
import { toManualTestResult } from './management-response.mapper';
import { ManualTestResultResponse } from './management.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// Gestión y aprobación del control (contracts/cumplimiento/aprobacion.md, MD-504, D132, D140).
@ApiTags(API_TAGS.controls)
@Controller()
export class ManagementController {
  constructor(private readonly approve: ApproveControlUseCase, private readonly registerResult: RegisterManualResultUseCase) {}

  @ApiOperation({
    summary: 'Aprobar o devolver un control',
    description:
      'La primera aprobación es del responsable del control (`controls.approve_first`, celda de lo suyo); la final, del `admin_empresa`. El servidor decide el paso según quién llama: el responsable aprueba sobre `pending_approval` y el control queda `owner_approved`; ' +
      'el `admin_empresa` aprueba sobre `owner_approved` y queda `approved`, y si es el responsable del control o este no tiene responsable, aprueba directo sobre `pending_approval` (G-05). Con otro responsable, `409 OWNER_APPROVAL_REQUIRED`. ' +
      'Aprobar exige que el motor dé el 100 % (`409 CONTROL_NOT_COMPLIANT`); repetir el mismo paso es `409 ALREADY_APPROVED`. **Devolver** (desde `pending_approval` u `owner_approved`, si no `409 NOTHING_TO_RETURN`) exige `reason` (`422 reason.required`): ' +
      'el control pasa a `returned`, pierde las aprobaciones vigentes, las entregas de `returned_submission_ids` dejan de contar y se avisa al delegado y al responsable. Cada acto queda en el registro de auditoría. El delegado, el auditor, el colaborador y `admin_monkey` reciben `403`.',
  })
  @ApiData(ControlDetailResponse, 'El control con su estado de gestión ya actualizado.')
  @ApiDomainErrors('CONTROL_NOT_COMPLIANT', 'OWNER_APPROVAL_REQUIRED', 'ALREADY_APPROVED', 'NOTHING_TO_RETURN')
  @Post('controls/:controlId/approval')
  @Can('controls.approve_first')
  @HttpCode(HttpStatus.OK)
  async decide(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Body() dto: ControlApprovalDto, @Req() req: Request) {
    const detail = await this.approve.execute(p, controlId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.OK, t(dto.decision === 'approve' ? 'approval.approved' : 'approval.returned'), toControlDetail(detail, t));
  }

  @ApiOperation({
    summary: 'Registrar el resultado de una prueba manual',
    description:
      'El responsable del control; si el control no tiene responsable o este es el `admin_empresa`, lo registra el `admin_empresa`. El delegado carga la evidencia pero no registra el resultado (D140 punto 2). Aplica a las pruebas manuales (operativa, de población o técnica manual): ' +
      'una automática la resuelve el motor y una documental, su evidencia (`409 TEST_NOT_MANUAL`). También una técnica semiautomática que el motor mide con checks: el resultado cubre su parte manual y la prueba queda en el peor de los dos (D160).**El resultado es de la prueba en ese control**, no de los demás del servicio (D129): cada registro es una fila nueva e inmutable que vale en la ventana vigente. ' +
      '`observation` y `exception` exigen `note` (`422 note.required`). Responde con el estado de gestión del control después del registro. Queda registro de auditoría.',
  })
  @ApiData(ManualTestResultResponse, 'El resultado registrado y el estado de gestión del control.', { status: 201 })
  @ApiDomainErrors('TEST_NOT_MANUAL')
  @Post('controls/:controlId/tests/:testId/result')
  @Can('verdicts.register')
  @HttpCode(HttpStatus.CREATED)
  async result(@CurrentUser() p: Principal, @Param('controlId', idPipe) controlId: string, @Param('testId', idPipe) testId: string, @Body() dto: ManualTestResultDto, @Req() req: Request) {
    const saved = await this.registerResult.execute(p, controlId, testId, dto, metaOf(req));
    return new ResponseDto(HttpStatus.CREATED, t('verdict.result_registered'), toManualTestResult(saved));
  }
}
