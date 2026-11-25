import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Can } from '../../../common/authorization/can.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { RequestMeta } from '../../../common/http/request-meta';
import { mailLanguageOf } from '../../../common/mail/mail-language';
import { toPageResponse } from '../../../common/pagination/page';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiPaged } from '../../../common/swagger/api-envelope';
import { DeactivateAdminDto, InviteAdminDto, ListAdminsQuery } from '../application/dtos/admin.dto';
import { DeactivateAdminUseCase, InviteAdminUseCase, ListAdminsUseCase, ReactivateAdminUseCase, ReissueAdminCodeUseCase } from '../application/use-cases/admin-accounts.use-cases';
import { toAdmin, toInvitation, toInvitedAdmin } from './admin.mapper';
import { AdminAccountResponse, AdminInvitedResponse, AdminReissuedResponse } from './admin.responses';
import { clientIp } from '../../../common/http/client-ip';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });
const metaOf = (req: Request): RequestMeta => ({ ipAddress: clientIp(req), userAgent: req.get('user-agent') ?? '', language: mailLanguageOf(I18nContext.current()?.lang) });

// contracts/gestion-usuarios/administradores.md (D117) · Todo el módulo es exclusivo de `admin_monkey`: cualquier otro rol recibe 403.
@ApiTags(API_TAGS.admins)
@Can('monkey_admins.manage')
@Controller('admins')
export class AdminsController {
  constructor(
    private readonly list: ListAdminsUseCase,
    private readonly invite: InviteAdminUseCase,
    private readonly reissue: ReissueAdminCodeUseCase,
    private readonly deactivate: DeactivateAdminUseCase,
    private readonly reactivate: ReactivateAdminUseCase,
  ) {}

  @ApiOperation({ summary: 'Listar los administradores de Monkey', description: 'Paginada, con filtro por estado (`active`, `pending`, `inactive`) y orden por `created_at`, `email` o `purge_at`. `invited_by` trae quién lo invitó, o su sello (`purged: true`) si esa persona ya se borró. Nunca devuelve el código de activación.' })
  @ApiPaged(AdminAccountResponse, 'Página de administradores.')
  @Get()
  async admins(@CurrentUser() p: Principal, @Query() q: ListAdminsQuery) {
    const page = await this.list.execute(p, { status: q.status, sort: q.sort, page: q.page, pageSize: q.page_size });
    return new ResponseDto(HttpStatus.OK, t('admin.list'), toPageResponse(page, toAdmin));
  }

  @ApiOperation({ summary: 'Invitar a otro administrador de Monkey', description: 'Crea una cuenta `admin_monkey` `pending` en la empresa interna (sin cupo de usuarios) y envía **por correo** su código de activación (un solo uso, 7 días); la respuesta trae solo el estado de la invitación. `role` solo admite `admin_monkey` (`422 role.not_allowed`). Pide el código del segundo factor de quien invita. Queda registro de auditoría, sin el código.' })
  @ApiData(AdminInvitedResponse, 'Cuenta creada, con el estado de su invitación.', { status: 201 })
  @ApiDomainErrors('EMAIL_TAKEN', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED', 'MFA_NOT_ENABLED', 'ACCOUNT_INACTIVE')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() p: Principal, @Body() dto: InviteAdminDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.CREATED, t('admin.invited'), toInvitedAdmin(await this.invite.execute(p, dto, metaOf(req))));
  }

  @ApiOperation({ summary: 'Reenviar la invitación', description: 'Sin cuerpo. Revoca el código vigente y envía por correo uno nuevo, solo mientras la cuenta esté `pending`. La respuesta trae solo el estado de la invitación, nunca el código.' })
  @ApiData(AdminReissuedResponse, 'Invitación reenviada, con su estado.')
  @ApiDomainErrors('NOT_FOUND', 'USER_ALREADY_ACTIVE', 'ACCOUNT_INACTIVE')
  @Post(':id/activation-code')
  @HttpCode(HttpStatus.OK)
  async reissueCode(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('admin.activation_code_regenerated'), { invitation: toInvitation(await this.reissue.execute(p, id, metaOf(req))) });
  }

  @ApiOperation({ summary: 'Desactivar a un administrador', description: 'En una transacción: pasa a `inactive` con `purge_at` a 7 días, cierra sus sesiones y desafíos del segundo factor y deja auditoría. Pasado el plazo la cuenta se borra (el sello conserva su nombre en la auditoría). Nadie se desactiva a sí mismo y el último administrador activo no se desactiva; una cuenta `pending` tampoco. Pide el código del segundo factor de quien desactiva.' })
  @ApiData(AdminAccountResponse, 'Cuenta desactivada, con `purge_at`.')
  @ApiDomainErrors('NOT_FOUND', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED', 'MFA_NOT_ENABLED', 'CANNOT_DEACTIVATE_SELF', 'LAST_ADMIN', 'ADMIN_ALREADY_INACTIVE', 'USER_NOT_ACTIVATED', 'ACCOUNT_INACTIVE')
  @Post(':id/deactivation')
  @HttpCode(HttpStatus.OK)
  async deactivation(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Body() dto: DeactivateAdminDto, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('admin.deactivated'), toAdmin(await this.deactivate.execute(p, id, dto.totp_code, metaOf(req))));
  }

  @ApiOperation({ summary: 'Reactivar a un administrador', description: 'Sin cuerpo y sin segundo factor (D117). Solo mientras la cuenta esté `inactive` y no se haya purgado; pasado el plazo es `404`. Debe iniciar sesión de nuevo.' })
  @ApiData(AdminAccountResponse, 'Cuenta reactivada.')
  @ApiDomainErrors('NOT_FOUND', 'ADMIN_NOT_INACTIVE', 'ACCOUNT_INACTIVE')
  @Post(':id/reactivation')
  @HttpCode(HttpStatus.OK)
  async reactivation(@CurrentUser() p: Principal, @Param('id', idPipe) id: string, @Req() req: Request) {
    return new ResponseDto(HttpStatus.OK, t('admin.reactivated'), toAdmin(await this.reactivate.execute(p, id, metaOf(req))));
  }
}
