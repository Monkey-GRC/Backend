import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { mailLanguageOf } from '../../../common/mail/mail-language';
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
import { toInvitation, toInvitedMember, toMember } from './team.mapper';
import { ReissuedInvitationResponse, TeamMemberInvitedResponse, TeamMemberResponse } from './team.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: req.ip ?? '', userAgent: req.get('user-agent') ?? '', language: mailLanguageOf(I18nContext.current()?.lang) });

// El equipo de la empresa (contracts/gestion-usuarios.md, D102). `admin_empresa` invita, lista, edita, desactiva y reemite códigos; el `responsable` solo invita delegados a su
// equipo y lista el suyo. `admin_monkey` no crea ni desactiva cuentas de una empresa. El restablecimiento del segundo factor (`DELETE /users/{id}/mfa`) vive en el módulo de autenticación.
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

  @ApiOperation({ summary: 'Invitar a una persona del equipo', description: 'Crea una cuenta `responsable`, `delegado`, `auditor` o `admin_empresa` (el `responsable` solo crea delegados, en su equipo). Nace `pending`, cuenta para el cupo y deja registro de auditoría. Un `responsable` nuevo queda en el grupo «Responsables»; su equipo de delegados no nace con él. El código de activación sale **por correo** a la persona, nunca en la respuesta: esta trae solo el estado de la invitación (`sent` o `failed`; si falló, se reenvía).' })
  @ApiData(TeamMemberInvitedResponse, 'Cuenta creada, con el estado de su invitación.', { status: 201 })
  @ApiDomainErrors('FORBIDDEN', 'NOT_FOUND', 'RESPONSIBLE_HAS_NO_TEAM', 'RESPONSIBLES_GROUP_INVALID', 'EMAIL_TAKEN', 'USER_LIMIT_REACHED', 'ACCOUNT_INACTIVE')
  @Roles('admin_empresa', 'responsable')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async invite(@CurrentUser() p: Principal, @Body() dto: CreateTeamMemberDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.CREATED, t('user.created'), toInvitedMember(await this.create.execute(p, dto, metaOf(req))));
  }

  @ApiOperation({ summary: 'Listar el equipo de la empresa', description: 'El administrador ve todas las cuentas de la empresa, incluido él (solo lectura); el `responsable`, solo su equipo. Filtros por rol, estado, grupo e interno/externo. Nunca devuelve el código de activación.' })
  @ApiPaged(TeamMemberResponse, 'Página de cuentas.')
  @ApiDomainErrors('FORBIDDEN')
  @Roles('admin_empresa', 'responsable')
  @Get()
  async members(@CurrentUser() p: Principal, @Query() q: ListTeamQuery) {
    const page = await this.list.execute(p, { role: q.role, status: q.status, groupId: q.group_id, isInternal: q.is_internal, sort: q.sort, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('user.list'), toPageResponse(page, toMember));
  }

  @ApiOperation({ summary: 'Editar, mover, desactivar o reactivar a una persona', description: 'Cambia el estado (`inactive`/`active`), el nombre o `is_internal` (solo `delegado`), o **mueve a un delegado** a otro equipo (`group_id`). **Desactivar cierra todas sus sesiones al instante** (CC6.3) y libera el cupo. Quien tiene controles asignados necesita `confirm_unassign` al desactivar o mover: el delegado deja sin ejecutor sus controles (siguen con su dueño) y un responsable o administrador los deja «Sin asignar». Un responsable con delegados activos o pendientes no se desactiva (`RESPONSIBLE_HAS_DELEGATES`, ni con confirmación). Reactivar vuelve a comprobar el cupo, no devuelve las asignaciones y, para un delegado, exige que su responsable siga activo o pendiente (`TEAM_LEADER_INACTIVE`). No se desactiva a uno mismo ni una cuenta `pending`. Sobre `admin_monkey` o alguien de otra empresa: `404`. Queda registro de auditoría, con una entrada por cada control cuyo dueño o ejecutor cambia.' })
  @ApiData(TeamMemberResponse, 'Cuenta ya cambiada.')
  @ApiDomainErrors('NOT_FOUND', 'LAST_ADMIN', 'USER_NOT_ACTIVATED', 'USER_LIMIT_REACHED', 'USER_HAS_ASSIGNMENTS', 'RESPONSIBLE_HAS_DELEGATES', 'TEAM_LEADER_INACTIVE', 'ACCOUNT_INACTIVE')
  @Patch(':id')
  async change(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: UpdateTeamMemberDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('user.updated'), toMember(await this.update.execute(p, id, dto, metaOf(req))));
  }

  @ApiOperation({ summary: 'Reenviar la invitación', description: 'Sin cuerpo. Revoca el código vigente y envía por correo uno nuevo; la respuesta trae solo el estado de la invitación, nunca el código. Solo mientras la cuenta esté `pending`. Queda registro de auditoría, sin el código.' })
  @ApiData(ReissuedInvitationResponse, 'Invitación reenviada, con su estado.')
  @ApiDomainErrors('NOT_FOUND', 'USER_ALREADY_ACTIVE', 'ACCOUNT_INACTIVE')
  @Post(':id/activation-code')
  @HttpCode(HttpStatus.OK)
  async reissueCode(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('user.activation_code_regenerated'), { invitation: toInvitation(await this.reissue.execute(p, id, metaOf(req))) });
  }
}
