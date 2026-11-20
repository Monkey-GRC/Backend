import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import { normalizeIp } from '../../../common/http/client-ip';
import { mailLanguageOf } from '../../../common/mail/mail-language';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiDomainErrors, ApiItems, ApiNoBody } from '../../../common/swagger/api-envelope';
import { ListDevicesUseCase } from '../application/use-cases/devices/list-devices.use-case';
import { RevokeAllDevicesUseCase } from '../application/use-cases/devices/revoke-all-devices.use-case';
import { RevokeDeviceUseCase } from '../application/use-cases/devices/revoke-device.use-case';
import { clearDeviceCookie, readDeviceCookie, requestMeta } from './auth-cookies';
import { TrustedDeviceResponse } from './auth.responses';

const t = (key: string): string => (I18nContext.current()?.t(key) as string | undefined) ?? key;
const idPipe = new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND });

// D123, SEG-84 · Los dispositivos recordados de la persona en sesión. `admin_monkey` no recuerda dispositivos: queda fuera por rol (403).
@ApiTags(API_TAGS.auth)
@Roles('admin_empresa', 'responsable', 'delegado', 'auditor')
@Controller('auth/devices')
export class DevicesController {
  constructor(
    private readonly list: ListDevicesUseCase,
    private readonly revokeOne: RevokeDeviceUseCase,
    private readonly revokeAll: RevokeAllDevicesUseCase,
  ) {}

  @ApiOperation({ summary: 'Mis dispositivos recordados', description: 'Los dispositivos **vigentes** (no vencidos ni olvidados) de la persona en sesión, del más reciente al más antiguo. Sin paginación: son pocos y vencen solos. `city` sale en el idioma de la petición (`Accept-Language`); la ubicación la resuelve una base local, la IP no se manda a ningún tercero. `admin_monkey` recibe 403.' })
  @ApiItems(TrustedDeviceResponse, 'Los dispositivos recordados vigentes de la persona.')
  @ApiDomainErrors('FORBIDDEN')
  @Get()
  async mine(@CurrentUser() principal: Principal, @Req() req: Request) {
    const language = mailLanguageOf(I18nContext.current()?.lang);
    const items = await this.list.execute(principal, readDeviceCookie(req));
    return new ResponseDto(
      HttpStatus.OK,
      t('auth.devices_listed'),
      items.map(({ device, isCurrent }) => ({
        id: device.id,
        browser: device.browser,
        os: device.os,
        device_type: device.deviceType,
        ip_address: normalizeIp(device.ipAddress),
        country: device.country,
        city: device.cityIn(language),
        created_at: device.createdAt.toISOString(),
        expires_at: device.expiresAt.toISOString(),
        last_used_at: device.lastUsedAt ? device.lastUsedAt.toISOString() : null,
        is_current: isCurrent,
      })),
    );
  }

  @ApiOperation({ summary: 'Olvidar un dispositivo', description: 'Revoca un dispositivo recordado de la persona en sesión (la próxima vez que entre desde él se le pedirá el código). Deja rastro `auth.device_revoked` (`scope: one`) en la misma transacción. Si es el de esta petición, también borra la cookie `mnk_device`. No existe, ya no está vigente o es de otra persona: 404 sin decir cuál. `admin_monkey` recibe 403.' })
  @ApiNoBody('Dispositivo olvidado. No hay cuerpo.')
  @ApiDomainErrors('FORBIDDEN', 'DEVICE_NOT_FOUND')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgetOne(@CurrentUser() principal: Principal, @Param('id', idPipe) id: string, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const { wasCurrent } = await this.revokeOne.execute(principal, id, readDeviceCookie(req), requestMeta(req));
    if (wasCurrent) clearDeviceCookie(res);
  }

  @ApiOperation({ summary: 'Olvidar todos mis dispositivos', description: 'Revoca todos los dispositivos recordados de la persona en sesión y borra la cookie `mnk_device`. Idempotente. Deja rastro `auth.device_revoked` (`scope: all`, `count`) solo si olvidó al menos uno. `admin_monkey` recibe 403.' })
  @ApiNoBody('Dispositivos olvidados. No hay cuerpo.')
  @ApiDomainErrors('FORBIDDEN')
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgetAll(@CurrentUser() principal: Principal, @Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.revokeAll.execute(principal, requestMeta(req));
    clearDeviceCookie(res);
  }
}
