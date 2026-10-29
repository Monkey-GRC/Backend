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
import { CreateTeamMemberDto, ListTeamQuery, UpdateTeamMemberDto } from '../application/dtos/team.dto';
import { CreateTeamMemberUseCase, ListTeamUseCase, ReissueActivationCodeUseCase, UpdateTeamMemberUseCase } from '../application/use-cases/team-users.use-cases';
import { toMember, toMemberWithCode } from './team.mapper';
import { TeamMemberCreatedResponse, TeamMemberResponse } from './team.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '' });

// El equipo de la empresa (contracts/modules/users-team.md, D96). Solo `admin_empresa`: invita, edita, desactiva y reemite códigos. `admin_monkey` no crea ni desactiva cuentas
// de una empresa. El restablecimiento del segundo factor (`DELETE /users/{id}/mfa`) vive en el módulo de autenticación.
@ApiTags(API_TAGS.team)
@Roles('admin_empresa')
@Controller('users')
export class UsersController {
  constructor(
    private readonly create: CreateTeamMemberUseCase,
    private readonly list: ListTeamUseCase,
    private readonly update: UpdateTeamMemberUseCase,
    private readonly reissue: ReissueActivationCodeUseCase,
  ) {}

  @ApiOperation({ summary: 'Invitar a una persona del equipo', description: 'Crea una cuenta `funcional` (con sus especialidades, obligatorias) o `auditor` (sin ellas). Nace `pending` y **la respuesta trae su código de activación, una sola vez**: hay que entregárselo a la persona. Queda registro de auditoría, sin el código.' })
  @ApiData(TeamMemberCreatedResponse, 'Cuenta creada, con su código de activación en claro (única vez).', { status: 201 })
  @ApiDomainErrors('EMAIL_TAKEN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async invite(@CurrentUser() p: Principal, @Body() dto: CreateTeamMemberDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.CREATED, t('user.created'), toMemberWithCode(await this.create.execute(p, dto, metaOf(req))));
  }

  @ApiOperation({ summary: 'Listar el equipo de la empresa', description: 'Todas las cuentas de la empresa, incluido el propio administrador (solo lectura). Filtros por rol y estado. Nunca devuelve el código de activación.' })
  @ApiPaged(TeamMemberResponse, 'Página de cuentas.')
  @Get()
  async members(@CurrentUser() p: Principal, @Query() q: ListTeamQuery) {
    const page = await this.list.execute(p, { role: q.role, status: q.status, sort: q.sort, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('user.list'), toPageResponse(page, toMember));
  }

  @ApiOperation({ summary: 'Editar, desactivar o reactivar a una persona', description: 'Cambia el estado (`inactive`/`active`) o las especialidades de un `funcional`; las dos cosas pueden ir juntas. **Desactivar cierra todas sus sesiones al instante** (CC6.3). No se desactiva a uno mismo, ni una cuenta `pending`; quitar una especialidad que aún atiende es `409 DIMENSION_IN_USE`. Sobre un administrador o alguien de otra empresa: `404`. Queda registro de auditoría.' })
  @ApiData(TeamMemberResponse, 'Cuenta ya cambiada.')
  @ApiDomainErrors('LAST_ADMIN', 'USER_NOT_ACTIVATED', 'DIMENSION_IN_USE')
  @Patch(':id')
  async change(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateTeamMemberDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('user.updated'), toMember(await this.update.execute(p, id, dto, metaOf(req))));
  }

  @ApiOperation({ summary: 'Emitir un código de activación nuevo', description: 'Sin cuerpo. Revoca el código vigente y emite uno nuevo, que viaja en claro solo en esta respuesta. Solo mientras la cuenta esté `pending`. Queda registro de auditoría, sin el código.' })
  @ApiData(TeamMemberCreatedResponse, 'Código nuevo emitido (única vez).', { status: 201 })
  @ApiDomainErrors('USER_ALREADY_ACTIVE')
  @Post(':id/activation-code')
  @HttpCode(HttpStatus.CREATED)
  async reissueCode(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    return new ResponseDto(HttpStatus.CREATED, t('user.activation_code_regenerated'), toMemberWithCode(await this.reissue.execute(p, id, metaOf(req))));
  }
}
