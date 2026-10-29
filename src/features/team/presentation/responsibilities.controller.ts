import { Body, Controller, Get, HttpStatus, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors } from '../../../common/swagger/api-envelope';
import { SetResponsibleDto } from '../application/dtos/team.dto';
import { ListControlResponsiblesUseCase, ListDimensionOwnersUseCase, SetControlResponsibleUseCase, SetDimensionOwnerUseCase } from '../application/use-cases/responsibility.use-cases';
import { DIMENSIONS } from '../domain/team.types';
import type { Dimension } from '../domain/team.types';
import { toControlResponsible, toDimensionOwner } from './team.mapper';
import { ControlResponsibleListResponse, ControlResponsibleResponse, DimensionOwnerListResponse, DimensionOwnerResponse } from './team.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
// Una dimensión que no existe es un recurso que no existe: 404, como un id inválido.
const dimensionPipe = new ParseEnumPipe(Object.fromEntries(DIMENSIONS.map((d) => [d, d])), { errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// Responsable por dimensión (contracts/modules/users-team.md, D96). Reparte el `admin_empresa`; el `auditor` lee. El `funcional` y `admin_monkey` no entran.
@ApiTags(API_TAGS.team)
@Roles('admin_empresa', 'auditor')
@Controller()
export class ResponsibilitiesController {
  constructor(
    private readonly listOwners: ListDimensionOwnersUseCase,
    private readonly setOwner: SetDimensionOwnerUseCase,
    private readonly listResponsibles: ListControlResponsiblesUseCase,
    private readonly setResponsible: SetControlResponsibleUseCase,
  ) {}

  @ApiOperation({ summary: 'Responsables por dimensión de un servicio', description: 'Siempre las cinco dimensiones, con su responsable principal, cuántos controles tienen pruebas de esa dimensión, cuántos una excepción y cuántos quedan sin nadie a cargo.' })
  @ApiData(DimensionOwnerListResponse, 'Las cinco dimensiones del servicio.')
  @Get('services/:serviceId/dimension-owners')
  async owners(@CurrentUser() p: Principal, @Param('serviceId', idPipe) serviceId: string) {
    return new ResponseDto(HttpStatus.OK, t('dimension_owner.list'), { items: (await this.listOwners.execute(p, serviceId)).map(toDimensionOwner) });
  }

  @ApiOperation({ summary: 'Poner el responsable de una dimensión en un servicio', description: 'Solo `admin_empresa`. Debe ser un `funcional` activo o pendiente de la empresa con esa especialidad. `user_id: null` deja la dimensión sin responsable del servicio (los controles con excepción conservan la suya). Queda registro de auditoría.' })
  @ApiData(DimensionOwnerResponse, 'La dimensión ya con su responsable.')
  @ApiDomainErrors('USER_LACKS_DIMENSION')
  @Patch('services/:serviceId/dimension-owners/:dimension')
  @Roles('admin_empresa')
  async changeOwner(
    @CurrentUser() p: Principal,
    @Param('serviceId', idPipe) serviceId: string,
    @Param('dimension', dimensionPipe) dimension: Dimension,
    @Body() dto: SetResponsibleDto,
    @Req() req: Request,
  ) {
    return new ResponseDto(HttpStatus.OK, t('dimension_owner.updated'), toDimensionOwner(await this.setOwner.execute(p, serviceId, dimension, dto.user_id, metaOf(req))));
  }

  @ApiOperation({ summary: 'Quién es responsable de cada dimensión de un control', description: 'Una fila por cada dimensión en la que el control tiene pruebas, con su responsable efectivo y de dónde sale: la excepción del control o el principal del servicio.' })
  @ApiData(ControlResponsibleListResponse, 'Responsables del control.')
  @Get('controls/:id/responsibles')
  async responsibles(@CurrentUser() p: Principal, @Param('id', idPipe) id: string) {
    return new ResponseDto(HttpStatus.OK, t('control_responsible.list'), { items: (await this.listResponsibles.execute(p, id)).map(toControlResponsible) });
  }

  @ApiOperation({ summary: 'Poner o quitar la excepción de un control en una dimensión', description: 'Solo `admin_empresa`. Pone a otro `funcional` con esa especialidad como responsable de este control en esa dimensión; `user_id: null` quita la excepción y vuelve al principal del servicio. Una dimensión en la que el control no tiene pruebas responde `404`. Queda registro de auditoría.' })
  @ApiData(ControlResponsibleResponse, 'La dimensión del control ya con su responsable.')
  @ApiDomainErrors('USER_LACKS_DIMENSION', 'CONTROL_RETIRED')
  @Patch('controls/:id/responsibles/:dimension')
  @Roles('admin_empresa')
  async changeResponsible(
    @CurrentUser() p: Principal,
    @Param('id', idPipe) id: string,
    @Param('dimension', dimensionPipe) dimension: Dimension,
    @Body() dto: SetResponsibleDto,
    @Req() req: Request,
  ) {
    return new ResponseDto(HttpStatus.OK, t('control_responsible.updated'), toControlResponsible(await this.setResponsible.execute(p, id, dimension, dto.user_id, metaOf(req))));
  }
}
