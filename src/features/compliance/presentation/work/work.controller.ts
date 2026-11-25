import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../../common/auth/principal';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Can } from '../../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../../common/dtos/response.dto';
import { API_TAGS } from '../../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors } from '../../../../common/swagger/api-envelope';
import { ListMyWorkQuery } from '../../application/work/list-my-work.query';
import { ListMyWorkUseCase, TeamWorkloadUseCase } from '../../application/work/work.use-cases';
import { toMyWork, toWorkload } from './work.mapper';
import { MyWorkResponse, WorkloadResponse } from './work.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;

// Viven en `compliance` porque calculan el estado de cada control con el motor (por servicio), aunque `workload` cuelgue de `/team`.
@ApiTags(API_TAGS.team)
@Controller()
export class WorkController {
  constructor(private readonly myWork: ListMyWorkUseCase, private readonly workload: TeamWorkloadUseCase) {}

  @ApiOperation({
    summary: 'Mi trabajo',
    description:
      'Solo `responsable` y `delegado` (el resto, `403`). Los controles que la persona posee o ejecuta, de todos los servicios, cada uno en un solo `bucket` (D122) y con lo que le falta (`pending_items`). Paginada; `progress` es el avance de SUS controles.',
  })
  @ApiData(MyWorkResponse, 'Sus controles con su bucket y el avance de lo suyo.')
  @ApiDomainErrors('FORBIDDEN')
  @Can('work.mine')
  @Get('me/work')
  async me(@CurrentUser() p: Principal, @Query() q: ListMyWorkQuery) {
    const r = await this.myWork.execute(p, { page: q.page, pageSize: q.page_size, bucket: q.bucket, serviceId: q.service_id, q: q.q, locale: I18nContext.current()?.lang });
    return new ResponseDto(HttpStatus.OK, t('work.list'), toMyWork(r.page, r.progress));
  }

  @ApiOperation({
    summary: 'Carga de trabajo por persona',
    description:
      'Solo `admin_empresa`. Cada `responsable` y `delegado` activo (con cero si no tiene controles) y cada `admin_empresa` dueño de algún control, con los que posee, los que ejecuta y el avance de los suyos. Sin tope ni paginación; orden por rol y nombre. `unassigned_count` es de toda la empresa.',
  })
  @ApiData(WorkloadResponse, 'La carga de cada persona y los controles sin asignar.')
  @ApiDomainErrors('FORBIDDEN')
  @Can('team.workload')
  @Get('team/workload')
  async team(@CurrentUser() p: Principal) {
    return new ResponseDto(HttpStatus.OK, t('team.workload'), toWorkload(await this.workload.execute(p, I18nContext.current()?.lang)));
  }
}
