import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { toPageResponse } from '../../../../common/pagination/page';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiDomainErrors, ApiPaged } from '../../../../common/swagger/api-envelope';
import { ListAssignmentsQuery } from '../../application/assignments/list-assignments.query';
import { ListAssignmentsUseCase } from '../../application/assignments/list-assignments.use-case';
import { AssignmentItemResponse } from './assignments.responses';
import { toAssignmentItem } from './assignments.mapper';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// El listado vive en `compliance` porque calcula el estado de cada control con el motor (por servicio); asignar dueño y ejecutor (`PUT`) vive en `team`.
@ApiTags(API_TAGS.team)
@Roles('admin_empresa', 'auditor', 'responsable', 'delegado')
@Controller('assignments')
export class AssignmentsListController {
  constructor(private readonly list: ListAssignmentsUseCase) {}

  @ApiOperation({
    summary: 'Listar los controles con su asignación',
    description:
      '`admin_empresa` y `auditor` ven todos los controles vigentes; el `responsable`, los que tiene a su cargo; el `delegado`, los que ejecuta (`admin_monkey` recibe `403`). Paginada, ordenada por servicio y por código de control. Todos los filtros se combinan; `status` se deriva por servicio y se aplica antes de paginar.',
  })
  @ApiPaged(AssignmentItemResponse, 'Página de controles con su dueño y ejecutor.')
  @ApiDomainErrors('FORBIDDEN')
  @Get()
  async assignments(@CurrentUser() p: Principal, @Query() q: ListAssignmentsQuery) {
    const page = await this.list.execute(p, {
      page: q.page, pageSize: q.page_size, serviceId: q.service_id, frameworkId: q.framework_id, category: q.category, requirementCode: q.requirement_code,
      status: q.status, assignment: q.assignment, ownerId: q.owner_id, executorId: q.executor_id, q: q.q,
    });
    return new ResponseDto(HttpStatus.OK, t('assignment.list'), toPageResponse(page, toAssignmentItem));
  }
}
