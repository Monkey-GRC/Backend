import { Body, Controller, HttpStatus, Put, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Can } from '../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors } from '../../../common/swagger/api-envelope';
import { SetExecutorDto, SetOwnerDto } from '../application/dtos/assignment.dto';
import { SetControlExecutorUseCase, SetControlOwnerUseCase } from '../application/use-cases/team-assignments.use-cases';
import { AssignmentUpdatedResponse } from './team.responses';
import { clientIp } from '../../../common/http/client-ip';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// Asignar dueño y ejecutor (contracts/gestion-usuarios.md · Asignación de controles, SEG-73). El listado (`GET /v1/assignments`) vive en `compliance`: necesita el estado de cada control.
@ApiTags(API_TAGS.team)
@Controller('assignments')
export class AssignmentsController {
  constructor(
    private readonly setOwner: SetControlOwnerUseCase,
    private readonly setExecutor: SetControlExecutorUseCase,
  ) {}

  @ApiOperation({
    summary: 'Asignar el dueño de controles',
    description:
      'Solo `admin_empresa`. Hasta 200 controles por petición. El dueño es un `responsable` activo o pendiente de la empresa, o el propio administrador; `owner_id: null` deja los controles «Sin asignar». Cambiar el dueño limpia el ejecutor. Todo o nada: un control dado de baja cancela la operación. `updated` cuenta solo los controles que cambiaron; cada uno deja un registro de auditoría `control_assignment.set`.',
  })
  @ApiData(AssignmentUpdatedResponse, 'Controles que cambiaron.')
  @ApiDomainErrors('NOT_FOUND', 'OWNER_NOT_ELIGIBLE', 'CONTROL_RETIRED', 'ACCOUNT_INACTIVE')
  @Can('assignments.owner')
  @Put('owner')
  async owner(@CurrentUser() p: Principal, @Body() dto: SetOwnerDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('assignment.owner_updated'), { updated: await this.setOwner.execute(p, dto, metaOf(req)) });
  }

  @ApiOperation({
    summary: 'Asignar el ejecutor de controles',
    description:
      '`admin_empresa` (D150: también delega) o `responsable`; este último solo sobre controles de los que es dueño (si no, `403`). Hasta 200 controles por petición. El ejecutor es un `delegado` activo o pendiente del equipo del DUEÑO de cada control (para el administrador, el de cada control; un control sin dueño solo admite `null`); `executor_id: null` lo quita (ejecuta el dueño). Un responsable sin equipo solo puede mandar `null`. Todo o nada. `updated` cuenta solo los controles que cambiaron; cada uno deja un registro de auditoría `control_assignment.set`.',
  })
  @ApiData(AssignmentUpdatedResponse, 'Controles que cambiaron.')
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND', 'EXECUTOR_NOT_IN_TEAM', 'CONTROL_RETIRED', 'ACCOUNT_INACTIVE')
  @Can('controls.delegate')
  @Put('executor')
  async executor(@CurrentUser() p: Principal, @Body() dto: SetExecutorDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('assignment.executor_updated'), { updated: await this.setExecutor.execute(p, dto, metaOf(req)) });
  }
}
