import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
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
import { CreateGroupDto, ListGroupsQuery, RenameGroupDto } from '../application/dtos/team.dto';
import { CreateGroupUseCase, ListGroupsUseCase, RenameGroupUseCase } from '../application/use-cases/team-groups.use-cases';
import { toGroup } from './team.mapper';
import { GroupResponse } from './team.responses';
import { clientIp } from '../../../common/http/client-ip';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '' });

// Los grupos de la empresa (contracts/gestion-usuarios.md · Grupos, D102 y D104). `admin_empresa` lista todos, crea grupos de responsables o el equipo de un responsable y renombra;
// el `responsable` lista el suyo y crea el suyo (uno solo). Mover a un delegado de equipo es `PATCH /v1/users/{id}`.
@ApiTags(API_TAGS.team)
@Roles('admin_empresa')
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly list: ListGroupsUseCase,
    private readonly create: CreateGroupUseCase,
    private readonly rename: RenameGroupUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar los grupos', description: 'El administrador ve todos los grupos de la empresa; el `responsable`, solo el equipo que lidera (lista vacía si aún no lo creó). Cada grupo trae su clase (`responsables` o `team`), su líder y cuántas cuentas tiene.' })
  @ApiPaged(GroupResponse, 'Página de grupos.')
  @ApiDomainErrors('FORBIDDEN')
  @Roles('admin_empresa', 'responsable')
  @Get()
  async groups(@CurrentUser() p: Principal, @Query() q: ListGroupsQuery) {
    const page = await this.list.execute(p, { sort: q.sort, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('group.list'), toPageResponse(page, toGroup));
  }

  @ApiOperation({
    summary: 'Crear un grupo',
    description:
      '`admin_empresa` sin `leader_id`: un grupo de responsables que lidera él; con `leader_id`: el equipo de delegados de ese responsable (activo o pendiente). `responsable`: su propio equipo (solo uno; `leader_id` ajeno es `403`). El nombre «Responsables» está reservado. Queda registro de auditoría.',
  })
  @ApiData(GroupResponse, 'Grupo creado.', { status: 201 })
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND', 'TEAM_ALREADY_EXISTS', 'GROUP_NAME_TAKEN', 'ACCOUNT_INACTIVE')
  @Roles('admin_empresa', 'responsable')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroup(@CurrentUser() p: Principal, @Body() dto: CreateGroupDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.CREATED, t('group.created'), toGroup(await this.create.execute(p, dto, metaOf(req))));
  }

  @ApiOperation({ summary: 'Renombrar un grupo', description: 'Solo `admin_empresa`. El grupo «Responsables» (el de los responsables por omisión) no se renombra, y ningún otro grupo puede llevar ese nombre. Queda registro de auditoría con el nombre antes y después.' })
  @ApiData(GroupResponse, 'Grupo ya renombrado.')
  @ApiDomainErrors('NOT_FOUND', 'GROUP_NAME_TAKEN', 'GROUP_RESERVED', 'ACCOUNT_INACTIVE')
  @Patch(':id')
  async renameGroup(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: RenameGroupDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('group.updated'), toGroup(await this.rename.execute(p, id, dto, metaOf(req))));
  }
}
